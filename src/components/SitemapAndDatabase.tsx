import React, { useState } from 'react';
import { Database, Network, GitPullRequest, ToggleLeft, ArrowRight, BookOpen, Layers, Link2, Key, Info } from 'lucide-react';

export default function SitemapAndDatabase() {
  const [activeSubTab, setActiveSubTab] = useState<'sitemap' | 'flow' | 'database' | 'fitur'>('sitemap');

  const databaseTables = [
    {
      name: 'users',
      role: 'Menyimpan kredensial dan detail profil pengguna.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik pengguna' },
        { name: 'name', type: 'VARCHAR', desc: 'Nama lengkap' },
        { name: 'email', type: 'VARCHAR', desc: 'Email unik login' },
        { name: 'phone', type: 'VARCHAR', desc: 'Nomor telepon seluler' },
        { name: 'role', type: 'ENUM', desc: 'customer | admin | owner' },
        { name: 'nik', type: 'VARCHAR (Opt)', desc: 'NIK untuk keperluan jaminan sewa' },
        { name: 'sim', type: 'VARCHAR (Opt)', desc: 'Nomor SIM A untuk sewa lepas kunci' },
        { name: 'address', type: 'TEXT (Opt)', desc: 'Alamat tempat tinggal' }
      ],
      relations: ['Merujuk ke booking.userId (1-to-N)', 'Merujuk ke review.userId (1-to-N)', 'Merujuk ke pembayaran.userId (1-to-N)']
    },
    {
      name: 'mobil',
      role: 'Menyimpan inventaris mobil rental.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik mobil' },
        { name: 'nama', type: 'VARCHAR', desc: 'Nama/Model kendaraan' },
        { name: 'brand', type: 'VARCHAR', desc: 'Brand (Toyota, Honda, dll)' },
        { name: 'tipe', type: 'VARCHAR', desc: 'MPV | SUV | Sedan | Van' },
        { name: 'transmisi', type: 'VARCHAR', desc: 'Manual | Matic' },
        { name: 'bensin', type: 'VARCHAR', desc: 'Jenis bahan bakar' },
        { name: 'kapasitas', type: 'INTEGER', desc: 'Jumlah kapasitas penunpang' },
        { name: 'hargaSewa', type: 'DECIMAL', desc: 'Biaya sewa harian' },
        { name: 'status', type: 'ENUM', desc: 'tersedia | disewa | maintenance' },
        { name: 'platNomor', type: 'VARCHAR', desc: 'Nomor polisi kendaraan' }
      ],
      relations: ['Merujuk ke booking.mobilId (1-to-N)']
    },
    {
      name: 'driver',
      role: 'Database personil driver profesional beserta status & biodata.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik driver' },
        { name: 'nama', type: 'VARCHAR', desc: 'Nama lengkap driver' },
        { name: 'telepon', type: 'VARCHAR', desc: 'Nomor kontak WhatsApp' },
        { name: 'tarifPerHari', type: 'DECIMAL', desc: 'Tarif jasa dasar per hari' },
        { name: 'tarifLemburPerJam', type: 'DECIMAL', desc: 'Tarif overtime per jam' },
        { name: 'pengalamanTahun', type: 'INTEGER', desc: 'Lama bekerja mengemudi' },
        { name: 'spesialisasi', type: 'ARRAY', desc: 'Keahlian rute (luar kota, dll)' },
        { name: 'rating', type: 'DECIMAL', desc: 'Rata-rata penilaian bintang' },
        { name: 'status', type: 'ENUM', desc: 'aktif | booking | istirahat | nonaktif' }
      ],
      relations: ['Merujuk ke booking.driverId (1-to-N)']
    },
    {
      name: 'booking',
      role: 'Core transaksi pemesanan semua jenis layanan utama (Rental / Driver).',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik booking global' },
        { name: 'bookingCode', type: 'VARCHAR', desc: 'Kode invoice publik (AR-XXXX)' },
        { name: 'userId', type: 'VARCHAR (FK)', desc: 'ID Customer pemilih' },
        { name: 'layanan', type: 'ENUM', desc: 'rental | driver | rental_driver' },
        { name: 'mobilId', type: 'VARCHAR (FK - Opt)', desc: 'ID mobil sewaan jika ada' },
        { name: 'driverId', type: 'VARCHAR (FK - Opt)', desc: 'ID driver sewaan jika ada' },
        { name: 'tanggalMulai', type: 'DATE', desc: 'Mulai rental' },
        { name: 'tanggalSelesai', type: 'DATE', desc: 'Selesai rental' },
        { name: 'durasiHari', type: 'INTEGER', desc: 'Jumlah total hari peminjaman' },
        { name: 'totalSewa', type: 'DECIMAL', desc: 'Total tarif sewa murni' },
        { name: 'denda', type: 'DECIMAL', desc: 'Biaya denda telat/rusak tambahan' },
        { name: 'totalBayar', type: 'DECIMAL', desc: 'Total tagihan final (Total Sewa + Denda)' },
        { name: 'dpMinimal', type: 'DECIMAL', desc: 'Batas minimal uang muka (20-30%)' },
        { name: 'jumlahBayar', type: 'DECIMAL', desc: 'Nominal pembayaran agregat masuk' },
        { name: 'status', type: 'ENUM', desc: 'pending_dp | pending_konfirmasi | aktif | selesai | dibatalkan' }
      ],
      relations: ['Belongs to users', 'Belongs to mobil', 'Belongs to driver', 'Merujuk ke pembayaran.bookingId', 'Merujuk ke invoice.bookingId']
    },
    {
      name: 'pembayaran',
      role: 'Log verifikasi uang muka (DP), pelunasan, atau denda masuk.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik riwayat bayar' },
        { name: 'bookingId', type: 'VARCHAR (FK)', desc: 'ID booking terelasi' },
        { name: 'tipeBayar', type: 'ENUM', desc: 'dp | pelunasan | lunas_full | denda' },
        { name: 'jumlah', type: 'DECIMAL', desc: 'Nominal uang yang ditransfer' },
        { name: 'metode', type: 'VARCHAR', desc: 'Nama bank atau kanal payment gateway' },
        { name: 'buktiTransferUrl', type: 'VARCHAR', desc: 'Lokasi attachment bukti bayar' },
        { name: 'tanggalBayar', type: 'DATETIME', desc: 'Waktu pengunggahan transaksi' },
        { name: 'status', type: 'ENUM', desc: 'pending | disetujui | ditolak' }
      ],
      relations: ['Belongs to booking']
    },
    {
      name: 'midtrans_payments',
      role: 'Log transaksi eksternal Midtrans sandbox yang disinkronkan otomatis via Webhook.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik transaksi Midtrans' },
        { name: 'bookingId', type: 'VARCHAR (FK)', desc: 'Korelasi ID booking AutoRent' },
        { name: 'midtransOrderId', type: 'VARCHAR', desc: 'Order ID unik dari sistem Midtrans (Booking Code)' },
        { name: 'jumlah', type: 'DECIMAL', desc: 'Jumlah dana yang ditransfer oleh pelanggan' },
        { name: 'midtransPaymentUrl', type: 'VARCHAR', desc: 'Tautan pembayaran instan Sandbox Midtrans' },
        { name: 'tanggalBayar', type: 'DATETIME', desc: 'Waktu callback webhook sukses' },
        { name: 'status', type: 'VARCHAR', desc: 'Status transaksi (lunas / disetujui)' }
      ],
      relations: ['Belongs to booking (1-to-1)', 'Terhubung ke dashboard admin log table']
    },
    {
      name: 'invoice',
      role: 'Data cetak surat penagihan sah untuk bukti fisik pengguna.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik invoice' },
        { name: 'invoiceCode', type: 'VARCHAR', desc: 'Nomor invoice cetak (INV/YYYYMMDD/XXX)' },
        { name: 'bookingId', type: 'VARCHAR (FK)', desc: 'ID korelasi transaksi' },
        { name: 'rincianItem', type: 'TEXT', desc: 'Ringkasan tagihan perincian bahasa manusia' },
        { name: 'subtotal', type: 'DECIMAL', desc: 'Jumlah tagihan murni' },
        { name: 'denda', type: 'DECIMAL', desc: 'Total keterlambatan' },
        { name: 'total', type: 'DECIMAL', desc: 'Jumlah final tagihan' },
        { name: 'terbayar', type: 'DECIMAL', desc: 'Dana yang sudah diverifikasi' },
        { name: 'status', type: 'ENUM', desc: 'belum_bayar | dp_lunas | lunas' }
      ],
      relations: ['Belongs to booking']
    },
    {
      name: 'review',
      role: 'Ulasan performa mobil, driver, & kepuasan pelanggan.',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik review' },
        { name: 'userId', type: 'VARCHAR (FK)', desc: 'ID pemberi ulasan' },
        { name: 'targetId', type: 'VARCHAR', desc: 'ID mobil / driver / rute sewaan' },
        { name: 'tipe', type: 'ENUM', desc: 'mobil | driver' },
        { name: 'rating', type: 'INTEGER', desc: 'Rating bintang dari 1 - 5' },
        { name: 'ulasan', type: 'TEXT', desc: 'Kritik saran tekstual' },
        { name: 'tanggal', type: 'DATE', desc: 'Tanggal ulasan diposting' }
      ],
      relations: ['Belongs to users']
    },
    {
      name: 'laporan',
      role: 'Agregasi pembukuan laba berkala untuk pemilik (Owner).',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', desc: 'ID unik entri log kas' },
        { name: 'tanggal', type: 'DATE', desc: 'Tanggal pencatatan kas' },
        { name: 'layanan', type: 'ENUM', desc: 'rental | driver' },
        { name: 'pemasukan', type: 'DECIMAL', desc: 'Jumlah laba kotor masuk' },
        { name: 'keterangan', type: 'VARCHAR', desc: 'Keterangan transaksi asal' }
      ],
      relations: ['Dihasilkan otomatis dari transaksi booking ter-selesaikan']
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8" id="sys-hub-container">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
        <div>
          <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Blueprint Arsitektur
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" /> Pusat Informasi Sistem AutoRent
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Visualisasi database relasional, peta struktur sitemap, dan alur operasional multi-role platform.
          </p>
        </div>

        {/* Mini Tab Selectors */}
        <div className="inline-flex p-1 bg-slate-50 rounded-xl border border-slate-100 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('sitemap')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'sitemap' ? 'bg-white text-blue-600 shadow-xs ring-1 ring-black/5' : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-btn-sitemap"
          >
            <Network className="w-3.5 h-3.5" /> Sitemap
          </button>
          <button
            onClick={() => setActiveSubTab('flow')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'flow' ? 'bg-white text-blue-600 shadow-xs ring-1 ring-black/5' : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-btn-flow"
          >
            <GitPullRequest className="w-3.5 h-3.5" /> Alur Flow
          </button>
          <button
            onClick={() => setActiveSubTab('database')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'database' ? 'bg-white text-blue-600 shadow-xs ring-1 ring-black/5' : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-btn-db"
          >
            <Database className="w-3.5 h-3.5" /> DB Schema & Relasi
          </button>
          <button
            onClick={() => setActiveSubTab('fitur')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'fitur' ? 'bg-white text-blue-600 shadow-xs ring-1 ring-black/5' : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-btn-features"
          >
            <BookOpen className="w-3.5 h-3.5" /> Matriks Fitur
          </button>
        </div>
      </div>

      {/* Content Rendering based on subTab */}
      {activeSubTab === 'sitemap' && (
        <div className="space-y-6" id="sitemap-view">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3 text-sm text-slate-600 leading-relaxed">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p>
              AutoRent diimplementasikan dalam arsitektur <strong>Single-Page Application (SPA) modular</strong> yang dinamis. 
              Semua <strong>13 Halaman Utama</strong> yang disyaratkan dapat diakses langsung secara mulus melalui sidebar dashboard interaktif 
              atau menu navigasi utama tergantung role aktif pengguna saat ini.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-xs">
              <h4 className="font-semibold text-slate-800 text-sm mb-3 border-b border-slate-50 pb-2 flex items-center justify-between">
                <span>Public & Customer Pages</span>
                <span className="text-[10px] bg-sky-50 text-sky-600 font-medium px-2 py-0.5 rounded-full">User Area</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                  <div><strong>Landing Page / Home:</strong> Etalase produk premium, promo sewa, dan pengantar interkoneksi 2 layanan.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                  <div><strong>Katalog Rental Mobil:</strong> Galeri terlengkap, detail bensin, kapasitas, transmisi, harga, dan filter status.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                  <div><strong>Katalog Jasa Driver:</strong> Direktori driver tersertifikasi, spesialisasi mengemudi, rating, dan pengalaman kerja.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">4</span>
                  <div><strong>Halaman Booking Checkout:</strong> Form integrasi dinamis (opsi lepas kunci / kombinasi mobil + driver tertentu).</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">5</span>
                  <div><strong>Halaman Pembayaran:</strong> Gateway pengunggahan bukti bayar DP atau Pelunasan dengan verifikasi cepat.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">6</span>
                  <div><strong>Dashboard Customer:</strong> Portal kendali sewa, memonitor durasi kendarai, status aktif, dan denda denda.</div>
                </li>
              </ul>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-xs">
              <h4 className="font-semibold text-slate-800 text-sm mb-3 border-b border-slate-50 pb-2 flex items-center justify-between">
                <span>Management (Admin) Pages</span>
                <span className="text-[10px] bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full">Admin Area</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">7</span>
                  <div><strong>Dashboard Admin Utama:</strong> Overview performa unit, denda harian, persentase utilisasi supir.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">8</span>
                  <div><strong>Kelola Armada (Mobil):</strong> Modul penciptaan entri mobil baru, menyetel tarif, dan status pemeliharaan.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">9</span>
                  <div><strong>Kelola Sopir Profesional:</strong> Manajer registrasi driver baru, merumuskan rating, tarif overtime atau lembur.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">10</span>
                  <div><strong>Verifikator Pembayaran & Booking:</strong> Memvalidasi resi transfer DP, menyetujui peminjaman, perpanjangan sewa.</div>
                </li>
              </ul>
            </div>

            <div className="border border-slate-100 rounded-xl p-5 bg-white shadow-xs">
              <h4 className="font-semibold text-slate-800 text-sm mb-3 border-b border-slate-50 pb-2 flex items-center justify-between">
                <span>Core Utilities & Owner Space</span>
                <span className="text-[10px] bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">Owner Space</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="bg-amber-100 text-amber-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">11</span>
                  <div><strong>Dashboard Owner:</strong> Laporan laba keuntungan komprehensif dan performa sewa.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-100 text-amber-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">12</span>
                  <div><strong>Generator Invoice Otomatis:</strong> Penghasil file penagihan PDF-friendly berisi rincian DP, sisa margin, dan plat mobil.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-100 text-amber-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">13</span>
                  <div><strong>Halaman Laporan Konsolidasi:</strong> Kemudahan melakukan filtrasi bulanan, export XLS/PDF simulatif, dan riwayat mutasi kas.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-100 text-slate-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">*</span>
                  <div><strong>Profil User:</strong> Mengatur SIM A, KTP, nomor WhatsApp utama, dan preferensi akun.</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-100 text-slate-700 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">*</span>
                  <div><strong>Notifikasi Realtime Center:</strong> Notifikasi otomatis saat invoice divalidasi oleh Admin.</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'flow' && (
        <div className="space-y-8" id="system-flow-view">
          {/* RENTAL FLOW */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-6" id="flow-cart-rental">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 1. Alur Sewa Armada & Transaksi Pembayaran
            </h3>

            {/* Sub-path 1: Transfer Bank Manual */}
            <div className="space-y-3">
              <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Jalur A: Transfer Bank Manual (Verifikasi Lambat)
              </span>
              <div className="flex flex-col md:flex-row items-center gap-3 text-xs text-slate-600 pt-1">
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] shrink-0">
                  <strong>1. Buat Reservasi</strong>
                  <p className="text-[9px] text-slate-400 mt-1">Pilih Unit & tanggal sewa</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-90 md:rotate-0" />
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] shrink-0">
                  <strong>2. Transfer & Unggah</strong>
                  <p className="text-[9px] text-slate-400 mt-1">Transfer nominal DP & upload resi</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-90 md:rotate-0" />
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] border-amber-200 bg-amber-50/20 shrink-0">
                  <strong>3. Verifikasi Admin</strong>
                  <p className="text-[9px] text-amber-600 mt-1">Admin memeriksa validitas bukti</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-90 md:rotate-0" />
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] border-emerald-200 bg-emerald-50/20 shrink-0">
                  <strong>4. Dalam Sewa</strong>
                  <p className="text-[9px] text-emerald-600 mt-1">Status disetujui, mobil diserahterimakan</p>
                </div>
              </div>
            </div>

            {/* Sub-path 2: Midtrans Payment Gateway */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Jalur B: Midtrans Payment Gateway (Instan Otomatis)
              </span>
              <div className="flex flex-col md:flex-row items-center gap-3 text-xs text-slate-600 pt-1">
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] shrink-0">
                  <strong>1. Buat Reservasi</strong>
                  <p className="text-[9px] text-slate-400 mt-1">Pilih Unit & tanggal sewa</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-90 md:rotate-0" />
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] shrink-0 border-blue-200 bg-blue-50/10">
                  <strong>2. Redirect Gateway</strong>
                  <p className="text-[9px] text-blue-600 mt-1">Bayar via QRIS/GoPay/Kartu Kredit</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-90 md:rotate-0" />
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] border-blue-200 bg-blue-50/20 shrink-0">
                  <strong>3. Callback Webhook</strong>
                  <p className="text-[9px] text-blue-700 mt-1">API Midtrans kirim notifikasi bayar</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 rotate-90 md:rotate-0" />
                <div className="bg-white border border-slate-100 rounded-lg p-3 text-center shadow-xs w-full max-w-[150px] border-emerald-200 bg-emerald-50/20 shrink-0">
                  <strong>4. Instan Dalam Sewa</strong>
                  <p className="text-[9px] text-emerald-600 mt-1">Sistem auto-approve tanpa validasi manual</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'database' && (
        <div className="space-y-8" id="database-schema-view">
          {/* Relational diagram */}
          <div className="bg-slate-900 rounded-xl p-5 md:p-6 text-white overflow-x-auto">
            <h3 className="font-semibold text-sm text-blue-400 mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4" /> Hubungan Kunci Relasi (Foreign Key Relationships)
            </h3>
            <div className="min-w-[800px] font-mono text-xs space-y-3 leading-relaxed text-slate-300">
              <div className="flex items-center gap-4 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px]">Primary Table</span>
                <span className="text-white font-bold w-24">users.id</span>
                <span className="text-slate-500">─── 1-to-N (Foreign Key) ───▶</span>
                <span className="text-slate-200 font-semibold">booking.userId</span>
                <span className="text-blue-400"> (Sewa milik siapa)</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px]">Primary Table</span>
                <span className="text-white font-bold w-24">mobil.id</span>
                <span className="text-slate-500">─── 1-to-N (Foreign Key) ───▶</span>
                <span className="text-slate-200 font-semibold">booking.mobilId</span>
                <span className="text-blue-400"> (Kendaraan ter-sewa)</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px]">Primary Table</span>
                <span className="text-white font-bold w-24">driver.id</span>
                <span className="text-slate-500">─── 1-to-N (Foreign Key) ───▶</span>
                <span className="text-slate-200 font-semibold">booking.driverId</span>
                <span className="text-blue-400"> (Mendapatkan layanan driver siapa)</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px]">Primary Table</span>
                <span className="text-white font-bold w-24">booking.id</span>
                <span className="text-slate-500">─── 1-to-1 / 1-to-N ────▶</span>
                <span className="text-slate-200 font-semibold">pembayaran.bookingId & invoice.bookingId</span>
                <span className="text-emerald-400"> (Invoice penagihan & kas)</span>
              </div>
            </div>
          </div>

          {/* Tables Field Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {databaseTables.map((table, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50/50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <span className="font-bold font-mono text-slate-800 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" /> {table.name}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                    {table.fields.length} Atribut
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{table.role}</p>
                
                <div className="space-y-1.5 border-t border-slate-50 pt-2 pb-3">
                  {table.fields.map((f, fi) => (
                    <div key={fi} className="flex justify-between text-[11px] py-0.5">
                      <span className="font-mono text-slate-700 font-medium flex items-center gap-1">
                        {f.type.includes('PK') && <Key className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                        {f.type.includes('FK') && <Link2 className="w-2.5 h-2.5 text-blue-500 shrink-0" />}
                        {f.name}
                      </span>
                      <span className="text-slate-400 font-mono italic shrink-0 pr-4">{f.type}</span>
                      <span className="text-slate-500 text-right truncate max-w-[180px]">{f.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50/30 rounded-lg p-2.5 border border-blue-50">
                  <span className="text-[10px] font-bold text-blue-700 uppercase block tracking-wider mb-1">
                    Relasi Logika:
                  </span>
                  <ul className="text-[10px] text-slate-600 list-disc list-inside space-y-0.5">
                    {table.relations.map((rel, rIdx) => (
                      <li key={rIdx}>{rel}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'fitur' && (
        <div className="space-y-6" id="feature-matrix-view">
          <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/30">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Integrasi Lintas Layanan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AutoRent membedakan diri dari sistem rental konvensional dengan mengaitkan entitas secara erat:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                <strong className="text-xs text-slate-800 block">Sewa Mobil + Driver:</strong>
                <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                  Saat menyewa mobil dan memilih opsi &ldquo;Dengan Driver&rdquo;, sistem akan memvalidasi tarif harian mobil & supir serta menggabungkannya ke dalam satu booking tunggal ter-rekomendasi.
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                <strong className="text-xs text-slate-800 block">Tarif & Denda Otomatis:</strong>
                <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                  Denda telat pengembalian mobil disinkronisasi berdasarkan keterlambatan jam dan tarif lembur spesifik driver (jika menggunakan driver).
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                <strong className="text-xs text-slate-800 block">Laporan Realtime Teragregasi:</strong>
                <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                  Laporan laba kotor di dasbor owner memilah masukan kas berdasarkan 2 kategori sewa dalam diagram lingkaran dinamis.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
