const fs = require('fs');

let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

adminContent = adminContent.replace(
  "        bensin: carBensin,\n        kapasitas: carKapasitas,\n        hargaSewa: Number(carHargaSewa),",
  "        bensin: carBensin,\n        kapasitas: carKapasitas,\n        platNomor: carPlat,\n        hargaSewa: Number(carHargaSewa),"
);

adminContent = adminContent.replace(
  "      kerusakan: maintKerusakan,\n      tanggalMasuk: new Date().toISOString().split('T')[0],",
  "      kerusakan: maintKerusakan,\n      tanggalPengajuan: new Date().toISOString().split('T')[0],"
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);
console.log('Fixed TS Errors very final');
