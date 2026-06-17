const fs = require('fs');

const dataFile = 'd:/remix_-autorent/src/data.ts';
let content = fs.readFileSync(dataFile, 'utf8');

const bookings = `[
  // 5 Selesai
  { id: 'BR-101', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-01-10T09:00', tanggalSelesai: '2026-01-12T09:00', totalHarga: 3000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-01-09T10:00' },
  { id: 'BR-102', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-02-15T09:00', tanggalSelesai: '2026-02-18T09:00', totalHarga: 4000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-02-14T10:00' },
  { id: 'BR-103', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-03-20T09:00', tanggalSelesai: '2026-03-22T09:00', totalHarga: 5000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-03-19T10:00' },
  { id: 'BR-104', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-04-05T09:00', tanggalSelesai: '2026-04-10T09:00', totalHarga: 6000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-04-04T10:00' },
  { id: 'BR-003', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-05-10T09:00', tanggalSelesai: '2026-05-15T09:00', totalHarga: 6000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-05-09T10:00' },

  // 4 Berlangsung
  { id: 'BR-106', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-06-15T09:00', tanggalSelesai: '2026-06-20T09:00', totalHarga: 3000000, status: 'Berlangsung', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-14T10:00' },
  { id: 'BR-107', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-06-16T09:00', tanggalSelesai: '2026-06-21T09:00', totalHarga: 4000000, status: 'Berlangsung', denganDriver: true, driverId: 'd_1', tipeBooking: 'Online', createdAt: '2026-06-15T10:00' },
  { id: 'BR-007', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-06-10T09:00', tanggalSelesai: '2026-06-12T09:00', totalHarga: 2000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-09T10:00' }, 
  { id: 'BR-008', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-06-11T09:00', tanggalSelesai: '2026-06-13T09:00', totalHarga: 2500000, status: 'Berlangsung', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-10T10:00' }, 
  
  // 3 Menunggu DP
  { id: 'BR-110', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-06-20T09:00', tanggalSelesai: '2026-06-25T09:00', totalHarga: 3500000, status: 'Menunggu Pembayaran', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-16T10:00' },
  { id: 'BR-111', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-06-22T09:00', tanggalSelesai: '2026-06-27T09:00', totalHarga: 4500000, status: 'Menunggu Pembayaran', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-16T11:00' },
  { id: 'BR-112', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-06-25T09:00', tanggalSelesai: '2026-06-30T09:00', totalHarga: 5000000, status: 'Menunggu Pembayaran', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-16T12:00' },

  // 3 Menunggu Pelunasan 
  { id: 'BR-001', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-06-18T09:00', tanggalSelesai: '2026-06-25T09:00', totalHarga: 7600000, status: 'DP Dibayar', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-15T10:00' },
  { id: 'BR-002', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-06-19T09:00', tanggalSelesai: '2026-06-23T09:00', totalHarga: 4500000, status: 'DP Dibayar', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-15T11:00' },
  { id: 'BR-115', mobilId: 'm_1', userId: 'USR-CUST-1', tanggalMulai: '2026-06-21T09:00', tanggalSelesai: '2026-06-24T09:00', totalHarga: 3000000, status: 'DP Dibayar', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-15T12:00' },

  // 2 Walk-In
  { id: 'BR-116', mobilId: 'm_1', userId: 'walk-in-1', tanggalMulai: '2026-06-16T10:00', tanggalSelesai: '2026-06-18T10:00', totalHarga: 2000000, status: 'Berlangsung', denganDriver: false, tipeBooking: 'Walk-In', createdAt: '2026-06-16T09:50', namaCustomer: 'Agus Walkin', noHpCustomer: '0811223344' },
  { id: 'BR-117', mobilId: 'm_2', userId: 'walk-in-2', tanggalMulai: '2026-06-17T10:00', tanggalSelesai: '2026-06-19T10:00', totalHarga: 2500000, status: 'Lunas', denganDriver: false, tipeBooking: 'Walk-In', createdAt: '2026-06-16T14:50', namaCustomer: 'Siti Walkin', noHpCustomer: '0855667788' },
  
  { id: 'BR-009', mobilId: 'm_2', userId: 'USR-CUST-1', tanggalMulai: '2026-06-05T09:00', tanggalSelesai: '2026-06-08T09:00', totalHarga: 3000000, status: 'Selesai', denganDriver: false, tipeBooking: 'Online', createdAt: '2026-06-04T10:00' }
]`;

