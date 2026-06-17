const fs = require('fs');

let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Fix the missing platNomor in Mobil creation (line 969)
// Let's find where platNomor is missing in the object
adminContent = adminContent.replace(
  "bensin: carBensin,\n      kapasitas: carKapasitas,",
  "bensin: carBensin,\n      kapasitas: carKapasitas,\n      platNomor: carPlat,"
);

adminContent = adminContent.replace(
  "bensin: carBensin,\n        kapasitas: carKapasitas,",
  "bensin: carBensin,\n        kapasitas: carKapasitas,\n        platNomor: carPlat,"
);


// Replace jenisKerusakan with kerusakan
adminContent = adminContent.replace(/jenisKerusakan:/g, 'kerusakan:');

fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);
console.log('Fixed errors in Admin');
