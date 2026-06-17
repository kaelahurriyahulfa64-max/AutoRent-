import React, { useState, useEffect, useRef } from 'react';
import { Car, Bell, Layers, User, Shield, UserCheck, RefreshCw, Key, LogIn, LogOut, UserPlus, Lock, ChevronDown, Mail, Phone, Check, X, Menu, ShoppingCart, Calendar, Users, TrendingUp, ClipboardList, Home, CreditCard } from 'lucide-react';
import { User as UserType, AppNotification, Booking, Pembayaran, Mobil, Driver, CartItem } from '../types';

interface NavbarProps {
  currentUser: UserType;
  allUsers: UserType[];
  onRoleChange: (role: 'customer' | 'admin' | 'owner') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onSetCurrentUser: (user: UserType) => void;
  onRegisterUser: (newUser: UserType) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning') => void;
  bookings: Booking[];
  adminActiveTab?: string;
  setAdminActiveTab?: (tab: string) => void;
  payments?: Pembayaran[];
  allCars?: Mobil[];
  allDrivers?: Driver[];
  cart?: CartItem[];
  customerActiveSubTab?: string;
  setCustomerActiveSubTab?: (subTab: string) => void;
  setLoginMode?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onRoleChange,
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead,
  onSetCurrentUser,
  onRegisterUser,
  onAddNotification,
  bookings,
  adminActiveTab,
  setAdminActiveTab,
  payments = [],
  allCars = [],
  allDrivers = [],
  cart = [],
  customerActiveSubTab = 'my-bookings',
  setCustomerActiveSubTab,
  setLoginMode,
  onLogout
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const prevNotifCountRef = useRef(notifications.length);

  useEffect(() => {
    prevNotifCountRef.current = notifications.length;
  }, [notifications.length]);

  const isDashboard = activeTab.startsWith('dashboard-') || activeTab === 'booking';

