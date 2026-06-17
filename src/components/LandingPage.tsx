import React, { useState } from 'react';
import { Mobil, Driver, User as UserType, Review, Booking } from '../types';
import { ProfileAvatar } from './ProfileAvatar';
import { 
  MapPin, Calendar, Clock, ShieldCheck, Star, Users, Car, Check, ChevronRight, 
  Phone, MessageSquare, ArrowRight, Plane, Briefcase, Camera, Headset, 
  Facebook, Instagram, Twitter, Youtube, CheckCircle2, Search, Award, X, Mail, Shield
} from 'lucide-react';
import { getCarStatus } from '../data';
// @ts-ignore
import heroImg from '../assets/autorent_showroom.png';

interface LandingPageProps {
  cars: Mobil[];
  bookings: Booking[];
  drivers: Driver[];
  reviews: Review[];
  setActiveTab: (tab: string) => void;
  setSelectedBookingItem: (type: 'rental' | 'driver', id: string) => void;
  currentUser: UserType;
  allUsers: UserType[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  setCurrentUser: (u: UserType) => void;
  onAddNotification: (title: string, msg: string, type: 'success' | 'info' | 'warning') => void;
}

export default function LandingPage({
  cars,
  bookings,
  drivers,
  reviews,
  setActiveTab,
  setSelectedBookingItem,
  currentUser,
  allUsers,
  setAllUsers,
  setCurrentUser,
  onAddNotification
}: LandingPageProps) {

  // Catalog Section state
  const [katalogSearch, setKatalogSearch] = useState('');
  const [katalogType, setKatalogType] = useState('All');

  // Detail Modals state
  const [viewingCar, setViewingCar] = useState<Mobil | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);

  // Vision / Mission state or active tabs for about us
  const [activeAboutTab, setActiveAboutTab] = useState<'visi' | 'misi' | 'sejarah'>('visi');

  const handleBookNow = (type: 'rental' | 'driver', id: string) => {
    if (currentUser.id === 'guest') {
      onAddNotification('Akses Terbatas', 'Silakan login atau daftar terlebih dahulu untuk melanjutkan.', 'warning');
      localStorage.setItem('autorent_pending_booking', JSON.stringify({ type, id }));
      setActiveTab('login');
      return;
    }
    setSelectedBookingItem(type, id);
    setActiveTab('booking');
  };

