// Vercel Serverless Function: Create Midtrans Snap Transaction Token
// This endpoint creates a Snap token securely server-side.
// The Server Key is NEVER sent to the browser.

import https from 'https';

// Simple in-memory cache for idempotency (per serverless instance)
// Prevents duplicate transactions from double-clicks or retries
const tokenCache = new Map<string, { token: string; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of tokenCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      tokenCache.delete(key);
    }
  }
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET — health check (verifies the route is reachable and env is configured)
  if (req.method === 'GET') {
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const hasKey = Boolean(process.env.MIDTRANS_SERVER_KEY);
    return res.status(200).json({
      status: 'ok',
      environment: isProduction ? 'production' : 'sandbox',
      serverKeyConfigured: hasKey,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error('MIDTRANS_SERVER_KEY is not configured in environment variables');
    return res.status(500).json({ error: 'Payment gateway not configured. Please set MIDTRANS_SERVER_KEY.' });
  }

  const { orderId, grossAmount } = req.body || {};

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid orderId' });
  }
  if (!grossAmount || typeof grossAmount !== 'number' || grossAmount <= 0) {
    return res.status(400).json({ error: 'Missing or invalid grossAmount' });
  }

  // Idempotency check: return cached token if the same orderId was already processed
  cleanExpiredCache();
  const cached = tokenCache.get(orderId);
  if (cached) {
    return res.status(200).json({ token: cached.token });
  }

  // Determine sandbox vs production
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const hostname = isProduction
    ? 'app.midtrans.com'
    : 'app.sandbox.midtrans.com';

  const authString = Buffer.from(`${serverKey}:`).toString('base64');
  const payload = JSON.stringify({
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    }
  });

  return new Promise<void>((resolve) => {
    const options: https.RequestOptions = {
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
            // Cache the token for idempotency
            tokenCache.set(orderId, { token: parsed.token, timestamp: Date.now() });
            res.status(200).json({ token: parsed.token });
          } else {
            console.error('Midtrans API Error:', response.statusCode, data);
            res.status(response.statusCode || 500).json({
              error: 'Midtrans API Error',
              detail: parsed.error_messages || parsed.message || data
            });
          }
        } catch (parseErr) {
          console.error('Failed to parse Midtrans response:', data);
          res.status(500).json({ error: 'Invalid response from payment gateway' });
        }
        resolve();
      });
    });

    request.on('error', (err) => {
      console.error('HTTPS request to Midtrans failed:', err);
      res.status(500).json({ error: 'Failed to connect to payment gateway' });
      resolve();
    });

    request.write(payload);
    request.end();
  });
}
