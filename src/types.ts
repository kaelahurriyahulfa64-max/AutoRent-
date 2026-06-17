export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'owner';
  passwordHash?: string;
  avatar?: string;
  nik?: string;
  sim?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  favorit?: string[]; // IDs of vehicles or drivers
  disabled?: boolean;
  password?: string;
  status?: string;
  joinDate?: string;
  isWalkIn?: boolean;
}

export interface Mobil {
  id: string;
  nama: string;
  brand: string;
  tipe: 'MPV' | 'SUV' | 'Sedan' | 'Van' | 'Hatchback';
  transmisi: 'Manual' | 'Matic';
  bensin: string;
  kapasitas: number;
  hargaSewa: number; // per hari
  foto: string;
  status: 'tersedia' | 'disewa' | 'maintenance' | 'Tersedia' | 'Disewa' | 'Maintenance';
  platNomor: string;
  aktif?: boolean;
  tahun?: number;
}

export interface Driver {
  id: string;
  nama: string;
  foto: string;
  telepon: string;
  tarifPerHari: number;
  tarifLemburPerJam: number;
  pengalamanTahun: number;
  spesialisasi: string[];
  rating: number;
  reviewCount: number;
  status: 'aktif' | 'booking' | 'istirahat' | 'nonaktif';
  lokasi: string;
  aktif?: boolean;
  alamat?: string;
  tarif?: number;
}



export interface CartItem {
  id: string;
  userId: string;
  layanan: 'rental' | 'rental_driver' | 'driver';
  
  // Detail Rental
  mobilId?: string;
  mobilNama?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  durasiHari?: number;
  denganDriver?: boolean;
  paketSewa?: string;
  customDurasiJam?: number;
  jenisPembayaran?: 'dp' | 'full';
  metodePembayaran?: 'gateway';
  
  // Detail Driver
  driverId?: string;
  driverNama?: string;

  totalHarga: number;
  status: 'draft' | 'siap_checkout' | 'checkout' | 'dibatalkan';
  
  // Lokasi Customer
  alamatLengkap?: string;
  latitude?: number;
  longitude?: number;
}

export interface SystemSettings {
  appName?: string;
  dpPercentage: number; // e.g. 30 for 30%
  diskonPersen: number;
  promoAktif: string;
  midtransServerKey?: string;
  dendaPerHari?: number;
  pajakPersen?: number;
  biayaLayanan?: number;
  bankTransfer?: Array<{
    id: string;
    bank: string;
    noRekening: string;
    atasNama: string;
    icon: string;
  }>;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userNama: string;
  userPhone?: string;
  layanan: 'rental' | 'rental_driver' | 'driver';
  
  // Detail Rental
  mobilId?: string;
  mobilNama?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  durasiHari?: number;
  denganDriver?: boolean;
  paketSewa?: string;
  customDurasiJam?: number;
  jenisPembayaran?: 'dp' | 'full';
  metodePembayaran?: 'gateway';
  
  // Detail Driver
  driverId?: string;
  driverNama?: string;
  
  // Lokasi Customer
  alamatLengkap?: string;
  latitude?: number;
  longitude?: number;
  
  // Keuangan
  totalSewa?: number;
  denda?: number;
  statusDenda?: 'none' | 'Belum Dibayar' | 'Sudah Dibayar';
  totalBayar: number;
  dpMinimal?: number;
  jumlahBayar: number; // total yg sudah dibayarkan
  sisaPelunasan?: number;
  
  // Perbaikan & Denda
  biayaTambahan?: number;
  totalAkhir?: number;
  statusPembayaran?: 'Belum Bayar' | 'Menunggu Verifikasi Admin' | 'DP Dibayar' | 'Lunas' | 'Menunggu Pelunasan' | 'Menunggu Pelunasan Denda' | 'Ditolak' | 'Dibatalkan' | 'Selesai' | 'Menunggu Pembayaran' | 'Kedaluwarsa' | 'Refund';
  midtransOrderId?: string;
  
  // Return info
  tanggalKembali?: string;
  jamKembali?: string;
    jamKembaliAktual?: string;
  kilometerAwal?: number;
  kilometerAkhir?: number;
  kondisiKendaraan?: string;
  catatanKerusakan?: string;
  fotoKendaraan?: string;

  // Jaminan
  jenisJaminan?: 'KTP' | 'SIM' | 'KTP + SIM' | 'KTP + Motor' | 'Motor' | 'Lainnya';
  nomorJaminan?: string;
  keteranganJaminan?: string;
  statusJaminan?: 'Belum Diserahkan' | 'Ditahan' | 'Dikembalikan';
  tanggalSerahTerima?: string;
  
