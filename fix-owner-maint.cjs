const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

// 1. Update calculation of maintenance cost
content = content.replace(
  /const totalMaintenanceCost = allCars\.filter\(c => c\.status === 'maintenance'\)\.length \* 500000; \/\/ Simulated maintenance cost\s*const totalPengeluaran = totalRefundAmount \+ totalMaintenanceCost;\s*const labaBersih = totalPendapatan - totalPengeluaran;\s*const prevPengeluaran = prevRefunds\.reduce\(\(sum, r\) => sum \+ r\.nominal, 0\) \+ totalMaintenanceCost;/,
  `const totalMaintenanceCost = maintenanceList
    .filter(m => (m.status === 'Selesai' || m.status === 'Sedang Diperbaiki') && isDateInFilter(m.tanggalPengajuan))
    .reduce((sum, m) => sum + (m.biaya || 0), 0);
  const totalPengeluaran = totalRefundAmount + totalMaintenanceCost;
  const labaBersih = totalPendapatan - totalPengeluaran;
  
  const prevMaintenanceCost = maintenanceList
    .filter(m => (m.status === 'Selesai' || m.status === 'Sedang Diperbaiki') && isDateInPreviousFilter(m.tanggalPengajuan))
    .reduce((sum, m) => sum + (m.biaya || 0), 0);
  const prevPengeluaran = prevRefunds.reduce((sum, r) => sum + r.nominal, 0) + prevMaintenanceCost;`
);

// 2. Insert Table for Maintenance List in Laporan Keuangan
const maintenanceTableCode = `
            {/* Rincian Pengeluaran Maintenance */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm mt-6">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Rincian Pengeluaran Maintenance (Telah Disetujui)</h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold">Mobil</th>
                    <th className="pb-3 font-semibold">Kerusakan</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {maintenanceList
                    .filter(m => (m.status === 'Selesai' || m.status === 'Sedang Diperbaiki') && isDateInFilter(m.tanggalPengajuan))
                    .map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-slate-500 font-mono">{m.tanggalPengajuan}</td>
                      <td className="py-3 font-bold text-slate-700">{m.mobilNama}</td>
                      <td className="py-3 text-slate-500 italic">"{m.kerusakan}"</td>
                      <td className="py-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">{m.status}</span></td>
                      <td className="py-3 text-right font-bold text-slate-700">Rp {(m.biaya || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {maintenanceList.filter(m => (m.status === 'Selesai' || m.status === 'Sedang Diperbaiki') && isDateInFilter(m.tanggalPengajuan)).length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-slate-400">Tidak ada pengeluaran maintenance pada periode ini.</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 font-bold">
                    <td colSpan={4} className="py-3 text-right text-slate-600">Total Pengeluaran Maintenance:</td>
                    <td className="py-3 text-right text-rose-600">Rp {totalMaintenanceCost.toLocaleString('id-ID')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
`;

// Insert the table just after the Ringkasan Keuangan & Laporan div closes
content = content.replace(
  /<\/div>\s*<\/div>\s*\{\/\* 4\. DAFTAR PENYEWAAN TERBARU \*\/\}/,
  `</div>\n            </div>\n\n${maintenanceTableCode}\n          </div>\n\n          {/* 4. DAFTAR PENYEWAAN TERBARU */}`
);

fs.writeFileSync('src/components/DashboardOwner.tsx', content);
console.log('Fixed DashboardOwner maintenance cost');
