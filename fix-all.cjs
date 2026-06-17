const fs = require('fs');

let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

adminContent = adminContent.replace(/platNomor:.*,/g, '');
fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);

let ownerContent = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

ownerContent = ownerContent.replace('  onAddNotification,\n  activeTab:', '  onAddNotification,\n  onUpdateCars,\n  activeTab:');

fs.writeFileSync('src/components/DashboardOwner.tsx', ownerContent);

console.log('Fixed errors in Admin and Owner');
