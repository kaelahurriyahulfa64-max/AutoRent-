const fs = require('fs');

let customerContent = fs.readFileSync('src/components/DashboardCustomer.tsx', 'utf8');

// 1. Remove Status Pembayaran & Status Rental from Customer Booking Details
customerContent = customerContent.replace(
  /<p>Status Pembayaran: <span className=\{`px-2\.5 py-0\.5 rounded text-\[10px\] font-bold uppercase inline-block \$\{[\s\S]*?\}`\}>\{booking\?\.statusPembayaran \|\| \(isLunas \? 'Lunas' : 'Belum Bayar'\)\}<\/span><\/p>\s*<p>Status Rental: <span className=\{`px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase inline-block \$\{[\s\S]*?\}`\}>\{booking\?\.status \|\| 'Menunggu Pengambilan'\}<\/span><\/p>/,
  ''
);

// 2. Remove Nominal yang Harus Dibayar block
customerContent = customerContent.replace(
  /<div className="flex items-center justify-between bg-white border border-slate-100 p-3\.5 rounded-xl">\s*<span className="font-bold text-slate-500">Nominal yang Harus Dibayar:<\/span>\s*<span className="font-mono font-black text-blue-600 text-sm">\s*Rp \{nominalYangHarusDibayar\.toLocaleString\('id-ID'\)\}\s*<\/span>\s*<\/div>/,
  ''
);

fs.writeFileSync('src/components/DashboardCustomer.tsx', customerContent);
console.log('Fixed Customer Invoice Modal');

