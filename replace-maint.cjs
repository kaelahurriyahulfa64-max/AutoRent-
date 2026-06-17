const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardOwner.tsx', 'utf8');

const oldMaintenanceHtml = `      {activeTab === 'maintenance' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-2">Maintenance Mobil</h3>
          <p className="text-xs text-slate-500 mb-6">Daftar kendaraan yang sedang dalam proses perbaikan atau perawatan rutin.</p>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-semibold">Plat Nomor</th>
                    <th className="p-4 font-semibold">Merek & Model</th>
                    <th className="p-4 font-semibold">Tahun</th>
                    <th className="p-4 font-semibold">Transmisi</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allCars.filter(c => c.status === 'maintenance').map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-700">{c.platNomor}</td>
                      <td className="p-4 font-medium text-slate-800">{c.brand} {c.nama}</td>
                      <td className="p-4 text-slate-600">{c.tahun}</td>
                      <td className="p-4 text-slate-600">{c.transmisi}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                          Maintenance
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allCars.filter(c => c.status === 'maintenance').length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada kendaraan dalam maintenance.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      )}`;

const newMaintenanceHtml = `      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Persetujuan Maintenance</h3>
            <p className="text-xs text-slate-500 mb-6">Daftar pengajuan maintenance dari Admin yang membutuhkan persetujuan dan pembayaran Anda.</p>
            <div className="space-y-4">
              {maintenanceList.filter(m => m.status !== 'Selesai' && m.status !== 'Ditolak').map(rec => {
                const car = allCars.find(c => c.id === rec.mobilId);
                return (
                  <div key={rec.id} className="border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 text-sm">{rec.mobilNama}</strong>
                          <span className="text-xs text-slate-500 ml-2 font-mono">{car?.platNomor}</span>
                        </div>
                        <span className={\`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider \${
                          rec.status === 'Menunggu Persetujuan Owner' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          rec.status === 'Disetujui' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          rec.status === 'Menunggu Perbaikan' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          rec.status === 'Sedang Diperbaiki' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }\`}>
                          {rec.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        "{rec.kerusakan}"
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                        <span>Tanggal Pengajuan: {rec.tanggalPengajuan}</span>
                        <span>Prioritas: {rec.prioritas || 'Sedang'}</span>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 border-t border-slate-100 pt-4 md:border-none md:pt-0">
                      {rec.status === 'Menunggu Persetujuan Owner' && (
                        <>
                          <button onClick={() => {
                            const updated = maintenanceList.map(r => r.id === rec.id ? { ...r, status: 'Disetujui' as any } : r);
                            onUpdateMaintenanceList(updated);
                            onShowToast('Pengajuan maintenance disetujui', 'success');
                          }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer">
                            Setujui
                          </button>
                          <button onClick={() => {
                            const updated = maintenanceList.map(r => r.id === rec.id ? { ...r, status: 'Ditolak' as any } : r);
                            onUpdateMaintenanceList(updated);
                            onShowToast('Pengajuan maintenance ditolak', 'info');
                          }} className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer">
                            Tolak
                          </button>
                        </>
                      )}

                      {rec.status === 'Disetujui' && (
                        <button onClick={() => {
                          const cost = prompt('Masukkan Biaya Maintenance (Rp):', '500000');
                          if (cost && !isNaN(Number(cost))) {
                            const updated = maintenanceList.map(r => r.id === rec.id ? { ...r, status: 'Sedang Diperbaiki' as any, biaya: Number(cost) } : r);
                            onUpdateMaintenanceList(updated);
                            onShowToast('Pembayaran berhasil diproses', 'success');
                            
                            // Also update car status to maintenance
                            const updatedCars = allCars.map(c => c.id === rec.mobilId ? { ...c, status: 'maintenance' as any } : c);
                            if (typeof onUpdateCars === 'function') onUpdateCars(updatedCars);
                          }
                        }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer">
                          <Wallet className="w-3.5 h-3.5" />
                          Bayar & Proses
                        </button>
                      )}

                      {(rec.status === 'Sedang Diperbaiki' || rec.status === 'Menunggu Perbaikan') && (
                        <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-bold py-2 rounded-xl text-xs text-center">
                          {rec.biaya ? \`Rp \${rec.biaya.toLocaleString('id-ID')}\` : 'Sedang Diproses'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {maintenanceList.filter(m => m.status !== 'Selesai' && m.status !== 'Ditolak').length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">Semua pengajuan telah diproses.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Riwayat Pembayaran Maintenance</h3>
            <p className="text-xs text-slate-500 mb-6">Daftar biaya perbaikan kendaraan yang sudah selesai.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-semibold">Mobil</th>
                    <th className="p-4 font-semibold">Kerusakan</th>
                    <th className="p-4 font-semibold">Tanggal Selesai</th>
                    <th className="p-4 font-semibold text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceList.filter(m => m.status === 'Selesai').map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-700">{rec.mobilNama}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]">{rec.kerusakan}</td>
                      <td className="p-4 text-slate-600">{rec.estimasiSelesai}</td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-600">
                        {rec.biaya ? \`Rp \${rec.biaya.toLocaleString('id-ID')}\` : 'Gratis / Rp 0'}
                      </td>
                    </tr>
                  ))}
                  {maintenanceList.filter(m => m.status === 'Selesai').length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada riwayat maintenance.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(oldMaintenanceHtml, newMaintenanceHtml);
fs.writeFileSync('src/components/DashboardOwner.tsx', content);
console.log('Done replacing maintenance UI in DashboardOwner');
