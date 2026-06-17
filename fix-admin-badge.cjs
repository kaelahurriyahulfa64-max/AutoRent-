const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

content = content.replace(
  /const renderStatusRentalBadge = \(status: 'Menunggu Pengambilan' \| 'Dalam Sewa' \| 'Selesai' \| 'Dibatalkan'\) => \{/,
  `const renderStatusRentalBadge = (status: string) => {
      if (status === 'Terlambat') {
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <Clock className="w-3 h-3 mr-1" />
            Terlambat
          </span>
        );
      }`
);

content = content.replace(
  /case 'Selesai': return 'Selesai';/,
  `case 'Selesai': return 'Selesai';
        case 'Terlambat': return 'Terlambat';`
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('Fixed renderStatusRentalBadge');
