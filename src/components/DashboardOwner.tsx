import React, { useState, useMemo } from 'react';
import { Booking, Invoice, Pembayaran, Mobil, Driver, User, Review, Refund, MaintenanceRecord } from '../types';
import { getCarStatus } from '../data';
import { 
  TrendingUp, FileText, RefreshCw, Car, Users, 
  Wallet, Calendar, ClipboardList, CheckCircle,
  Clock, XCircle, ChevronUp, ChevronDown, Wrench, Download, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardOwnerProps {
  currentUser?: User;
  bookings: Booking[];
  invoices: Invoice[];
  payments: Pembayaran[];
  allCars: Mobil[];
  allDrivers: Driver[];
  allUsers: User[];
  reviews: Review[];
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning', targetUserId?: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onUpdateUsers: (users: User[]) => void;
  onUpdateCars: (cars: Mobil[]) => void;
  onUpdateDrivers: (drivers: Driver[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdateReviews: (reviews: Review[]) => void;
  onUpdateActiveSubTab?: (tab: string) => void;
  refunds: Refund[];
  maintenanceList: MaintenanceRecord[];
  onUpdateMaintenanceList: (list: MaintenanceRecord[]) => void;
  onUpdateRefunds: (newRefunds: Refund[]) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function DashboardOwner({
  currentUser,
  bookings,
  payments,
  allCars,
  allUsers,
  invoices,
  refunds,
  maintenanceList,
  onUpdateMaintenanceList,
  onAddNotification,
  onUpdateCars,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onShowToast,
  onShowConfirm
}: DashboardOwnerProps) {
  const [localActiveTab, setLocalActiveTab] = useState<string>('dashboard');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;

  const [periodeFilter, setPeriodeFilter] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'custom'>('bulanan');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtering Logic
  const isDateInFilter = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    
    if (periodeFilter === 'harian') {
      return d.toDateString() === today.toDateString();
    }
    if (periodeFilter === 'mingguan') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return d >= firstDay && d <= lastDay;
    }
    if (periodeFilter === 'bulanan') {
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    if (periodeFilter === 'tahunan') {
      return d.getFullYear() === today.getFullYear();
    }
    if (periodeFilter === 'custom' && customStartDate && customEndDate) {
      return d >= new Date(customStartDate) && d <= new Date(customEndDate);
    }
    return true;
  };

  const isDateInPreviousFilter = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    
    if (periodeFilter === 'harian') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return d.toDateString() === yesterday.toDateString();
    }
    if (periodeFilter === 'mingguan') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay() - 7));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6 - 7));
      return d >= firstDay && d <= lastDay;
    }
    if (periodeFilter === 'bulanan') {
      let prevMonth = today.getMonth() - 1;
      let prevYear = today.getFullYear();
      if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    }
    if (periodeFilter === 'tahunan') {
      return d.getFullYear() === today.getFullYear() - 1;
    }
    return false;
  };

  // Filtered Data Collections
  const filteredBookings = useMemo(() => bookings.filter(b => isDateInFilter(b.tanggalMulai) || isDateInFilter(b.tanggalSelesai)), [bookings, periodeFilter, customStartDate, customEndDate]);
  const prevBookings = useMemo(() => bookings.filter(b => isDateInPreviousFilter(b.tanggalMulai) || isDateInPreviousFilter(b.tanggalSelesai)), [bookings, periodeFilter, customStartDate, customEndDate]);

  const filteredPayments = useMemo(() => payments.filter(p => p.status === 'disetujui' && isDateInFilter(p.tanggalBayar)), [payments, periodeFilter, customStartDate, customEndDate]);
  const prevPayments = useMemo(() => payments.filter(p => p.status === 'disetujui' && isDateInPreviousFilter(p.tanggalBayar)), [payments, periodeFilter, customStartDate, customEndDate]);

  const filteredRefunds = useMemo(() => refunds.filter(r => r.status === 'Disetujui' && isDateInFilter(r.tanggalPengajuan)), [refunds, periodeFilter, customStartDate, customEndDate]);
  const prevRefunds = useMemo(() => refunds.filter(r => r.status === 'Disetujui' && isDateInPreviousFilter(r.tanggalPengajuan)), [refunds, periodeFilter, customStartDate, customEndDate]);

  const customerUsers = allUsers.filter(u => u.role === 'customer');

  // KPI Calculations
  const totalRefundAmount = filteredRefunds.reduce((sum, r) => sum + (r.nominalRefund || 0), 0);
  const prevRefundAmount = prevRefunds.reduce((sum, r) => sum + (r.nominalRefund || 0), 0);

  const pendapatanRental = filteredPayments.filter(p => p.tipeBayar !== 'denda').reduce((sum, p) => sum + p.jumlah, 0);
  const pendapatanDenda = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInFilter(b.tanggalSelesai || b.tanggalBooking)).reduce((sum, b) => sum + (b.denda || 0), 0);
  const totalPendapatan = pendapatanRental + pendapatanDenda - totalRefundAmount;
  
  const prevPendapatanRental = prevPayments.filter(p => p.tipeBayar !== 'denda').reduce((sum, p) => sum + p.jumlah, 0);
  const prevPendapatanDenda = bookings.filter(b => b.statusDenda === 'Sudah Dibayar' && isDateInPreviousFilter(b.tanggalSelesai || b.tanggalBooking)).reduce((sum, b) => sum + (b.denda || 0), 0);
  const prevPendapatan = prevPendapatanRental + prevPendapatanDenda - prevRefundAmount;
  
  const diffPendapatan = prevPendapatan ? Math.round(((totalPendapatan - prevPendapatan) / prevPendapatan) * 100) : 0;

  const totalTransaksi = filteredPayments.length;
  const prevTransaksi = prevPayments.length;
  const diffTransaksi = prevTransaksi ? Math.round(((totalTransaksi - prevTransaksi) / prevTransaksi) * 100) : 0;

  const kendaraanAktif = allCars.filter(c => {
    const status = getCarStatus(c, bookings);
    return (status === 'Tersedia' || status === 'Disewa') && c.aktif !== false;
  }).length;
  
  const totalPelanggan = customerUsers.length;
  const pelangganBaru = customerUsers.filter(c => isDateInFilter(c.joinDate || new Date().toISOString())).length;
  const prevPelangganBaru = customerUsers.filter(c => isDateInPreviousFilter(c.joinDate || new Date().toISOString())).length;
  const diffPelanggan = prevPelangganBaru ? Math.round(((pelangganBaru - prevPelangganBaru) / prevPelangganBaru) * 100) : 0;

  const totalMaintenanceCost = maintenanceList
    .filter(m => (m.status === 'Selesai' || m.status === 'Sedang Diperbaiki') && isDateInFilter(m.tanggalPengajuan))
    .reduce((sum, m) => sum + (m.biaya || 0), 0);
  const totalPengeluaran = totalRefundAmount + totalMaintenanceCost;
  const labaBersih = totalPendapatan - totalMaintenanceCost;
  
  const prevMaintenanceCost = maintenanceList
    .filter(m => (m.status === 'Selesai' || m.status === 'Sedang Diperbaiki') && isDateInPreviousFilter(m.tanggalPengajuan))
    .reduce((sum, m) => sum + (m.biaya || 0), 0);
  const prevPengeluaran = prevRefundAmount + prevMaintenanceCost;
  const prevLabaBersih = prevPendapatan - prevMaintenanceCost;
  const diffLabaBersih = prevLabaBersih ? Math.round(((labaBersih - prevLabaBersih) / prevLabaBersih) * 100) : 0;

  const persentaseLaba = totalPendapatan ? Math.round((labaBersih / totalPendapatan) * 100) : 0;

  // Chart Data: Bar Chart (Income)
  const barChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const sortedPayments = [...filteredPayments].sort((a, b) => new Date(a.tanggalBayar).getTime() - new Date(b.tanggalBayar).getTime());
    
    // Add rental payments
      sortedPayments.forEach(p => {
      let key = p.tanggalBayar.substring(0, 10);
      if (periodeFilter === 'bulanan' || periodeFilter === 'tahunan') {
        const d = new Date(p.tanggalBayar);
        key = d.toLocaleString('id-ID', { month: 'short' });
      }
      dataMap[key] = (dataMap[key] || 0) + p.jumlah;
    });

    return Object.keys(dataMap).map(k => ({
      name: k,
      Pendapatan: dataMap[k]
    }));
  }, [filteredPayments, periodeFilter]);

  // Chart Data: Pie Chart (Car Distribution)
  const carDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredBookings.forEach(b => {
      const car = allCars.find(c => c.id === b.mobilId);
      if (car) {
        let model = car.nama;
        if (!['Avanza', 'Innova', 'Brio', 'Xpander', 'Fortuner'].includes(model)) {
          model = 'Lainnya';
        }
        counts[model] = (counts[model] || 0) + 1;
      }
    });

    const total = Object.values(counts).reduce((a,b)=>a+b, 0);
    return Object.keys(counts).map((key, index) => ({
      name: key,
      value: counts[key],
      percentage: total ? Math.round((counts[key] / total) * 100) : 0
    })).sort((a,b) => b.value - a.value);
  }, [filteredBookings, allCars]);

  // Table Data: Popular Cars
  const popularCars = useMemo(() => {
    const counts: Record<string, {name: string, count: number}> = {};
    filteredBookings.forEach(b => {
      const car = allCars.find(c => c.id === b.mobilId);
      if (car) {
        if (!counts[car.id]) counts[car.id] = { name: `${car.brand} ${car.nama}`, count: 0 };
        counts[car.id].count += 1;
      }
    });
    const total = Object.values(counts).reduce((a,b)=>a+b.count, 0);
    return Object.values(counts)
      .sort((a,b) => b.count - a.count)
      .map((c, i) => ({
        no: i + 1,
        mobil: c.name,
        totalSewa: c.count,
        persentase: total ? Math.round((c.count / total) * 100) : 0
      })).slice(0, 6);
  }, [filteredBookings, allCars]);

  // Ringkasan Penyewaan
  const totalPenyewaan = filteredBookings.length;
  const penyewaanHariIni = filteredBookings.filter(b => b.tanggalMulai.startsWith(new Date().toISOString().substring(0, 10))).length;
  const penyewaanBerlangsung = filteredBookings.filter(b => b.status === 'Dalam Sewa').length;
  const penyewaanSelesai = filteredBookings.filter(b => b.status === 'Selesai').length;

  const prevPenyewaan = prevBookings.length;
  const diffPenyewaan = prevPenyewaan ? Math.round(((totalPenyewaan - prevPenyewaan) / prevPenyewaan) * 100) : 0;

  // Custom Formatter for Currency
  const formatRupiah = (value: number) => {
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)} Jt`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)} Rb`;
    return `Rp ${value}`;
  };

  // Helper render badge
  const renderTrendBadge = (diff: number, label: string) => {
    const isPositive = diff >= 0;
    return (
      <div className="flex items-center gap-1 mt-2 text-[10px] font-bold">
        {isPositive ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-rose-500" />}
        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>{Math.abs(diff)}%</span>
        <span className="text-slate-400 font-normal">{label}</span>
      </div>
    );
  };

  // Download Action Handlers
  const handleDownloadPDF = (title: string) => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>${title}</title></head><body style="padding: 20px; font-family: sans-serif;"><h2>${title}</h2><p>Laporan diekspor pada ${new Date().toLocaleString('id-ID')}</p><br/>`);
      win.document.write('Laporan Lengkap. Anda bisa menekan tombol cetak (Ctrl+P) untuk menyimpan sebagai PDF.');
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
    onShowToast('Laporan berhasil diunduh.', 'success');
  };

  const handleDownloadExcel = (title: string) => {
    const csvContent = "Tanggal,Keterangan,Pemasukan,Pengeluaran\n" + 
      new Date().toLocaleDateString('id-ID') + ",Export " + title + ",0,0\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Laporan Excel berhasil diunduh.', 'success');
  };

  return (
    <div className="space-y-6" id="owner-panel-container">
      
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Owner</h2>
          <p className="text-slate-500 text-sm mt-1">Ringkasan performa bisnis rental mobil</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Date Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-xs border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={periodeFilter}
              onChange={(e) => setPeriodeFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
              <option value="custom">Custom Rentang Tanggal</option>
            </select>
            {periodeFilter === 'custom' && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 ml-1">
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="text-xs border border-slate-200 rounded p-1" />
                <span className="text-slate-400">-</span>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="text-xs border border-slate-200 rounded p-1" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-slate-900 text-sm">Owner AutoRent</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Owner</div>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
              OA
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 1. TOP 5 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Pendapatan */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Total Pendapatan</p>
                  <h4 className="text-xl font-black text-slate-900 font-mono">Rp {totalPendapatan.toLocaleString('id-ID')}</h4>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Wallet className="w-5 h-5" /></div>
              </div>
              {renderTrendBadge(diffPendapatan, 'dari periode lalu')}
            </div>

            {/* Total Transaksi */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Total Transaksi</p>
                  <h4 className="text-xl font-black text-slate-900 font-mono">{totalTransaksi}</h4>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ClipboardList className="w-5 h-5" /></div>
              </div>
              {renderTrendBadge(diffTransaksi, 'dari periode lalu')}
            </div>

            {/* Kendaraan Aktif */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Kendaraan Aktif</p>
                  <h4 className="text-xl font-black text-slate-900 font-mono">{kendaraanAktif}</h4>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Car className="w-5 h-5" /></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2">Dari {allCars.length} unit tersedia</p>
            </div>

            {/* Total Pelanggan */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Total Pelanggan</p>
                  <h4 className="text-xl font-black text-slate-900 font-mono">{totalPelanggan}</h4>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Users className="w-5 h-5" /></div>
              </div>
              {renderTrendBadge(diffPelanggan, 'dari periode lalu')}
            </div>

            {/* Laba Bersih */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">Laba Bersih</p>
                  <h4 className="text-xl font-black text-slate-900 font-mono">Rp {labaBersih.toLocaleString('id-ID')}</h4>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><TrendingUp className="w-5 h-5" /></div>
              </div>
              {renderTrendBadge(diffLabaBersih, 'dari periode lalu')}
            </div>
          </div>

          {/* 2. CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bar Chart: Grafik Pendapatan */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-sm">Grafik Pendapatan</h3>
              </div>
              <div className="h-64 w-full">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatRupiah} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']} />
                      <Bar dataKey="Pendapatan" fill="#cbd5e1" radius={[4, 4, 0, 0]} activeBar={{ fill: '#3b82f6' }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                    <BarChart2 className="w-8 h-8 mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">Belum ada data pendapatan di periode ini</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart: Distribusi Penyewaan */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Distribusi Penyewaan Kendaraan</h3>
              
              {carDistribution.length > 0 ? (
                <>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={carDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {carDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => [`${value} Sewa`, 'Total']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-4">
                    {carDistribution.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-slate-600 font-semibold">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl mt-2 p-6">
                  <PieChartIcon className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-center">Belum ada data penyewaan mobil</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. MIDDLE WIDGETS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Ringkasan Penyewaan */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col space-y-4">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Ringkasan Penyewaan</h3>
              
              <div className="flex items-center gap-4 border border-slate-100 p-3 rounded-xl">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Car className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Penyewaan</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black">{totalPenyewaan}</span>
                    <span className={`text-[10px] font-bold ${diffPenyewaan >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {diffPenyewaan >= 0 ? '+' : ''}{diffPenyewaan}% dari periode lalu
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border border-slate-100 p-3 rounded-xl">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Calendar className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Penyewaan Hari Ini</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black">{penyewaanHariIni}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 border border-slate-100 p-3 rounded-xl">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Penyewaan Sedang Berlangsung</p>
                  <span className="text-lg font-black">{penyewaanBerlangsung}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 border border-slate-100 p-3 rounded-xl">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><CheckCircle className="w-5 h-5" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Penyewaan Selesai</p>
                  <span className="text-lg font-black">{penyewaanSelesai}</span>
                </div>
              </div>
            </div>

            {/* Kendaraan Terpopuler */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Daftar Kendaraan Terpopuler</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-semibold w-10">No.</th>
                      <th className="pb-3 font-semibold">Mobil</th>
                      <th className="pb-3 font-semibold text-center">Total Sewa</th>
                      <th className="pb-3 font-semibold text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {popularCars.map((car, idx) => (
                      <tr key={idx}>
                        <td className="py-3 text-slate-500 font-mono">{car.no}</td>
                        <td className="py-3 font-bold text-slate-700">{car.mobil}</td>
                        <td className="py-3 text-center font-mono">{car.totalSewa}</td>
                        <td className="py-3 text-right font-bold text-slate-600">{car.persentase}%</td>
                      </tr>
                    ))}
                    {popularCars.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-slate-400">Tidak ada data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ringkasan Keuangan & Laporan */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Ringkasan Keuangan</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pendapatan</span>
                    <span className="font-bold text-slate-800">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pengeluaran</span>
                    <span className="font-bold text-rose-600">Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-[10px]">
                    <span className="text-slate-400">- Biaya Maintenance</span>
                    <span className="text-slate-500">Rp {totalMaintenanceCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-[10px]">
                    <span className="text-slate-400">- Pengembalian Refund</span>
                    <span className="text-slate-500">Rp {totalRefundAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <span className="font-bold text-slate-800">Laba Bersih</span>
                    <span className="font-black text-emerald-600 text-sm font-mono">Rp {labaBersih.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-3 pt-3 border-t border-slate-100 text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span>Pendapatan Rental</span>
                      <span className="font-semibold text-slate-800">Rp {pendapatanRental.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span>Pendapatan Denda</span>
                      <span className="font-semibold text-slate-800">Rp {pendapatanDenda.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500">
                    <span className="text-xs">Dari Total Transaksi</span>
                    <span className="font-semibold text-sm text-slate-800">{totalTransaksi}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Unduh Laporan</h3>
                <div className="space-y-3">
                  <button onClick={() => handleDownloadPDF('Laporan Keuangan')} className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Laporan Keuangan</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">PDF</span>
                  </button>

                  <button onClick={() => handleDownloadPDF('Laporan Maintenance')} className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Laporan Maintenance</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PENYEWAAN TERBARU */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Penyewaan Terbaru</h3>
              <button onClick={() => setActiveTab('monitoring')} className="text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition cursor-pointer">Lihat Semua</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="p-4 font-semibold w-32">No. Booking</th>
                    <th className="p-4 font-semibold">Pelanggan</th>
                    <th className="p-4 font-semibold">Mobil</th>
                    <th className="p-4 font-semibold">Tanggal Mulai</th>
                    <th className="p-4 font-semibold">Tanggal Selesai</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.slice(0, 5).map(b => {
                    const car = allCars.find(c => c.id === b.mobilId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono font-bold text-slate-700">{b.bookingCode}</td>
                        <td className="p-4 font-medium text-slate-800">{b.userNama}</td>
                        <td className="p-4 text-slate-600">{car ? `${car.brand} ${car.nama}` : '-'}</td>
                        <td className="p-4 text-slate-600">{b.tanggalMulai}</td>
                        <td className="p-4 text-slate-600">{b.tanggalSelesai}</td>
                        <td className="p-4 font-mono font-bold text-slate-800">Rp {(b.totalBayar || 0).toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                            ${b.status === 'Menunggu Pembayaran' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              b.status === 'Dalam Sewa' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              b.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              b.status === 'Menunggu Konfirmasi' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {b.status === 'Menunggu Pembayaran' ? 'Menunggu DP' : b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-400">Belum ada transaksi di periode ini</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-PAGES */}
      {activeTab === 'monitoring' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-2">Monitoring Penyewaan</h3>
          <p className="text-xs text-slate-500 mb-6">Daftar seluruh transaksi yang terdaftar dalam sistem.</p>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-semibold w-32">No. Booking</th>
                    <th className="p-4 font-semibold">Pelanggan</th>
                    <th className="p-4 font-semibold">Layanan</th>
                    <th className="p-4 font-semibold">Mobil</th>
                    <th className="p-4 font-semibold">Jadwal</th>
                    <th className="p-4 font-semibold">Total Nilai</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map(b => {
                    const car = allCars.find(c => c.id === b.mobilId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-mono font-bold text-slate-700">{b.bookingCode}</td>
                        <td className="p-4 font-medium text-slate-800">{b.userNama}</td>
                        <td className="p-4 text-slate-600 capitalize">{(b.layanan || (b.denganDriver ? 'rental_driver' : 'rental')).replace('_', ' ')}</td>
                        <td className="p-4 text-slate-600">{car ? `${car.brand} ${car.nama}` : '-'}</td>
                        <td className="p-4 text-[10px] text-slate-500">{b.tanggalMulai} s/d {b.tanggalSelesai}</td>
                        <td className="p-4 font-mono font-bold text-slate-800">Rp {(b.totalBayar || 0).toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${b.status === 'Dalam Sewa' ? 'bg-amber-100 text-amber-700' :
                              b.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Persetujuan Maintenance</h3>
            <p className="text-xs text-slate-500 mb-6">Daftar pengajuan maintenance dari Admin yang membutuhkan persetujuan dan pembayaran Anda.</p>
            <div className="space-y-4">
              {maintenanceList.filter(m => m.status !== 'Selesai' && m.status !== 'Ditolak').map(rec => {
                const car = allCars.find(c => c.id === rec.mobilId);
                return (
                  <div key={rec.id} className="border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 text-sm">{rec.mobilNama}</strong>
                          <span className="text-xs text-slate-500 ml-2 font-mono">{car?.platNomor}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.status === 'Menunggu Persetujuan Owner' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          rec.status === 'Disetujui' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          rec.status === 'Menunggu Perbaikan' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                          rec.status === 'Sedang Diperbaiki' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        "{rec.kerusakan}"
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                        <span>Tanggal Pengajuan: {rec.tanggalPengajuan}</span>
                        <span>Prioritas: {rec.prioritas || 'Sedang'}</span>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 border-t border-slate-100 pt-4 md:border-none md:pt-0">
                      {rec.status === 'Menunggu Persetujuan Owner' && (
                        <>
                          <button onClick={() => {
                            // (A) Setujui: langsung kunci mobil agar tidak bisa dibooking selama menunggu perbaikan
                            const updated = maintenanceList.map(r => r.id === rec.id ? { ...r, status: 'Disetujui' as any } : r);
                            onUpdateMaintenanceList(updated);
                            // Lock car immediately on approval — tidak tunggu "Bayar & Proses"
                            const updatedCars = allCars.map(c => c.id === rec.mobilId ? { ...c, status: 'maintenance' as any } : c);
                            if (typeof onUpdateCars === 'function') onUpdateCars(updatedCars);
                            onShowToast('Maintenance disetujui & mobil dikunci dari booking baru', 'success');
                          }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer">
                            Setujui
                          </button>
                          <button onClick={() => {
                            const updated = maintenanceList.map(r => r.id === rec.id ? { ...r, status: 'Ditolak' as any } : r);
                            onUpdateMaintenanceList(updated);
                            onShowToast('Pengajuan maintenance ditolak', 'info');
                          }} className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer">
                            Tolak
                          </button>
                        </>
                      )}

                      {rec.status === 'Disetujui' && (
                        <button onClick={() => {
                          const cost = prompt('Masukkan Biaya Maintenance (Rp):', '500000');
                          if (cost && !isNaN(Number(cost))) {
                            const updated = maintenanceList.map(r => r.id === rec.id ? { ...r, status: 'Sedang Diperbaiki' as any, biaya: Number(cost) } : r);
                            onUpdateMaintenanceList(updated);
                            onShowToast('Pembayaran berhasil diproses', 'success');
                            // Car sudah dikunci sejak Setujui, tidak perlu diubah lagi
                          }
                        }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer">
                          <Wallet className="w-3.5 h-3.5" />
                          Bayar & Proses
                        </button>
                      )}

                      {(rec.status === 'Sedang Diperbaiki' || rec.status === 'Menunggu Perbaikan') && (
                        <>
                          <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-bold py-2 rounded-xl text-xs text-center">
                            {rec.biaya ? `Rp ${rec.biaya.toLocaleString('id-ID')}` : 'Sedang Diproses'}
                          </div>
                          {/* (B) Tombol Selesai Maintenance — state terminal yang sebelumnya hilang */}
                          <button onClick={() => {
                            const updated = maintenanceList.map(r =>
                              r.id === rec.id ? { ...r, status: 'Selesai' as any } : r
                            );
                            onUpdateMaintenanceList(updated);
                            // Release car kembali ke tersedia
                            const updatedCars = allCars.map(c =>
                              c.id === rec.mobilId ? { ...c, status: 'tersedia' as any } : c
                            );
                            if (typeof onUpdateCars === 'function') onUpdateCars(updatedCars);
                            onShowToast(`Maintenance selesai. ${rec.mobilNama} kembali tersedia.`, 'success');
                          }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex justify-center items-center gap-1 cursor-pointer">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Selesai Maintenance
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
              {maintenanceList.filter(m => m.status !== 'Selesai' && m.status !== 'Ditolak').length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">Semua pengajuan telah diproses.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Riwayat Pembayaran Maintenance</h3>
            <p className="text-xs text-slate-500 mb-6">Daftar biaya perbaikan kendaraan yang sudah selesai.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-4 font-semibold">Mobil</th>
                    <th className="p-4 font-semibold">Kerusakan</th>
                    <th className="p-4 font-semibold">Tanggal Selesai</th>
                    <th className="p-4 font-semibold text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceList.filter(m => m.status === 'Selesai').map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-700">{rec.mobilNama}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]">{rec.kerusakan}</td>
                      <td className="p-4 text-slate-600">{rec.estimasiSelesai}</td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-600">
                        {rec.biaya ? `Rp ${rec.biaya.toLocaleString('id-ID')}` : 'Gratis / Rp 0'}
                      </td>
                    </tr>
                  ))}
                  {maintenanceList.filter(m => m.status === 'Selesai').length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada riwayat maintenance.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports-finance' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Laporan Keuangan Eksekutif</h3>
              <p className="text-xs text-slate-500 mt-1">Data difilter berdasarkan periode {periodeFilter} pilihan Anda.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleDownloadExcel('Laporan_Keuangan_Eksekutif')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm border-none">
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button onClick={() => handleDownloadPDF('Laporan Keuangan Eksekutif')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-sm border-none">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Tanggal</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Booking Code</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Pembayaran</th>
                  <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Nominal Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 text-slate-600">{p.tanggalBayar}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">{p.bookingCode}</td>
                    <td className="p-3 text-slate-800">{p.userNama}</td>
                    <td className="p-3 capitalize">{p.tipeBayar.replace('_', ' ')} - {p.metode}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">Rp {p.jumlah.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={4} className="p-3 text-right text-slate-600">Total Pendapatan Kotor:</td>
                  <td className="p-3 font-mono text-emerald-600 text-sm">Rp {totalPendapatan.toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}



    </div>
  );
}
