const http = require('http');

const data = JSON.stringify({
  order_id: 'TEST-BKG-1234',
  transaction_status: 'settlement',
  gross_amount: '200000.00',
  payment_type: 'credit_card',
  transaction_time: new Date().toISOString()
});

const options = {
  hostname: 'localhost',
  port: 3003, // Wait, is the Vite port 3003? The log said 3000!
  path: '/api/midtrans-webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
