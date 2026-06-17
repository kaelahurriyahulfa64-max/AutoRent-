const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /statusDenda\?: string; \/\/ 'none' \| 'pending' \| 'lunas'/,
  `statusDenda?: 'none' | 'Belum Dibayar' | 'Sudah Dibayar';`
);

content = content.replace(
  /jamKembali\?: string;/,
  `jamKembali?: string;
    tanggalKembaliAktual?: string;
    jamKembaliAktual?: string;`
);

content = content.replace(
  /status: 'pending_dp' \| 'pending_konfirmasi' \| 'aktif' \| 'selesai' \| 'dibatalkan' \| 'menunggu_pembayaran' \|\s*'dp_dibayar' \| 'pembayaran_sebagian' \| 'lunas' \| 'diproses' \| 'disetujui' \| 'sedang_berjalan' \| 'Menunggu Pembayaran'\s*\| 'DP Dibayar' \| 'Lunas' \| 'Menunggu Pengambilan' \| 'Sewa Aktif' \| 'Selesai' \| 'Menunggu Pelunasan' \| 'Menunggu\s*Pelunasan Denda' \| 'Menunggu Verifikasi Admin' \| 'Ditolak' \| 'Dibatalkan' \| 'Expired' \| 'Dalam Sewa' \| 'Menunggu\s*Verifikasi Refund' \| 'Aktif';/,
  `status: 'pending_dp' | 'pending_konfirmasi' | 'aktif' | 'selesai' | 'dibatalkan' | 'menunggu_pembayaran' | 'dp_dibayar' | 'pembayaran_sebagian' | 'lunas' | 'diproses' | 'disetujui' | 'sedang_berjalan' | 'Menunggu Pembayaran' | 'DP Dibayar' | 'Lunas' | 'Menunggu Pengambilan' | 'Sewa Aktif' | 'Selesai' | 'Menunggu Pelunasan' | 'Menunggu Pelunasan Denda' | 'Menunggu Verifikasi Admin' | 'Ditolak' | 'Dibatalkan' | 'Expired' | 'Dalam Sewa' | 'Menunggu Verifikasi Refund' | 'Aktif' | 'Terlambat';`
);

fs.writeFileSync('src/types.ts', content);
console.log('Fixed types.ts');