  // Status
  status: 'pending_dp' | 'pending_konfirmasi' | 'aktif' | 'selesai' | 'dibatalkan' | 'menunggu_pembayaran' | 'dp_dibayar' | 'pembayaran_sebagian' | 'lunas' | 'diproses' | 'disetujui' | 'sedang_berjalan' | 'Menunggu Pembayaran' | 'DP Dibayar' | 'Lunas' | 'Menunggu Pengambilan' | 'Sewa Aktif' | 'Selesai' | 'Menunggu Pelunasan' | 'Menunggu Pelunasan Denda' | 'Menunggu Verifikasi Admin' | 'Ditolak' | 'Dibatalkan' | 'Expired' | 'Dalam Sewa' | 'Menunggu Verifikasi Refund' | 'Aktif' | 'Terlambat' | 'Tepat Waktu' | 'Dikonfirmasi';
  tanggalBooking: string;
  tipeBooking?: 'online' | 'walk_in';
}

export interface Pembayaran {
  id: string;
  bookingId: string;
  bookingCode: string;
  userId: string;
  userNama: string;
  tipeBayar: 'dp' | 'pelunasan' | 'lunas_full' | 'denda' | 'lunas';
  jumlah: number;
  metode: string;
  buktiTransferUrl?: string;
  tanggalBayar: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  midtransPaymentUrl?: string;
  midtransOrderId?: string;
}

export interface Invoice {
  id: string;
  invoiceCode?: string;
  bookingId: string;
  bookingCode: string;
  userId?: string;
  userNama?: string;
  layanan?: string;
  rincianItem?: string;
  subtotal?: number;
  denda?: number;
  biayaTambahan?: number;
  total: number;
  totalAkhir?: number;
  terbayar?: number;
  sisa?: number;
  status: 'belum_dibuat' | 'terbit' | 'lunas' | 'dp_lunas' | 'belum_bayar' | 'Kedaluwarsa' | 'kedaluwarsa' | 'refund' | 'Lunas';
  tanggalDibuat?: string;
  tanggal?: string;
  metodePembayaran?: string;
  tanggalPembayaran?: string;
  tanggalJatuhTempo?: string;
  totalNominal?: number;
  keterangan?: string;
}

export interface Review {
  id: string;
  bookingId?: string;
  bookingCode?: string;
  userId: string;
  userNama: string;
  userAvatar?: string;
  targetId: string; // mobilId atau driverId
  targetNama: string;
  tipe: 'mobil' | 'driver';
  rating: number; // 1-5
  ulasan: string;
  tanggal: string;
}

export interface AppNotification {
  id: string;
  userId: string; // "all" untuk semua user
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: string;
}

export interface LaporanPemasukan {
  id: string;
  tanggal: string;
  layanan: 'rental' | 'rental_driver';
  bookingCode: string;
  pemasukan: number;
  keterangan: string;
}

export interface Refund {
  id: string;
  bookingId: string;
  bookingCode: string;
  userId: string;
  userNama: string;
  totalDibayar: number;
  nominalRefund: number;
  alasanPembatalan: string;
  catatanTambahan?: string;
  metodeRefund?: 'Transfer Bank';
  metodePembayaranAwal?: string;
  bankNama?: string;
  rekeningNomor?: string;
  rekeningNama?: string;
  nomorTeleponRefund?: string;
  status: 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak' | 'Refund Diproses' | 'Refund Selesai';
  tanggalPengajuan: string;
  tanggalRefund?: string;
  nomorRefund?: string;
  alasan?: string;
  bankTujuan?: string;
  nominal?: number;
}

export interface MaintenanceRecord {
  id: string;
  mobilId: string;
  mobilNama: string;
  kerusakan: string;
  deskripsi?: string;
  prioritas?: 'Tinggi' | 'Sedang' | 'Rendah';
  foto?: string;
  estimasiSelesai: string; // The date input by admin, or when admin wants it back
  status: 'Menunggu Persetujuan Owner' | 'Disetujui' | 'Ditolak' | 'Diproses' | 'Selesai' | 'Menunggu Perbaikan' | 'Sedang Diperbaiki';
  tanggalPengajuan: string;
  
  // Owner only fields
  bengkel?: string;
  biaya?: number;
  tanggalPerbaikan?: string;
  catatanOwner?: string;
}
