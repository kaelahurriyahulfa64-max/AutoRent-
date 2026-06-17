// Vercel Serverless Function: Clear processed webhooks
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const WEBHOOK_FILE = join('/tmp', 'autorent_webhooks.json');

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body || {};
    
    if (existsSync(WEBHOOK_FILE)) {
      if (id) {
        const content = readFileSync(WEBHOOK_FILE, 'utf-8');
        let webhooks = JSON.parse(content || '[]');
        webhooks = webhooks.filter((wh: any) => wh.id !== id);
        writeFileSync(WEBHOOK_FILE, JSON.stringify(webhooks, null, 2));
      } else {
        writeFileSync(WEBHOOK_FILE, JSON.stringify([], null, 2));
      }
    }

    return res.status(200).json({ status: 'success' });
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid body' });
  }
}
