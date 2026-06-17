import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import https from 'https';
import {defineConfig, loadEnv} from 'vite';

const localTokenCache = new Map<string, { token: string; timestamp: number }>();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Local dev API middleware plugin.
  // configureServer MUST be a plugin hook — placing it inside server:{} is silently ignored by Vite.
  const localApiPlugin = {
    name: 'autorent-local-api',
    configureServer(server: any) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';

          if (url.startsWith('/api/midtrans-snap-token') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const { orderId, grossAmount } = JSON.parse(body || '{}');
                if (!orderId || !grossAmount) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Missing orderId or grossAmount' }));
                  return;
                }

                // Check cache
                const cached = localTokenCache.get(orderId);
                if (cached && (Date.now() - cached.timestamp < 30 * 60 * 1000)) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ token: cached.token }));
                  return;
                }

                const serverKey = env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY;
                if (!serverKey) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'MIDTRANS_SERVER_KEY is not configured in local environment' }));
                  return;
                }

                const isProduction = (env.MIDTRANS_IS_PRODUCTION || process.env.MIDTRANS_IS_PRODUCTION) === 'true';
                const hostname = isProduction ? 'app.midtrans.com' : 'app.sandbox.midtrans.com';
                const authString = Buffer.from(`${serverKey}:`).toString('base64');

                // Diagnostics object — embedded in HTTP response body so callers capture it directly
                const __diag = {
                  keyPresent: Boolean(serverKey),
                  keyLength: serverKey.length,
                  keyStartsWithMidServer: serverKey.startsWith('Mid-server-'),
                  keySource: env.MIDTRANS_SERVER_KEY ? '.env via loadEnv' : 'process.env fallback',
                  authHeaderFormat: 'Basic base64(key + ":")',
                  authHeaderPrefix: `Basic ${authString.substring(0, 6)}...`,
                  targetUrl: `https://${hostname}/snap/v1/transactions`,
                  isProduction,
                  sandboxEndpoint: !isProduction,
                };

                const payload = JSON.stringify({
                  transaction_details: {
                    order_id: orderId,
                    gross_amount: grossAmount
                  }
                });

                const options = {
                  hostname,
                  port: 443,
                  path: '/snap/v1/transactions',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${authString}`,
                    'Content-Length': Buffer.byteLength(payload)
                  }
                };

                const request = https.request(options, (response) => {
                  let data = '';
                  response.on('data', (chunk) => {
                    data += chunk;
                  });
                  response.on('end', () => {
                    try {
                      const parsed = JSON.parse(data);
                      if (response.statusCode === 201 && parsed.token) {
                        localTokenCache.set(orderId, { token: parsed.token, timestamp: Date.now() });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ token: parsed.token }));
                      } else {
                        // Embed __diagnostics in error response so callers capture it directly
                        res.writeHead(response.statusCode || 500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                          error: parsed.error_messages || parsed.message || 'Midtrans Error',
                          midtransStatusCode: response.statusCode,
                          midtransBody: parsed,
                          __diagnostics: __diag,
                        }));
                      }
                    } catch (parseErr) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'Invalid response from Midtrans', __diagnostics: __diag }));
                    }
                  });
                });

                request.on('error', (err) => {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: err.message || 'Connection failed' }));
                });

                request.write(payload);
                request.end();

              } catch (e: any) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request JSON' }));
              }
            });
            return;
          }

          // GET /api/midtrans-snap-token — health check
          if (url.startsWith('/api/midtrans-snap-token') && req.method === 'GET') {
            const isProduction = (env.MIDTRANS_IS_PRODUCTION || process.env.MIDTRANS_IS_PRODUCTION) === 'true';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', environment: isProduction ? 'production' : 'sandbox' }));
            return;
          }

          if (url.startsWith('/api/midtrans-webhook') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const filePath = path.resolve(__dirname, 'db_webhooks.json');
                let webhooks = [];
                if (fs.existsSync(filePath)) {
                  const content = fs.readFileSync(filePath, 'utf-8');
                  webhooks = JSON.parse(content || '[]');
                }
                webhooks.push({
                  id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  orderId: data.order_id || data.orderId || '',
                  transactionStatus: data.transaction_status || data.transactionStatus || '',
                  grossAmount: parseFloat(String(data.gross_amount || data.grossAmount || '0')),
                  paymentType: data.payment_type || data.paymentType || 'Payment Gateway',
                  transactionTime: data.transaction_time || data.transactionTime || new Date().toISOString(),
                  timestamp: Date.now()
                });
                fs.writeFileSync(filePath, JSON.stringify(webhooks, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', message: 'Webhook received' }));
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON body' }));
              }
            });
            return;
          }

          if (url.startsWith('/api/webhook-payments/clear') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const whId = parsed.id;
                const filePath = path.resolve(__dirname, 'db_webhooks.json');
                if (fs.existsSync(filePath)) {
                  if (whId) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    let webhooks = JSON.parse(content || '[]');
                    webhooks = webhooks.filter((wh: any) => wh.id !== whId);
                    fs.writeFileSync(filePath, JSON.stringify(webhooks, null, 2));
                  } else {
                    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
                  }
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
              } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid body' }));
              }
            });
            return;
          }

          if (url.startsWith('/api/webhook-payments') && req.method === 'GET') {
            const filePath = path.resolve(__dirname, 'db_webhooks.json');
            let webhooks = [];
            if (fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf-8');
                webhooks = JSON.parse(content || '[]');
              } catch (e) {
                webhooks = [];
              }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(webhooks));
            return;
          }

          next();
        });
      }
    };

  return {
    plugins: [react(), tailwindcss(), localApiPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
