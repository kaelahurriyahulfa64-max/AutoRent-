// Vercel Serverless Function: Midtrans Webhook Receiver
// This endpoint receives payment notifications from Midtrans and stores them
// in Vercel's /tmp storage for client-side polling (prototype approach).
// For production, replace with a proper database (e.g., Vercel KV, Supabase).

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const WEBHOOK_FILE = join('/tmp', 'autorent_webhooks.json');

function getWebhooks() {
  try {
    if (existsSync(WEBHOOK_FILE)) {
      return JSON.parse(readFileSync(WEBHOOK_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading webhooks:', e);
  }
  return [];
}

function saveWebhooks(webhooks: any[]) {
  writeFileSync(WEBHOOK_FILE, JSON.stringify(webhooks, null, 2));
}

export default function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Receive webhook from Midtrans
  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      const webhook = {
        id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId: data.order_id || data.orderId || '',
        transactionStatus: data.transaction_status || data.transactionStatus || '',
        grossAmount: parseFloat(String(data.gross_amount || data.grossAmount || '0')),
        paymentType: data.payment_type || data.paymentType || 'Payment Gateway',
        transactionTime: data.transaction_time || data.transactionTime || new Date().toISOString(),
        timestamp: Date.now()
      };

      const webhooks = getWebhooks();
      webhooks.push(webhook);
      saveWebhooks(webhooks);

      return res.status(200).json({ status: 'success', message: 'Webhook received' });
    } catch (err) {
      return res.status(400).json({ status: 'error', message: 'Invalid request body' });
    }
  }

  // GET: Poll pending webhooks (client-side polling)
  if (req.method === 'GET') {
    const webhooks = getWebhooks();
    return res.status(200).json(webhooks);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
