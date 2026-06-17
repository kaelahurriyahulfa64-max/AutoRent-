// Vercel Serverless Function: Get pending webhook payments
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const WEBHOOK_FILE = join('/tmp', 'autorent_webhooks.json');

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let webhooks: any[] = [];
  try {
    if (existsSync(WEBHOOK_FILE)) {
      const content = readFileSync(WEBHOOK_FILE, 'utf-8');
      webhooks = JSON.parse(content || '[]');
    }
  } catch (e) {
    webhooks = [];
  }

  return res.status(200).json(webhooks);
}
