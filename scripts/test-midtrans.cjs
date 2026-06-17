const https = require('https');
const serverKey = process.env.VITE_MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY;
if (!serverKey) throw new Error("Midtrans server key configuration not found");
const authString = Buffer.from(serverKey + ':').toString('base64');

const options = {
  hostname: 'api.sandbox.midtrans.com',
  port: 443,
  path: '/v2/dummy/status',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Basic ${authString}`
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
