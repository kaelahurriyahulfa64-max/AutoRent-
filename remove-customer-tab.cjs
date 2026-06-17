const fs = require('fs');

// Remove from App.tsx
const appFile = 'd:/remix_-autorent/src/App.tsx';
let appContent = fs.readFileSync(appFile, 'utf8');
const appLines = appContent.split('\n');

const appButtonStart = appLines.findIndex(line => line.includes('setAdminActiveTab(\'customers\')')) - 2;
// The button spans 14 lines
appLines.splice(appButtonStart, 14);
fs.writeFileSync(appFile, appLines.join('\n'));
console.log('Removed from App.tsx');

// Remove from DashboardAdmin.tsx
const adminFile = 'd:/remix_-autorent/src/components/DashboardAdmin.tsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');
const adminLines = adminContent.split('\n');

const tabStart = adminLines.findIndex(line => line.includes('TAB CUSTOMERS (DAFTAR CUSTOMER)'));
let tabEnd = tabStart;
while (tabEnd < adminLines.length && !adminLines[tabEnd].includes('TAB NOTIFICATIONS (KIRIM PENGUMUMAN / NOTIFIKASI)')) {
  tabEnd++;
}
// Delete from tabStart up to just before tabEnd
adminLines.splice(tabStart, tabEnd - tabStart);
fs.writeFileSync(adminFile, adminLines.join('\n'));
console.log('Removed from DashboardAdmin.tsx');
