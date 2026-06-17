const fs = require('fs');
const path = require('path');

function searchFile(filePath, keywords) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`\n--- Searching in ${path.basename(filePath)} ---`);
  lines.forEach((line, i) => {
    keywords.forEach(kw => {
      if (line.toLowerCase().includes(kw.toLowerCase())) {
        console.log(`${i + 1}: ${line.trim()}`);
      }
    });
  });
}

const customerPath = path.join(__dirname, 'src', 'components', 'DashboardCustomer.tsx');
const adminPath = path.join(__dirname, 'src', 'components', 'DashboardAdmin.tsx');

searchFile(customerPath, ['Kata Sandi', 'Bayar di Toko', 'checkoutPaymentMethod', 'Ubah Password', 'Menunggu Pembayaran', 'profilePassword']);
searchFile(adminPath, ['Menunggu Pembayaran di Toko', 'Bayar di Toko', 'Invoice']);
