const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardCustomer.tsx', 'utf8');

content = content.replace(
  /statusDenda: dendaAuto > 0 \? 'lunas' : 'none'/g,
  "statusDenda: dendaAuto > 0 ? 'Sudah Dibayar' : 'none'"
);

fs.writeFileSync('src/components/DashboardCustomer.tsx', content);
console.log('Fixed statusDenda in DashboardCustomer.tsx');