const payments = `[
  { id: 'PAY-J1', bookingId: 'BR-101', bookingCode: 'BR-101', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 5000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-01-09T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-J2', bookingId: 'BR-101', bookingCode: 'BR-101', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 3000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-01-09T10:06', tipeBayar: 'pelunasan' },

  { id: 'PAY-F1', bookingId: 'BR-102', bookingCode: 'BR-102', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 6000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-02-14T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-F2', bookingId: 'BR-102', bookingCode: 'BR-102', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 4000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-02-14T10:06', tipeBayar: 'pelunasan' },

  { id: 'PAY-M1', bookingId: 'BR-103', bookingCode: 'BR-103', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 7000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-03-19T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-M2', bookingId: 'BR-103', bookingCode: 'BR-103', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 5000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-03-19T10:06', tipeBayar: 'pelunasan' },

  { id: 'PAY-A1', bookingId: 'BR-104', bookingCode: 'BR-104', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 9000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-04-04T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-A2', bookingId: 'BR-104', bookingCode: 'BR-104', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 6000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-04-04T10:06', tipeBayar: 'pelunasan' },

  { id: 'PAY-Y1', bookingId: 'BR-003', bookingCode: 'BR-003', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 12000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-05-09T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-Y2', bookingId: 'BR-003', bookingCode: 'BR-003', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 6000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-05-09T10:06', tipeBayar: 'pelunasan' },

  { id: 'PAY-JN1', bookingId: 'BR-001', bookingCode: 'BR-001', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 2400000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-15T10:05', tipeBayar: 'dp' },
  { id: 'PAY-JN2', bookingId: 'BR-002', bookingCode: 'BR-002', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 1500000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-15T11:05', tipeBayar: 'dp' },
  { id: 'PAY-JN3', bookingId: 'BR-115', bookingCode: 'BR-115', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 1000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-15T12:05', tipeBayar: 'dp' },
  { id: 'PAY-JN4', bookingId: 'BR-106', bookingCode: 'BR-106', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 3000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-14T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-JN5', bookingId: 'BR-107', bookingCode: 'BR-107', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 4000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-15T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-JN6', bookingId: 'BR-116', bookingCode: 'BR-116', userId: 'walk-in-1', userNama: 'Agus Walkin', jumlah: 2000000, metode: 'Cash', status: 'disetujui', tanggalBayar: '2026-06-16T10:00', tipeBayar: 'pelunasan' },
  { id: 'PAY-JN7', bookingId: 'BR-117', bookingCode: 'BR-117', userId: 'walk-in-2', userNama: 'Siti Walkin', jumlah: 2500000, metode: 'Cash', status: 'disetujui', tanggalBayar: '2026-06-16T14:55', tipeBayar: 'pelunasan' },
  { id: 'PAY-JN8', bookingId: 'BR-007', bookingCode: 'BR-007', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 2000000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-09T10:05', tipeBayar: 'pelunasan' },
  { id: 'PAY-JN9', bookingId: 'BR-009', bookingCode: 'BR-009', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 2800000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-04T10:05', tipeBayar: 'pelunasan' }, 
  { id: 'PAY-F-007', bookingId: 'BR-007', bookingCode: 'BR-007', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 200000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-13T10:05', tipeBayar: 'denda' },
  { id: 'PAY-F-009', bookingId: 'BR-009', bookingCode: 'BR-009', userId: 'USR-CUST-1', userNama: 'Budi Santoso', jumlah: 600000, metode: 'Transfer', status: 'disetujui', tanggalBayar: '2026-06-11T10:05', tipeBayar: 'denda' }
]`;

const invoices = `[
  { id: 'INV-001', bookingId: 'BR-001', subtotal: 7600000, denda: 0, total: 7600000, terbayar: 2400000, status: 'dp_lunas' },
  { id: 'INV-002', bookingId: 'BR-002', subtotal: 4500000, denda: 0, total: 4500000, terbayar: 1500000, status: 'dp_lunas' },
  { id: 'INV-003', bookingId: 'BR-003', subtotal: 6000000, denda: 0, total: 6000000, terbayar: 6000000, status: 'lunas' },
  { id: 'INV-007', bookingId: 'BR-007', subtotal: 2000000, denda: 200000, total: 2200000, terbayar: 2200000, status: 'lunas' },
  { id: 'INV-008', bookingId: 'BR-008', subtotal: 2500000, denda: 400000, total: 2900000, terbayar: 0, status: 'pending' },
  { id: 'INV-009', bookingId: 'BR-009', subtotal: 2800000, denda: 600000, total: 3400000, terbayar: 3400000, status: 'lunas' },
  { id: 'INV-101', bookingId: 'BR-101', subtotal: 3000000, denda: 0, total: 3000000, terbayar: 3000000, status: 'lunas' },
  { id: 'INV-102', bookingId: 'BR-102', subtotal: 4000000, denda: 0, total: 4000000, terbayar: 4000000, status: 'lunas' },
  { id: 'INV-103', bookingId: 'BR-103', subtotal: 5000000, denda: 0, total: 5000000, terbayar: 5000000, status: 'lunas' },
  { id: 'INV-104', bookingId: 'BR-104', subtotal: 6000000, denda: 0, total: 6000000, terbayar: 6000000, status: 'lunas' },
  { id: 'INV-106', bookingId: 'BR-106', subtotal: 3000000, denda: 0, total: 3000000, terbayar: 3000000, status: 'lunas' },
  { id: 'INV-107', bookingId: 'BR-107', subtotal: 4000000, denda: 0, total: 4000000, terbayar: 4000000, status: 'lunas' },
  { id: 'INV-110', bookingId: 'BR-110', subtotal: 3500000, denda: 0, total: 3500000, terbayar: 0, status: 'pending' },
  { id: 'INV-111', bookingId: 'BR-111', subtotal: 4500000, denda: 0, total: 4500000, terbayar: 0, status: 'pending' },
  { id: 'INV-112', bookingId: 'BR-112', subtotal: 5000000, denda: 0, total: 5000000, terbayar: 0, status: 'pending' },
  { id: 'INV-115', bookingId: 'BR-115', subtotal: 3000000, denda: 0, total: 3000000, terbayar: 1000000, status: 'dp_lunas' },
  { id: 'INV-116', bookingId: 'BR-116', subtotal: 2000000, denda: 0, total: 2000000, terbayar: 2000000, status: 'lunas' },
  { id: 'INV-117', bookingId: 'BR-117', subtotal: 2500000, denda: 0, total: 2500000, terbayar: 2500000, status: 'lunas' }
]`;

