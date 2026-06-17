import React, { useState } from 'react';
import { Mobil, Driver, User as UserType, Review } from '../types';
import { ProfileAvatar } from './ProfileAvatar';
import { MapPin, Calendar, Clock, ShieldCheck, Star, Users, Car, Check, ChevronRight, Phone, MessageSquare, ArrowRight, Plane, Briefcase, Camera, Headset, Facebook, Instagram, Twitter, Youtube, CheckCircle2, Search, Award } from 'lucide-react';
// @ts-ignore
import heroImg from '../assets/autorent_showroom.png';

interface LandingPageProps {
  cars: Mobil[];
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

  const [carType, setCarType] = useState('');

  const handleBookNow = (type: 'rental' | 'driver', id: string) => {
    if (currentUser.id === 'guest') {
      onAddNotification('Akses Terbatas', 'Silakan login atau daftar terlebih dahulu untuk melakukan pemesanan.', 'warning');
      localStorage.setItem('autorent_pending_booking', JSON.stringify({ type, id }));
      setActiveTab('login');
      return;
    }
    setSelectedBookingItem(type, id);
    setActiveTab('booking');
  };

  const handleSearch = () => {
    onAddNotification('Mencari Mobil', 'Sistem sedang mencarikan armada terbaik untuk Anda...', 'info');
    const el = document.getElementById('mobil-populer');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const popularCars = cars.filter(c => {
    const s = (c.status || '').toLowerCase();
    return (s === 'tersedia') && c.aktif !== false;
  });

  const services = [
    { title: 'Driver Profesional', desc: 'Driver berpengalaman, ramah dan mengutamakan kenyamanan Anda.', icon: <Users className="w-8 h-8" /> },
    { title: 'Antar Jemput Bandara', desc: 'Layanan antar jemput bandara tepat waktu dan aman sampai tujuan.', icon: <Plane className="w-8 h-8" /> },
    { title: 'Perjalanan Dinas', desc: 'Cocok untuk kebutuhan perjalanan bisnis Anda lebih efisien.', icon: <Briefcase className="w-8 h-8" /> },
    { title: 'Wisata & Liburan', desc: 'Nikmati perjalanan wisata bersama keluarga dengan driver terbaik kami.', icon: <Camera className="w-8 h-8" /> }
  ];

  const benefits = [
    { title: 'Armada Terawat', desc: 'Semua mobil kami dalam kondisi prima dan rutin dilakukan perawatan.', icon: <ShieldCheck className="w-8 h-8" /> },
    { title: 'Driver Profesional', desc: 'Driver berpengalaman, sopan dan mengutamakan keamanan penumpang.', icon: <Users className="w-8 h-8" /> },
    { title: 'Pembayaran Aman', desc: 'Transaksi aman kebutuhan berbagai metode pembayaran yang terpercaya.', icon: <CheckCircle2 className="w-8 h-8" /> },
    { title: 'Customer Service 24 Jam', desc: 'Kami siap membantu Anda kapanpun dengan layanan 24 jam setiap hari.', icon: <Headset className="w-8 h-8" /> }
  ];

  const stats = [
    { label: 'Customer', sub: 'Pelanggan Puas', value: '500+', icon: <Users className="w-10 h-10" /> },
    { label: 'Mobil', sub: 'Armada Terawat', value: '100+', icon: <Car className="w-10 h-10" /> },
    { label: 'Driver', sub: 'Berpengalaman', value: '20+', icon: <Award className="w-10 h-10" /> },
    { label: 'Transaksi', sub: 'Setiap Bulan', value: '1000+', icon: <MessageSquare className="w-10 h-10" /> }
  ];

  const testimonials = [
    { name: 'Dimas Pratama', review: 'Mobil bersih dan nyaman, driver juga sangat ramah dan tepat waktu. AutoRent terbaik!', rating: 5, img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
    { name: 'Siti Aisyah', review: 'Proses booking mudah dan cepat, harga juga terjangkau. Pasti sewa lagi di AutoRent.', rating: 5, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    { name: 'Rizky Maulana', review: 'Pelayanan memuaskan, mobil dalam kondisi prima. Sangat recommended!', rating: 5, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* 1 & 2. HERO SECTION */}
      <section className="relative bg-[#0B1F4D] pt-12 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-0">
          <img 
            src={heroImg} 
            alt="Showroom AutoRent" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F4D] via-[#0B1F4D]/90 to-transparent lg:to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F4D] via-transparent to-transparent lg:hidden"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center min-h-[320px]">
          <div className="max-w-2xl text-left space-y-4">
            <div className="inline-block px-3 py-1 bg-[#2563EB]/20 border border-[#2563EB]/50 rounded-full text-blue-300 text-[10px] font-bold tracking-wider uppercase">
              Sewa Mobil Terpercaya
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Sewa Mobil Mudah & <br className="hidden md:block"/> Cepat Bersama <span className="text-[#2563EB]">AutoRent</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
              Temukan pengalaman sewa mobil terbaik dengan armada terawat, harga bersaing dan layanan profesional.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => handleBookNow('rental', 'm_1')}
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <Car className="w-5 h-5" /> Sewa Mobil
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK BOOKING FORM */}
      <section className="relative z-20 -mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-100 p-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-slate-400"/> Jenis Mobil</label>
              <select value={carType} onChange={(e) => setCarType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:outline-none focus:border-blue-500">
                <option value="">Semua Jenis</option>
                <option value="MPV">MPV</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            <button onClick={handleSearch} className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Search className="w-4 h-4"/> Cari Mobil
            </button>
          </div>
        </div>
      </section>

      {/* 4. MOBIL POPULER */}
      <section className="pt-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" id="mobil-populer">
        <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Mobil Populer</h2>
        <p className="text-slate-500 mb-10">Pilih mobil terbaik sesuai kebutuhan Anda</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {popularCars.map(car => (
            <div key={car.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="relative h-44 bg-slate-50 select-none">
                <img src={car.foto} alt={car.nama} className="w-full h-full object-cover" />
                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {car.status === 'tersedia' ? 'TERSEDIA' : 'DISEWA'}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black tracking-widest text-blue-600">{car.brand} · {car.tipe}</span>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">{car.nama}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10.5px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl">
                  <div>Kapasitas: <span className="text-slate-800 font-bold">{car.kapasitas} Seat</span></div>
                  <div>Transmisi: <span className="text-slate-800 font-bold">{car.transmisi}</span></div>
                  <div>BBM: <span className="text-slate-800 font-bold">{car.bensin}</span></div>
                  <div>Nomor Plat: <span className="text-slate-800 font-bold font-mono">{car.platNomor}</span></div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Mulai dari</span>
                    <span className="font-mono text-sm font-black text-blue-600">Rp {car.hargaSewa.toLocaleString('id-ID')}</span>
                    <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                  </div>

                  <button
                    onClick={() => handleBookNow('rental', car.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer border-0"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. KATALOG DRIVER PROFESIONAL */}
      <section className="pt-12 pb-20 bg-slate-50 border-t border-slate-100 text-center" id="driver-profesional">
        <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Driver Profesional</h2>
        <p className="text-slate-500 mb-10">Pilihan driver berpengalaman untuk perjalanan Anda</p>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drivers.filter(d => d.status === 'aktif' && d.aktif !== false).map(dri => (
              <div key={dri.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="relative h-44 bg-slate-50 select-none">
                  <img src={dri.foto} alt={dri.nama} className="w-full h-full object-cover" />
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    TERSEDIA
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black tracking-widest text-blue-600">Pengalaman {dri.pengalamanTahun} Tahun</span>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">{dri.nama}</h4>
                  </div>

                  <div className="text-[10.5px] text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl line-clamp-2 leading-relaxed">
                    Driver profesional dan berpengalaman siap melayani perjalanan Anda.
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">Tarif Harian</span>
                      <span className="font-mono text-sm font-black text-blue-600">Rp {dri.tarifPerHari.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] text-slate-500 font-bold">/Hari</span>
                    </div>

                    <button
                      onClick={() => handleBookNow('driver', dri.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer border-0"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LAYANAN DRIVER */}
      <section className="py-16 bg-white border-t border-slate-100 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-2">Layanan Driver</h2>
          <p className="text-slate-500 mb-12">Driver profesional untuk perjalanan Anda lebih nyaman</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-blue-200 hover:shadow-md transition-all flex flex-col gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  {svc.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{svc.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MENGAPA MEMILIH AUTORENT */}
      <section className="py-20 bg-slate-50 text-center border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-12">Mengapa Memilih AutoRent?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((ben, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4">
                <div className="text-[#2563EB]">
                  {ben.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{ben.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">{ben.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. STATISTIK */}
      <section className="py-16 bg-[#0B1F4D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-white/10">
            {stats.map((st, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left px-4">
                <div className="text-blue-300">
                  {st.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold">{st.value}</h3>
                  <p className="text-sm font-semibold text-slate-200">{st.label}</p>
                  <p className="text-[10px] text-slate-400">{st.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONI */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0B1F4D] uppercase tracking-tight mb-12">Apa Kata Mereka?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews && reviews.length > 0 ? reviews.slice(0,3).map(r => ({ name: r.userNama, review: r.ulasan, rating: r.rating })) : testimonials).map((testi, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <ProfileAvatar name={testi.name} className="w-12 h-12 text-sm shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{testi.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 mb-3">"{testi.review}"</p>
                    <div className="flex text-amber-400">
                      {[...Array(testi.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#0B1F4D] text-slate-300 pt-16 pb-8 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 pr-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Car className="w-6 h-6 text-[#2563EB]" /> AutoRent
            </h2>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
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
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Beranda</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Rental Mobil</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cara Kerja</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Kontak</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm">Layanan</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Rental Mobil</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Antar Jemput Bandara</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Perjalanan Dinas</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Wisata & Liburan</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm">Kontak Kami</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>Jl. Merdeka No.123, Jakarta Selatan, DKI Jakarta 12345</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>0800-1234-567</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>info@autorent.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>www.autorent.id</span>
              </li>
            </ul>

            <div className="pt-2">
              <h4 className="font-bold text-white text-sm mb-2">Jam Operasional</h4>
              <p className="text-xs text-slate-400">Senin - Minggu</p>
              <p className="text-xs text-slate-400">08.00 - 22.00 WIB</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-500">
          <p>© 2026 AutoRent Corp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
