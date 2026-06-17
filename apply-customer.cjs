const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardCustomer.tsx', 'utf8');

content = content.replace(
  /<span>Total Tagihan:<\/span>/g,
  '<span>Total Tagihan Akhir:</span>'
);

fs.writeFileSync('src/components/DashboardCustomer.tsx', content);
console.log('DashboardCustomer updated.');
