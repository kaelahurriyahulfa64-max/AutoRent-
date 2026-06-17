const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardAdmin.tsx', 'utf8');

// Update UI to add Jenis Pembayaran
const oldSelectMetode = `<select
                        value={walkInMetodeBayar}
                        onChange={(e) => setWalkInMetodeBayar(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      >
                        <option value="manual">Manual (Tunai / Transfer Langsung)</option>
                        <option value="gateway">Payment Gateway (Midtrans)</option>
                      </select>`;

const newSelectMetode = `
                      <select
                        value={walkInMetodeBayar}
                        onChange={(e) => setWalkInMetodeBayar(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      >
                        <option value="manual">Manual (Tunai / Transfer Langsung)</option>
                        <option value="gateway">Payment Gateway (Midtrans)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Pembayaran</label>
                      <select
                        value={walkInJenisPembayaran}
                        onChange={(e) => setWalkInJenisPembayaran(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      >
                        <option value="lunas">Lunas</option>
                        <option value="dp">DP (Down Payment)</option>
                      </select>
                    </div>
                    {walkInJenisPembayaran === 'dp' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Nominal DP</label>
                        <input
                          type="number"
                          value={walkInDPNominal}
                          onChange={(e) => setWalkInDPNominal(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Biarkan 0 untuk otomatis 30%"
                        />
                      </div>
                    )}`;

content = content.replace(oldSelectMetode, newSelectMetode);

// Update notification text
content = content.replace(
  /onAddNotification\('Booking Walk-In Berhasil', `Booking \$\{newBooking\.bookingCode\} telah dibuat dan langsung lunas\. Invoice otomatis terbuat\.`, 'success'\);/,
  `onAddNotification('Booking Walk-In Berhasil', \`Booking \${newBooking.bookingCode} telah dibuat. Status: \${statusPemb}. Invoice otomatis terbuat.\`, 'success');`
);

// Remove the old note
content = content.replace(
  /<div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-\[10px\] text-blue-700 leading-relaxed">\s*<strong>Catatan:<\/strong> Booking Walk-in akan otomatis tercatat sebagai <strong>Lunas<\/strong> dan kendaraan langsung berstatus <strong>Dalam Sewa<\/strong> tanpa melalui proses upload resi\. Pastikan uang telah diterima dengan sesuai\.\s*<\/div>/,
  ''
);

fs.writeFileSync('src/components/DashboardAdmin.tsx', content);
console.log('Fixed UI form');
