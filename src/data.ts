import { Mobil, Driver, Booking, Pembayaran, Invoice, Review, AppNotification, User, CartItem, SystemSettings, Refund, MaintenanceRecord } from './types';

// Simple robust hash algorithm (hex string output)
export function hashPassword(password: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < password.length; i++) {
    ch = password.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'));
}

// Predefined Users — Admin & Owner akun bawaan sistem
// Password hashes pre-computed: Admin@123 → 9d110f9e9ce64fed | Owner@123 → d53840d489af49a3
export const INITIAL_USERS: User[] = [
  { id: 'user_admin_1', name: 'Admin AutoRent', email: 'admin@autorent.com', phone: '081234567890', role: 'admin', passwordHash: '9d110f9e9ce64fed' },
  { id: 'user_owner_1', name: 'Owner AutoRent', email: 'owner@autorent.com', phone: '081234567891', role: 'owner', passwordHash: 'd53840d489af49a3' },
  { id: 'USR-CUST-1', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '08111222333', role: 'customer', passwordHash: 'budi123' },
  { id: 'walk-in-1', name: 'Agus Walkin', email: 'agus@walkin.com', phone: '0811223344', role: 'customer' },
  { id: 'walk-in-2', name: 'Siti Walkin', email: 'siti@walkin.com', phone: '0855667788', role: 'customer' }
];

