import React, { useState } from 'react';
import { User, AppNotification } from '../types';
import { Car, Mail, Phone, User as UserIcon, Shield, ChevronLeft, LogIn, UserPlus, Check, X, MapPin, CreditCard, Award, Eye, EyeOff, Key } from 'lucide-react';
import { hashPassword } from '../data';

interface LoginRegisterPageProps {
  allUsers: User[];
  currentUser: User;
  onSetCurrentUser: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning') => void;
  onBackToHome: () => void;
  initialMode: 'login' | 'register';
  setActiveTab: (tab: string, isLogin?: boolean) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

export default function LoginRegisterPage({
  allUsers,
  currentUser,
  onSetCurrentUser,
  onRegisterUser,
  onAddNotification,
  onBackToHome,
  initialMode,
  setActiveTab,
  onShowToast,
  onShowConfirm
}: LoginRegisterPageProps) {
  const [authTab, setAuthTab] = useState<'login' | 'register'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerNik, setRegisterNik] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');

  // Lupa Password States
  const [forgotPasswordMode, setForgotPasswordMode] = useState<'closed' | 'request' | 'reset'>('closed');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  // Feedback States
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('Mohon isi alamat email dan password Anda.');
      onShowToast('Mohon isi alamat email dan password Anda.', 'error');
      setIsSubmitting(false);
      return;
    }

    const matched = allUsers.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!matched) {
      setAuthError('Email tidak ditemukan! Silakan periksa kembali email Anda atau buat akun baru.');
      onShowToast('Login gagal. Email tidak ditemukan!', 'error');
      setIsSubmitting(false);
      return;
    }

    // Verify password
    const inputHash = hashPassword(loginPassword);
    if (matched.passwordHash !== inputHash) {
      setAuthError('Password salah! Silakan coba lagi.');
      onShowToast('Login gagal. Password salah!', 'error');
      setIsSubmitting(false);
      return;
    }

    if ((matched as any).disabled) {
      setAuthError('Akun Anda dinonaktifkan oleh administrator. Silakan hubungi dukungan.');
      onShowToast('Login gagal. Akun dinonaktifkan.', 'error');
      setIsSubmitting(false);
      return;
    }

    // Create session
    localStorage.setItem('autorent_session_token', `token_${Date.now()}_${matched.id}`);
    localStorage.setItem('autorent_session_expiry', String(Date.now() + 15 * 60 * 1000));
    
    onSetCurrentUser(matched);
    setAuthSuccess(`Selamat datang kembali, ${matched.name}!`);
    onShowToast('Selamat datang kembali di AutoRent.', 'success');
    onAddNotification(
      'Masuk Akun Berhasil',
      `Anda sekarang aktif sebagai ${matched.name} (${matched.role === 'customer' ? 'Pelanggan' : matched.role})`,
      'success'
    );

    setLoginEmail('');
    setLoginPassword('');
    setIsSubmitting(false);
    
    if (matched.role === 'admin') {
      setActiveTab('dashboard-admin', true);
    } else if (matched.role === 'owner') {
      setActiveTab('dashboard-owner', true);
    } else {
      setActiveTab('dashboard-customer', true);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    if (!registerName.trim()) {
      setAuthError('Nama lengkap wajib diisi!');
      setIsSubmitting(false);
      return;
    }

    if (!registerPhone.trim()) {
      setAuthError('Nomor HP wajib diisi!');
      setIsSubmitting(false);
      onShowToast('Data belum lengkap. Nama lengkap wajib diisi!', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setAuthError('Email tidak valid!');
      onShowToast('Data belum lengkap. Email tidak valid!', 'error');
      setIsSubmitting(false);
      return;
    }

    if (!registerPassword || registerPassword.length < 6) {
      setAuthError('Password minimal 6 karakter!');
      onShowToast('Data belum lengkap. Password minimal 6 karakter!', 'error');
      setIsSubmitting(false);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setAuthError('Konfirmasi password tidak cocok!');
      onShowToast('Data belum lengkap. Konfirmasi password tidak cocok!', 'error');
      setIsSubmitting(false);
      return;
    }

    const emailExists = allUsers.some(u => u.email.toLowerCase() === registerEmail.trim().toLowerCase());
    if (emailExists) {
      setAuthError('Email ini sudah terdaftar. Silakan gunakan email lain atau langsung Login.');
      onShowToast('Pendaftaran gagal. Email sudah terdaftar.', 'error');
      setIsSubmitting(false);
      return;
    }

    const lowerEmail = registerEmail.trim().toLowerCase();
    let assignedRole: 'customer' | 'admin' | 'owner' = 'customer';
    if (lowerEmail === 'admin@autorent.com') assignedRole = 'admin';
    else if (lowerEmail === 'owner@autorent.com') assignedRole = 'owner';

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: registerName.trim(),
      email: lowerEmail,
      phone: registerPhone.trim(),
      role: assignedRole,
      passwordHash: hashPassword(registerPassword),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      nik: registerNik.trim() || undefined,
      address: registerAddress.trim() || undefined
    };

    onRegisterUser(newUser);

    setAuthSuccess('Akun berhasil dibuat! Anda sekarang bisa login.');
    onShowToast('Akun berhasil dibuat. Silakan login untuk melanjutkan.', 'success');
    
    onAddNotification(
      'Registrasi Akun Baru',
      `Akun pelanggan Anda (${newUser.name}) siap digunakan!`,
      'success'
    );

    setRegisterName('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterNik('');
    setRegisterAddress('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setIsSubmitting(false);
    
    // Pre-fill email and switch to login tab
    setLoginEmail(newUser.email);
    setAuthTab('login');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const matched = allUsers.find(
      u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase()
    );

    if (!matched) {
      setAuthError('Email tidak terdaftar di sistem!');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setAuthSuccess(`Kode OTP berhasil dikirim! (Mock OTP: ${otp})`);
    onAddNotification(
      'Reset Password OTP',
      `Kode OTP reset password untuk ${forgotEmail} adalah ${otp}.`,
      'info'
    );
    setForgotPasswordMode('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (forgotOtp !== generatedOtp) {
      setAuthError('Kode OTP tidak cocok!');
      return;
    }

    if (newPassword.length < 8) {
      setAuthError('Password baru minimal 8 karakter!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    const matched = allUsers.find(
      u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase()
    );

    if (matched) {
      const updatedUser = {
        ...matched,
        passwordHash: hashPassword(newPassword)
      };
      onRegisterUser(updatedUser);
      setAuthSuccess('Password berhasil diperbarui! Silakan login kembali.');
      onAddNotification(
        'Reset Password Berhasil',
        `Password baru untuk akun ${updatedUser.name} telah disimpan.`,
        'success'
      );
      setForgotPasswordMode('closed');
      setAuthTab('login');
      setLoginEmail(updatedUser.email);
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden" id="login-viewport-canvas">
      
      {/* Geometric background accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 w-full max-w-4xl flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Left Side: Modern Promotional Banner with Dark Navy corporate gradient */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#0a1128] via-[#0f1d40] to-[#1e293b] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent)] pointer-events-none"></div>
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 text-blue-400 z-10">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Auto<span className="text-blue-400">Rent</span>
            </span>
          </div>

          {/* Slogan details */}
          <div className="my-8 space-y-6 z-10">
            <h2 className="text-2xl font-black leading-tight text-white">Sewa Armada Terlengkap &amp; Terpercaya</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              AutoRent hadir memfasilitasi kebutuhan rental mobil harian lepas kunci hingga jasa driver profesional dalam satu platform digital terintegrasi.
            </p>
            
            <div className="space-y-3.5 pt-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><MapPin className="w-3.5 h-3.5 text-blue-400" /></div>
                <span>Antar Jemput Bandara &amp; Kota</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><CreditCard className="w-3.5 h-3.5 text-emerald-400" /></div>
                <span>DP Murah &amp; Pembayaran Fleksibel</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><Award className="w-3.5 h-3.5 text-amber-400" /></div>
                <span>Armada Selalu Prima &amp; Bersih</span>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start group z-10 mt-6"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Right Side: Centered user-friendly forms */}
        <div className="md:w-7/12 p-8 lg:p-12 flex flex-col bg-white overflow-y-auto max-h-screen">
          <div className="max-w-md w-full mx-auto space-y-6 my-auto">
            
            {/* Page Header / Mode switcher tabs */}
            <div className="text-left space-y-1">
              <h3 className="text-xl font-black text-slate-900">Selamat Datang di AutoRent</h3>
              <p className="text-xs text-slate-500 font-medium">Silakan masuk ke akun Anda atau daftarkan akun baru.</p>
            </div>

            {/* Modal Tabs Selectors */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 pb-3 text-center text-xs font-bold transition-all relative cursor-pointer ${
                  authTab === 'login' ? 'text-blue-650 font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Masuk Akun
                {authTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
              <button
                onClick={() => {
                  setAuthTab('register');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 pb-3 text-center text-xs font-bold transition-all relative cursor-pointer ${
                  authTab === 'register' ? 'text-blue-650 font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Daftar Akun Baru
                {authTab === 'register' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 text-[11px] font-semibold rounded-xl border border-red-100 text-left">
                ⚠️ {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-xl border border-emerald-100 text-left flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            {authTab === 'login' ? (
              <>
                {forgotPasswordMode !== 'closed' ? (
                  forgotPasswordMode === 'request' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Masukkan Email untuk Reset</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            disabled={isSubmitting}
                            placeholder="Email terdaftar"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold">Kirim Kode Reset</button>
                        <button type="button" onClick={() => setForgotPasswordMode('closed')} className="w-1/3 border border-slate-200 rounded-xl py-2 text-xs font-bold text-slate-600">Batal</button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Kode OTP</label>
                        <input value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} placeholder="Masukkan kode OTP" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Password Baru</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">Konfirmasi Password Baru</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Ulangi password" className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                          <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold">Simpan Password Baru</button>
                        <button type="button" onClick={() => setForgotPasswordMode('closed')} className="w-1/3 border border-slate-200 rounded-xl py-2 text-xs font-bold text-slate-600">Batal</button>
                      </div>
                    </form>
                  )
                ) : (
                  <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Akun Anda</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          disabled={isSubmitting}
                          autoComplete="off"
                          placeholder="contoh: budi@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />
                      </div>
                      <div className="mt-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            placeholder="Masukkan password Anda"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            aria-label={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex justify-end text-[11px] mt-1">
                          <button
                            type="button"
                            onClick={() => setForgotPasswordMode('request')}
                            className="text-slate-400 hover:text-blue-600 transition-colors font-semibold"
                          >
                            Lupa Password?
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0f1d40] hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Sedang Memproses...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Masuk Aplikasi</span>
                        </>
                      )}
                    </button>

                    <div className="text-center text-xs mt-3">
                      <span className="text-slate-400">Belum punya akun? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('register');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="text-blue-600 hover:underline font-bold transition-all cursor-pointer"
                      >
                        Daftar sekarang
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      autoComplete="off"
                      placeholder="Masukkan nama lengkap Anda"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Alamat Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      disabled={isSubmitting}
                      autoComplete="off"
                      placeholder="contoh: budi@gmail.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">No HP / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      autoComplete="off"
                      placeholder="contoh: 081234567890"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Password *</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-label={showRegisterPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Konfirmasi Password *</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                        placeholder="Ulangi password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">NIK (No KTP)</label>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      autoComplete="off"
                      placeholder="3201..."
                      value={registerNik}
                      onChange={(e) => setRegisterNik(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Alamat Tempat Tinggal</label>
                  <textarea
                    disabled={isSubmitting}
                    placeholder="Alamat domisili lengkap..."
                    rows={2}
                    value={registerAddress}
                    onChange={(e) => setRegisterAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-700/10 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Baru</span>
                    </>
                  )}
                </button>

                <div className="text-center text-xs mt-3">
                  <span className="text-slate-400">Sudah punya akun? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-blue-600 hover:underline font-bold transition-all cursor-pointer"
                  >
                    Masuk sekarang
                  </button>
                </div>
              </form>
            )}

            {/* Link back to home */}
            <div className="pt-2 text-center text-xs">
              <span className="text-slate-400">Ingin kembali? </span>
              <button 
                onClick={onBackToHome}
                className="text-blue-600 hover:underline font-bold transition-all cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
