const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// 1. Update calculateDelayAndPenalty to use settings.dendaPerHari
const oldCalculateDelayAndPenalty = `const calculateDelayAndPenalty = (tanggalSelesaiStr?: string, returnDateStr?: string) => {
    if (!tanggalSelesaiStr || !returnDateStr) return { days: 0, penalty: 0 };
    const scheduled = new Date(tanggalSelesaiStr);
    const actual = new Date(returnDateStr);
    
    scheduled.setHours(0,0,0,0);
    actual.setHours(0,0,0,0);
    
    const timeDiff = actual.getTime() - scheduled.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    
    const days = dayDiff > 0 ? dayDiff : 0;
    const penalty = days * 100000;
    return { days, penalty };
  };`;

const newCalculateDelayAndPenalty = `const calculateDelayAndPenalty = (tanggalSelesaiStr?: string, returnDateStr?: string) => {
    if (!tanggalSelesaiStr || !returnDateStr) return { days: 0, penalty: 0 };
    const scheduled = new Date(tanggalSelesaiStr);
    const actual = new Date(returnDateStr);
    
    scheduled.setHours(0,0,0,0);
    actual.setHours(0,0,0,0);
    
    const timeDiff = actual.getTime() - scheduled.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    
    const days = dayDiff > 0 ? dayDiff : 0;
    const dendaPerHari = settings?.dendaPerHari || 200000;
    const penalty = days * dendaPerHari;
    return { days, penalty };
  };`;

content = content.replace(oldCalculateDelayAndPenalty, newCalculateDelayAndPenalty);

// 2. Update handleReturnVehicle 
const oldHandleReturn = `const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          denda: penalty,
          totalAkhir: finalTotal,
          sisaPelunasan: remainingBalance,
          status: 'Selesai' as const,
          statusPembayaran: isFullyPaid ? ('Lunas' as const) : ('Menunggu Pelunasan Denda' as const),
          tanggalKembali: retDate,
          jamKembali: retTime,
          catatanKerusakan: notes,
          statusJaminan: 'Dikembalikan' as const
        };
      }
      return b;
    });`;

const newHandleReturn = `const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          denda: penalty,
          statusDenda: penalty > 0 ? ('Belum Dibayar' as const) : ('none' as const),
          totalAkhir: finalTotal,
          sisaPelunasan: remainingBalance,
          status: penalty > 0 ? ('Terlambat' as const) : ('Tepat Waktu' as const),
          statusPembayaran: isFullyPaid ? ('Lunas' as const) : ('Menunggu Pelunasan Denda' as const),
          tanggalKembali: retDate,
          jamKembali: retTime,
          catatanKerusakan: notes,
          statusJaminan: 'Dikembalikan' as const
        };
      }
      return b;
    });`;

content = content.replace(oldHandleReturn, newHandleReturn);

// 3. Render Settings input for "Denda Keterlambatan"
// We need to find the Pengaturan Sistem tab render block. Let's look for "Minimal DP" or something similar.
const dpRegex = /<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 animate-fade-in">[\s\S]*?<label className="block text-sm font-bold text-slate-700 mb-2">[\s\S]*?Persentase Minimal DP \(%\)[\s\S]*?<\/label>[\s\S]*?<input[\s\S]*?value=\{settings\.dpPercentage\}[\s\S]*?onChange=\{[\s\S]*?\}\) \}\) \}\)[\s\S]*?\/>[\s\S]*?<\/div>/;

// Wait, I will use a different strategy. I'll just find dpPercentage block.
const dpBlock = `<div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Persentase Minimal DP (%)
              </label>
              <input 
                type="number" 
                value={settings.dpPercentage}
                onChange={(e) => onUpdateSettings({ ...settings, dpPercentage: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>`;

const dendaBlock = `<div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Persentase Minimal DP (%)
              </label>
              <input 
                type="number" 
                value={settings.dpPercentage}
                onChange={(e) => onUpdateSettings({ ...settings, dpPercentage: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Denda Keterlambatan (Per Hari - Rp)
              </label>
              <input 
                type="number" 
                value={settings.dendaPerHari || 200000}
                onChange={(e) => onUpdateSettings({ ...settings, dendaPerHari: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>`;

content = content.replace(dpBlock, dendaBlock);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('DashboardAdmin updated.');