// Seed Cars
export const INITIAL_MOBIL: Mobil[] = [
  { id: 'm_1', nama: 'Toyota Avanza 2022', brand: 'Toyota', tipe: 'MPV', transmisi: 'Matic', bensin: 'Bensin', kapasitas: 7, hargaSewa: 350000, foto: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 1234 ABC', aktif: true, tahun: 2022 },
  { id: 'm_2', nama: 'Honda Brio RS', brand: 'Honda', tipe: 'Hatchback', transmisi: 'Matic', bensin: 'Bensin', kapasitas: 5, hargaSewa: 300000, foto: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 5678 DEF', aktif: true, tahun: 2021 },
  { id: 'm_3', nama: 'Toyota Innova Reborn', brand: 'Toyota', tipe: 'MPV', transmisi: 'Matic', bensin: 'Diesel', kapasitas: 7, hargaSewa: 600000, foto: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 9012 GHI', aktif: true, tahun: 2023 },
  { id: 'm_4', nama: 'Mitsubishi Pajero Sport', brand: 'Mitsubishi', tipe: 'SUV', transmisi: 'Matic', bensin: 'Diesel', kapasitas: 7, hargaSewa: 900000, foto: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 3456 JKL', aktif: true, tahun: 2023 },
  { id: 'm_5', nama: 'Suzuki Ertiga Hybrid', brand: 'Suzuki', tipe: 'MPV', transmisi: 'Manual', bensin: 'Bensin', kapasitas: 7, hargaSewa: 350000, foto: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 7890 MNO', aktif: true, tahun: 2022 },
  { id: 'm_6', nama: 'Toyota Fortuner GR', brand: 'Toyota', tipe: 'SUV', transmisi: 'Matic', bensin: 'Diesel', kapasitas: 7, hargaSewa: 950000, foto: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 1122 PQR', aktif: true, tahun: 2024 },
  { id: 'm_7', nama: 'Honda CR-V', brand: 'Honda', tipe: 'SUV', transmisi: 'Matic', bensin: 'Bensin', kapasitas: 5, hargaSewa: 800000, foto: 'https://images.unsplash.com/photo-1563720225384-986424564ee1?auto=format&fit=crop&q=80&w=600', status: 'tersedia', platNomor: 'B 3344 STU', aktif: true, tahun: 2023 }
];

// Seed Drivers
export const INITIAL_DRIVERS: Driver[] = [
  { id: 'd_1', nama: 'Budi Santoso', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', telepon: '08123456789', tarifPerHari: 150000, tarifLemburPerJam: 20000, pengalamanTahun: 5, spesialisasi: ['Dalam Kota', 'Luar Kota'], rating: 4.8, reviewCount: 120, status: 'aktif', lokasi: 'Jakarta Pusat' },
  { id: 'd_2', nama: 'Agus Gunawan', foto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200', telepon: '08556677889', tarifPerHari: 200000, tarifLemburPerJam: 25000, pengalamanTahun: 8, spesialisasi: ['Luar Kota', 'Tour Guide'], rating: 4.9, reviewCount: 200, status: 'aktif', lokasi: 'Jakarta Selatan' },
  { id: 'd_3', nama: 'Dadang Suradang', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', telepon: '08778899001', tarifPerHari: 150000, tarifLemburPerJam: 20000, pengalamanTahun: 3, spesialisasi: ['Dalam Kota', 'Antar Jemput Bandara'], rating: 4.6, reviewCount: 55, status: 'aktif', lokasi: 'Jakarta Barat' },
  { id: 'd_4', nama: 'Joko Susilo', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', telepon: '08990011223', tarifPerHari: 250000, tarifLemburPerJam: 30000, pengalamanTahun: 10, spesialisasi: ['Luar Kota', 'VIP Escort', 'Tour Guide'], rating: 5.0, reviewCount: 350, status: 'aktif', lokasi: 'Jakarta Timur' }
];



// Seed Bookings
export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'BR-101', bookingCode: 'BR-101', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-01-10T09:00', tanggalSelesai: '2026-01-12T09:00', durasiHari: 2, totalBayar: 8000000, jumlahBayar: 8000000, sisaPelunasan: 0, status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-01-09 10:00' },
  { id: 'BR-102', bookingCode: 'BR-102', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-02-15T09:00', tanggalSelesai: '2026-02-18T09:00', durasiHari: 3, totalBayar: 10000000, jumlahBayar: 10000000, sisaPelunasan: 0, status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-02-14 10:00' },
  { id: 'BR-103', bookingCode: 'BR-103', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-03-20T09:00', tanggalSelesai: '2026-03-22T09:00', durasiHari: 2, totalBayar: 12000000, jumlahBayar: 12000000, sisaPelunasan: 0, status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-03-19 10:00' },
  { id: 'BR-104', bookingCode: 'BR-104', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-04-05T09:00', tanggalSelesai: '2026-04-10T09:00', durasiHari: 5, totalBayar: 15000000, jumlahBayar: 15000000, sisaPelunasan: 0, status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-04-04 10:00' },
  { id: 'BR-003', bookingCode: 'BR-003', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-05-10T09:00', tanggalSelesai: '2026-05-15T09:00', durasiHari: 5, totalBayar: 6000000, jumlahBayar: 6000000, sisaPelunasan: 0, status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-05-09 10:00' },
  { id: 'BR-106', bookingCode: 'BR-106', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-06-15T09:00', tanggalSelesai: '2026-06-20T09:00', durasiHari: 5, totalBayar: 3000000, jumlahBayar: 3000000, sisaPelunasan: 0, status: 'Dalam Sewa', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-14 10:00' },
  { id: 'BR-107', bookingCode: 'BR-107', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental_driver', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', driverId: 'd_1', driverNama: 'Budi Santoso', tanggalMulai: '2026-06-16T09:00', tanggalSelesai: '2026-06-21T09:00', durasiHari: 5, totalBayar: 4000000, jumlahBayar: 4000000, sisaPelunasan: 0, status: 'Dalam Sewa', statusPembayaran: 'Lunas', denganDriver: true, tipeBooking: 'online', tanggalBooking: '2026-06-15 10:00' },
  { id: 'BR-007', bookingCode: 'BR-007', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-06-10T09:00', tanggalSelesai: '2026-06-12T09:00', durasiHari: 2, totalBayar: 2000000, jumlahBayar: 2000000, sisaPelunasan: 0, denda: 200000, statusDenda: 'Sudah Dibayar', status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-09 10:00' },
  { id: 'BR-008', bookingCode: 'BR-008', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-06-11T09:00', tanggalSelesai: '2026-06-13T09:00', durasiHari: 2, totalBayar: 2500000, jumlahBayar: 2500000, sisaPelunasan: 0, status: 'Dalam Sewa', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-10 10:00' },
  { id: 'BR-110', bookingCode: 'BR-110', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-06-20T09:00', tanggalSelesai: '2026-06-25T09:00', durasiHari: 5, totalBayar: 3500000, jumlahBayar: 0, sisaPelunasan: 3500000, status: 'Menunggu Pembayaran', statusPembayaran: 'Menunggu Pembayaran', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-16 10:00' },
  { id: 'BR-111', bookingCode: 'BR-111', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-06-22T09:00', tanggalSelesai: '2026-06-27T09:00', durasiHari: 5, totalBayar: 4500000, jumlahBayar: 0, sisaPelunasan: 4500000, status: 'Menunggu Pembayaran', statusPembayaran: 'Menunggu Pembayaran', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-16 11:00' },
  { id: 'BR-112', bookingCode: 'BR-112', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-06-25T09:00', tanggalSelesai: '2026-06-30T09:00', durasiHari: 5, totalBayar: 5000000, jumlahBayar: 0, sisaPelunasan: 5000000, status: 'Menunggu Pembayaran', statusPembayaran: 'Menunggu Pembayaran', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-16 12:00' },
  { id: 'BR-001', bookingCode: 'BR-001', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-06-18T09:00', tanggalSelesai: '2026-06-25T09:00', durasiHari: 7, totalBayar: 7600000, jumlahBayar: 2400000, sisaPelunasan: 5200000, dpMinimal: 2400000, status: 'Menunggu Pelunasan', statusPembayaran: 'DP Dibayar', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-15 10:00' },
  { id: 'BR-002', bookingCode: 'BR-002', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-06-19T09:00', tanggalSelesai: '2026-06-23T09:00', durasiHari: 4, totalBayar: 4500000, jumlahBayar: 1500000, sisaPelunasan: 3000000, dpMinimal: 1500000, status: 'Menunggu Pelunasan', statusPembayaran: 'DP Dibayar', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-15 11:00' },
  { id: 'BR-115', bookingCode: 'BR-115', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-06-21T09:00', tanggalSelesai: '2026-06-24T09:00', durasiHari: 3, totalBayar: 3000000, jumlahBayar: 1000000, sisaPelunasan: 2000000, dpMinimal: 1000000, status: 'Menunggu Pelunasan', statusPembayaran: 'DP Dibayar', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-15 12:00' },
  { id: 'BR-116', bookingCode: 'BR-116', userId: 'walk-in-1', userNama: 'Agus Walkin', userPhone: '0811223344', layanan: 'rental', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', tanggalMulai: '2026-06-16T10:00', tanggalSelesai: '2026-06-18T10:00', durasiHari: 2, totalBayar: 2000000, jumlahBayar: 2000000, sisaPelunasan: 0, status: 'Dalam Sewa', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'walk_in', tanggalBooking: '2026-06-16 09:50' },
  { id: 'BR-117', bookingCode: 'BR-117', userId: 'walk-in-2', userNama: 'Siti Walkin', userPhone: '0855667788', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-06-17T10:00', tanggalSelesai: '2026-06-19T10:00', durasiHari: 2, totalBayar: 2500000, jumlahBayar: 2500000, sisaPelunasan: 0, status: 'Dalam Sewa', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'walk_in', tanggalBooking: '2026-06-16 14:50' },
  { id: 'BR-009', bookingCode: 'BR-009', userId: 'USR-CUST-1', userNama: 'Budi Santoso', layanan: 'rental', mobilId: 'm_2', mobilNama: 'Honda Brio RS', tanggalMulai: '2026-06-05T09:00', tanggalSelesai: '2026-06-08T09:00', durasiHari: 3, totalBayar: 3000000, jumlahBayar: 3000000, sisaPelunasan: 0, denda: 600000, statusDenda: 'Sudah Dibayar', status: 'Selesai', statusPembayaran: 'Lunas', denganDriver: false, tipeBooking: 'online', tanggalBooking: '2026-06-04 10:00' }
];


// Seed Payments
export const INITIAL_PAYMENTS: Pembayaran[] = [
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
];

// Data Initial Invoices
export const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-001', bookingId: 'BR-001', bookingCode: 'BR-001', subtotal: 7600000, denda: 0, total: 7600000, terbayar: 2400000, status: 'dp_lunas' },
  { id: 'INV-002', bookingId: 'BR-002', bookingCode: 'BR-002', subtotal: 4500000, denda: 0, total: 4500000, terbayar: 1500000, status: 'dp_lunas' },
  { id: 'INV-003', bookingId: 'BR-003', bookingCode: 'BR-003', subtotal: 6000000, denda: 0, total: 6000000, terbayar: 6000000, status: 'lunas' },
  { id: 'INV-007', bookingId: 'BR-007', bookingCode: 'BR-007', subtotal: 2000000, denda: 200000, total: 2200000, terbayar: 2200000, status: 'lunas' },
  { id: 'INV-008', bookingId: 'BR-008', bookingCode: 'BR-008', subtotal: 2500000, denda: 400000, total: 2900000, terbayar: 0, status: 'belum_bayar' },
  { id: 'INV-009', bookingId: 'BR-009', bookingCode: 'BR-009', subtotal: 2800000, denda: 600000, total: 3400000, terbayar: 3400000, status: 'lunas' },
  { id: 'INV-101', bookingId: 'BR-101', bookingCode: 'BR-101', subtotal: 3000000, denda: 0, total: 3000000, terbayar: 3000000, status: 'lunas' },
  { id: 'INV-102', bookingId: 'BR-102', bookingCode: 'BR-102', subtotal: 4000000, denda: 0, total: 4000000, terbayar: 4000000, status: 'lunas' },
  { id: 'INV-103', bookingId: 'BR-103', bookingCode: 'BR-103', subtotal: 5000000, denda: 0, total: 5000000, terbayar: 5000000, status: 'lunas' },
  { id: 'INV-104', bookingId: 'BR-104', bookingCode: 'BR-104', subtotal: 6000000, denda: 0, total: 6000000, terbayar: 6000000, status: 'lunas' },
  { id: 'INV-106', bookingId: 'BR-106', bookingCode: 'BR-106', subtotal: 3000000, denda: 0, total: 3000000, terbayar: 3000000, status: 'lunas' },
  { id: 'INV-107', bookingId: 'BR-107', bookingCode: 'BR-107', subtotal: 4000000, denda: 0, total: 4000000, terbayar: 4000000, status: 'lunas' },
  { id: 'INV-110', bookingId: 'BR-110', bookingCode: 'BR-110', subtotal: 3500000, denda: 0, total: 3500000, terbayar: 0, status: 'belum_bayar' },
  { id: 'INV-111', bookingId: 'BR-111', bookingCode: 'BR-111', subtotal: 4500000, denda: 0, total: 4500000, terbayar: 0, status: 'belum_bayar' },
  { id: 'INV-112', bookingId: 'BR-112', bookingCode: 'BR-112', subtotal: 5000000, denda: 0, total: 5000000, terbayar: 0, status: 'belum_bayar' },
  { id: 'INV-115', bookingId: 'BR-115', bookingCode: 'BR-115', subtotal: 3000000, denda: 0, total: 3000000, terbayar: 1000000, status: 'dp_lunas' },
  { id: 'INV-116', bookingId: 'BR-116', bookingCode: 'BR-116', subtotal: 2000000, denda: 0, total: 2000000, terbayar: 2000000, status: 'lunas' },
  { id: 'INV-117', bookingId: 'BR-117', bookingCode: 'BR-117', subtotal: 2500000, denda: 0, total: 2500000, terbayar: 2500000, status: 'lunas' }
];

// Data Initial Maintenance
export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'MT-001', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', kerusakan: 'Perbaikan Mesin', deskripsi: 'Turun mesin rutin', biaya: 10000000, status: 'Selesai', tanggalPengajuan: '2026-05-01', estimasiSelesai: '2026-05-05' },
  { id: 'MT-002', mobilId: 'm_2', mobilNama: 'Honda Brio RS', kerusakan: 'Servis AC', deskripsi: 'AC kurang dingin', biaya: 1500000, status: 'Menunggu Persetujuan Owner', tanggalPengajuan: '2026-06-16', estimasiSelesai: '2026-06-20' },
  { id: 'MT-003', mobilId: 'm_1', mobilNama: 'Toyota Avanza 2022', kerusakan: 'Ganti Ban', deskripsi: 'Ban botak', biaya: 0, status: 'Diproses', tanggalPengajuan: '2026-06-15', estimasiSelesai: '2026-06-17' }
];

// Seed Reviews
export const INITIAL_REVIEWS: Review[] = [];

// Seed Notifications
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'NOTIF-1', userId: 'all', title: 'Booking Baru', message: 'Booking baru berhasil dibuat (BR-110).', type: 'info', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-2', userId: 'USR-CUST-1', title: 'DP Dibayar', message: 'DP untuk booking BR-001 berhasil dibayar sebesar Rp 2.400.000.', type: 'success', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-3', userId: 'USR-CUST-1', title: 'Pelunasan Berhasil', message: 'Pelunasan untuk booking BR-003 berhasil diterima.', type: 'success', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-4', userId: 'user_owner_1', title: 'Maintenance Menunggu Persetujuan', message: 'Maintenance mobil m_2 menunggu persetujuan Owner.', type: 'warning', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-5', userId: 'user_admin_1', title: 'Refund Diajukan', message: 'Pengajuan refund untuk booking BR-112.', type: 'warning', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-6', userId: 'USR-CUST-1', title: 'Refund Disetujui', message: 'Refund untuk booking BR-111 telah disetujui.', type: 'success', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-7', userId: 'user_admin_1', title: 'Mobil Terlambat', message: 'Mobil m_1 terlambat dikembalikan (BR-008).', type: 'warning', read: false, timestamp: new Date().toISOString() },
  { id: 'NOTIF-8', userId: 'USR-CUST-1', title: 'Denda Dibayar', message: 'Denda untuk booking BR-007 berhasil dibayar.', type: 'success', read: false, timestamp: new Date().toISOString() }
];

// Initial System Settings
export const INITIAL_SETTINGS: SystemSettings = {
  appName: 'AutoRent',
  dpPercentage: 30,
  diskonPersen: 0,
  promoAktif: '',
  midtransServerKey: '',
  dendaPerHari: 100000,
  pajakPersen: 11,
  biayaLayanan: 50000,
  bankTransfer: [
    { id: 'b_1', bank: 'BCA', noRekening: '1234567890', atasNama: 'AutoRent Corp', icon: '' }
  ]
};

// Initial Cart (Empty)
export const INITIAL_CART: CartItem[] = [];

// Initial Refunds
export const INITIAL_REFUNDS: Refund[] = [
  // BR-111 jumlahBayar=0, sehingga totalDibayar & nominalRefund = 0 (belum ada pembayaran)
  { id: 'REF-001', bookingId: 'BR-111', bookingCode: 'BR-111', userId: 'USR-CUST-1', userNama: 'Kaela', totalDibayar: 0, nominalRefund: 0, alasanPembatalan: 'Batal karena jadwal berubah', alasan: 'Batal karena jadwal berubah', status: 'Disetujui', tanggalPengajuan: '2026-06-16T09:00', tanggalPersetujuan: '2026-06-16T09:30', approvedBy: 'Admin AutoRent' },
  // BR-112 jumlahBayar=0, sehingga totalDibayar & nominalRefund = 0
  { id: 'REF-002', bookingId: 'BR-112', bookingCode: 'BR-112', userId: 'USR-CUST-1', userNama: 'Kaela', totalDibayar: 0, nominalRefund: 0, alasanPembatalan: 'Keperluan mendadak', alasan: 'Keperluan mendadak', status: 'Menunggu Verifikasi', tanggalPengajuan: '2026-06-16T10:00' }
];

// Helper to load application state with default backups
export function getStoredState<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(`autorent_${key}`);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error loading state for ${key}`, error);
    return initialValue;
  }
}

// Helper to save state
export function setStoredState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`autorent_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving state for ${key}`, error);
  }
}

// Initial Storage Synchronizer
export function initLocalStorageOnLoad() {
  if (localStorage.getItem('autorent_initialized') !== 'v11') {
    setStoredState('users', INITIAL_USERS);
    setStoredState('mobil', INITIAL_MOBIL);
    setStoredState('drivers', INITIAL_DRIVERS);
    setStoredState('bookings', INITIAL_BOOKINGS);
    setStoredState('payments', INITIAL_PAYMENTS);
    setStoredState('invoices', INITIAL_INVOICES);
    setStoredState('maintenanceList', INITIAL_MAINTENANCE);
    setStoredState('reviews', INITIAL_REVIEWS);
    setStoredState('notifications', INITIAL_NOTIFICATIONS);
    setStoredState('cart', INITIAL_CART);
    setStoredState('settings', INITIAL_SETTINGS);
    setStoredState('refunds', INITIAL_REFUNDS);
    localStorage.setItem('autorent_initialized', 'v11');
  } else {
    // Always ensure settings has valid dpPercentage even if already initialized
    const existingSettings = getStoredState('settings', INITIAL_SETTINGS);
    if (!existingSettings.dpPercentage || isNaN(existingSettings.dpPercentage)) {
      setStoredState('settings', { ...INITIAL_SETTINGS, ...existingSettings, dpPercentage: INITIAL_SETTINGS.dpPercentage });
    }
    
    // Always ensure seed admin & owner credentials are correct (runs every load)
    const existingUsers: User[] = getStoredState('users', []);
    let changed = false;
    for (const seedUser of INITIAL_USERS) {
      const existingIndex = existingUsers.findIndex(
        u => u.email.toLowerCase() === seedUser.email.toLowerCase()
      );
      if (existingIndex < 0) {
        // Account doesn't exist yet — add it
        existingUsers.push(seedUser);
        changed = true;
      } else {
        // Account exists — force-sync password hash and role to match seed
        const existing = existingUsers[existingIndex];
        if (existing.passwordHash !== seedUser.passwordHash || existing.role !== seedUser.role) {
          existingUsers[existingIndex] = {
            ...existing,
            passwordHash: seedUser.passwordHash,
            role: seedUser.role
          };
          changed = true;
        }
      }
    }
    if (changed) setStoredState('users', existingUsers);

    // Sync missing seed cars
    const existingCars: Mobil[] = getStoredState('mobil', []);
    let carsChanged = false;
    for (const seedCar of INITIAL_MOBIL) {
      if (!existingCars.some(c => c.id === seedCar.id)) {
        existingCars.push(seedCar);
        carsChanged = true;
      }
    }
    if (carsChanged) setStoredState('mobil', existingCars);

    // Sync missing seed drivers
    const existingDrivers: Driver[] = getStoredState('drivers', []);
    let driversChanged = false;
    for (const seedDriver of INITIAL_DRIVERS) {
      if (!existingDrivers.some(d => d.id === seedDriver.id)) {
        existingDrivers.push(seedDriver);
        driversChanged = true;
      }
    }
    if (driversChanged) setStoredState('drivers', existingDrivers);
  }
}

// Status maintenance yang dianggap "aktif" (mobil harus dikunci)
const ACTIVE_MAINTENANCE_STATUSES = [
  'Disetujui', 'Menunggu Perbaikan', 'Sedang Diperbaiki', 'Diproses'
];

/**
 * Dynamically compute current status of a car based on:
 * 1. Active MaintenanceRecord (priority over booking check)
 * 2. car.status field
 * 3. Active bookings spanning right now
 *
 * @param car - The car to check
 * @param bookings - All bookings
 * @param maintenanceList - Optional: all maintenance records for accurate status
 */
export function getCarStatus(
  car: Mobil,
  bookings: Booking[],
  maintenanceList?: MaintenanceRecord[]
): 'Tersedia' | 'Disewa' | 'Maintenance' {
  const statusLower = (car.status || '').toLowerCase();

  // 1. Check active MaintenanceRecord first (source of truth over car.status)
  if (maintenanceList) {
    const hasActiveMaint = maintenanceList.some(
      m => m.mobilId === car.id && ACTIVE_MAINTENANCE_STATUSES.includes(m.status)
    );
    if (hasActiveMaint) return 'Maintenance';
  }

  // 2. Fallback: check car.status field directly
  if (statusLower === 'maintenance') {
    return 'Maintenance';
  }

  // 3. Check if there is an active booking spanning right now
  const now = new Date();
  const activeBooking = bookings.find(b => {
    if (b.mobilId !== car.id) return false;

    // Ignore seed bookings for presentation so they start as 'Tersedia'
    if (b.id && b.id.startsWith('BR-')) return false;

    const bStatus = (b.status || '').toLowerCase();
    const bPayStatus = (b.statusPembayaran || '').toLowerCase();

    // Skip completed or cancelled bookings
    if (['selesai', 'dibatalkan', 'ditolak', 'expired', 'kedaluwarsa'].includes(bStatus)) {
      return false;
    }

    // Check if booking is paid (DP Dibayar, Lunas, etc.) and confirmed/active
    const isPaid = bPayStatus === 'lunas' || bPayStatus === 'dp dibayar' || bPayStatus === 'dp_dibayar' || bPayStatus === 'menunggu pelunasan';
    const isActive = bStatus === 'dalam sewa' || bStatus === 'sewa aktif' || bStatus === 'aktif' || bStatus === 'menunggu pengambilan' || bStatus === 'lunas' || bStatus === 'dp dibayar' || bStatus === 'dikonfirmasi';

    if (!isPaid && !isActive) return false;

    if (!b.tanggalMulai || !b.tanggalSelesai) return false;
    const start = new Date(b.tanggalMulai.replace(' ', 'T'));
    const end = new Date(b.tanggalSelesai.replace(' ', 'T'));

    return (now >= start && now <= end);
  });

  if (activeBooking) return 'Disewa';

  if (statusLower === 'disewa' || statusLower === 'dibooking') return 'Disewa';

  return 'Tersedia';
}

