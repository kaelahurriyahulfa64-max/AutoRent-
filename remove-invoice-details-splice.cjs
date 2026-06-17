const fs = require('fs');

// Remove from DashboardCustomer.tsx
const custFile = 'd:/remix_-autorent/src/components/DashboardCustomer.tsx';
let custContent = fs.readFileSync(custFile, 'utf8');
let custLines = custContent.split('\n');

const custStart = custLines.findIndex(line => line.includes('<span>Subtotal Sewa Mobil:</span>')) - 1;
const custEnd = custLines.findIndex(line => line.includes('<span>Total:</span>')) - 1;
if (custStart > 0 && custEnd > custStart) {
  custLines.splice(custStart, custEnd - custStart);
  fs.writeFileSync(custFile, custLines.join('\n'));
  console.log('Removed from DashboardCustomer.tsx');
}

// Remove from DashboardAdmin.tsx
const adminFile = 'd:/remix_-autorent/src/components/DashboardAdmin.tsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');
let adminLines = adminContent.split('\n');

const adminStart = adminLines.findIndex(line => line.includes('<span>Subtotal Sewa Mobil:</span>')) - 1;
const adminEnd = adminLines.findIndex(line => line.includes('<span>Total:</span>')) - 1;
if (adminStart > 0 && adminEnd > adminStart) {
  adminLines.splice(adminStart, adminEnd - adminStart);
  fs.writeFileSync(adminFile, adminLines.join('\n'));
  console.log('Removed from DashboardAdmin.tsx');
}
