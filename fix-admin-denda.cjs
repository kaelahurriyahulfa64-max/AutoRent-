const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Add onGenerateDemoDenda to DashboardAdminProps
content = content.replace(
  /onUpdateReviews: \(reviews: Review\[\]\) => void;/,
  `onUpdateReviews: (reviews: Review[]) => void;\n    onGenerateDemoDenda?: () => void;`
);

// Destructure onGenerateDemoDenda
content = content.replace(
  /onUpdateReviews,\n\s*onAddNotification,/,
  `onUpdateReviews,\n    onGenerateDemoDenda,\n    onAddNotification,`
);

// Add stats calculations
content = content.replace(
  /const armadaMaintenance = allCars\.filter\(c => c\.status === 'maintenance'\)\.length;/,
  `const armadaMaintenance = allCars.filter(c => c.status === 'maintenance').length;
  const kendaraanTerlambat = bookings.filter(b => b.status === 'Terlambat').length;
  const totalDendaBelumDibayar = bookings.filter(b => b.status === 'Terlambat' && b.statusDenda === 'Belum Dibayar').reduce((sum, b) => sum + (b.denda || 0), 0);`
);

// Add "Generate Demo Denda" button to header
content = content.replace(
  /<button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">/,
  `{onGenerateDemoDenda && (
            <button onClick={onGenerateDemoDenda} className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-200 transition-colors flex items-center gap-1 shadow-sm">
              <span className="hidden sm:inline">Generate Demo Denda</span>
              <span className="sm:hidden">Denda</span>
            </button>
          )}
          <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">`
);

// Add widgets for Kendaraan Terlambat and Total Denda Belum Dibayar
const newWidgets = `
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(225,29,72,0.2)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider block">Kendaraan Terlambat</span>
                  <h4 className="text-2xl font-black text-rose-900 mt-1">{kendaraanTerlambat}</h4>
                </div>
                <div className="p-2.5 bg-rose-100 rounded-xl">
                  <Clock className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-rose-600">
                Segera tindak lanjuti
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(217,119,6,0.2)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Denda Belum Dibayar</span>
                  <h4 className="text-xl font-black text-amber-900 mt-1">Rp {totalDendaBelumDibayar.toLocaleString('id-ID')}</h4>
                </div>
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-amber-600">
                Pemasukan tertunda
              </p>
            </div>
`;

// Insert the new widgets inside the Top Statistics Grid
content = content.replace(
  /<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">/,
  `<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">\n${newWidgets}`
);

// We need to make sure we import AlertCircle
if (!content.includes('AlertCircle')) {
  content = content.replace(
    /import \{/,
    `import { AlertCircle,`
  );
}

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('DashboardAdmin updated');
