const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'DashboardAdmin.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* 👑 Header Dashboard */}'));
const endIdx = lines.findIndex(l => l.includes('activeTab === \'cars-bookings\' && (')) - 1; // The line before {activeTab === 'cars-bookings' && (

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = `      {/* 👑 Header Dashboard SaaS */}
      <div className="bg-white rounded-t-2xl border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Dashboard Admin</h2>
          <p className="text-slate-500 text-xs mt-0.5">Ringkasan operasional rental mobil</p>
        </div>
        
        {/* Search Bar Center */}
        <div className="flex-1 max-w-md mx-auto hidden md:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-xs transition-all"
            placeholder="Cari transaksi, mobil, driver..."
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 leading-none">Rian</p>
              <p className="text-[10px] font-semibold text-blue-600 mt-1">Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-blue-50">
              R
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 TABS CONDITIONALS */}

      {/* 1. TAB OVERVIEW (DASHBOARD) */}
      {activeTab === 'dashboard' && (
        <div className="p-6 space-y-6">
          
          {/* Top Statistics Grid (5 cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Booking</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{totalBookingsCount}</h4>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span>↑</span> 12% dari bulan lalu
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Mobil Aktif</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{armadaDisewa}</h4>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Car className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                Sedang berjalan hari ini
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Transaksi Harian</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{bookings.filter(b => b.tanggalSewa === new Date().toISOString().split('T')[0]).length || 0}</h4>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                Pesanan masuk hari ini
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Belum Lunas</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{bookings.filter(b => b.statusPembayaran !== 'Lunas').length}</h4>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <DollarSign className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                Menunggu pembayaran
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Maintenance</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{armadaMaintenance}</h4>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                Armada di bengkel
              </p>
            </div>
          </div>

          {/* Main Content Section (Row 2) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Booking Terbaru Table (Left - 2 cols) */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-800">Booking Terbaru</h3>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Lihat Semua →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase tracking-wider bg-white">
                      <th className="py-3 px-5">No Booking</th>
                      <th className="py-3 px-5">Customer</th>
                      <th className="py-3 px-5">Mobil</th>
                      <th className="py-3 px-5">Tanggal Rental</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {bookings.slice(0, 5).map(bk => {
                      const car = allCars.find(c => c.id === bk.mobilId);
                      return (
                        <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700">{bk.bookingCode}</td>
                          <td className="py-3 px-5">{bk.userNama}</td>
                          <td className="py-3 px-5">{car?.nama || 'Unknown'}</td>
                          <td className="py-3 px-5">{bk.tanggalSewa}</td>
                          <td className="py-3 px-5">{renderStatusRentalBadge(getStatusRentalText(bk.status))}</td>
                          <td className="py-3 px-5 text-center">
                            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors">Detail</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Revenue Bar Chart (Right - 1 col) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm text-slate-800">Pendapatan Bulanan</h3>
                <select className="text-[10px] border-none bg-slate-100 rounded-lg px-2 py-1 font-bold text-slate-600 outline-none cursor-pointer">
                  <option>Tahun 2026</option>
                  <option>Tahun 2025</option>
                </select>
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto pb-2 relative">
                <div className="absolute top-0 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-1/4 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-2/4 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-3/4 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                
                {/* Dummy Bars */}
                {[40, 60, 45, 80, 50, 95].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 z-10 group">
                    <div className="w-full bg-slate-100 rounded-t-sm h-full flex items-end justify-center relative rounded-b-md overflow-hidden">
                      <div className="w-full bg-blue-600 rounded-t-sm rounded-b-md transition-all duration-500 group-hover:bg-blue-500" style={{ height: \`\${h}%\` }}></div>
                      <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h}M
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Middle Section (Row 3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Vehicle Status Doughnut Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-sm text-slate-800 mb-6">Status Kendaraan</h3>
              
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                    
                    {/* Disewa (Blue) */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray={\`\${(armadaDisewa/totalArmada)*100} 100\`} strokeDashoffset="0" />
                    
                    {/* Tersedia (Emerald) */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="4" strokeDasharray={\`\${(armadaTersedia/totalArmada)*100} 100\`} strokeDashoffset={\`-\${(armadaDisewa/totalArmada)*100}\`} />
                    
                    {/* Maintenance (Amber) */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-400" strokeWidth="4" strokeDasharray={\`\${(armadaMaintenance/totalArmada)*100} 100\`} strokeDashoffset={\`-\${((armadaDisewa+armadaTersedia)/totalArmada)*100}\`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{totalArmada}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Tersedia</span>
                  <span className="text-xs font-bold text-slate-800">{armadaTersedia}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Disewa</span>
                  <span className="text-xs font-bold text-slate-800">{armadaDisewa}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Bengkel</span>
                  <span className="text-xs font-bold text-slate-800">{armadaMaintenance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Nonaktif</span>
                  <span className="text-xs font-bold text-slate-800">{allCars.filter(c=>c.status==='tidak_tersedia').length}</span>
                </div>
              </div>
            </div>

            {/* Driver Schedule Today */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-800">Jadwal Driver Hari Ini</h3>
                <button className="text-xs text-blue-600 font-semibold hover:underline">Semua Jadwal</button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {allDrivers.slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-blue-100 transition-colors bg-slate-50/30">
                    <img src={d.foto} alt={d.nama} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{d.nama}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{d.status === 'booking' ? 'Bertugas' : 'Standby'}</p>
                    </div>
                    <div className="text-right">
                      {d.status === 'booking' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">Bertugas</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">Tersedia</span>
                      )}
                      <p className="text-[9px] text-slate-400 font-medium mt-1">08:00 - 17:00</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notifications Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
              <h3 className="font-bold text-sm text-slate-800 mb-6">Aktivitas Terbaru</h3>
              
              <div className="flex-1 relative border-l-2 border-slate-100 ml-3 space-y-6">
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Booking Baru Dibuat</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Andi Susanto memesan Toyota Avanza</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">10 menit yang lalu</span>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Pembayaran Diterima</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pembayaran pelunasan Rp 350.000 (QRIS)</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">45 menit yang lalu</span>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Reminder Maintenance</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Waktunya ganti oli rutin untuk Brio.</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">2 jam yang lalu</span>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Sistem Login</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Admin Rian login ke dalam sistem.</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">5 jam yang lalu</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Bottom Section (Row 4): Upcoming Bookings */}
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Prediksi Rental 7 Hari Kedepan
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const isToday = offset === 0;
                // Dummy logic for forecast:
                const forecastCount = Math.floor(Math.random() * 8) + 2; 
                
                return (
                  <div key={offset} className={\`p-4 rounded-xl border \${isToday ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-200 transition-colors'} text-center flex flex-col items-center justify-center gap-2\`}>
                    <span className={\`text-[10px] font-bold uppercase tracking-wider \${isToday ? 'text-blue-600' : 'text-slate-500'}\`}>
                      {isToday ? 'Hari Ini' : d.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-black text-slate-800">{d.getDate()}</span>
                    <div className="mt-1">
                      <span className={\`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold \${isToday ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>
                        {forecastCount} Booking
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
`;

  lines.splice(startIdx, endIdx - startIdx, newContent);
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log("Replaced successfully!");
} else {
  console.log("Indices not found", startIdx, endIdx);
}
