const fs = require('fs');

// 1. Revert App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const demoRegex = /\s*const handleGenerateDemoDenda = \(\) => \{[\s\S]*?showToast\('10 Data Demo Denda Keterlambatan berhasil ditambahkan!', 'success'\);\n  \};\n/;
appContent = appContent.replace(demoRegex, '');
appContent = appContent.replace(/\s*onGenerateDemoDenda=\{handleGenerateDemoDenda\}/g, '');
fs.writeFileSync('src/App.tsx', appContent);

// 2. Revert DashboardAdmin.tsx
let adminContent = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');
adminContent = adminContent.replace(/\s*onGenerateDemoDenda\?: \(\) => void;/g, '');
adminContent = adminContent.replace(/\s*onGenerateDemoDenda,/g, '');
adminContent = adminContent.replace(/\s*const kendaraanTerlambat = bookings\.filter\(b => b\.status === 'Terlambat'\)\.length;/g, '');
adminContent = adminContent.replace(/\s*const totalDendaBelumDibayar = bookings\.filter\(b => b\.status === 'Terlambat' && b\.statusDenda === 'Belum Dibayar'\)\.reduce\(\(sum, b\) => sum \+ \(b\.denda \|\| 0\), 0\);/g, '');

const btnRegex = /\{onGenerateDemoDenda && \([\s\S]*?<\span className="sm:hidden">Denda<\/span>\n\s*<\/button>\n\s*\)\}\n\s*/;
adminContent = adminContent.replace(btnRegex, '');

const widgetRegex = /<div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl[\s\S]*?<div className="p-2\.5 bg-amber-100 rounded-xl">\n\s*<AlertCircle className="w-5 h-5 text-amber-600" \/>\n\s*<\/div>\n\s*<\/div>\n\s*<p className="text-\[10px\] font-bold text-amber-600">\n\s*Pemasukan tertunda\n\s*<\/p>\n\s*<\/div>/;
adminContent = adminContent.replace(widgetRegex, '');

fs.writeFileSync('src/components/DashboardAdmin.tsx', adminContent);

// 3. Revert DashboardOwner.tsx
let ownerContent = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');
ownerContent = ownerContent.replace(/const pendapatanDenda = bookings\.filter\(b => b\.statusDenda === 'Sudah Dibayar' && isDateInFilter\(b\.tanggalSelesai \|\| b\.tanggalBooking\)\)\.reduce\(\(sum, b\) => sum \+ \(b\.denda \|\| 0\), 0\);\n\s*const totalPendapatan = pendapatanRental \+ pendapatanDenda;/g, 'const totalPendapatan = pendapatanRental;');
ownerContent = ownerContent.replace(/const prevPendapatanDenda = bookings\.filter\(b => b\.statusDenda === 'Sudah Dibayar' && isDateInPreviousFilter\(b\.tanggalSelesai \|\| b\.tanggalBooking\)\)\.reduce\(\(sum, b\) => sum \+ \(b\.denda \|\| 0\), 0\);\n\s*const prevPendapatan = prevPendapatanRental \+ prevPendapatanDenda;/g, 'const prevPendapatan = prevPendapatanRental;');

// Revert the Ringkasan Keuangan breakdown in DashboardOwner
const incomeBreakdownRegex = /<div className="flex justify-between text-xs mt-3 pt-3 border-t border-emerald-500\/30">[\s\S]*?<\/div>\n\s*<\/div>/;
ownerContent = ownerContent.replace(incomeBreakdownRegex, '');
fs.writeFileSync('src/components/DashboardOwner.tsx', ownerContent);

// 4. Revert DashboardCustomer.tsx
let custContent = fs.readFileSync('src/components/DashboardCustomer.tsx', 'utf8');
custContent = custContent.replace(/statusDenda: \(dendaAuto > 0 \? 'Sudah Dibayar' : 'none'\) as 'Sudah Dibayar' \| 'none'/g, "statusDenda: dendaAuto > 0 ? 'pending' : 'none'");
fs.writeFileSync('src/components/DashboardCustomer.tsx', custContent);

// 5. Revert types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(/statusDenda\?: 'none' \| 'Sudah Dibayar' \| 'Belum Dibayar';/g, 'statusDenda?: string;');
typesContent = typesContent.replace(/\s*tanggalKembaliAktual\?: string;/g, '');
typesContent = typesContent.replace(/'Terlambat' \| /g, '');
fs.writeFileSync('src/types.ts', typesContent);

console.log('Revert completed');