  const navigateToSection = (sectionId: string) => {
    setActiveTab('landing');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleLoginAction = (type: 'login' | 'register') => {
    setShowLoginDropdown(false);
    setActiveTab('login');
  };

  const unreadNotifications = notifications.filter(n => !n.read && (n.userId === 'all' || n.userId === currentUser.id));

  const handleRoleSelect = (role: 'customer' | 'admin' | 'owner') => {
    onRoleChange(role);
    setShowRoleSwitcher(false);
    
    // Auto redirect to appropriate dashboard
    if (role === 'customer') {
      setActiveTab('dashboard-customer');
    } else if (role === 'admin') {
      setActiveTab('dashboard-admin');
    } else {
      setActiveTab('dashboard-owner');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0" id="main-nav-container">
      <div className="w-full">
        <div className="flex justify-between items-center h-12">
          {/* Logo Brand / Workspace Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Hamburger Drawer Toggle */}
            <button
              onClick={() => {
                setShowMobileDrawer(true);
              }}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer md:hidden"
              id="hamburger-btn"
            >
              <Menu className="w-5 h-5 text-slate-800 font-black" />
            </button>

            <button 
              onClick={() => {
                setActiveTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="flex items-center gap-2.5 font-black text-xl sm:text-2xl text-blue-600 transition-transform active:scale-95 cursor-pointer text-left"
              id="brand-logo"
            >
              <div className="bg-blue-600 text-white p-2 sm:p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="tracking-tight text-slate-900 font-display font-black text-xl">
                Auto<span className="text-blue-600">Rent</span>
              </span>
            </button>
          </div>

          {/* Middle Nav Links (Desktop) - Only on public pages */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigateToSection('hero-section')}
                className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => navigateToSection('mobil-populer')}
                className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Mobil Populer
              </button>
              <button
                onClick={() => navigateToSection('katalog-mobil')}
                className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Katalog Mobil
              </button>
              <button
                onClick={() => navigateToSection('driver-section')}
                className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Driver Profesional
              </button>
              <button
                onClick={() => navigateToSection('about-us-section')}
                className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => navigateToSection('contact-section')}
                className="text-xs font-black uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Kontak
              </button>
            </div>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {currentUser && currentUser.id !== 'guest' ? (
              <>
                {/* Unified Login Action with dropdown option displaying active user name */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowLoginDropdown(!showLoginDropdown);
                      setShowNotifications(false);
                      setShowRoleSwitcher(false);
                    }}
                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    id="unified-login-btn"
                  >
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name || 'Login'}</p>
                      <p className="text-[9px] uppercase font-black tracking-wider text-blue-600 mt-1">{currentUser.role === 'customer' ? 'Pelanggan' : currentUser.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {/* Login/Register/Dashboard Interactive Dropdown Options */}
                  {showLoginDropdown && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 transition-all z-50 text-left shadow-blue-900/5" id="login-selection-dropdown">
                      <div className="mb-2.5 pb-2.5 border-b border-slate-100">
                        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block leading-tight">Portal Sesi AutoRent</span>
                        <span className="text-[11px] text-slate-500 font-semibold leading-snug">Silakan pilih opsi di bawah:</span>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Choice 0: Buka Dashboard Saya */}
                        <button
                          onClick={() => {
                            setShowLoginDropdown(false);
                            if (currentUser.role === 'customer') setActiveTab('dashboard-customer');
                            else if (currentUser.role === 'admin') setActiveTab('dashboard-admin');
                            else setActiveTab('dashboard-owner');
                          }}
                          className="w-full text-left font-bold text-xs p-2.5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-blue-800 transition-all flex items-start gap-2.5 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="block font-black text-xs text-blue-900 leading-tight">Dashboard Saya</span>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Akses panel kontrol {currentUser.role === 'customer' ? 'Pelanggan' : currentUser.role === 'admin' ? 'Verifikator' : 'Owner'} Anda</span>
                          </div>
                        </button>

                        {/* Choice 1: Ganti / Masuk Akun */}
                        <button
                          onClick={() => handleLoginAction('login')}
                          className="w-full text-left font-bold text-xs p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-800 transition-all flex items-start gap-2.5 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="block font-black text-xs text-slate-900 leading-tight">Ganti / Masuk Akun</span>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Masuk ke akun Pelanggan / Mitra yang lain</span>
                          </div>
                        </button>

                        {/* Choice 2: Buat Akun Baru */}
                        <button
                          onClick={() => handleLoginAction('register')}
                          className="w-full text-left font-bold text-xs p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 text-emerald-800 transition-all flex items-start gap-2.5 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="block font-black text-xs text-emerald-950 leading-tight">Daftar Akun Baru</span>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Daftarkan akun baru gratis untuk menyewa armada</span>
                          </div>
                        </button>

                        {/* Choice 3: Logout */}
                        {onLogout && (
                          <button
                            onClick={() => {
                              setShowLoginDropdown(false);
                              onLogout();
                            }}
                            className="w-full text-left font-bold text-xs p-2.5 rounded-xl border border-red-100 bg-red-50/20 hover:bg-red-50 text-red-800 transition-all flex items-start gap-2.5 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-650 mt-0.5 shrink-0" />
                            <div>
                              <span className="block font-black text-xs text-red-950 leading-tight">Logout / Keluar</span>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Akhiri sesi aktif Anda dengan aman</span>
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-2 text-[9px] text-slate-400 text-center border-t border-slate-50 leading-relaxed font-sans">
                        Butuh bantuan? Silakan hubungi WA Support di bawah halaman.
                      </div>
                    </div>
                  )}
                </div>

                {/* Shopping Cart Header Link (Customer Only) */}
                {currentUser.role === 'customer' && (
                  <button
                    onClick={() => {
                      if (setCustomerActiveSubTab) setCustomerActiveSubTab('cart');
                      setActiveTab('dashboard-customer');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-2 rounded-xl relative transition-all active:scale-95 cursor-pointer text-slate-400 hover:bg-slate-50 hover:text-slate-700`}
                    id="navbar-cart-button"
                  >
                    <ShoppingCart className="w-5 h-5 text-slate-600" />
                    {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white font-extrabold text-[8px] flex items-center justify-center ring-2 ring-white">
                        {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length}
                      </span>
                    )}
                  </button>
                )}

                {/* Notification bell menu link button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowRoleSwitcher(false);
                    }}
                    className={`p-2 rounded-xl relative transition-all active:scale-95 cursor-pointer ${
                      unreadNotifications.length > 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                    id="navbar-notification-bell"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                  </button>

                  {/* Notification Popup Dropdown Drawer */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 transition-all z-50 text-left" id="notification-dropdown">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">Notifikasi Transaksi</span>
                          <span className="text-[9px] uppercase font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {unreadNotifications.length} Baru
                          </span>
                        </div>
                      </div>
                      
                      {notifications.filter(n => n.userId === 'all' || n.userId === currentUser.id).length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">Tidak ada info notifikasi baru</div>
                      ) : (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {notifications
                            .filter(n => n.userId === 'all' || n.userId === currentUser.id)
                            .map((notif, i) => {
                              // Dinamis icon & bg berdasarkan kata kunci di title/message
                              const t = notif.title.toLowerCase();
                              let iconEl = <Bell className="w-3.5 h-3.5 text-slate-600" />;
                              let bgClass = 'bg-slate-50 border-slate-100';
                              
                              if (t.includes('bayar') || t.includes('pembayaran') || t.includes('lunas') || t.includes('dp') || t.includes('nominal')) {
                                iconEl = <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
                                bgClass = 'bg-emerald-50 border-emerald-100';
                              } else if (t.includes('batal') || t.includes('dibatalkan') || t.includes('tolak') || t.includes('ditolak') || t.includes('gagal')) {
                                iconEl = <X className="w-3.5 h-3.5 text-red-650" />;
                                bgClass = 'bg-red-50/50 border-red-100';
                              } else if (t.includes('jaminan') || t.includes('guarantee') || t.includes('collateral')) {
                                iconEl = <Shield className="w-3.5 h-3.5 text-amber-600" />;
                                bgClass = 'bg-amber-50 border-amber-100';
                              } else if (t.includes('kembali') || t.includes('serah terima') || t.includes('handover') || t.includes('kunci')) {
                                iconEl = <Key className="w-3.5 h-3.5 text-indigo-600" />;
                                bgClass = 'bg-indigo-50 border-indigo-100';
                              } else if (t.includes('travel') || t.includes('shuttle') || t.includes('berangkat') || t.includes('jadwal')) {
                                iconEl = <Calendar className="w-3.5 h-3.5 text-sky-600" />;
                                bgClass = 'bg-sky-50 border-sky-100';
                              } else if (t.includes('sewa') || t.includes('booking') || t.includes('mobil') || t.includes('driver')) {
                                iconEl = <Car className="w-3.5 h-3.5 text-blue-600" />;
                                bgClass = 'bg-blue-50 border-blue-100';
                              }

                              return (
                                <div 
                                  key={notif.id} 
                                  onClick={() => onMarkNotificationRead(notif.id)}
                                  className={`p-3 rounded-xl text-left border cursor-pointer transition-all flex gap-3 items-start relative ${
                                    notif.read 
                                      ? 'bg-slate-50/50 border-slate-100/50 hover:bg-slate-100' 
                                      : 'bg-white border-slate-200 hover:bg-slate-50/80 shadow-2xs'
                                  }`}
                                >
                                  <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center border ${bgClass}`}>
                                    {iconEl}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[11px] font-black text-slate-800 truncate leading-tight">{notif.title}</span>
                                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{notif.timestamp.split(' ')[1]} WIB</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-1 leading-normal font-medium">{notif.message}</p>
                                  </div>
                                  {!notif.read && (
                                    <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                      <div className="mt-3 pt-2 text-[9px] text-slate-400 text-center border-t border-slate-100 leading-relaxed font-sans font-bold">
                        Menampilkan semua pemberitahuan transaksi Anda
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Public Navbar Actions: Login and Register buttons for Guest
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (setLoginMode) setLoginMode('login');
                    setActiveTab('login');
                  }}
                  className="text-xs text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer bg-white"
                  id="navbar-login-btn"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    if (setLoginMode) setLoginMode('register');
                    setActiveTab('login');
                  }}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  id="navbar-register-btn"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

      {/* Dynamic Overlay Login & Register Modal removed */}

      {/* 📱 Beautiful Slide-Over Sidebar Drawer */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-55 flex" id="sidebar-drawer-overlay">
          {/* Backdrop Glass blur */}
          <div 
            onClick={() => setShowMobileDrawer(false)}
            className="fixed inset-0 bg-[#0c1329]/80 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Sidebar Content */}
          <div className="relative flex-1 flex flex-col max-w-[240px] w-full bg-[#0a1128] text-white p-4 shadow-2xl border-r border-[#1e2f5c]/40 animate-in slide-in-from-left duration-200">
            {/* Close button top right */}
            <button
              onClick={() => setShowMobileDrawer(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a294d] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Title Area */}
            <div className="flex items-center gap-3 pt-2 pb-5 border-b border-[#18284e]/60 mb-6 text-left">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white font-display">AutoRent Mobile</span>
            </div>

            {/* Navigation links matching Sidebar */}
            <nav className="flex-1 space-y-1 overflow-y-auto text-left">
              {isDashboard ? (
                <>
                  {currentUser.role === 'customer' && (
                    <>
                      <button
                        onClick={() => {
                          setActiveTab('landing');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'landing' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <Layers className="w-4 h-4 opacity-80" />
                        <span>Beranda (Home)</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('rental');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'rental' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <Car className="w-4 h-4 opacity-80" />
                        <span>Rental Mobil</span>
                      </button>



                      <button
                        onClick={() => {
                          setActiveTab('driver');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'driver' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <Users className="w-4 h-4 opacity-80" />
                        <span>Jasa Driver</span>
                      </button>

                      <button
                        onClick={() => {
                          if (setCustomerActiveSubTab) setCustomerActiveSubTab('cart');
                          setActiveTab('dashboard-customer');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'dashboard-customer' && customerActiveSubTab === 'cart' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-4 h-4 opacity-80 text-emerald-400" />
                          <span>Keranjang Saya</span>
                        </div>
                        {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length > 0 && (
                          <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                            {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length}
                          </span>
                        )}
                      </button>

                      <div className="pt-5 border-t border-[#18284e]/60 mt-5 space-y-1">
                        <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest px-4 mb-2">HUB KENDALI AKTIF (Pelanggan)</p>
                        <button
                          onClick={() => {
                            if (setCustomerActiveSubTab) setCustomerActiveSubTab('my-bookings');
                            setActiveTab('dashboard-customer');
                            setShowMobileDrawer(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-left cursor-pointer text-xs ${
                            activeTab === 'dashboard-customer' && customerActiveSubTab === 'my-bookings' ? 'bg-[#18284e] text-white border-l-4 border-emerald-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                          }`}
                        >
                          <UserCheck className="w-4 h-4 opacity-80 text-emerald-400" />
                          <span>Sewa Saya (User)</span>
                        </button>
                      </div>
                    </>
                  )}

                  {currentUser.role === 'admin' && (
                    <>
                      

                      <button
                        onClick={() => {
                          setActiveTab('dashboard-admin');
                          if (setAdminActiveTab) setAdminActiveTab('all-bookings');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'dashboard-admin' && adminActiveTab === 'all-bookings' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <ClipboardList className="w-4 h-4 text-blue-400 opacity-90" />
                        <span>Semua Booking ({bookings.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('dashboard-admin');
                          if (setAdminActiveTab) setAdminActiveTab('cars');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'dashboard-admin' && adminActiveTab === 'cars' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <Car className="w-4 h-4 text-blue-400 opacity-90" />
                        <span>Inventaris Mobil ({allCars.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('dashboard-admin');
                          if (setAdminActiveTab) setAdminActiveTab('drivers');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'dashboard-admin' && adminActiveTab === 'drivers' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <Users className="w-4 h-4 text-blue-400 opacity-90" />
                        <span>Kelola Driver ({allDrivers.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('dashboard-admin');
                          if (setAdminActiveTab) setAdminActiveTab('refunds');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'dashboard-admin' && adminActiveTab === 'refunds' ? 'bg-[#18284e] text-white border-l-4 border-red-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-4 h-4 text-red-400 opacity-90" />
                          <span>Kelola Refund</span>
                        </div>
                        {bookings.filter(b => b.status === 'Menunggu Verifikasi Refund').length > 0 && (
                          <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full">
                            {bookings.filter(b => b.status === 'Menunggu Verifikasi Refund').length}
                          </span>
                        )}
                      </button>



                      <div className="pt-5 border-t border-[#18284e]/60 mt-5 space-y-1">
                        <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest px-4 mb-2">Mode Navigasi Publik</p>
                        <button
                          onClick={() => {
                            setActiveTab('landing');
                            setShowMobileDrawer(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-left cursor-pointer text-xs ${
                            activeTab === 'landing' ? 'bg-[#18284e] text-white border-l-4 border-emerald-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                          }`}
                        >
                          <Home className="w-4 h-4 opacity-80 text-emerald-400" />
                          <span>Beranda Publik</span>
                        </button>
                      </div>
                    </>
                  )}

                  {currentUser.role === 'owner' && (
                    <>
                      <button
                        onClick={() => {
                          setActiveTab('dashboard-owner');
                          setShowMobileDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                          activeTab === 'dashboard-owner' ? 'bg-[#18284e] text-white border-l-4 border-amber-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 opacity-85 text-amber-400" />
                        <span>Executive Owner Dashboard</span>
                      </button>

                      <div className="pt-5 border-t border-[#18284e]/60 mt-5 space-y-1">
                        <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest px-4 mb-2">Menu Tambahan</p>
                        <button
                          onClick={() => {
                            setActiveTab('dashboard-admin');
                            if (setAdminActiveTab) setAdminActiveTab('dashboard');
                            setShowMobileDrawer(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-left cursor-pointer text-xs text-slate-300 hover:bg-[#121f3c]"
                        >
                          <Shield className="w-4 h-4 text-blue-400 opacity-90" />
                          <span>Kelola Data (As Admin)</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('landing');
                            setShowMobileDrawer(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-left cursor-pointer text-xs ${
                            activeTab === 'landing' ? 'bg-[#18284e] text-white border-l-4 border-emerald-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                          }`}
                        >
                          <Home className="w-4 h-4 opacity-80 text-emerald-400" />
                          <span>Beranda Publik</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigateToSection('hero-section');
                      setShowMobileDrawer(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs ${
                      activeTab === 'landing' ? 'bg-[#18284e] text-white border-l-4 border-blue-500 font-bold' : 'text-slate-300 hover:bg-[#121f3c]'
                    }`}
                  >
                    <Layers className="w-4 h-4 opacity-80" />
                    <span>Beranda</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateToSection('mobil-populer');
                      setShowMobileDrawer(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs text-slate-300 hover:bg-[#121f3c]"
                  >
                    <Car className="w-4 h-4 opacity-80" />
                    <span>Mobil Populer</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateToSection('katalog-mobil');
                      setShowMobileDrawer(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs text-slate-300 hover:bg-[#121f3c]"
                  >
                    <ClipboardList className="w-4 h-4 opacity-80" />
                    <span>Katalog Mobil</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateToSection('driver-section');
                      setShowMobileDrawer(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs text-slate-300 hover:bg-[#121f3c]"
                  >
                    <Users className="w-4 h-4 opacity-80" />
                    <span>Driver Profesional</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateToSection('about-us-section');
                      setShowMobileDrawer(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs text-slate-300 hover:bg-[#121f3c]"
                  >
                    <Users className="w-4 h-4 opacity-80" />
                    <span>Tentang Kami</span>
                  </button>

                  <button
                    onClick={() => {
                      navigateToSection('contact-section');
                      setShowMobileDrawer(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left cursor-pointer text-xs text-slate-300 hover:bg-[#121f3c]"
                  >
                    <Phone className="w-4 h-4 opacity-85" />
                    <span>Kontak</span>
                  </button>

                  <div className="flex flex-col gap-2 pt-4 border-t border-[#18284e]/60 mt-4">
                    <button
                      onClick={() => {
                        if (setLoginMode) setLoginMode('login');
                        setActiveTab('login');
                        setShowMobileDrawer(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs text-slate-200 border border-[#1d305e] hover:bg-[#121f3c] font-bold cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 opacity-85" />
                      <span>Masuk (Login)</span>
                    </button>
                    <button
                      onClick={() => {
                        if (setLoginMode) setLoginMode('register');
                        setActiveTab('login');
                        setShowMobileDrawer(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 opacity-85" />
                      <span>Daftar Akun Baru</span>
                    </button>
                  </div>
                </>
              )}
            </nav>

            {isDashboard && (
              <div className="bg-[#070d1e] p-3 rounded-xl border border-blue-950/70 text-[10px] text-slate-300 text-left mt-auto space-y-1">
                <span className="font-extrabold uppercase tracking-wide block text-blue-400">PENGGUNA AKTIF:</span>
                <p className="font-bold truncate text-slate-100">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 text-emerald-400 pt-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online Terkoneksi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
