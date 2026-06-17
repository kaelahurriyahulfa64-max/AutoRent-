const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

// 1. Calculate pendapatanRental and pendapatanDenda
content = content.replace(
  /const totalPendapatan = filteredPayments\.reduce\(\(sum, p\) => sum \+ p\.jumlah, 0\);/,
  `const pendapatanRental = filteredPayments.reduce((sum, p) => sum + p.jumlah, 0);
    const pendapatanDenda = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInFilter(b.tanggalSelesai || b.tanggalBooking)).reduce((sum, b) => sum + (b.denda || 0), 0);
    const totalPendapatan = pendapatanRental + pendapatanDenda;`
);

// Do the same for previous period to calculate diff correctly
content = content.replace(
  /const prevPendapatan = prevPayments\.reduce\(\(sum, p\) => sum \+ p\.jumlah, 0\);/,
  `const prevPendapatanRental = prevPayments.reduce((sum, p) => sum + p.jumlah, 0);
    const prevPendapatanDenda = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInPreviousFilter(b.tanggalSelesai || b.tanggalBooking)).reduce((sum, b) => sum + (b.denda || 0), 0);
    const prevPendapatan = prevPendapatanRental + prevPendapatanDenda;`
);

// 2. Update the "Ringkasan Keuangan" block to show the split
const oldRingkasanKeuangan = `<div className="flex justify-between">
                      <span className="text-slate-500">Total Pendapatan</span>
                      <span className="font-bold text-slate-800">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
                    </div>`;
                    
const newRingkasanKeuangan = `<div className="flex justify-between">
                      <span className="text-slate-500">Pendapatan Rental</span>
                      <span className="font-bold text-slate-700">Rp {pendapatanRental.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pendapatan Denda</span>
                      <span className="font-bold text-slate-700">Rp {pendapatanDenda.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-slate-700 font-bold">Total Pendapatan</span>
                      <span className="font-bold text-slate-900">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
                    </div>`;

content = content.replace(oldRingkasanKeuangan, newRingkasanKeuangan);

// Update chart to include Denda? The prompt says "Memasukkan data pembayaran denda ke dalam Chart Pendapatan."
// Currently barChartData uses filteredPayments.
content = content.replace(
  /sortedPayments\.forEach\(p => \{/,
  `// Add rental payments
      sortedPayments.forEach(p => {`
);

// After the sortedPayments loop, add denda to the same map
content = content.replace(
  /\};\s*\}, \[filteredPayments, periodeFilter\]\);/,
  `};
      
      // Add denda income to chart
      const paidDendaBookings = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInFilter(b.tanggalSelesai || b.tanggalBooking));
      paidDendaBookings.forEach(b => {
        const dendaDate = b.tanggalKembaliAktual || b.tanggalSelesai || b.tanggalBooking;
        let key = dendaDate.substring(0, 10);
        if (periodeFilter === 'bulanan' || periodeFilter === 'tahunan') {
          const d = new Date(dendaDate);
          key = periodeFilter === 'bulanan' ? \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}\` : \`\${d.getFullYear()}\`;
        }
        if (!dataMap[key]) dataMap[key] = 0;
        dataMap[key] += (b.denda || 0);
      });
      
    }, [filteredPayments, bookings, periodeFilter]);`
);


fs.writeFileSync('src/components/DashboardOwner.tsx', content);
console.log('Fixed DashboardOwner.tsx');