const refunds = `[
  { id: 'REF-001', bookingId: 'BR-111', userId: 'USR-CUST-1', userNama: 'Kaela', nominalRefund: 2000000, alasan: 'Batal karena jadwal berubah', status: 'Disetujui', tanggalPengajuan: '2026-06-16T09:00', buktiTransferUrl: 'test.jpg' },
  { id: 'REF-002', bookingId: 'BR-112', userId: 'USR-CUST-1', userNama: 'Kaela', nominalRefund: 1000000, alasan: 'Keperluan mendadak', status: 'Menunggu Verifikasi', tanggalPengajuan: '2026-06-16T10:00' }
]`;

const maintenance = `[
  { id: 'MT-001', mobilId: 'm_1', tipe: 'Perbaikan Mesin', deskripsi: 'Turun mesin rutin', biaya: 10000000, status: 'Selesai', tanggalMulai: '2026-05-01', tanggalSelesai: '2026-05-05' },
  { id: 'MT-002', mobilId: 'm_2', tipe: 'Servis AC', deskripsi: 'AC kurang dingin', biaya: 1500000, status: 'Menunggu Persetujuan', tanggalMulai: '2026-06-16' },
  { id: 'MT-003', mobilId: 'm_1', tipe: 'Ganti Ban', deskripsi: 'Ban botak', biaya: 0, status: 'Diproses', tanggalMulai: '2026-06-15' }
]`;

const notifications = `[
  { id: 'NOTIF-1', title: 'Booking Baru', message: 'Booking baru berhasil dibuat (BR-110).', type: 'info', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-2', title: 'DP Dibayar', message: 'DP untuk booking BR-001 berhasil dibayar sebesar Rp 2.400.000.', type: 'success', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-3', title: 'Pelunasan Berhasil', message: 'Pelunasan untuk booking BR-003 berhasil diterima.', type: 'success', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-4', title: 'Maintenance Menunggu Persetujuan', message: 'Maintenance mobil m_2 menunggu persetujuan Owner.', type: 'warning', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-5', title: 'Refund Diajukan', message: 'Pengajuan refund untuk booking BR-112.', type: 'warning', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-6', title: 'Refund Disetujui', message: 'Refund untuk booking BR-111 telah disetujui.', type: 'success', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-7', title: 'Mobil Terlambat', message: 'Mobil m_1 terlambat dikembalikan (BR-008).', type: 'error', isRead: false, createdAt: new Date().toISOString() },
  { id: 'NOTIF-8', title: 'Denda Dibayar', message: 'Denda untuk booking BR-007 berhasil dibayar.', type: 'success', isRead: false, createdAt: new Date().toISOString() }
]`;

function replaceArray(content, arrayName, newData) {
  const startStr = 'export const ' + arrayName + ': ';
  const startIdx = content.indexOf(startStr);
  if (startIdx === -1) return content;
  
  const bracketStart = content.indexOf('[', startIdx);
  if (bracketStart === -1) return content;
  
  let bracketEnd = bracketStart;
  let brackets = 1;
  while (brackets > 0 && bracketEnd < content.length - 1) {
    bracketEnd++;
    if (content[bracketEnd] === '[') brackets++;
    if (content[bracketEnd] === ']') brackets--;
  }
  
  return content.substring(0, bracketStart) + newData + content.substring(bracketEnd + 1);
}

content = replaceArray(content, 'INITIAL_BOOKINGS', bookings);
content = replaceArray(content, 'INITIAL_PAYMENTS', payments);
content = replaceArray(content, 'INITIAL_INVOICES', invoices);
content = replaceArray(content, 'INITIAL_MAINTENANCE', maintenance);
content = replaceArray(content, 'INITIAL_REFUNDS', refunds);
content = replaceArray(content, 'INITIAL_NOTIFICATIONS', notifications);

// Replace v8, v9, v10 just to be safe
content = content.replace(/'autorent_initialized', 'v[0-9]+'/g, "'autorent_initialized', 'v10'");
content = content.replace(/'autorent_initialized' === 'v[0-9]+'/g, "'autorent_initialized' === 'v10'");
content = content.replace(/'v[0-9]+'/g, "'v10'"); 

fs.writeFileSync(dataFile, content);

console.log('Mock data safely injected and version updated to v10!');
