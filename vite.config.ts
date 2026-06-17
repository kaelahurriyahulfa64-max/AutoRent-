import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
      proxy: {
        '/api-midtrans': {
          target: 'https://app.sandbox.midtrans.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-midtrans/, '')
        },
        '/api-midtrans-core': {
          target: 'https://api.sandbox.midtrans.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-midtrans-core/, '')
        }
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
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
    },
  };
});
