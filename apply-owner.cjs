const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

// Update pendapatanDenda calculation
const oldPendapatanRental = `const pendapatanRental = filteredPayments.reduce((sum, p) => sum + p.jumlah, 0);\n    const totalPendapatan = pendapatanRental;`;

const newPendapatanRental = `const pendapatanRental = filteredPayments.reduce((sum, p) => sum + p.jumlah, 0);
    const pendapatanDenda = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInFilter(b.tanggalSelesai || b.tanggalBooking)).reduce((sum, b) => sum + (b.denda || 0), 0);
    const totalPendapatan = pendapatanRental + pendapatanDenda;`;

content = content.replace(oldPendapatanRental, newPendapatanRental);

// Update prevPendapatanDenda
const oldPrevPendapatan = `const prevPendapatanRental = prevPayments.reduce((sum, p) => sum + p.jumlah, 0);\n    const prevPendapatan = prevPendapatanRental;`;

const newPrevPendapatan = `const prevPendapatanRental = prevPayments.reduce((sum, p) => sum + p.jumlah, 0);
    const prevPendapatanDenda = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInPreviousFilter(b.tanggalSelesai || b.tanggalBooking)).reduce((sum, b) => sum + (b.denda || 0), 0);
    const prevPendapatan = prevPendapatanRental + prevPendapatanDenda;`;

content = content.replace(oldPrevPendapatan, newPrevPendapatan);

// Update Ringkasan Keuangan breakdown to show Pendapatan Denda
const oldCardBlock = `<div className="mt-4 pt-4 border-t border-emerald-500/30 flex items-center justify-between text-emerald-100">
              <span className="text-xs">Dari Total Transaksi</span>
              <span className="font-semibold text-sm">{totalTransaksi}</span>
            </div>`;

const newCardBlock = `<div className="flex justify-between text-xs mt-3 pt-3 border-t border-emerald-500/30 text-emerald-100">
              <div className="flex flex-col gap-1">
                <span>Pendapatan Rental</span>
                <span className="font-semibold">Rp {pendapatanRental.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span>Pendapatan Denda</span>
                <span className="font-semibold">Rp {pendapatanDenda.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-emerald-500/30 flex items-center justify-between text-emerald-100">
              <span className="text-xs">Dari Total Transaksi</span>
              <span className="font-semibold text-sm">{totalTransaksi}</span>
            </div>`;

content = content.replace(oldCardBlock, newCardBlock);

fs.writeFileSync('src/components/DashboardOwner.tsx', content);
console.log('DashboardOwner updated.');