  // Get dynamic reviews ratings from the real database reviews list
  const getCarRating = (carId: string) => {
    const carReviews = reviews.filter(r => r.tipe === 'mobil' && r.targetId === carId);
    if (carReviews.length === 0) return 4.8; // default
    const sum = carReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / carReviews.length).toFixed(1));
  };

  const getDriverRating = (dri: Driver) => {
    const driverReviews = reviews.filter(r => r.tipe === 'driver' && r.targetId === dri.id);
    if (driverReviews.length === 0) return dri.rating || 4.8;
    const sum = driverReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / driverReviews.length).toFixed(1));
  };

  // 4-6 Popular Cars from Single Source of Truth
  const popularCars = cars.filter(c => c.aktif !== false).slice(0, 6);

  const services = [
    { title: 'Driver Profesional', desc: 'Driver berpengalaman, ramah dan mengutamakan kenyamanan Anda.', icon: <Users className="w-8 h-8" /> },
    { title: 'Antar Jemput Bandara', desc: 'Layanan antar jemput bandara tepat waktu dan aman sampai tujuan.', icon: <Plane className="w-8 h-8" /> },
    { title: 'Perjalanan Dinas', desc: 'Cocok untuk kebutuhan perjalanan bisnis Anda lebih efisien.', icon: <Briefcase className="w-8 h-8" /> },
    { title: 'Wisata & Liburan', desc: 'Nikmati perjalanan wisata bersama keluarga dengan driver terbaik kami.', icon: <Camera className="w-8 h-8" /> }
  ];

  const benefits = [
    { title: 'Armada Terawat', desc: 'Semua mobil kami dalam kondisi prima dan rutin dilakukan perawatan.', icon: <ShieldCheck className="w-8 h-8" /> },
    { title: 'Driver Profesional', desc: 'Driver berpengalaman, sopan dan mengutamakan keamanan penumpang.', icon: <Users className="w-8 h-8" /> },
    { title: 'Pembayaran Aman', desc: 'Transaksi aman dengan payment gateway terpercaya (Midtrans).', icon: <CheckCircle2 className="w-8 h-8" /> },
    { title: 'Customer Service 24 Jam', desc: 'Kami siap membantu Anda kapanpun dengan layanan 24 jam setiap hari.', icon: <Headset className="w-8 h-8" /> }
  ];

  const stats = [
    { label: 'Customer', sub: 'Pelanggan Puas', value: '500+', icon: <Users className="w-10 h-10" /> },
    { label: 'Mobil', sub: 'Armada Terawat', value: `${cars.filter(c => c.aktif !== false).length}+`, icon: <Car className="w-10 h-10" /> },
    { label: 'Driver', sub: 'Berpengalaman', value: `${drivers.filter(d => d.aktif !== false).length}+`, icon: <Award className="w-10 h-10" /> },
    { label: 'Transaksi', sub: 'Setiap Bulan', value: '1000+', icon: <MessageSquare className="w-10 h-10" /> }
  ];

  const testimonials = [
    { name: 'Dimas Pratama', review: 'Mobil bersih dan nyaman, driver juga sangat ramah dan tepat waktu. AutoRent terbaik!', rating: 5 },
    { name: 'Siti Aisyah', review: 'Proses booking mudah dan cepat, harga juga terjangkau. Pasti sewa lagi di AutoRent.', rating: 5 },
    { name: 'Rizky Maulana', review: 'Pelayanan memuaskan, mobil dalam kondisi prima. Sangat recommended!', rating: 5 }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#0B1F4D] pt-12 pb-20 overflow-hidden" id="hero-section">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-0">
          <img 
            src={heroImg} 
            alt="Showroom AutoRent" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F4D] via-[#0B1F4D]/90 to-transparent lg:to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F4D] via-transparent to-transparent lg:hidden"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center min-h-[380px]">
          <div className="max-w-2xl text-left space-y-4">
            <div className="inline-block px-3 py-1 bg-[#2563EB]/20 border border-[#2563EB]/50 rounded-full text-blue-300 text-[10px] font-bold tracking-wider uppercase">
              Sewa Mobil Terpercaya
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Solusi Rental Mobil <br />Terpercaya dan Mudah
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
              Temukan pengalaman sewa mobil terbaik dengan armada terawat, harga bersaing dan layanan profesional bersama AutoRent.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  const firstCarId = cars.find(c => c.aktif !== false && getCarStatus(c, bookings) === 'Tersedia')?.id || cars[0]?.id || 'm_1';
                  handleBookNow('rental', firstCarId);
                }}
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer border-0"
              >
                <Car className="w-5 h-5" /> Sewa Sekarang
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('katalog-mobil');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-colors flex items-center gap-2 backdrop-blur-sm cursor-pointer"
              >
                <Search className="w-5 h-5" /> Lihat Katalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOBIL POPULER */}
      <section className="pt-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" id="mobil-populer">
        <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Mobil Populer</h2>
        <p className="text-slate-500 mb-10">Pilihan mobil unggulan dengan rating terbaik dari pelanggan kami</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {popularCars.map(car => {
            const currentStatus = 'Tersedia';
            const statusColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';

            return (
              <div key={car.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="relative h-44 bg-slate-50 select-none">
                  <img src={car.foto} alt={car.nama} className="w-full h-full object-cover" />
                  <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${statusColorClass}`}>
                    {currentStatus.toUpperCase()}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-black tracking-widest text-blue-600">{car.brand} · {car.tipe}</span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{getCarRating(car.id)}</span>
                      </div>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">{car.nama}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl">
                    <div>Kapasitas: <span className="text-slate-800 font-bold">{car.kapasitas} Kursi</span></div>
                    <div>Transmisi: <span className="text-slate-800 font-bold">{car.transmisi}</span></div>
                    <div>BBM: <span className="text-slate-800 font-bold">{car.bensin}</span></div>
                    <div>Plat: <span className="text-slate-800 font-bold font-mono">{car.platNomor}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Tarif Sewa</span>
                      <span className="font-mono text-sm font-black text-blue-600">Rp {car.hargaSewa.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingCar(car)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-3 py-2.5 rounded-xl transition-all cursor-pointer border-0"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleBookNow('rental', car.id)}
                        disabled={currentStatus !== 'Tersedia'}
                        className={`font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0 ${
                          currentStatus === 'Tersedia' 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Sewa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. KATALOG MOBIL (FULL DIRECTORY) */}
      <section className="py-20 bg-white border-t border-slate-100 text-center" id="katalog-mobil">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Katalog Mobil Lengkap</h2>
          <p className="text-slate-500 mb-8">Jelajahi seluruh armada kami dengan filter pencarian instan</p>

          {/* Search & Filter Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-10 max-w-4xl mx-auto border border-slate-100">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau merk mobil..."
                value={katalogSearch}
                onChange={(e) => setKatalogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-500 font-bold whitespace-nowrap">Filter Tipe:</span>
              <select
                value={katalogType}
                onChange={(e) => setKatalogType(e.target.value)}
                className="w-full md:w-44 px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
              >
                <option value="All">Semua Tipe</option>
                <option value="MPV">MPV</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Van">Van</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {cars
              .filter(car => {
                const matchesSearch = car.nama.toLowerCase().includes(katalogSearch.toLowerCase()) || car.brand.toLowerCase().includes(katalogSearch.toLowerCase());
                const matchesType = katalogType === 'All' || car.tipe === katalogType;
                return matchesSearch && matchesType && car.aktif !== false;
              })
              .map(car => {
                const currentStatus = 'Tersedia';
                const statusColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';

                return (
                  <div key={car.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group border-b-2 hover:border-b-blue-600">
                    <div className="relative h-44 bg-slate-50 select-none overflow-hidden">
                      <img src={car.foto} alt={car.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${statusColorClass}`}>
                        {currentStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">{car.brand} · {car.tipe}</span>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{getCarRating(car.id)}</span>
                          </div>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 leading-tight">{car.nama}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl">
                        <div>Kapasitas: <span className="text-slate-800 font-bold">{car.kapasitas} Kursi</span></div>
                        <div>Transmisi: <span className="text-slate-800 font-bold">{car.transmisi}</span></div>
                        <div>BBM: <span className="text-slate-800 font-bold">{car.bensin}</span></div>
                        <div>Plat: <span className="text-slate-800 font-bold font-mono">{car.platNomor}</span></div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Tarif Sewa</span>
                          <span className="font-mono text-sm font-black text-blue-600">Rp {car.hargaSewa.toLocaleString('id-ID')}</span>
                          <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingCar(car)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-3 py-2.5 rounded-xl transition-all cursor-pointer border-0"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleBookNow('rental', car.id)}
                            disabled={currentStatus !== 'Tersedia'}
                            className={`font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0 ${
                              currentStatus === 'Tersedia' 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                          >
                            Sewa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 4. DRIVER PROFESIONAL */}
      <section className="pt-16 pb-20 bg-slate-50 border-t border-slate-100 text-center" id="driver-section">
        <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Driver Profesional</h2>
        <p className="text-slate-500 mb-10">Pilihan driver berpengalaman, tersertifikasi, dan ramah untuk menemani perjalanan Anda</p>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.filter(d => d.aktif !== false).map(dri => {
              const driverStatusClass = 
                dri.status.toLowerCase() === 'aktif' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100';

              return (
                <div key={dri.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="relative h-44 bg-slate-50 select-none">
                    <img src={dri.foto} alt={dri.nama} className="w-full h-full object-cover object-top" />
                    <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${driverStatusClass}`}>
                      {dri.status === 'aktif' ? 'TERSEDIA' : dri.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-black tracking-widest text-blue-600">Pengalaman {dri.pengalamanTahun} Tahun</span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{getDriverRating(dri)}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">{dri.nama}</h4>
                    </div>

                    <div className="text-[10.5px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl flex flex-col gap-1">
                      <div>Spesialisasi: <span className="text-slate-800 font-bold">{dri.spesialisasi.join(', ')}</span></div>
                      <div>Lokasi Tugas: <span className="text-slate-800 font-bold">{dri.lokasi}</span></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Tarif Harian</span>
                        <span className="font-mono text-sm font-black text-blue-600">Rp {dri.tarifPerHari.toLocaleString('id-ID')}</span>
                        <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingDriver(dri)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-3 py-2.5 rounded-xl transition-all cursor-pointer border-0"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleBookNow('driver', dri.id)}
                          disabled={dri.status !== 'aktif'}
                          className={`font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0 ${
                            dri.status === 'aktif'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          Pesan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TENTANG KAMI */}
      <section className="py-20 bg-white border-t border-slate-100 text-center" id="about-us-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Tentang AutoRent</h2>
          <p className="text-slate-500 mb-12">Solusi rental mobil digital terintegrasi yang berpusat pada kenyamanan Anda</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            {/* Visual Column / Tabs */}
            <div className="space-y-6">
              <div className="flex border-b border-slate-200">
                <button 
                  onClick={() => setActiveAboutTab('visi')}
                  className={`pb-3 pr-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeAboutTab === 'visi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Visi Kami
                </button>
                <button 
                  onClick={() => setActiveAboutTab('misi')}
                  className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeAboutTab === 'misi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Misi Kami
                </button>
                <button 
                  onClick={() => setActiveAboutTab('sejarah')}
                  className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeAboutTab === 'sejarah' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sejarah
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-h-[160px]">
                {activeAboutTab === 'visi' && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-base">Menjadi Platform Rental Mobil Terdepan di Indonesia</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Kami bertekad untuk memimpin transformasi digital dalam industri transportasi rental mobil dengan menghadirkan solusi pemesanan instan, transparan, aman, dan dapat diandalkan oleh seluruh lapisan masyarakat Indonesia.
                    </p>
                  </div>
                )}
                {activeAboutTab === 'misi' && (
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <h4 className="font-extrabold text-slate-800 text-base mb-2">Nilai-Nilai Operasional Kami:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Menyediakan armada rental mobil yang selalu prima, bersih, dan wangi demi keselamatan pelanggan.</li>
                      <li>Membina jaringan driver profesional yang santun, mahir berkendara, dan berorientasi pelayanan prima.</li>
                      <li>Menyediakan teknologi integrasi pembayaran gateway instan (Midtrans) tanpa validasi manual manual.</li>
                      <li>Berkomitmen pada pelayanan pelanggan yang responsif selama 24 jam setiap harinya.</li>
                    </ul>
                  </div>
                )}
                {activeAboutTab === 'sejarah' && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-base">Berdiri Sejak 2020</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Berawal dari garasi kecil dengan 3 unit kendaraan di Jakarta Selatan, AutoRent kini telah berkembang pesat melayani ribuan transaksi setiap bulannya dengan puluhan armada berkualitas serta driver bersertifikasi. Kami bangga dapat menemani setiap perjalanan bisnis dan wisata Anda.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Corporate Profile Description */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-[#0B1F4D]">Mengapa Memilih Kami?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                AutoRent didesain untuk menyederhanakan proses sewa menyewa mobil harian baik lepas kunci maupun dengan driver. Layanan kami terintegrasi penuh dari pemesanan armada, pembayaran gateway instan, penerbitan invoice otomatis, kalkulasi denda keterlambatan real-time, hingga sistem refund yang aman.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.slice(0, 2).map((ben, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="text-blue-600 bg-blue-50 p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center">
                      {ben.icon}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{ben.title}</h5>
                      <p className="text-[10px] text-slate-500 leading-snug mt-1">{ben.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 bg-[#0B1F4D] text-white rounded-3xl p-8 shadow-xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {stats.map((st, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left px-4 pt-4 lg:pt-0">
                  <div className="text-blue-300">
                    {st.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{st.value}</h3>
                    <p className="text-xs font-semibold text-slate-200 leading-none mt-1">{st.label}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{st.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. KONTAK */}
      <section className="py-20 bg-slate-50 border-t border-slate-100 text-center" id="contact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Informasi Kontak</h2>
          <p className="text-slate-500 mb-12">Hubungi kami atau kunjungi kantor kami untuk mendapatkan layanan rental mobil terbaik</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 text-left">
            {/* Card 1: Nama Perusahaan */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl w-fit">
                <Car className="w-6 h-6" />
              </div>
              <div className="mt-4 flex-1">
                <h4 className="font-extrabold text-slate-800 text-sm">AutoRent</h4>
                <p className="text-xs text-slate-550 leading-relaxed mt-1.5">
                  Layanan rental mobil prima, aman, terpercaya, dan terintegrasi digital.
                </p>
              </div>
            </div>

            {/* Card 2: Alamat */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl w-fit">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="mt-4 flex-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Alamat Kantor</h4>
                <p className="text-xs text-slate-650 font-bold leading-relaxed mt-1.5 flex items-center gap-1.5">
                  Garut, Jawa Barat
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Indonesia</p>
              </div>
            </div>

            {/* Card 3: WhatsApp */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl w-fit">
                <Phone className="w-6 h-6" />
              </div>
              <div className="mt-4 flex-1">
                <h4 className="font-extrabold text-slate-800 text-sm">WhatsApp</h4>
                <a href="https://wa.me/628001234567" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-emerald-600 hover:underline block mt-1.5">
                  +62 xxx xxxx xxxx
                </a>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Klik untuk chat langsung dengan support kami</p>
              </div>
            </div>

            {/* Card 4: Email */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
              <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl w-fit">
                <Mail className="w-6 h-6" />
              </div>
              <div className="mt-4 flex-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Email Resmi</h4>
                <a href="mailto:autorent@gmail.com" className="text-xs font-mono font-bold text-indigo-600 hover:underline block mt-1.5">
                  autorent@gmail.com
                </a>
                <p className="text-[10px] text-slate-400 mt-1">Kirimkan pertanyaan atau tawaran kerjasama</p>
              </div>
            </div>

            {/* Card 5: Jam Operasional */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl w-fit">
                <Clock className="w-6 h-6" />
              </div>
              <div className="mt-4 flex-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Jam Operasional</h4>
                <p className="text-xs text-slate-650 font-bold leading-relaxed mt-1.5">
                  Senin - Minggu
                </p>
                <p className="text-[11px] text-slate-600 font-bold leading-none mt-1">
                  08.00 - 21.00 WIB
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#0B1F4D] text-slate-350 pt-16 pb-8 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6 text-xs text-slate-400">
          <div className="lg:col-span-2 space-y-4 pr-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Car className="w-6 h-6 text-[#2563EB]" /> AutoRent
            </h2>
            <p className="leading-relaxed max-w-sm">
              AutoRent adalah solusi terbaik untuk kebutuhan rental mobil Anda. Armada terawat, driver profesional dan harga terbaik untuk Anda.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"><Facebook className="w-4 h-4"/></a>
              <a href="#" className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-500 transition-colors"><Instagram className="w-4 h-4"/></a>
              <a href="#" className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-400 transition-colors"><MessageSquare className="w-4 h-4"/></a>
              <a href="#" className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-500 transition-colors"><Youtube className="w-4 h-4"/></a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm">Navigasi</h4>
            <ul className="space-y-2">
              <li><a href="#hero-section" className="hover:text-blue-400 transition-colors">Beranda</a></li>
              <li><a href="#mobil-populer" className="hover:text-blue-400 transition-colors">Mobil Populer</a></li>
              <li><a href="#katalog-mobil" className="hover:text-blue-400 transition-colors">Katalog Mobil</a></li>
              <li><a href="#driver-section" className="hover:text-blue-400 transition-colors">Driver Profesional</a></li>
              <li><a href="#about-us-section" className="hover:text-blue-400 transition-colors">Tentang Kami</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm">Layanan</h4>
            <ul className="space-y-2">
              <li><a href="#katalog-mobil" className="hover:text-blue-400 transition-colors">Rental Mobil Lepas Kunci</a></li>
              <li><a href="#driver-section" className="hover:text-blue-400 transition-colors">Jasa Driver Profesional</a></li>
              <li><a href="#about-us-section" className="hover:text-blue-400 transition-colors">Perjalanan Wisata &amp; Dinas</a></li>
              <li><a href="#contact-section" className="hover:text-blue-400 transition-colors">Antar Jemput Bandara</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm">Kontak Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>Jl. Merdeka No.123, Jakarta Selatan, DKI Jakarta 12345</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>0800-1234-567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>info@autorent.id</span>
              </li>
            </ul>

            <div className="pt-2">
              <h4 className="font-bold text-white text-sm mb-1">Jam Operasional</h4>
              <p className="text-slate-400 font-bold">Senin - Minggu</p>
              <p className="text-slate-400">08.00 - 22.00 WIB</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-500">
          <p>© 2026 AutoRent Corp. All rights reserved.</p>
        </div>
      </footer>

      {/* ==================== DETAIL MOBIL MODAL ==================== */}
      {viewingCar && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setViewingCar(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 rounded-full transition-all cursor-pointer border-0"
              aria-label="Tutup detail mobil"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Photo Column */}
            <div className="md:w-5/12 bg-slate-50 relative h-64 md:h-auto min-h-[250px]">
              <img src={viewingCar.foto} alt={viewingCar.nama} className="w-full h-full object-cover" />
              {(() => {
                const detailStatus = 'Tersedia';
                return (
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-emerald-50 text-emerald-700 border-emerald-100`}>
                    {detailStatus.toUpperCase()}
                  </span>
                );
              })()}
            </div>

            {/* Right Details Column */}
            <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                    {viewingCar.brand} · {viewingCar.tipe}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mt-2">{viewingCar.nama}</h3>
                  <span className="text-xs text-slate-400 font-mono block">Plat Nomor: {viewingCar.platNomor}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-650">
                  <h4 className="font-extrabold text-slate-900">Spesifikasi Detail:</h4>
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Transmisi</span>
                      <strong className="text-slate-800">{viewingCar.transmisi}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Kapasitas</span>
                      <strong className="text-slate-800">{viewingCar.kapasitas} Penumpang</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Bahan Bakar</span>
                      <strong className="text-slate-800">{viewingCar.bensin}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Tahun Rilis</span>
                      <strong className="text-slate-800">{viewingCar.tahun || '2022'}</strong>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-900">Ulasan Pelanggan ({reviews.filter(r => r.tipe === 'mobil' && r.targetId === viewingCar.id).length})</h4>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{getCarRating(viewingCar.id)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {reviews.filter(r => r.tipe === 'mobil' && r.targetId === viewingCar.id).length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-2">Belum ada ulasan untuk armada ini. Jadilah penyewa pertama!</p>
                    ) : (
                      reviews
                        .filter(r => r.tipe === 'mobil' && r.targetId === viewingCar.id)
                        .map(rev => (
                          <div key={rev.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800 text-[10px]">{rev.userNama}</span>
                              <div className="flex text-amber-400 scale-90">
                                {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug">"{rev.ulasan}"</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Mulai dari</span>
                  <span className="font-mono text-base font-black text-blue-600">Rp {viewingCar.hargaSewa.toLocaleString('id-ID')}</span>
                  <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingCar(null)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setViewingCar(null);
                      handleBookNow('rental', viewingCar.id);
                    }}
                    disabled={false}
                    className="font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
                  >
                    Sewa Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DETAIL DRIVER MODAL ==================== */}
      {viewingDriver && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setViewingDriver(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 rounded-full transition-all cursor-pointer border-0"
              aria-label="Tutup detail driver"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Photo Column */}
            <div className="md:w-5/12 bg-slate-50 relative h-64 md:h-auto min-h-[250px]">
              <img src={viewingDriver.foto} alt={viewingDriver.nama} className="w-full h-full object-cover object-top" />
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                viewingDriver.status === 'aktif' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {viewingDriver.status === 'aktif' ? 'Tersedia' : 'Istirahat'}
              </span>
            </div>

            {/* Right Details Column */}
            <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                    Pengalaman {viewingDriver.pengalamanTahun} Tahun
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mt-2">{viewingDriver.nama}</h3>
                  <span className="text-xs text-slate-400 font-mono block">Kontak WA: 08**-****-**** (Terbuka setelah booking)</span>
                </div>

                <div className="space-y-2 text-xs text-slate-650">
                  <h4 className="font-extrabold text-slate-900">Spesifikasi &amp; Keahlian:</h4>
                  <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                    <div><span className="text-slate-400 font-bold">Domisili Driver:</span> <strong className="text-slate-800">{viewingDriver.lokasi}</strong></div>
                    <div><span className="text-slate-400 font-bold">Spesialisasi Rute:</span> <strong className="text-slate-800">{viewingDriver.spesialisasi.join(', ')}</strong></div>
                    <div><span className="text-slate-400 font-bold">Bahasa:</span> <strong className="text-slate-800">Bahasa Indonesia, Inggris (Pasif)</strong></div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-900">Ulasan Pelanggan ({reviews.filter(r => r.tipe === 'driver' && r.targetId === viewingDriver.id).length})</h4>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{getDriverRating(viewingDriver)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {reviews.filter(r => r.tipe === 'driver' && r.targetId === viewingDriver.id).length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-2">Belum ada ulasan untuk driver ini.</p>
                    ) : (
                      reviews
                        .filter(r => r.tipe === 'driver' && r.targetId === viewingDriver.id)
                        .map(rev => (
                          <div key={rev.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800 text-[10px]">{rev.userNama}</span>
                              <div className="flex text-amber-400 scale-90">
                                {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug">"{rev.ulasan}"</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Tarif Driver</span>
                  <span className="font-mono text-base font-black text-blue-600">Rp {viewingDriver.tarifPerHari.toLocaleString('id-ID')}</span>
                  <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingDriver(null)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setViewingDriver(null);
                      handleBookNow('driver', viewingDriver.id);
                    }}
                    disabled={viewingDriver.status !== 'aktif'}
                    className={`font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-0 ${
                      viewingDriver.status === 'aktif' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Pesan Driver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
