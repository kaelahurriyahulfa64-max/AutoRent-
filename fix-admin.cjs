const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

content = content.replace(
  "mobilNama: bk.mobilNama || 'Armada',\n      platNomor: allCars.find(c => c.id === bk.mobilId)?.platNomor || '-',",
  "mobilNama: bk.mobilNama || 'Armada',"
);

content = content.replace(
  "mobilNama: targetCar.nama,\n      platNomor: targetCar.platNomor,",
  "mobilNama: targetCar.nama,"
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('Fixed DashboardAdmin.tsx errors');
