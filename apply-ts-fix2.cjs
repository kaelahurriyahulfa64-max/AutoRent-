const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardCustomer.tsx', 'utf8');

content = content.replace(
  /statusDenda: dendaAuto > 0 \? 'Belum Dibayar' : 'none'/g,
  "statusDenda: dendaAuto > 0 ? ('Belum Dibayar' as const) : ('none' as const)"
);

fs.writeFileSync('src/components/DashboardCustomer.tsx', content);
console.log('Added as const to statusDenda in DashboardCustomer.');
