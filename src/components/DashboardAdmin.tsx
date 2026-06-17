import React, { useState, useEffect } from 'react';
import { Mobil, Driver, Booking, Pembayaran, Invoice, User, Review, Refund, MaintenanceRecord } from '../types';
import {
  Clock, Plus, Edit2, Trash2, ShieldCheck, Car, Users, Calendar, 
  MapPin, CheckCircle, XCircle, DollarSign, PenTool, Check,
  LayoutDashboard, Receipt, Shield, CheckSquare, Star, User as UserIcon, Bell, FileText, Settings, AlertCircle, ArrowRight, RefreshCw, Send, ShieldAlert, Award, FileSpreadsheet, Eye, Printer, Wrench, AlertTriangle,
  BarChart2, Activity, Search
} from 'lucide-react';
import { getCarStatus } from '../data';
import { ProfileAvatar } from './ProfileAvatar';

interface DashboardAdminProps {
  currentUser?: User;
  allCars: Mobil[];
  allDrivers: Driver[];
  bookings: Booking[];
  payments: Pembayaran[];
  invoices: Invoice[];
  allUsers: User[];
  reviews: Review[];
  onUpdateCars: (cars: Mobil[]) => void;
  onUpdateDrivers: (drivers: Driver[]) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdatePayments: (payments: Pembayaran[]) => void;
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onUpdateUsers: (users: User[]) => void;
  onUpdateReviews: (reviews: Review[]) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning', targetUserId?: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  settings: any;
  onUpdateSettings: (settings: any) => void;
  refunds: Refund[];
  maintenanceList: MaintenanceRecord[];
  onUpdateMaintenanceList: (list: MaintenanceRecord[]) => void;
  onUpdateRefunds: (refunds: Refund[]) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
  onApprovePayment?: (params: {
    bookingId: string;
    amount: number;
    paymentMethod: string;
    tipeBayar?: Pembayaran['tipeBayar'];
    buktiTransferUrl?: string;
    midtransOrderId?: string;
    transactionTime?: string;
    paymentIdToApprove?: string;
  }) => boolean;
}

const formatPaketSewa = (p?: string, customHours?: number) => {
  if (!p) return '-';
  switch(p) {
    case '12h': return '1/2 Hari (12 Jam)';
    case '1d': return '1 Hari';
    case '1.5d': return '1,5 Hari';
    case '2d': return '2 Hari';
    case '3d': return '3 Hari';
    case '4d': return '4 Hari';
    case '5d': return '5 Hari';
    case '6d': return '6 Hari';
    case '7d': return '7 Hari';
    case 'custom': return `Kustom (${Math.round(customHours || 24)} Jam)`;
    default: return customHours ? `${customHours} Jam` : p;
  }
};

const splitDateTime = (dtStr?: string) => {
  if (!dtStr) return { date: '-', time: '-' };
  const parts = dtStr.split('T');
  if (parts.length === 2) return { date: parts[0], time: parts[1] };
  const spaceParts = dtStr.split(' ');
  if (spaceParts.length === 2) return { date: spaceParts[0], time: spaceParts[1] };
  return { date: dtStr, time: '-' };
};

export default function DashboardAdmin({
  currentUser,
  allCars,
  allDrivers,
  bookings,
  payments,
  invoices,
  allUsers,
  reviews,
  onUpdateCars,
  onUpdateDrivers,
  onUpdateBookings,
  onUpdatePayments,
  onUpdateInvoices,
  onUpdateUsers,
  onUpdateReviews,
  onAddNotification,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  settings,
  onUpdateSettings,
  refunds,
  maintenanceList,
  onUpdateMaintenanceList,
  onUpdateRefunds,
  onShowToast,
  onShowConfirm,
  onApprovePayment
}: DashboardAdminProps) {
  const [localActiveTab, setLocalActiveTab] = useState<string>('dashboard');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;

  // Filter States
  const [periodeFilter, setPeriodeFilter] = useState<'Hari Ini' | 'Minggu Ini' | 'Bulan Ini' | 'Tahun Ini' | 'Custom'>('Bulan Ini');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Search states
  const [carSearch, setCarSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Detail Booking Modal state
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [isProcessingPelunasan, setIsProcessingPelunasan] = useState(false);
  const [pelunasanMetode, setPelunasanMetode] = useState<'Transfer' | 'QRIS' | 'Cash'>('Transfer');
  const [nominalDiterima, setNominalDiterima] = useState<number>(0);

  const getStatusRentalText = (status: string): 'Menunggu Pengambilan' | 'Dalam Sewa' | 'Selesai' | 'Dibatalkan' => {
    if (status === 'selesai' || status === 'Selesai' || status === 'Menunggu Pelunasan Denda') return 'Selesai';
    if (status === 'aktif' || status === 'Sewa Aktif' || status === 'Dalam Sewa' || status === 'sedang_berjalan') return 'Dalam Sewa';
    if (status === 'dibatalkan' || status === 'Dibatalkan' || status === 'Ditolak') return 'Dibatalkan';
    return 'Menunggu Pengambilan';
  };

  const getStatusPembayaranText = (bk: Booking): 'Belum Bayar' | 'DP Dibayar' | 'Lunas' => {
    if (bk.statusPembayaran === 'Lunas' || bk.jumlahBayar >= bk.totalBayar) {
      return 'Lunas';
    }
    if (bk.statusPembayaran === 'DP Dibayar' || (bk.jumlahBayar > 0 && bk.jumlahBayar < bk.totalBayar)) {
      return 'DP Dibayar';
    }
    return 'Belum Bayar';
  };

  const renderStatusPembayaranBadge = (status: 'Belum Bayar' | 'DP Dibayar' | 'Lunas') => {
    switch (status) {
      case 'Lunas':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <span>🟢</span> Lunas
          </span>
        );
      case 'DP Dibayar':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <span>🟡</span> DP Dibayar
          </span>
        );
      case 'Belum Bayar':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <span>🔴</span> Belum Bayar
          </span>
        );
    }
  };

  const renderStatusRentalBadge = (status: string) => {
      if (status === 'Terlambat') {
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <Clock className="w-3 h-3 mr-1" />
            Terlambat
          </span>
        );
      }
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Selesai
          </span>
        );
      case 'Dalam Sewa':
        return (
          <span className="inline-flex items-center bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Dalam Sewa
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Dibatalkan
          </span>
        );
      case 'Menunggu Pengambilan':
      default:
        return (
          <span className="inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            Menunggu Pengambilan
          </span>
        );
    }
  };

  // Tab filter states
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<string>('all');
  const [bookingFilterPaymentStatus, setBookingFilterPaymentStatus] = useState<string>('all');
  const [bookingFilterArmada, setBookingFilterArmada] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  const [activeCheckinBookingId, setActiveCheckinBookingId] = useState<string>('');
  const [checkinDamageFee, setCheckinDamageFee] = useState<number>(0);
  const [checkinExtraFee, setCheckinExtraFee] = useState<number>(0);
  const [checkinDenda, setCheckinDenda] = useState<number>(0);
  const [checkinDamageDesc, setCheckinDamageDesc] = useState<string>('');
  const [checkinKmAwal, setCheckinKmAwal] = useState<number>(0);
  const [checkinFoto, setCheckinFoto] = useState<string>('');
  const [checkinIsDamaged, setCheckinIsDamaged] = useState<boolean>(false);
  const [checkinDamagePenalty, setCheckinDamagePenalty] = useState<number>(0);

  // Mobil entry states (Create/Edit)
  const [editingCar, setEditingCar] = useState<Mobil | null>(null);
  const [carNama, setCarNama] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carTipe, setCarTipe] = useState<'MPV' | 'SUV' | 'Sedan' | 'Van' | 'Hatchback'>('MPV');
  const [carTransmisi, setCarTransmisi] = useState<'Manual' | 'Matic'>('Matic');
  const [carHargaSewa, setCarHargaSewa] = useState(0);
  const [carStatus, setCarStatus] = useState<'tersedia' | 'disewa' | 'maintenance'>('tersedia');
  const [carPlat, setCarPlat] = useState('');
  const [carBensin, setCarBensin] = useState('Pertamax');
  const [carAktif, setCarAktif] = useState(true);
  const [carFoto, setCarFoto] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600');
  const [carKapasitas, setCarKapasitas] = useState(7);
  const [carTahun, setCarTahun] = useState<number>(2024);

  // Driver entry states
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverNama, setDriverNama] = useState('');
  const [driverTelepon, setDriverTelepon] = useState('');
  const [driverTarif, setDriverTarif] = useState(0);
  const [driverLembur, setDriverLembur] = useState(0);
  const [driverPengalaman, setDriverPengalaman] = useState(0);
  const [driverStatus, setDriverStatus] = useState<'aktif' | 'booking' | 'istirahat' | 'nonaktif'>('aktif');
  const [driverAktif, setDriverAktif] = useState(true);
  const [driverAlamat, setDriverAlamat] = useState('');
  const [driverFoto, setDriverFoto] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150');

  // Admin entry states
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminStatus, setAdminStatus] = useState<'terverifikasi' | 'belum_verifikasi'>('terverifikasi');
  const [employeeTab, setEmployeeTab] = useState<'driver' | 'admin'>('driver');

  // Walk-In Booking States
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInCustomerName, setWalkInCustomerName] = useState('');
  const [walkInCustomerPhone, setWalkInCustomerPhone] = useState('');
  const [walkInMobilId, setWalkInMobilId] = useState('');
  const [walkInDriverId, setWalkInDriverId] = useState('');
  const [walkInLayanan, setWalkInLayanan] = useState<'rental' | 'rental_driver' | 'driver'>('rental');
  const [walkInStartDate, setWalkInStartDate] = useState('');
  const [walkInEndDate, setWalkInEndDate] = useState('');
  const [walkInPaket, setWalkInPaket] = useState('1d');
  const [walkInMetodeBayar, setWalkInMetodeBayar] = useState<'Transfer' | 'QRIS' | 'Cash'>('Transfer');
  const [walkInJenisPembayaran, setWalkInJenisPembayaran] = useState<'lunas' | 'dp'>('lunas');
  const [walkInDPNominal, setWalkInDPNominal] = useState<number>(0);

  // Guarantee (Jaminan) States
  const [guaranteeType, setGuaranteeType] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('autorent_guaranteeType');
    return saved ? JSON.parse(saved) : {
      'b_100': 'KTP + STNK Motor',
    };
  });
  const [guaranteeStatus, setGuaranteeStatus] = useState<Record<string, 'belum' | 'diverifikasi' | 'dikembalikan'>>(() => {
    const saved = localStorage.getItem('autorent_guaranteeStatus');
    return saved ? JSON.parse(saved) : {
      'b_100': 'diverifikasi',
      'b_101': 'belum',
    };
  });
  const [guaranteeDeposit, setGuaranteeDeposit] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('autorent_guaranteeDeposit');
    return saved ? JSON.parse(saved) : {
      'b_100': 1000000,
      'b_101': 500000,
    };
  });
  const [selectedGuaranteeBookingId, setSelectedGuaranteeBookingId] = useState<string>('');
  const [guaranteeInputType, setGuaranteeInputType] = useState<string>('KTP');
  const [guaranteeInputNumber, setGuaranteeInputNumber] = useState<string>('');
  const [handoverDateInput, setHandoverDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [guaranteeInputDeposit, setGuaranteeInputDeposit] = useState<number>(0);
  
  // Guarantee verification states
  const [confirmCarReturned, setConfirmCarReturned] = useState<boolean>(true);
  const [confirmGuaranteeReturned, setConfirmGuaranteeReturned] = useState<boolean>(true);

  // Handover (Serah Terima) States
  const [checkoutKm, setCheckoutKm] = useState<number>(12500);
  const [checkoutBody, setCheckoutBody] = useState<string>('Mulus, tidak ada baret');
  const [checkoutBbm, setCheckoutBbm] = useState<string>('Full (Baru diisi)');
  const [checkoutStnk, setCheckoutStnk] = useState<boolean>(true);
  const [checkoutKunci, setCheckoutKunci] = useState<boolean>(true);

  const [checkinKm, setCheckinKm] = useState<number>(12850);
  const [checkinBody, setCheckinBody] = useState<string>('Ada baret halus di bemper kiri depan');
  const [checkinBbm, setCheckinBbm] = useState<string>('3/4 Tangki');
  const [checkinReturnDate, setCheckinReturnDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [checkinReturnTime, setCheckinReturnTime] = useState<string>('12:00');
  
  const [selectedHandoverBookingId, setSelectedHandoverBookingId] = useState<string>('');
  const [selectedReturnBookingId, setSelectedReturnBookingId] = useState<string>('');
  const [actualReturnDate, setActualReturnDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [actualReturnTime, setActualReturnTime] = useState<string>(() => {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  });
  const [actualReturnNotes, setActualReturnNotes] = useState<string>('');
  const [handoverDetails, setHandoverDetails] = useState<Record<string, {
    kmAwal: number;
    bodyAwal: string;
    bbmAwal: string;
    stnkOk: boolean;
    kunciOk: boolean;
    tanggalKeluar: string;
    kmAkhir?: number;
    bodyAkhir?: string;
    bbmAkhir?: string;
    tanggalKembaliActual?: string;
    dendaCalculated?: number;
  }>>(() => {
    const saved = localStorage.getItem('autorent_handoverDetails');
    return saved ? JSON.parse(saved) : {
      'b_100': {
        kmAwal: 12100,
        bodyAwal: 'Mulus',
        bbmAwal: 'Full',
        stnkOk: true,
        kunciOk: true,
        tanggalKeluar: '2026-06-03 08:00',
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('autorent_guaranteeType', JSON.stringify(guaranteeType));
  }, [guaranteeType]);

  useEffect(() => {
    localStorage.setItem('autorent_guaranteeStatus', JSON.stringify(guaranteeStatus));
  }, [guaranteeStatus]);

  useEffect(() => {
    localStorage.setItem('autorent_guaranteeDeposit', JSON.stringify(guaranteeDeposit));
  }, [guaranteeDeposit]);

  const [maintCarId, setMaintCarId] = useState('');
  const [maintKerusakan, setMaintKerusakan] = useState('');
  const [maintEstimasi, setMaintEstimasi] = useState('');

  // Damage reporting states inside cars-ops tab
  const [damageBookingId, setDamageBookingId] = useState<string>('');
  const [damageDesc, setDamageDesc] = useState<string>('');
  const [damageEstDate, setDamageEstDate] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('autorent_handoverDetails', JSON.stringify(handoverDetails));
  }, [handoverDetails]);

  // Invoice visualizer details modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Customer Management States
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNik, setCustNik] = useState('');
  const [custSim, setCustSim] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Notification Broadcaster States
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'warning'>('info');
  const [broadcastTarget, setBroadcastTarget] = useState<string>('all');

  // Payments sub-selector
  const [paymentSubTab, setPaymentSubTab] = useState<'pending' | 'gateway'>('pending');

  // Refund Approval Modal States
  const [approvingRefund, setApprovingRefund] = useState<Refund | null>(null);
  const [adminRefundMetode, setAdminRefundMetode] = useState<'Transfer Bank'>('Transfer Bank');
  const [adminRefundBank, setAdminRefundBank] = useState('');
  const [adminRefundRekening, setAdminRefundRekening] = useState('');
  const [adminRefundNama, setAdminRefundNama] = useState('');
  // Offline Payment Handler
  const handleOfflinePayment = (bk: Booking) => {
    const paymentAmt = bk.sisaPelunasan;
    if (paymentAmt <= 0) return alert('Booking ini sudah lunas!');

    const isDendaPayment = bk.statusPembayaran === 'Menunggu Pelunasan Denda';
    const pId = `p_offline_${Date.now()}`;
    const newPayment: Pembayaran = {
      id: pId,
      bookingId: bk.id,
      bookingCode: bk.bookingCode,
      userId: bk.userId,
      userNama: bk.userNama,
      tipeBayar: isDendaPayment ? 'denda' : (bk.jumlahBayar === 0 ? 'lunas_full' : 'pelunasan'),
      jumlah: paymentAmt,
      metode: 'Manual',
      buktiTransferUrl: '',
      tanggalBayar: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'disetujui'
    };

    onUpdatePayments([newPayment, ...payments]);

    const finalTotal = bk.totalAkhir || bk.totalBayar;
    const newJumlahBayar = bk.jumlahBayar + paymentAmt;
    const newSisa = Math.max(0, finalTotal - newJumlahBayar);

    const updatedBookings = bookings.map(b => {
      if (b.id === bk.id) {
        return {
          ...b,
          jumlahBayar: newJumlahBayar,
          sisaPelunasan: newSisa,
          status: isDendaPayment ? ('Menunggu Pelunasan Denda' as const) : ('Menunggu Pengambilan' as const),
          statusPembayaran: 'Lunas' as const
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    const existingInvIndex = invoices.findIndex(i => i.bookingId === bk.id);
    if (existingInvIndex >= 0) {
      const updatedInvoices = [...invoices];
      const i = updatedInvoices[existingInvIndex];
      updatedInvoices[existingInvIndex] = {
        ...i,
        terbayar: newJumlahBayar,
        sisa: newSisa,
        status: 'lunas' as const
      };
      onUpdateInvoices(updatedInvoices);
    } else {
      const invId = `i_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const rincianText = bk.layanan === 'rental'
        ? `Sewa Lepas Kunci ${bk.mobilNama} (${bk.durasiHari} hari)`
        : bk.layanan === 'rental_driver'
        ? `Sewa ${bk.mobilNama} (${bk.durasiHari} hari) + Jasa Driver ${bk.driverNama}`
        : `Jasa Driver Profesional ${bk.driverNama} (${bk.durasiHari} hari)`;

      const newInvoice: Invoice = {
        id: invId,
        invoiceCode: `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        userId: bk.userId,
        userNama: bk.userNama,
        layanan: bk.layanan === 'rental' ? 'Rental Mobil' : bk.layanan === 'rental_driver' ? 'Rental + Driver' : 'Jasa Driver',
        rincianItem: rincianText,
        subtotal: bk.totalBayar,
        denda: 0,
        total: bk.totalBayar,
        terbayar: newJumlahBayar,
        sisa: newSisa,
        status: 'lunas' as const,
        tanggalDibuat: new Date().toISOString().substring(0, 10),
        metodePembayaran: 'Manual',
        tanggalPembayaran: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      onUpdateInvoices([newInvoice, ...invoices]);
    }

    // If it was a regular rental checkout (not denda), we block car & driver as active/booking.
    // If it was a denda payment, the car is already released!
    if (!isDendaPayment) {
      if (bk.mobilId) {
        const updatedCars = allCars.map(c => {
          if (c.id === bk.mobilId) return { ...c, status: 'Disewa' as const };
          return c;
        });
        onUpdateCars(updatedCars);
      }
      if (bk.driverId) {
        const updatedDrivers = allDrivers.map(dr => {
          if (dr.id === bk.driverId) return { ...dr, status: 'booking' as const };
          return dr;
        });
        onUpdateDrivers(updatedDrivers);
      }
    }

    onAddNotification(
      'Pembayaran Offline Berhasil',
      `Pembayaran offline booking ${bk.bookingCode} sebesar Rp ${paymentAmt.toLocaleString('id-ID')} lunas di kasir!`,
      'success'
    );
  };

  const handleApproveRefund = (ref: Refund) => {
    setApprovingRefund(ref);
    setAdminRefundMetode('Transfer Bank');
    setAdminRefundBank(ref.bankNama || '');
    setAdminRefundRekening(ref.rekeningNomor || '');
    setAdminRefundNama(ref.rekeningNama || '');
  };

  const submitApproveRefund = () => {
    if (!approvingRefund) return;
    const ref = approvingRefund;

    if (adminRefundMetode === 'Transfer Bank') {
      if (!adminRefundBank.trim() || !adminRefundRekening.trim() || !adminRefundNama.trim()) {
        alert('Data rekening bank wajib diisi untuk transfer.');
        return;
      }
    }

    const targetBooking = bookings.find(b => b.id === ref.bookingId);
    if (!targetBooking) {
      alert('Booking tidak ditemukan.');
      return;
    }

    const existingInvoice = invoices.find(inv => inv.bookingId === targetBooking.id || inv.bookingCode === targetBooking.bookingCode);
    if (!existingInvoice) {
      alert('Invoice untuk booking ini tidak ditemukan.');
      return;
    }

    // Verify payment has been approved (Meaning booking has a recorded amount paid)
    if (targetBooking.jumlahBayar <= 0) {
      alert('Persetujuan refund ditolak: Booking belum dibayar.');
      return;
    }

    // Verify refund amount does not exceed amount paid
    if (ref.nominalRefund > ref.totalDibayar) {
      alert(`Persetujuan refund ditolak: Nominal refund (Rp ${ref.nominalRefund.toLocaleString('id-ID')}) melebihi jumlah total dibayar pada pengajuan (Rp ${ref.totalDibayar.toLocaleString('id-ID')}).`);
      return;
    }
    if (ref.nominalRefund > targetBooking.jumlahBayar) {
      alert(`Persetujuan refund ditolak: Nominal refund (Rp ${ref.nominalRefund.toLocaleString('id-ID')}) melebihi jumlah yang telah dibayar pada booking (Rp ${targetBooking.jumlahBayar.toLocaleString('id-ID')}).`);
      return;
    }

    // 1. Update status refund
    const updatedRefunds = refunds.map(r => {
      if (r.id === ref.id) {
        return { 
          ...r, 
          status: 'Disetujui' as const, 
          tanggalRefund: new Date().toISOString().substring(0, 10),
          tanggalPersetujuan: new Date().toISOString(),
          approvedBy: currentUser?.name || 'Admin',
          nomorRefund: 'RFD-' + ref.bookingCode,
          metodeRefund: adminRefundMetode,
          bankNama: adminRefundBank,
          rekeningNomor: adminRefundRekening,
          rekeningNama: adminRefundNama
        };
      }
      return r;
    });
    onUpdateRefunds(updatedRefunds);

    // 2. Update status booking & status pembayaran
    const updatedBookings = bookings.map(b => {
      if (b.id === ref.bookingId) {
        return { 
          ...b, 
          status: 'dibatalkan' as const,
          statusPembayaran: 'Refund' as const
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // 3. Release car & driver
    if (targetBooking.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === targetBooking.mobilId) {
          return { ...c, status: 'tersedia' as const };
        }
        return c;
      });
      onUpdateCars(updatedCars);
    }
    if (targetBooking.driverId) {
      const updatedDrivers = allDrivers.map(d => {
        if (d.id === targetBooking.driverId) {
          return { ...d, status: 'aktif' as const };
        }
        return d;
      });
      onUpdateDrivers(updatedDrivers);
    }

    // 4. Update the existing invoice status to 'refund'
    const updatedInvoices = invoices.map(inv => {
      if (inv.bookingId === targetBooking.id || inv.bookingCode === targetBooking.bookingCode) {
        return {
          ...inv,
          status: 'refund' as const,
          invoiceStatus: 'refund',
          tanggalPembayaran: new Date().toISOString().substring(0, 10),
          paymentDate: new Date().toISOString().substring(0, 10)
        };
      }
      return inv;
    });
    onUpdateInvoices(updatedInvoices);

    // 5. Send notifications to Customer, Admin, and Owner
    onAddNotification(
      'Refund Disetujui', 
      `Refund ${ref.id} untuk customer ${ref.userNama} telah disetujui. Dana Rp ${ref.nominalRefund.toLocaleString('id-ID')} dikembalikan.`, 
      'success',
      ref.userId
    );
    onAddNotification(
      'Refund Disetujui', 
      `Refund ${ref.id} untuk customer ${ref.userNama} telah disetujui. Dana Rp ${ref.nominalRefund.toLocaleString('id-ID')} dikembalikan.`, 
      'success',
      'user_owner_1'
    );
    onAddNotification(
      'Refund Disetujui', 
      `Refund ${ref.id} untuk customer ${ref.userNama} telah disetujui. Dana Rp ${ref.nominalRefund.toLocaleString('id-ID')} dikembalikan.`, 
      'success',
      'user_admin_1'
    );

    setApprovingRefund(null);
  };

  const handleRejectRefund = (ref: Refund) => {
    const reason = prompt(`Masukkan alasan penolakan refund ${ref.id}:`, '');
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      alert('Alasan penolakan wajib diisi!');
      return;
    }

    // 1. Update status refund
    const updatedRefunds = refunds.map(r => {
      if (r.id === ref.id) {
        return { 
          ...r, 
          status: 'Ditolak' as const,
          alasan: reason,
          tanggalPersetujuan: new Date().toISOString(),
          approvedBy: currentUser?.name || 'Admin'
        };
      }
      return r;
    });
    onUpdateRefunds(updatedRefunds);

    // 2. Restore booking status
    const targetBooking = bookings.find(b => b.id === ref.bookingId);
    if (targetBooking) {
      const updatedBookings = bookings.map(b => {
        if (b.id === ref.bookingId) {
          const isLunas = targetBooking.jumlahBayar >= targetBooking.totalBayar;
          return { 
            ...b, 
            status: 'Dikonfirmasi' as const,
            statusPembayaran: isLunas ? 'Lunas' as const : 'DP Dibayar' as const
          };
        }
        return b;
      });
      onUpdateBookings(updatedBookings);
    }

    // 3. Send notifications to Customer, Admin, and Owner
    onAddNotification(
      'Refund Ditolak', 
      `Pengajuan refund ${ref.id} untuk customer ${ref.userNama} telah ditolak. Alasan: ${reason}. Reservasi tetap aktif.`, 
      'warning',
      ref.userId
    );
    onAddNotification(
      'Refund Ditolak', 
      `Pengajuan refund ${ref.id} untuk customer ${ref.userNama} telah ditolak. Alasan: ${reason}.`, 
      'warning',
      'user_owner_1'
    );
    onAddNotification(
      'Refund Ditolak', 
      `Pengajuan refund ${ref.id} untuk customer ${ref.userNama} telah ditolak. Alasan: ${reason}.`, 
      'warning',
      'user_admin_1'
    );
  };

  const handleKonfirmasiPembayaran = (bk: Booking, metode: 'Transfer' | 'QRIS' | 'Cash', nominal: number) => {
    if (nominal <= 0) return alert('Nominal harus lebih dari 0!');
    const totalFinal = bk.totalAkhir || bk.totalBayar;
    const remaining = totalFinal - bk.jumlahBayar;
    if (nominal > remaining) return alert(`Nominal tidak boleh melebihi sisa tagihan (Rp ${remaining.toLocaleString('id-ID')})!`);

    const isDendaPayment = bk.statusPembayaran === 'Menunggu Pelunasan Denda' || bk.status === 'Menunggu Pelunasan Denda';
    const pId = `p_offline_${Date.now()}`;
    const newPayment: Pembayaran = {
      id: pId,
      bookingId: bk.id,
      bookingCode: bk.bookingCode,
      userId: bk.userId,
      userNama: bk.userNama,
      tipeBayar: isDendaPayment ? 'denda' : (bk.jumlahBayar === 0 ? 'dp' : 'pelunasan'),
      jumlah: nominal,
      metode: metode,
      buktiTransferUrl: '',
      tanggalBayar: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'disetujui'
    };

    const newJumlahBayar = bk.jumlahBayar + nominal;
    const newSisa = Math.max(0, totalFinal - newJumlahBayar);
    const isFullyPaid = newSisa <= 0;

    const newStatusPembayaran = isFullyPaid 
      ? 'Lunas' as const 
      : (isDendaPayment ? 'Menunggu Pelunasan Denda' as const : 'DP Dibayar' as const);

    const newBookingStatus = isDendaPayment 
      ? (isFullyPaid ? 'Selesai' as const : 'Menunggu Pelunasan Denda' as const)
      : (isFullyPaid ? 'Lunas' as const : 'Menunggu Pelunasan' as const);

    onUpdatePayments([newPayment, ...payments]);

    const updatedBookings = bookings.map(b => {
      if (b.id === bk.id) {
        return {
          ...b,
          jumlahBayar: newJumlahBayar,
          sisaPelunasan: newSisa,
          status: newBookingStatus,
          statusPembayaran: newStatusPembayaran,
          statusDenda: isDendaPayment ? (isFullyPaid ? 'Sudah Dibayar' as const : 'Belum Dibayar' as const) : b.statusDenda
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // Sync Invoice
    const existingInvIndex = invoices.findIndex(i => i.bookingId === bk.id);
    if (existingInvIndex >= 0) {
      const updatedInvoices = [...invoices];
      const i = updatedInvoices[existingInvIndex];
      updatedInvoices[existingInvIndex] = {
        ...i,
        terbayar: newJumlahBayar,
        sisa: newSisa,
        status: isFullyPaid ? 'lunas' as const : 'dp_lunas' as const,
        metodePembayaran: metode,
        tanggalPembayaran: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      onUpdateInvoices(updatedInvoices);
    } else {
      const invId = `i_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const rincianText = bk.layanan === 'rental'
        ? `Sewa Lepas Kunci ${bk.mobilNama} (${bk.durasiHari} hari)`
        : bk.layanan === 'rental_driver'
        ? `Sewa ${bk.mobilNama} (${bk.durasiHari} hari) + Jasa Driver ${bk.driverNama}`
        : `Jasa Driver Profesional ${bk.driverNama} (${bk.durasiHari} hari)`;

      const newInvoice: Invoice = {
        id: invId,
        invoiceCode: `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        userId: bk.userId,
        userNama: bk.userNama,
        layanan: bk.layanan === 'rental' ? 'Rental Mobil' : bk.layanan === 'rental_driver' ? 'Rental + Driver' : 'Jasa Driver',
        rincianItem: rincianText,
        subtotal: bk.totalBayar,
        denda: 0,
        total: bk.totalBayar,
        terbayar: newJumlahBayar,
        sisa: newSisa,
        status: isFullyPaid ? 'lunas' as const : 'dp_lunas' as const,
        tanggalDibuat: new Date().toISOString().substring(0, 10),
        metodePembayaran: metode,
        tanggalPembayaran: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      onUpdateInvoices([newInvoice, ...invoices]);
    }

    if (bk.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === bk.mobilId) return { ...c, status: 'Disewa' as const };
        return c;
      });
      onUpdateCars(updatedCars);
    }

    onAddNotification(
      'Konfirmasi Pembayaran Berhasil',
      `Pembayaran booking ${bk.bookingCode} sebesar Rp ${nominal.toLocaleString('id-ID')} via ${metode} berhasil dikonfirmasi!`,
      'success'
    );

    // Refresh selected booking detail view state
    setSelectedBookingForDetail(updatedBookings.find(b => b.id === bk.id) || null);
    setIsProcessingPelunasan(false);
  };

  // Complete Booking Handler
  const handleCompleteBooking = (bk: Booking) => {
    const updatedBookings = bookings.map(b => {
      if (b.id === bk.id) {
        return {
          ...b,
          status: 'selesai' as const
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    if (bk.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === bk.mobilId) return { ...c, status: 'tersedia' as const };
        return c;
      });
      onUpdateCars(updatedCars);
    }
    if (bk.driverId) {
      const updatedDrivers = allDrivers.map(dr => {
        if (dr.id === bk.driverId) return { ...dr, status: 'aktif' as const };
        return dr;
      });
      onUpdateDrivers(updatedDrivers);
    }

    onAddNotification(
      'Booking Sewa Selesai',
      `Reservasi ${bk.bookingCode} berhasil diselesaikan. Armada dan supir kembali stand-by.`,
      'success'
    );
  };

  // Approve / Reject Payment Handler
  const handleApprovePayment = (payment: Pembayaran) => {
    if (onApprovePayment) {
      onApprovePayment({
        bookingId: payment.bookingId,
        amount: payment.jumlah,
        paymentMethod: payment.metode,
        tipeBayar: payment.tipeBayar,
        buktiTransferUrl: payment.buktiTransferUrl,
        paymentIdToApprove: payment.id
      });
      // Rehydrate the detail modal state by reading the updated booking
      setTimeout(() => {
        const currentBks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
        const updatedBk = currentBks.find((b: Booking) => b.id === payment.bookingId);
        if (updatedBk) setSelectedBookingForDetail(updatedBk);
      }, 50);
      return;
    }

    // Fallback legacy implementation (if orchestrator is not present)
    const updatedPayments = payments.map(p => {
      if (p.id === payment.id) return { ...p, status: 'disetujui' as const };
      return p;
    });
    onUpdatePayments(updatedPayments);

    const targetBooking = bookings.find(b => b.id === payment.bookingId);
    const isDenda = targetBooking?.statusPembayaran === 'Menunggu Pelunasan Denda' || targetBooking?.status === 'Menunggu Pelunasan Denda';
    let isLunas = false;
    
    const updatedBookings = bookings.map(b => {
      if (b.id === payment.bookingId) {
        const totalFinal = b.totalAkhir || b.totalBayar;
        const alreadyPaid = b.jumlahBayar + payment.jumlah;
        isLunas = alreadyPaid >= totalFinal;
        const newPaymentStatus = isLunas ? ('Lunas' as const) : (isDenda ? ('Menunggu Pelunasan Denda' as const) : ('DP Dibayar' as const));
        const newBookingStatus = isDenda 
          ? (isLunas ? ('Selesai' as const) : ('Menunggu Pelunasan Denda' as const))
          : ('Dikonfirmasi' as const);
        
        return { 
          ...b, 
          status: newBookingStatus,
          statusPembayaran: newPaymentStatus,
          jumlahBayar: alreadyPaid,
          sisaPelunasan: Math.max(0, totalFinal - alreadyPaid)
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    let invoiceStatus: 'belum_bayar' | 'dp_lunas' | 'lunas' = 'dp_lunas';
    if (targetBooking) {
      const alreadyPaid = targetBooking.jumlahBayar + payment.jumlah;
      if (alreadyPaid >= targetBooking.totalBayar) {
        invoiceStatus = 'lunas';
      }
    }

    const existingInvIndex = invoices.findIndex(i => i.bookingId === payment.bookingId);
    if (existingInvIndex >= 0) {
      const updatedInvoices = [...invoices];
      const i = updatedInvoices[existingInvIndex];
      const newPaid = i.terbayar + payment.jumlah;
      updatedInvoices[existingInvIndex] = {
        ...i,
        terbayar: newPaid,
        sisa: Math.max(0, i.total - newPaid),
        status: invoiceStatus
      };
      onUpdateInvoices(updatedInvoices);
    } else if (targetBooking) {
      const invId = `i_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const rincianText = targetBooking.layanan === 'rental'
        ? `Sewa Lepas Kunci ${targetBooking.mobilNama} (${targetBooking.durasiHari} hari)`
        : targetBooking.layanan === 'rental_driver'
        ? `Sewa ${targetBooking.mobilNama} (${targetBooking.durasiHari} hari) + Jasa Driver ${targetBooking.driverNama}`
        : `Jasa Driver Profesional ${targetBooking.driverNama} (${targetBooking.durasiHari} hari)`;

      const newPaid = payment.jumlah;
      const total = targetBooking.totalBayar;
      
      const newInvoice: Invoice = {
        id: invId,
        invoiceCode: `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
        bookingId: targetBooking.id,
        bookingCode: targetBooking.bookingCode,
        userId: targetBooking.userId,
        userNama: targetBooking.userNama,
        layanan: targetBooking.layanan === 'rental' ? 'Rental Mobil' : targetBooking.layanan === 'rental_driver' ? 'Rental + Driver' : 'Jasa Driver',
        rincianItem: rincianText,
        subtotal: total,
        denda: 0,
        total: total,
        terbayar: newPaid,
        sisa: Math.max(0, total - newPaid),
        status: invoiceStatus as any,
        tanggalDibuat: new Date().toISOString().substring(0, 10),
        metodePembayaran: payment.metode,
        tanggalPembayaran: payment.tanggalBayar
      };
      onUpdateInvoices([newInvoice, ...invoices]);
    }

    if (targetBooking?.mobilId) {
      const isDenda = targetBooking.statusPembayaran === 'Menunggu Pelunasan Denda' || targetBooking.status === 'Menunggu Pelunasan Denda';
      if (!isDenda) {
        const updatedCars = allCars.map(c => {
          if (c.id === targetBooking.mobilId) return { ...c, status: 'Disewa' as const };
          return c;
        });
        onUpdateCars(updatedCars);
      }
    }
    if (targetBooking?.driverId) {
      const updatedDrivers = allDrivers.map(dr => {
        if (dr.id === targetBooking.driverId) return { ...dr, status: 'booking' as const };
        return dr;
      });
      onUpdateDrivers(updatedDrivers);
    }

    onAddNotification(
      'Pembayaran Disetujui', 
      `Pembayaran invoice ${payment.bookingCode} sebesar Rp ${payment.jumlah.toLocaleString('id-ID')} berhasil diverifikasi sah!`, 
      'success'
    );
    if (targetBooking) {
      onAddNotification(
        'Pembayaran Diverifikasi', 
        `Pembayaran Anda untuk booking ${payment.bookingCode} sebesar Rp ${payment.jumlah.toLocaleString('id-ID')} telah disetujui Admin. Status: ${isLunas ? 'Lunas' : 'DP Dibayar'}.`, 
        'success',
        targetBooking.userId
      );
    }
  };

  const handleDeclinePayment = (payment: Pembayaran) => {
    const updatedPayments = payments.map(p => {
      if (p.id === payment.id) return { ...p, status: 'ditolak' as const };
      return p;
    });
    onUpdatePayments(updatedPayments);

    const targetBooking = bookings.find(b => b.id === payment.bookingId);
    const updatedBookings = bookings.map(b => {
      if (b.id === payment.bookingId) {
        return { 
          ...b, 
          status: 'Menunggu Pembayaran' as const,
          statusPembayaran: 'Belum Bayar' as const
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // Revert car status back to tersedia
    if (targetBooking?.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === targetBooking.mobilId) return { ...c, status: 'tersedia' as const };
        return c;
      });
      onUpdateCars(updatedCars);
    }

    // Revert driver status back to aktif
    if (targetBooking?.driverId) {
      const updatedDrivers = allDrivers.map(d => {
        if (d.id === targetBooking.driverId) return { ...d, status: 'aktif' as const };
        return d;
      });
      onUpdateDrivers(updatedDrivers);
    }

    onAddNotification(
      'Pembayaran Ditolak', 
      `Pembayaran booking ${payment.bookingCode} ditolak karena resi transfer tidak valid/jelas.`, 
      'warning'
    );
    if (targetBooking) {
      onAddNotification(
        'Pembayaran Ditolak', 
        `Pembayaran Anda untuk booking ${payment.bookingCode} sebesar Rp ${payment.jumlah.toLocaleString('id-ID')} ditolak Admin. Silakan hubungi admin atau unggah ulang bukti transfer valid.`, 
        'warning',
        targetBooking.userId
      );
    }

    // Rehydrate detail modal
    setTimeout(() => {
      const currentBks = JSON.parse(localStorage.getItem('autorent_bookings') || '[]');
      const updatedBk = currentBks.find((b: Booking) => b.id === payment.bookingId);
      if (updatedBk) setSelectedBookingForDetail(updatedBk);
    }, 50);
  };

  // Car Actions
  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carNama || !carBrand || !carPlat) return alert('Lengkapi data mobil!');

    if (editingCar) {
      const updatedCar = {
        ...editingCar,
        nama: carNama,
        brand: carBrand,
        tipe: carTipe,
        transmisi: carTransmisi,
        bensin: carBensin,
        hargaSewa: carHargaSewa,
        status: carStatus,
        platNomor: carPlat,
        foto: carFoto || editingCar.foto,
        kapasitas: carKapasitas,
        aktif: carAktif,
        tahun: carTahun
      };
      const updatedCars = allCars.map(c => c.id === editingCar.id ? updatedCar : c);
      onUpdateCars(updatedCars);

      // Sync mobilNama on existing bookings if car name changed
      const newFullName = carNama;
      if (editingCar.nama !== newFullName) {
        const updatedBookings = bookings.map(b =>
          b.mobilId === editingCar.id ? { ...b, mobilNama: newFullName } : b
        );
        onUpdateBookings(updatedBookings);
      }

      setEditingCar(null);
      onAddNotification('Unit Disimpan', `Detail mobil ${carNama} diperbarui dan disinkronkan ke seluruh sistem.`, 'success');
    } else {
      const newCar: Mobil = {
        id: `m_${Date.now()}`,
        nama: carNama,
        brand: carBrand,
        tipe: carTipe,
        transmisi: carTransmisi,
        bensin: carBensin,
        kapasitas: carKapasitas,
        platNomor: carPlat,
        hargaSewa: carHargaSewa,
        foto: carFoto || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
        status: carStatus,
        aktif: carAktif,
        tahun: carTahun
      };
      onUpdateCars([...allCars, newCar]);
      onAddNotification('Unit Ditambahkan', `Unit ${carBrand} ${carNama} berhasil masuk sistem armada dan tersedia di seluruh katalog.`, 'success');
    }

    // Reset all form fields
    setCarNama('');
    setCarBrand('');
    setCarPlat('');
    setCarHargaSewa(0);
    setCarAktif(true);
    setCarTahun(2024);
    setCarStatus('tersedia');
    setCarTipe('MPV');
    setCarTransmisi('Matic');
    setCarBensin('Pertamax');
    setCarKapasitas(7);
    setCarFoto('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600');
  };

  const handleStartEditCar = (car: Mobil) => {
    setEditingCar(car);
    setCarNama(car.nama);
    setCarBrand(car.brand);
    setCarTipe(car.tipe);
    setCarTransmisi(car.transmisi);
    setCarHargaSewa(car.hargaSewa);
    setCarStatus(car.status);
    setCarPlat(car.platNomor);
    setCarBensin(car.bensin);
    setCarFoto(car.foto);
    setCarKapasitas(car.kapasitas);
    setCarAktif(car.aktif ?? true);
    setCarTahun(car.tahun || 2024);
    document.getElementById('manage-cars-audit')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteCar = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mobil ini dari draf armada?')) {
      onUpdateCars(allCars.filter(c => c.id !== id));
      onAddNotification('Unit Dihapus', 'Armada berhasil dinonaktifkan permanen.', 'warning');
    }
  };

  // Driver Actions
  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverNama || !driverTelepon) return alert('Lengkapi data supir!');

    if (editingDriver) {
      const updated = allDrivers.map(d => {
        if (d.id === editingDriver.id) {
          return {
            ...d,
            nama: driverNama,
            telepon: driverTelepon,
            tarifPerHari: driverTarif,
            tarifLemburPerJam: driverLembur,
            pengalamanTahun: driverPengalaman,
            status: driverStatus,
            aktif: driverAktif,
            alamat: driverAlamat,
            lokasi: driverAlamat,
            foto: driverFoto
          };
        }
        return d;
      });
      onUpdateDrivers(updated);
      setEditingDriver(null);
      onAddNotification('Driver Disimpan', `Profil supir ${driverNama} diperbarui.`, 'success');
    } else {
      const newD: Driver = {
        id: `d_${Date.now()}`,
        nama: driverNama,
        foto: driverFoto,
        telepon: driverTelepon,
        tarifPerHari: driverTarif,
        tarifLemburPerJam: driverLembur,
        pengalamanTahun: driverPengalaman,
        spesialisasi: ['Dalam Kota', 'Umum'],
        rating: 5.0,
        reviewCount: 1,
        status: driverStatus,
        lokasi: driverAlamat || 'Bandung',
        alamat: driverAlamat,
        aktif: driverAktif
      };
      onUpdateDrivers([...allDrivers, newD]);
      onAddNotification('Driver Terdaftar', `Sopir baru ${driverNama} resmi terdaftar dan siap terima order.`, 'success');
    }

    setDriverNama('');
    setDriverTelepon('');
    setDriverTarif(0);
    setDriverLembur(0);
    setDriverPengalaman(0);
    setDriverAktif(true);
    setDriverAlamat('');
    setDriverFoto('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150');
  };

  const handleStartEditDriver = (d: Driver) => {
    setEditingDriver(d);
    setDriverNama(d.nama);
    setDriverTelepon(d.telepon);
    setDriverTarif(d.tarifPerHari);
    setDriverLembur(d.tarifLemburPerJam);
    setDriverPengalaman(d.pengalamanTahun);
    setDriverStatus(d.status);
    setDriverAktif(d.aktif ?? true);
    setDriverAlamat(d.alamat || d.lokasi || '');
    setDriverFoto(d.foto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150');
    document.getElementById('manage-drivers-audit')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm('Hapus driver ini dari rekrutmen?')) {
      onUpdateDrivers(allDrivers.filter(d => d.id !== id));
      onAddNotification('Driver Dihapus', 'Staff driver dinonaktifkan.', 'warning');
    }
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || (!editingAdmin && !adminPassword)) {
      onAddNotification('Gagal Menyimpan', 'Nama, Email, dan Password wajib diisi.', 'warning');
      return;
    }

    if (editingAdmin) {
      const updated = allUsers.map(u => {
        if (u.id === editingAdmin.id) {
          return {
            ...u,
            name: adminName,
            email: adminEmail,
            phone: adminPhone,
            status: adminStatus,
            // (Dalam sistem nyata, password tidak disimpan plain, ini sekadar simulasi state)
            password: adminPassword || u.password
          };
        }
        return u;
      });
      onUpdateUsers(updated);
      setEditingAdmin(null);
      onAddNotification('Admin Disimpan', `Profil admin ${adminName} diperbarui.`, 'success');
    } else {
      const newA: User = {
        id: `ADM_${Date.now()}`,
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        role: 'admin',
        status: adminStatus,
        joinDate: new Date().toISOString().split('T')[0],
      };
      onUpdateUsers([...allUsers, newA]);
      onAddNotification('Admin Terdaftar', `Staff admin ${adminName} resmi ditambahkan.`, 'success');
    }

    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminPassword('');
    setAdminStatus('terverifikasi');
  };

  const handleStartEditAdmin = (a: User) => {
    setEditingAdmin(a);
    setAdminName(a.name);
    setAdminEmail(a.email);
    setAdminPhone(a.phone || '');
    setAdminStatus((a.status as 'terverifikasi' | 'belum_verifikasi') || 'terverifikasi');
    setAdminPassword(''); // clear password field for security
    document.getElementById('manage-employees-audit')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm('Hapus akses admin ini secara permanen?')) {
      onUpdateUsers(allUsers.filter(u => u.id !== id));
      onAddNotification('Admin Dihapus', 'Akses administrator telah dicabut.', 'warning');
    }
  };


  // Guarantee Submit Handler
  const handleSaveGuarantee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuaranteeBookingId) return alert('Pilih booking terlebih dahulu!');

    setGuaranteeType({
      ...guaranteeType,
      [selectedGuaranteeBookingId]: guaranteeInputType
    });
    setGuaranteeStatus({
      ...guaranteeStatus,
      [selectedGuaranteeBookingId]: 'diverifikasi'
    });
    setGuaranteeDeposit({
      ...guaranteeDeposit,
      [selectedGuaranteeBookingId]: guaranteeInputDeposit
    });

    const targetBk = bookings.find(b => b.id === selectedGuaranteeBookingId);
    onAddNotification(
      'Jaminan Diverifikasi',
      `Jaminan untuk ${targetBk?.bookingCode || selectedGuaranteeBookingId} (${guaranteeInputType}) sukses diverifikasi & disimpan di brankas!`,
      'success'
    );
    setSelectedGuaranteeBookingId('');
    setGuaranteeInputDeposit(0);
  };

  // Synchronise with legacy localStorage keys for customer dashboard compatibility
  const syncLegacyData = (bookingId: string, type: string, status: 'belum' | 'diverifikasi' | 'dikembalikan', deposit: number, handover: any) => {
    const savedType = localStorage.getItem('autorent_guaranteeType');
    const typeObj = savedType ? JSON.parse(savedType) : {};
    typeObj[bookingId] = type;
    localStorage.setItem('autorent_guaranteeType', JSON.stringify(typeObj));
    setGuaranteeType(typeObj);

    const savedStatus = localStorage.getItem('autorent_guaranteeStatus');
    const statusObj = savedStatus ? JSON.parse(savedStatus) : {};
    statusObj[bookingId] = status;
    localStorage.setItem('autorent_guaranteeStatus', JSON.stringify(statusObj));
    setGuaranteeStatus(statusObj);

    const savedDeposit = localStorage.getItem('autorent_guaranteeDeposit');
    const depositObj = savedDeposit ? JSON.parse(savedDeposit) : {};
    depositObj[bookingId] = deposit;
    localStorage.setItem('autorent_guaranteeDeposit', JSON.stringify(depositObj));
    setGuaranteeDeposit(depositObj);

    const savedHandover = localStorage.getItem('autorent_handoverDetails');
    const handoverObj = savedHandover ? JSON.parse(savedHandover) : {};
    if (handover) {
      handoverObj[bookingId] = {
        ...handoverObj[bookingId],
        ...handover
      };
    } else {
      delete handoverObj[bookingId];
    }
    localStorage.setItem('autorent_handoverDetails', JSON.stringify(handoverObj));
    setHandoverDetails(handoverObj);
  };

  // 1. Serahkan Kendaraan (Handover & Guarantee Input)
  const handleHandoverVehicle = (bookingId: string, jenis: string, nomor: string, tanggal: string) => {
    if (!bookingId) return alert('Pilih booking!');
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk) return;

    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Dalam Sewa' as const,
          jenisJaminan: jenis as any,
          nomorJaminan: nomor,
          statusJaminan: 'Ditahan' as const,
          tanggalSerahTerima: tanggal
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    if (bk.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === bk.mobilId) return { ...c, status: 'Disewa' as const };
        return c;
      });
      onUpdateCars(updatedCars);
    }

    syncLegacyData(bookingId, jenis, 'diverifikasi', 0, {
      kmAwal: 12500,
      bodyAwal: 'Mulus',
      bbmAwal: 'Full',
      stnkOk: true,
      kunciOk: true,
      tanggalKeluar: tanggal
    });

    onAddNotification(
      'Serah Terima Kendaraan Berhasil',
      `Unit ${bk.mobilNama} telah diserahkan kepada ${bk.userNama}. Jaminan ditahan.`,
      'success'
    );

    setSelectedHandoverBookingId('');
    setGuaranteeInputNumber('');
  };

  // Helper to calculate delay and penalty
  const calculateDelayAndPenalty = (tanggalSelesaiStr?: string, returnDateStr?: string) => {
    if (!tanggalSelesaiStr || !returnDateStr) return { days: 0, penalty: 0 };
    const scheduled = new Date(tanggalSelesaiStr);
    const actual = new Date(returnDateStr);
    
    scheduled.setHours(0,0,0,0);
    actual.setHours(0,0,0,0);
    
    const timeDiff = actual.getTime() - scheduled.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    
    const days = dayDiff > 0 ? dayDiff : 0;
    const dendaPerHari = settings?.dendaPerHari || 200000;
    const penalty = days * dendaPerHari;
    return { days, penalty };
  };

  // 2. Konfirmasi Pengembalian Mobil
  const handleReturnVehicle = (bookingId: string, retDate: string, retTime: string, notes: string, carReturned: boolean, guaranteeReturned: boolean) => {
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk) return;

    // 1. Kilometer Validation
    const kmAwal = handoverDetails[bk.id]?.kmAwal || bk.kilometerAwal || 12000;
    if (checkinKm < kmAwal) {
      onShowToast(`Kilometer akhir (${checkinKm} km) tidak boleh kurang dari kilometer awal (${kmAwal} km)!`, 'error');
      return;
    }

    // 2. Calculate Penalties
    // Car Late return daily penalty
    const scheduledDay = new Date(bk.tanggalSelesai.replace('T', ' '));
    scheduledDay.setHours(0, 0, 0, 0);
    const actualDay = new Date(retDate);
    actualDay.setHours(0, 0, 0, 0);
    const daysOverdue = Math.max(0, Math.round((actualDay.getTime() - scheduledDay.getTime()) / (1000 * 3600 * 24)));
    const lateReturnPenalty = daysOverdue * (settings?.dendaPerHari || 200000);

    // Driver Overtime Penalty (only if a driver is assigned and return exceeds scheduled time)
    // Partial-hour handling rule: Any late return time is rounded up to the nearest hour.
    // e.g., 30 minutes late rounds up to 1 hour.
    let driverOvertimePenalty = 0;
    if (bk.driverId) {
      const scheduledDateTime = new Date(bk.tanggalSelesai.replace('T', ' '));
      const actualDateTime = new Date(`${retDate} ${retTime}`);
      if (actualDateTime.getTime() > scheduledDateTime.getTime()) {
        const timeDiffMs = actualDateTime.getTime() - scheduledDateTime.getTime();
        const hoursOverdue = Math.max(0, Math.ceil(timeDiffMs / (1000 * 3600)));
        const driver = allDrivers.find(d => d.id === bk.driverId);
        const driverLemburPerJam = driver?.tarifLemburPerJam || 20000;
        driverOvertimePenalty = hoursOverdue * driverLemburPerJam;
      }
    }

    // Damage penalty (uncoupled from repair costs)
    const damagePenalty = checkinIsDamaged ? checkinDamagePenalty : 0;

    // Total penalty
    const totalPenalty = lateReturnPenalty + driverOvertimePenalty + damagePenalty;
    const finalTotal = (bk.totalSewa || bk.totalBayar || 0) + totalPenalty;
    const remainingBalance = Math.max(0, finalTotal - bk.jumlahBayar);
    const isFullyPaid = remainingBalance <= 0;

    // 3. Update Booking
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          denda: totalPenalty,
          statusDenda: totalPenalty > 0 ? (isFullyPaid ? ('Sudah Dibayar' as const) : ('Belum Dibayar' as const)) : ('none' as const),
          totalSewa: b.totalSewa || b.totalBayar || 0,
          totalAkhir: finalTotal,
          sisaPelunasan: remainingBalance,
          status: remainingBalance > 0 ? ('Menunggu Pelunasan Denda' as const) : ('Selesai' as const),
          statusPembayaran: isFullyPaid ? ('Lunas' as const) : ('Menunggu Pelunasan Denda' as const),
          tanggalKembali: retDate,
          jamKembali: retTime,
          catatanKerusakan: checkinIsDamaged ? `${checkinBody} (Denda Kerusakan: Rp ${checkinDamagePenalty.toLocaleString('id-ID')})` : notes || checkinBody,
          statusJaminan: guaranteeReturned ? ('Dikembalikan' as const) : ('Ditahan' as const)
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // 4. Update Invoice (in-place modification)
    const updatedInvoices = invoices.map(inv => {
      if (inv.bookingId === bookingId) {
        return {
          ...inv,
          denda: totalPenalty,
          total: finalTotal,
          totalAkhir: finalTotal,
          sisa: remainingBalance,
          status: isFullyPaid ? ('lunas' as const) : inv.status
        };
      }
      return inv;
    });
    onUpdateInvoices(updatedInvoices);

    // 5. Update Car status (direct to maintenance if damaged, else available)
    if (bk.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === bk.mobilId) {
          return {
            ...c,
            status: checkinIsDamaged ? ('maintenance' as const) : ('tersedia' as const)
          };
        }
        return c;
      });
      onUpdateCars(updatedCars);
    }

    // 6. Release Driver status to active
    if (bk.driverId) {
      const updatedDrivers = allDrivers.map(dr => {
        if (dr.id === bk.driverId) return { ...dr, status: 'aktif' as const };
        return dr;
      });
      onUpdateDrivers(updatedDrivers);
    }

    // 7. Auto-create Maintenance Record if damaged
    if (checkinIsDamaged && bk.mobilId) {
      const newMaint: MaintenanceRecord = {
        id: `maint_${Date.now()}`,
        mobilId: bk.mobilId,
        mobilNama: bk.mobilNama || 'Armada',
        kerusakan: checkinBody || 'Kerusakan diidentifikasi saat pengembalian',
        deskripsi: notes || checkinBody || 'Tidak ada deskripsi tambahan',
        tanggalPengajuan: new Date().toISOString().split('T')[0],
        estimasiSelesai: new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0],
        status: 'Menunggu Persetujuan Owner',
        biaya: 0, // Repair cost is uncoupled and initialized to 0
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        tanggalKembaliActual: `${retDate} ${retTime}`,
        catatanKembali: notes || checkinBody
      };
      onUpdateMaintenanceList([newMaint, ...maintenanceList]);
    }

    // 8. Sync handoverDetails
    syncLegacyData(bookingId, bk.jenisJaminan || '', guaranteeReturned ? 'dikembalikan' : 'diverifikasi', 0, {
      kmAkhir: checkinKm,
      bodyAkhir: checkinBody,
      bbmAkhir: checkinBbm,
      tanggalKembaliActual: `${retDate} ${retTime}`,
      dendaCalculated: totalPenalty
    });

    onAddNotification(
      'Pengembalian Kendaraan Dikonfirmasi',
      `Unit ${bk.mobilNama} telah dikembalikan. Denda: Rp ${totalPenalty.toLocaleString('id-ID')}. ${isFullyPaid ? 'Tagihan lunas.' : 'Menunggu Pelunasan Denda.'}`,
      isFullyPaid ? 'success' : 'warning'
    );

    setSelectedReturnBookingId('');
    setActualReturnNotes('');
  };

  // 3. Kembalikan Jaminan
  const handleReturnGuarantee = (bookingId: string) => {
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk) return;

    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Selesai' as const,
          statusPembayaran: 'Lunas' as const,
          statusJaminan: 'Dikembalikan' as const
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    if (bk.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === bk.mobilId) return { ...c, status: 'tersedia' as const };
        return c;
      });
      onUpdateCars(updatedCars);
    }

    if (bk.driverId) {
      const updatedDrivers = allDrivers.map(dr => {
        if (dr.id === bk.driverId) return { ...dr, status: 'aktif' as const };
        return dr;
      });
      onUpdateDrivers(updatedDrivers);
    }

    syncLegacyData(bookingId, bk.jenisJaminan || '', 'dikembalikan', 0, null);

    onAddNotification(
      'Jaminan Dikembalikan',
      `Jaminan untuk booking ${bk.bookingCode} telah dikembalikan. Status rental Selesai, mobil kembali Tersedia.`,
      'success'
    );
  };

  const handleInputKerusakan = (bookingId: string, deskripsiKerusakan: string, estimasiSelesaiDate: string) => {
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk || !bk.mobilId) return alert('Data booking/mobil tidak ditemukan!');

    // Update car status to maintenance
    const updatedCars = allCars.map(c => {
      if (c.id === bk.mobilId) {
        return { ...c, status: 'maintenance' as const };
      }
      return c;
    });
    onUpdateCars(updatedCars);

    // Add record to maintenanceList
    const newMaint: MaintenanceRecord = {
      id: `maint_${Date.now()}`,
      mobilId: bk.mobilId,
      mobilNama: bk.mobilNama || 'Armada',
      
      kerusakan: deskripsiKerusakan,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      estimasiSelesai: estimasiSelesaiDate || new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0],
      status: 'Menunggu Perbaikan'
    };
    onUpdateMaintenanceList([newMaint, ...maintenanceList]);

    onAddNotification(
      'Kerusakan Unit Diinput',
      `Mobil ${bk.mobilNama} dialihkan ke status maintenance untuk perbaikan.`,
      'warning'
    );
  };

  const handleUpdateMaintenanceStatus = (recordId: string, newStatus: 'Menunggu Perbaikan' | 'Sedang Diperbaiki' | 'Selesai') => {
    const record = maintenanceList.find(r => r.id === recordId);
    if (!record) return;

    const updatedList = maintenanceList.map(r => r.id === recordId ? { ...r, status: newStatus as any } : r);
    onUpdateMaintenanceList(updatedList);

    if (newStatus === 'Selesai') {
      const updatedCars = allCars.map(c => c.id === record.mobilId ? { ...c, status: 'tersedia' as const } : c);
      onUpdateCars(updatedCars);
      onAddNotification('Unit Ready', `Armada ${record.mobilNama} telah selesai maintenance & kembali Tersedia!`, 'success');
    } else {
      onAddNotification('Status Maintenance', `Status unit ${record.mobilNama} diperbarui menjadi ${newStatus}.`, 'info');
    }
  };

  const handleCreateMaintenanceManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintCarId || !maintKerusakan) return alert('Pilih mobil & isi deskripsi perbaikan!');

    const targetCar = allCars.find(c => c.id === maintCarId);
    if (!targetCar) return;

    // Update car status to maintenance
    const updatedCars = allCars.map(c => c.id === maintCarId ? { ...c, status: 'maintenance' as const } : c);
    onUpdateCars(updatedCars);

    const newMaint: MaintenanceRecord = {
      id: `maint_${Date.now()}`,
      mobilId: maintCarId,
      mobilNama: targetCar.nama,
      
      kerusakan: maintKerusakan,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      estimasiSelesai: maintEstimasi || new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0],
      status: 'Menunggu Persetujuan Owner'
    };

    onUpdateMaintenanceList([newMaint, ...maintenanceList]);
    setMaintCarId('');
    setMaintKerusakan('');
    setMaintEstimasi('');

    onAddNotification('Maintenance Ditambahkan', `Unit ${targetCar.nama} dimasukkan ke daftar perbaikan.`, 'warning');
  };

  // Review moderation handler
  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus review ini dari sistem?')) {
      onUpdateReviews(reviews.filter(r => r.id !== reviewId));
      onAddNotification('Ulasan Dihapus', 'Review customer berhasil dihapus dari moderasi.', 'info');
    }
  };

  // Customer profile actions
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return alert('Lengkapi Nama & Email!');

    if (editingCustomer) {
      const updated = allUsers.map(u => {
        if (u.id === editingCustomer.id) {
          return {
            ...u,
            name: custName,
            email: custEmail,
            phone: custPhone,
            nik: custNik,
            sim: custSim,
            address: custAddress
          };
        }
        return u;
      });
      onUpdateUsers(updated);
      setEditingCustomer(null);
      onAddNotification('Profil Customer Disimpan', `Customer ${custName} berhasil diperbarui.`, 'success');
    } else {
      const newCust: User = {
        id: `user_${Date.now()}`,
        name: custName,
        email: custEmail,
        phone: custPhone,
        role: 'customer',
        nik: custNik,
        sim: custSim,
        address: custAddress,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
      };
      onUpdateUsers([...allUsers, newCust]);
      onAddNotification('Customer Ditambahkan', `Customer baru ${custName} berhasil didaftarkan.`, 'success');
    }

    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setCustNik('');
    setCustSim('');
    setCustAddress('');
  };

  // Notification Broadcast action
  const handleBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return alert('Lengkapi judul & pesan!');

    // Add broadcast notification to matching users
    if (broadcastTarget === 'all') {
      onAddNotification(broadcastTitle, broadcastMessage, broadcastType);
      onAddNotification('Notifikasi Dikirim', 'Pengumuman berhasil disiarkan ke semua pengguna!', 'success');
    } else {
      const targetUser = allUsers.find(u => u.id === broadcastTarget);
      if (targetUser) {
        onAddNotification(broadcastTitle, `[Pesan Khusus] ${broadcastMessage}`, broadcastType);
        onAddNotification('Notifikasi Dikirim', `Notifikasi pribadi dikirim ke ${targetUser.name}`, 'success');
      }
    }

    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInCustomerName || !walkInCustomerPhone) {
      onAddNotification('Data Tidak Lengkap', 'Nama dan No. Telepon wajib diisi.', 'warning');
      return;
    }
    if ((walkInLayanan === 'rental' || walkInLayanan === 'rental_driver') && !walkInMobilId) {
      onAddNotification('Data Tidak Lengkap', 'Mobil wajib dipilih untuk layanan rental.', 'warning');
      return;
    }
    if ((walkInLayanan === 'driver' || walkInLayanan === 'rental_driver') && !walkInDriverId) {
      onAddNotification('Data Tidak Lengkap', 'Supir wajib dipilih.', 'warning');
      return;
    }
    if (!walkInStartDate || !walkInEndDate) {
      onAddNotification('Data Tidak Lengkap', 'Tanggal sewa wajib diisi.', 'warning');
      return;
    }

    const mobil = allCars.find(c => c.id === walkInMobilId);
    const driver = allDrivers.find(d => d.id === walkInDriverId);

    // Hitung Biaya
    const start = new Date(walkInStartDate);
    const end = new Date(walkInEndDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    
    let totalMobil = 0;
    let totalDriver = 0;

    if (mobil) {
      const isPaket12h = walkInPaket === '12h';
      totalMobil = isPaket12h ? mobil.hargaSewa * 0.6 : mobil.hargaSewa * days;
    }
    if (driver) {
      totalDriver = driver.tarif * days;
    }
    
    const totalBayar = totalMobil + totalDriver;
  
      let jumlahBayarAwal = totalBayar;
      let statusPemb = 'Lunas';
      
      if (walkInJenisPembayaran === 'dp') {
        const safeDpPctAdmin = (typeof settings.dpPercentage === 'number' && !isNaN(settings.dpPercentage) && settings.dpPercentage > 0) ? settings.dpPercentage : 30;
        jumlahBayarAwal = walkInDPNominal > 0 ? walkInDPNominal : totalBayar * (safeDpPctAdmin / 100);
        statusPemb = 'DP Dibayar';
      }
  
      // Buat User Guest (Walk-in)
    const guestUserId = `USR-W-${Date.now()}`;
    const newGuestUser: User = {
      id: guestUserId,
      name: walkInCustomerName,
      email: `${walkInCustomerPhone}@walkin.autorent.com`,
      phone: walkInCustomerPhone,
      role: 'customer',
      status: 'terverifikasi',
      joinDate: new Date().toISOString().split('T')[0],
      isWalkIn: true
    };

    onUpdateUsers([...allUsers, newGuestUser]);

    // Buat Booking
    const newBookingId = `BK-${Date.now()}`;
    const newBooking: Booking = {
      id: newBookingId,
      bookingCode: `WA-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: guestUserId,
      userNama: walkInCustomerName,
      userPhone: walkInCustomerPhone,
      mobilId: mobil?.id,
      mobilNama: mobil ? `${mobil.brand} ${mobil.nama}` : undefined,
      driverId: driver?.id,
      driverNama: driver?.nama,
      layanan: walkInLayanan,
      paketSewa: walkInPaket,
      tanggalMulai: walkInStartDate,
      tanggalSelesai: walkInEndDate,
      totalBayar: totalBayar,
      jumlahBayar: jumlahBayarAwal,
        statusPembayaran: statusPemb as any,
        status: 'Menunggu Pengambilan',
      tanggalBooking: new Date().toISOString(),
      metodePembayaran: walkInMetodeBayar,
      tipeBooking: 'walk_in'
    };

    onUpdateBookings([...bookings, newBooking]);

    // Note: Mobil/Driver status is NOT automatically set to 'disewa' yet, because they need to go through Serah Terima (Handover) first just like Booking Online.

    // Buat Invoice langsung lunas
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      bookingId: newBooking.id,
      bookingCode: newBooking.bookingCode,
      tanggal: new Date().toISOString().split('T')[0],
      total: totalBayar,
        status: statusPemb as any,
        keterangan: `Pembayaran ${walkInJenisPembayaran === 'dp' ? 'DP' : 'Lunas'} ${walkInMetodeBayar} (Walk-in)`,
        subtotal: totalBayar,
        denda: 0
    };
    onUpdateInvoices([...invoices, newInvoice]);

    // Buat History Pembayaran
    const newPayment: Pembayaran = {
      id: `PAY-${Date.now()}`,
      bookingId: newBooking.id,
      bookingCode: newBooking.bookingCode,
      userId: guestUserId,
      userNama: walkInCustomerName,
      jumlah: jumlahBayarAwal,
        metode: walkInMetodeBayar,
        status: 'disetujui',
        tanggalBayar: new Date().toISOString().split('T')[0],
        tipeBayar: walkInJenisPembayaran === 'dp' ? 'dp' : 'pelunasan'
    };
    onUpdatePayments([...payments, newPayment]);

    onAddNotification('Booking Walk-In Berhasil', `Booking ${newBooking.bookingCode} telah dibuat. Status: ${statusPemb}. Invoice otomatis terbuat.`, 'success');
    
    // Reset form
    setShowWalkInModal(false);
    setWalkInCustomerName('');
    setWalkInCustomerPhone('');
    setWalkInMobilId('');
    setWalkInDriverId('');
    setWalkInStartDate('');
    setWalkInEndDate('');
  };

  // Statistics calculation
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const activeReservationsCount = allCars.filter(c => c.status === 'disewa').length;
  
  // Analitik & Statistik (Dashboard Overview)
  const gatewayPayments = payments.filter(p => p.metode === 'Payment Gateway' || p.metode === 'midtrans' || p.metode === 'ShopeePay' || p.metode === 'Gopay');

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending_dp': return 'Menunggu DP';
      case 'pending_konfirmasi': return 'Menunggu Verifikasi';
      case 'aktif': return 'Dalam Sewa';
      case 'selesai': return 'Selesai';
      case 'dibatalkan': return 'Dibatalkan';
      case 'Menunggu Pengambilan': return 'Menunggu Pengambilan';
      case 'Sewa Aktif': return 'Dalam Sewa';
      case 'Dalam Sewa': return 'Dalam Sewa';
      case 'Menunggu Pelunasan Denda': return 'Menunggu Pelunasan Denda';
      case 'Selesai': return 'Selesai';
        case 'Terlambat': return 'Terlambat';
      default: return status.replace('_', ' ');
    }
  };

  // 1. FILTERING LOGIC
  const filterDate = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    
    if (periodeFilter === 'Hari Ini') {
      return d.toDateString() === today.toDateString();
    }
    if (periodeFilter === 'Minggu Ini') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return d >= firstDay && d <= lastDay;
    }
    if (periodeFilter === 'Bulan Ini') {
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    if (periodeFilter === 'Tahun Ini') {
      return d.getFullYear() === today.getFullYear();
    }
    if (periodeFilter === 'Custom' && customStartDate && customEndDate) {
      return d >= new Date(customStartDate) && d <= new Date(customEndDate);
    }
    return true; // fallback
  };

  // 2. DATA PROCESSING (Filtered by Date)
  const filteredBookingsDashboard = bookings.filter(b => filterDate(b.tanggalBooking) || filterDate(b.tanggalMulai));
  const filteredPaymentsDashboard = payments.filter(p => p.status === 'disetujui' && filterDate(p.tanggalBayar));

  // Analytics for Charts (Filtered)
  let rentalRev = 0;
  let driverRev = 0;
  let onlineBookings = 0;
  let walkInBookings = 0;
  let mobilBookingsCount = 0;
  let driverBookingsCount = 0;

  filteredBookingsDashboard.forEach(b => {
    if (b.status.toLowerCase() !== 'dibatalkan') {
      // Revenue
      if (b.layanan === 'rental') {
        rentalRev += b.jumlahBayar || b.totalBayar;
      } else if (b.layanan === 'rental_driver') {
        rentalRev += Math.round((b.jumlahBayar || b.totalBayar) * 0.8);
        driverRev += Math.round((b.jumlahBayar || b.totalBayar) * 0.2);
      } else if (b.layanan === 'driver') {
        driverRev += b.jumlahBayar || b.totalBayar;
      }

      // Booking types
      if (b.tipeBooking === 'walk_in') {
        walkInBookings++;
      } else {
        onlineBookings++;
      }

      // Layanan counts
      if (b.layanan.includes('rental')) mobilBookingsCount++;
      if (b.layanan.includes('driver')) driverBookingsCount++;
    }
  });

  const totalSegmentedRev = rentalRev + driverRev || 1;
  const rentPct = Math.round((rentalRev / totalSegmentedRev) * 100);
  const driverPct = 100 - rentPct;

  const totalBookingsCount = onlineBookings + walkInBookings || 1;
  const onlinePct = Math.round((onlineBookings / totalBookingsCount) * 100);
  const walkInPct = 100 - onlinePct;

  const totalLayananCount = mobilBookingsCount + driverBookingsCount || 1;
  const mobilCountPct = Math.round((mobilBookingsCount / totalLayananCount) * 100);
  const driverCountPct = 100 - mobilCountPct;

  // Normalize status comparison using getCarStatus helper (Single Source of Truth)
  const isCarTersedia = (c: Mobil) => getCarStatus(c, bookings) === 'Tersedia';
  const isCarDisewa = (c: Mobil) => getCarStatus(c, bookings) === 'Disewa';
  const isCarMaintenance = (c: Mobil) => getCarStatus(c, bookings) === 'Maintenance';
  
  const armadaTersedia = allCars.filter(isCarTersedia).length;
  const armadaDisewa = allCars.filter(isCarDisewa).length;
  const armadaMaintenance = allCars.filter(isCarMaintenance).length;
  const totalArmada = allCars.length || 1;

  return (
    <div className="space-y-4" id="admin-dashboard-container">
      
      {/* 👑 Header Dashboard SaaS */}
      <div className="bg-white rounded-t-2xl border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Dashboard Admin</h2>
          <p className="text-slate-500 text-xs mt-0.5">Ringkasan operasional rental mobil</p>
        </div>
        
        {/* Search Bar Center */}
        <div className="flex-1 max-w-md mx-auto hidden md:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-xs transition-all"
            placeholder="Cari transaksi, mobil, driver..."
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 leading-none">Rian</p>
              <p className="text-[10px] font-semibold text-blue-600 mt-1">Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-blue-50">
              R
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 TABS CONDITIONALS */}

      {/* 1. TAB OVERVIEW (DASHBOARD) */}
      {activeTab === 'dashboard' && (
        <div className="p-6 space-y-6">
          
          {/* Top Statistics Grid (5 cards) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">

            

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Booking</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{totalBookingsCount}</h4>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span>↑</span> 12% dari bulan lalu
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Mobil Aktif</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{armadaDisewa}</h4>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Car className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                Sedang berjalan hari ini
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Transaksi Harian</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{bookings.filter(b => b.tanggalMulai && b.tanggalMulai.split('T')[0] === new Date().toISOString().split('T')[0]).length || 0}</h4>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                Pesanan masuk hari ini
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Belum Lunas</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{bookings.filter(b => b.statusPembayaran !== 'Lunas').length}</h4>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <DollarSign className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                Menunggu pembayaran
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Maintenance</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-1">{armadaMaintenance}</h4>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                Armada di bengkel
              </p>
            </div>
          </div>

          {/* Main Content Section (Row 2) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Booking Terbaru Table (Left - 2 cols) */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-sm text-slate-800">Booking Terbaru</h3>
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Lihat Semua →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase tracking-wider bg-white">
                      <th className="py-3 px-5">No Booking</th>
                      <th className="py-3 px-5">Customer</th>
                      <th className="py-3 px-5">Mobil</th>
                      <th className="py-3 px-5">Tanggal Rental</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {bookings.slice(0, 5).map(bk => {
                      const car = allCars.find(c => c.id === bk.mobilId);
                      return (
                        <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-5 font-bold text-slate-700">{bk.bookingCode}</td>
                          <td className="py-3 px-5">{bk.userNama}</td>
                          <td className="py-3 px-5">{car?.nama || 'Unknown'}</td>
                          <td className="py-3 px-5">{bk.tanggalMulai ? bk.tanggalMulai.split('T')[0] : '-'}</td>
                          <td className="py-3 px-5">{renderStatusRentalBadge(getStatusRentalText(bk.status))}</td>
                          <td className="py-3 px-5 text-center">
                            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors">Detail</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Revenue Bar Chart (Right - 1 col) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm text-slate-800">Pendapatan Bulanan</h3>
                <select className="text-[10px] border-none bg-slate-100 rounded-lg px-2 py-1 font-bold text-slate-600 outline-none cursor-pointer">
                  <option>Tahun 2026</option>
                  <option>Tahun 2025</option>
                </select>
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto pb-2 relative">
                <div className="absolute top-0 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-1/4 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-2/4 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                <div className="absolute top-3/4 left-0 right-0 border-t border-slate-100 border-dashed"></div>
                
                {/* Dummy Bars */}
                {[40, 60, 45, 80, 50, 95].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 z-10 group">
                    <div className="w-full bg-slate-100 rounded-t-sm h-full flex items-end justify-center relative rounded-b-md overflow-hidden">
                      <div className="w-full bg-blue-600 rounded-t-sm rounded-b-md transition-all duration-500 group-hover:bg-blue-500" style={{ height: `${h}%` }}></div>
                      <div className="absolute -top-8 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h}M
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Middle Section (Row 3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Vehicle Status Doughnut Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-sm text-slate-800 mb-6">Status Kendaraan</h3>
              
              <div className="flex items-center justify-center py-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                    
                    {/* Disewa (Blue) */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray={`${(armadaDisewa/totalArmada)*100} 100`} strokeDashoffset="0" />
                    
                    {/* Tersedia (Emerald) */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="4" strokeDasharray={`${(armadaTersedia/totalArmada)*100} 100`} strokeDashoffset={`-${(armadaDisewa/totalArmada)*100}`} />
                    
                    {/* Maintenance (Amber) */}
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-400" strokeWidth="4" strokeDasharray={`${(armadaMaintenance/totalArmada)*100} 100`} strokeDashoffset={`-${((armadaDisewa+armadaTersedia)/totalArmada)*100}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{totalArmada}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Tersedia</span>
                  <span className="text-xs font-bold text-slate-800">{armadaTersedia}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Disewa</span>
                  <span className="text-xs font-bold text-slate-800">{armadaDisewa}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <span className="text-xs text-slate-600 font-medium flex-1">Bengkel</span>
                  <span className="text-xs font-bold text-slate-800">{armadaMaintenance}</span>
                </div>
              </div>
            </div>

            {/* Driver Schedule Today */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-800">Jadwal Driver Hari Ini</h3>
                <button className="text-xs text-blue-600 font-semibold hover:underline">Semua Jadwal</button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {allDrivers.slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-blue-100 transition-colors bg-slate-50/30">
                    <img src={d.foto} alt={d.nama} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{d.nama}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{d.status === 'booking' ? 'Bertugas' : 'Standby'}</p>
                    </div>
                    <div className="text-right">
                      {d.status === 'booking' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">Bertugas</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">Tersedia</span>
                      )}
                      <p className="text-[9px] text-slate-400 font-medium mt-1">08:00 - 17:00</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notifications Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
              <h3 className="font-bold text-sm text-slate-800 mb-6">Aktivitas Terbaru</h3>
              
              <div className="flex-1 relative border-l-2 border-slate-100 ml-3 space-y-6">
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Booking Baru Dibuat</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Andi Susanto memesan Toyota Avanza</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">10 menit yang lalu</span>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Pembayaran Diterima</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pembayaran pelunasan Rp 350.000 (QRIS)</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">45 menit yang lalu</span>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Reminder Maintenance</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Waktunya ganti oli rutin untuk Brio.</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">2 jam yang lalu</span>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-800">Sistem Login</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Admin Rian login ke dalam sistem.</p>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 block">5 jam yang lalu</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Bottom Section (Row 4): Upcoming Bookings */}
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Prediksi Rental 7 Hari Kedepan
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const isToday = offset === 0;
                // Dummy logic for forecast:
                const forecastCount = Math.floor(Math.random() * 8) + 2; 
                
                return (
                  <div key={offset} className={`p-4 rounded-xl border ${isToday ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-200 transition-colors'} text-center flex flex-col items-center justify-center gap-2`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                      {isToday ? 'Hari Ini' : d.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-black text-slate-800">{d.getDate()}</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {forecastCount} Booking
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}


      {activeTab === 'cars-bookings' && (
        <div className="space-y-4" id="all-bookings-panel">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Transaksi Reservasi Rental Mobil ({bookings.filter(b => b.layanan === 'rental' || b.layanan === 'rental_driver').length})</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Kelola konfirmasi rental mobil, audit manual pembayaran offline, pembatalan sepihak, dan cetak invoice resmi.</p>
              <button
                onClick={() => setShowWalkInModal(true)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm border-0 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Buat Booking Manual (Walk-in)
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari kode atau customer..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs w-48 bg-white focus:outline-none focus:border-blue-500"
              />
              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Status Rental</option>
                <option value="pending_dp">Menunggu Pembayaran</option>
                <option value="pending_konfirmasi">Menunggu Verifikasi</option>
                <option value="aktif">Dalam Sewa</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>

              <select
                value={bookingFilterPaymentStatus}
                onChange={(e) => setBookingFilterPaymentStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Status Bayar</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="DP Dibayar">DP Dibayar</option>
                <option value="Lunas">Lunas</option>
                <option value="Menunggu Pelunasan Denda">Menunggu Pelunasan Denda</option>
                <option value="Selesai">Lunas &amp; Selesai</option>
              </select>

              <select
                value={bookingFilterArmada}
                onChange={(e) => setBookingFilterArmada(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Armada</option>
                {allCars.map(c => (
                  <option key={c.id} value={c.id}>{c.nama} ({c.platNomor})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3 px-3">Kode Booking</th>
                  <th className="py-3 px-3">Nama Customer</th>
                  <th className="py-3 px-3">Armada</th>
                  <th className="py-3 px-3">Tanggal Mulai</th>
                  <th className="py-3 px-3">Tanggal Selesai</th>
                  <th className="py-3 px-3 text-right">Total Tagihan</th>
                  <th className="py-3 px-3 text-right">Sudah Dibayar</th>
                  <th className="py-3 px-3">Status Pembayaran</th>
                  <th className="py-3 px-3">Status Rental</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
<tbody className="divide-y divide-slate-100 text-slate-600 text-[10.5px] font-medium">
                {bookings
                  .filter(bk => (bk.layanan === 'rental' || bk.layanan === 'rental_driver'))
                  .filter(bk => {
                    const matchSearch = bk.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) || bk.userNama.toLowerCase().includes(bookingSearch.toLowerCase());
                    const s = bk.status.toLowerCase();
                    const matchStatus = bookingFilterStatus === 'all' || 
                      bk.status === bookingFilterStatus ||
                      (bookingFilterStatus === 'aktif' && (s === 'aktif' || s === 'sewa aktif' || s === 'dalam sewa' || s === 'sedang_berjalan')) ||
                      (bookingFilterStatus === 'selesai' && s === 'selesai') ||
                      (bookingFilterStatus === 'dibatalkan' && (s === 'dibatalkan' || s === 'ditolak')) ||
                      (bookingFilterStatus === 'pending_konfirmasi' && (s === 'pending_konfirmasi' || s === 'menunggu verifikasi admin')) ||
                      (bookingFilterStatus === 'pending_dp' && (s === 'pending_dp' || s === 'menunggu pembayaran'));
                    
                    const calculatedPaymentStatus = getStatusPembayaranText(bk);
                    const matchPayment = bookingFilterPaymentStatus === 'all' || calculatedPaymentStatus === bookingFilterPaymentStatus;
                    
                    const matchArmada = bookingFilterArmada === 'all' || bk.mobilId === bookingFilterArmada;
                    
                    return matchSearch && matchStatus && matchPayment && matchArmada;
                  })
                  .map(bk => {
                    const startParts = splitDateTime(bk.tanggalMulai);
                    const endParts = splitDateTime(bk.tanggalSelesai);
                    
                    return (
                      <tr key={bk.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{bk.bookingCode}</span>
                          {(() => {
                            const inv = invoices.find(i => i.bookingId === bk.id || i.bookingCode === bk.bookingCode);
                            return inv ? (
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="mt-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-mono bg-transparent border-0 cursor-pointer p-0 text-left block"
                              >
                                {inv.invoiceCode}
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic block mt-1">Belum ada invoice</span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{bk.userNama}</td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-700 block">{bk.mobilNama || '-'}</strong>
                          {bk.driverNama && <span className="block text-[9px] text-slate-400">Driver: {bk.driverNama}</span>}
                          <span className="text-[9px] text-slate-400 font-mono">({bk.layanan === 'rental_driver' ? 'Mobil + Driver' : 'Lepas Kunci'})</span>
                        </td>
                        <td className="py-3 px-3 font-mono">{startParts.date}</td>
                        <td className="py-3 px-3 font-mono">{endParts.date}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">Rp {bk.totalBayar.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-650">Rp {bk.jumlahBayar.toLocaleString('id-ID')}</td>
                        
                        <td className="py-3 px-3">
                          {renderStatusPembayaranBadge(getStatusPembayaranText(bk))}
                        </td>
                        
                        <td className="py-3 px-3">
                          {renderStatusRentalBadge(getStatusRentalText(bk.status))}
                        </td>
                        
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 justify-center">
                            <button
                              onClick={() => {
                                setSelectedBookingForDetail(bk);
                                setIsProcessingPelunasan(false);
                              }}
                              className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Detail
                            </button>
                            {bk.status === 'pending_konfirmasi' && (
                              <button
                                onClick={() => {
                                  const updated = bookings.map(b => b.id === bk.id ? { ...b, status: 'aktif' as const } : b);
                                  onUpdateBookings(updated);
                                  onAddNotification('Konfirmasi Rental Mobil', `Booking ${bk.bookingCode} berhasil disetujui!`, 'success');
                                }}
                                className="text-[10px] text-blue-650 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                              >
                                Konfirmasi Booking
                              </button>
                            )}
                            {(bk.status === 'pending_dp' || bk.status === 'pending_konfirmasi' || bk.status === 'aktif' || getStatusRentalText(bk.status) === 'Menunggu Pengambilan') && (
                              <button
                                onClick={() => {
                                  if (!window.confirm(`Batalkan booking ${bk.bookingCode}?`)) return;
                                  const updated = bookings.map(b => b.id === bk.id ? { ...b, status: 'dibatalkan' as const } : b);
                                  onUpdateBookings(updated);

                                  if (bk.mobilId) {
                                    const updatedCars = allCars.map(c => c.id === bk.mobilId ? { ...c, status: 'tersedia' as const } : c);
                                    onUpdateCars(updatedCars);
                                  }
                                  if (bk.driverId) {
                                    const updatedDrivers = allDrivers.map(d => d.id === bk.driverId ? { ...d, status: 'aktif' as const } : d);
                                    onUpdateDrivers(updatedDrivers);
                                  }
                                  onAddNotification('Booking Dibatalkan Admin', `Booking ${bk.bookingCode} telah dibatalkan oleh Admin.`, 'warning');
                                }}
                                className="text-[10px] text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                              >
                                Batalkan
                              </button>
                            )}
                            {(bk.status === 'aktif' || bk.status === 'Sewa Aktif' || bk.status === 'Dalam Sewa' || getStatusRentalText(bk.status) === 'Dalam Sewa') && (
                              <button
                                onClick={() => handleCompleteBooking(bk)}
                                className="text-[10px] text-emerald-650 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                              >
                                Selesai
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const inv = invoices.find(i => i.bookingId === bk.id);
                                if (inv) {
                                  setSelectedInvoice(inv);
                                } else {
                                  alert('Invoice tidak ditemukan untuk booking ini.');
                                }
                              }}
                              className="text-[10px] text-slate-600 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {bookings.filter(b => (b.layanan === 'rental' || b.layanan === 'rental_driver')).length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">Tidak ada booking rental mobil yang ditemukan.</div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB MOBIL (DATA MOBIL - KATALOG) */}
      {activeTab === 'cars-data' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="manage-cars-audit">
          {/* Form */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm self-start">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" /> {editingCar ? 'Ubah Informasi Mobil' : 'Tambah Mobil Baru'}
            </h3>
            
            <form onSubmit={handleSaveCar} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Model / Nama Mobil</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Innova Zenix"
                  value={carNama}
                  onChange={(e) => setCarNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Merek (Brand)</label>
                <input
                  type="text"
                  required
                  placeholder="Toyota, Honda, Wuling"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Plat Nomor</label>
                  <input
                    type="text"
                    required
                    placeholder="D 1234 ABC"
                    value={carPlat}
                    onChange={(e) => setCarPlat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Bahan Bakar</label>
                  <input
                    type="text"
                    value={carBensin}
                    onChange={(e) => setCarBensin(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kategori Tipe</label>
                  <select
                    value={carTipe}
                    onChange={(e) => setCarTipe(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="MPV">MPV</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Van">Van</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Transmisi</label>
                  <select
                    value={carTransmisi}
                    onChange={(e) => setCarTransmisi(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Matic">Matic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Status Armada</label>
                  <select
                    value={carStatus}
                    onChange={(e) => setCarStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="tersedia">Tersedia (Ready)</option>
                    <option value="disewa">Disewa (Active)</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tahun Pembuatan</label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={carTahun}
                    onChange={(e) => setCarTahun(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kapasitas Kursi</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={carKapasitas}
                    onChange={(e) => setCarKapasitas(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Sewa / Hari (Rp)</label>
                  <input
                    type="number"
                    required
                    value={carHargaSewa}
                    onChange={(e) => setCarHargaSewa(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Upload Foto Mobil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCarFoto(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[10px] bg-slate-50 cursor-pointer"
                />
                {carFoto && <img src={carFoto} alt="Preview Mobil" className="mt-2 w-20 h-20 object-cover rounded-md shadow-sm border border-slate-200" />}
              </div>

              <div className="flex items-center gap-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="car-aktif-checkbox"
                  checked={carAktif}
                  onChange={(e) => setCarAktif(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="car-aktif-checkbox" className="font-semibold text-slate-700 cursor-pointer select-none">
                  Aktif di Katalog Publik
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                {editingCar && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCar(null);
                      setCarNama('');
                      setCarBrand('');
                      setCarPlat('');
                      setCarHargaSewa(0);
                      setCarAktif(true);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-center cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center cursor-pointer"
                >
                  {editingCar ? 'Simpan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-xs">Daftar Inventaris Armada ({allCars.length} Unit)</h4>
              <input
                type="text"
                placeholder="Cari unit atau plat..."
                value={carSearch}
                onChange={(e) => setCarSearch(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-44 bg-white focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allCars
                .filter(car => car.nama.toLowerCase().includes(carSearch.toLowerCase()) || car.platNomor.toLowerCase().includes(carSearch.toLowerCase()))
                .map(car => {
                  const dynamicStatus = getCarStatus(car, bookings);
                  return (
                    <div key={car.id} className="bg-white border border-slate-100 rounded-xl p-4 flex gap-3 shadow-xs hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                        <img src={car.foto} alt={car.nama} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 text-xs block">{car.nama}</strong>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">{car.platNomor}</span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              dynamicStatus === 'Tersedia' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              dynamicStatus === 'Disewa' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {dynamicStatus}
                            </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          (car.aktif ?? true) ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-rose-50 text-rose-700 border border-rose-150'
                        }`}>
                          {(car.aktif ?? true) ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600">
                      Tipe: <strong>{car.tipe}</strong> | {car.kapasitas} Kursi | Tahun: <strong>{car.tahun || '-'}</strong>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                      <span className="font-bold text-blue-600">Rp {car.hargaSewa.toLocaleString('id-ID')}/hari</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStartEditCar(car);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="Ubah Mobil"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteCar(car.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Mobil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB KELOLA KARYAWAN */}
      {activeTab === 'employees' && (
        <div className="space-y-4" id="manage-employees-audit">
          
          <div className="flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setEmployeeTab('driver')}
              className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors cursor-pointer ${employeeTab === 'driver' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Staff Sopir
            </button>
            <button
              onClick={() => setEmployeeTab('admin')}
              className={`pb-3 px-2 font-bold text-sm border-b-2 transition-colors cursor-pointer ${employeeTab === 'admin' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Administrator
            </button>
          </div>

          {employeeTab === 'driver' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm self-start">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> {editingDriver ? 'Ubah Sopir' : 'Daftarkan Sopir Baru'}
                </h3>

                <form onSubmit={handleSaveDriver} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap Supir</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Slamet"
                      value={driverNama}
                      onChange={(e) => setDriverNama(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nomor Telepon WA</label>
                    <input
                      type="text"
                      required
                      placeholder="0812XXXXXXXX"
                      value={driverTelepon}
                      onChange={(e) => setDriverTelepon(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jl. Dago No. 12, Bandung"
                      value={driverAlamat}
                      onChange={(e) => setDriverAlamat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Tarif / Hari (Rp)</label>
                      <input
                        type="number"
                        required
                        value={driverTarif}
                        onChange={(e) => setDriverTarif(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Overtime / Jam (Rp)</label>
                      <input
                        type="number"
                        required
                        value={driverLembur}
                        onChange={(e) => setDriverLembur(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Pengalaman (Tahun)</label>
                      <input
                        type="number"
                        required
                        value={driverPengalaman}
                        onChange={(e) => setDriverPengalaman(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Upload Foto Supir</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDriverFoto(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[10px] bg-slate-50 cursor-pointer"
                    />
                    {driverFoto && <img src={driverFoto} alt="Preview Supir" className="mt-2 w-16 h-16 object-cover rounded-full shadow-sm border border-slate-200" />}
                  </div>

                  <div className="flex items-center gap-2 pt-1 pb-2">
                    <input
                      type="checkbox"
                      id="driver-aktif-checkbox"
                      checked={driverAktif}
                      onChange={(e) => setDriverAktif(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="driver-aktif-checkbox" className="font-semibold text-slate-700 cursor-pointer select-none">
                      Aktif di Katalog Publik
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingDriver && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDriver(null);
                          setDriverNama('');
                          setDriverTelepon('');
                          setDriverAktif(true);
                        }}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-center cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-center cursor-pointer"
                    >
                      {editingDriver ? 'Ubah Driver' : 'Daftarkan'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 text-xs">Pendaftaran Supir Aktif ({allDrivers.length} Orang)</h4>
                  <input
                    type="text"
                    placeholder="Cari supir..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-44 bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  {allDrivers
                    .filter(dri => dri.nama.toLowerCase().includes(driverSearch.toLowerCase()))
                    .map(dri => (
                    <div key={dri.id} className="bg-white border border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-xs text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                          <img src={dri.foto} alt={dri.nama} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <strong className="text-slate-800 block text-xs">{dri.nama}</strong>
                          <span className="text-[10px] text-slate-400">Pengalaman: {dri.pengalamanTahun} tahun • Telp: {dri.telepon} • Alamat: {dri.alamat || dri.lokasi || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="block font-bold text-blue-600">Rp {dri.tarifPerHari.toLocaleString('id-ID')}/hari</span>
                          <span className="text-[9px] text-slate-400">Lembur: Rp {dri.tarifLemburPerJam.toLocaleString('id-ID')}/jam</span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            (dri.aktif ?? true) ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-rose-50 text-rose-700 border border-rose-150'
                          }`}>
                            {(dri.aktif ?? true) ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStartEditDriver(dri);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            title="Ubah Driver"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteDriver(dri.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Hapus Driver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {employeeTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm self-start">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" /> {editingAdmin ? 'Ubah Administrator' : 'Daftarkan Admin Baru'}
                </h3>

                <form onSubmit={handleSaveAdmin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nama Lengkap Admin</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="admin@autorent.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nomor Telepon WA</label>
                    <input
                      type="text"
                      placeholder="0812XXXXXXXX"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Password {editingAdmin && <span className="text-xs font-normal text-slate-400">(Kosongkan jika tak diubah)</span>}</label>
                    <input
                      type="password"
                      required={!editingAdmin}
                      placeholder="Min. 6 karakter"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Status Akun</label>
                    <select
                      value={adminStatus}
                      onChange={(e) => setAdminStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="terverifikasi">Aktif (Terverifikasi)</option>
                      <option value="belum_verifikasi">Nonaktif</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAdmin(null);
                          setAdminName('');
                          setAdminEmail('');
                          setAdminPhone('');
                          setAdminPassword('');
                        }}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-center cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-center cursor-pointer"
                    >
                      {editingAdmin ? 'Simpan Perubahan' : 'Buat Akun'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 text-xs">Daftar Administrator ({allUsers.filter(u => u.role === 'admin').length} Orang)</h4>
                </div>

                <div className="space-y-3">
                  {allUsers
                    .filter(u => u.role === 'admin')
                    .map(adm => (
                    <div key={adm.id} className="bg-white border border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-xs text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 bg-emerald-50 shrink-0 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <strong className="text-slate-800 block text-xs">{adm.name}</strong>
                          <span className="text-[10px] text-slate-400">{adm.email} • Telp: {adm.phone || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            adm.status === 'terverifikasi' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-slate-50 text-slate-700 border border-slate-150'
                          }`}>
                            {adm.status === 'terverifikasi' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStartEditAdmin(adm);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            title="Ubah Admin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteAdmin(adm.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Hapus Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5B. TAB DRIVERS - BOOKING JASA DRIVER */}
      {activeTab === 'drivers-bookings' && (
        <div className="space-y-4" id="driver-bookings-panel">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Booking Jasa Driver ({bookings.filter(b => b.layanan === 'driver').length} Transaksi)</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Kelola penugasan driver, konfirmasi persewaan, status penugasan harian, dan penyelesaian tugas.</p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-100 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-4">Kode Booking</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Driver Bertugas</th>
                  <th className="py-3.5 px-4">Masa Tugas / Tanggal</th>
                  <th className="py-3.5 px-4 text-right">Total Tarif</th>
                  <th className="py-3.5 px-4">Status Bayar</th>
                  <th className="py-3.5 px-4">Status Tugas</th>
                  <th className="py-3.5 px-4 text-center">Operasional Penugasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-[11px] font-medium">
                {bookings
                  .filter(bk => bk.layanan === 'driver')
                  .map(bk => (
                    <tr key={bk.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{bk.bookingCode}</span>
                        {(() => {
                          const inv = invoices.find(i => i.bookingId === bk.id || i.bookingCode === bk.bookingCode);
                          return inv ? (
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="mt-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-mono bg-transparent border-0 cursor-pointer p-0 text-left block"
                            >
                              {inv.invoiceCode}
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic block mt-1">Belum ada invoice</span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{bk.userNama}</td>
                      <td className="py-3 px-4">
                        {bk.driverNama ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <strong className="text-slate-800">{bk.driverNama}</strong>
                          </div>
                        ) : (
                          <span className="text-red-500 font-bold">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="block font-semibold text-slate-700">{bk.durasiHari} Hari Sewa</span>
                        <span className="text-[10px] text-slate-400 font-mono">{bk.tanggalMulai} s/d {bk.tanggalSelesai}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">Rp {bk.totalBayar.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          bk.jumlahBayar >= bk.totalBayar ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          bk.jumlahBayar > 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {bk.jumlahBayar >= bk.totalBayar ? 'Lunas' : bk.jumlahBayar > 0 ? 'DP/Sebagian' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          bk.status.toLowerCase() === 'selesai' ? 'bg-emerald-50 text-emerald-700' :
                          (bk.status.toLowerCase() === 'aktif' || bk.status.toLowerCase() === 'sewa aktif' || bk.status.toLowerCase() === 'dalam sewa') ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          bk.status.toLowerCase() === 'pending_konfirmasi' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          bk.status.toLowerCase() === 'dibatalkan' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {(bk.status.toLowerCase() === 'aktif' || bk.status.toLowerCase() === 'sewa aktif' || bk.status.toLowerCase() === 'dalam sewa') ? 'Sedang Bertugas' : statusLabel(bk.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {bk.status === 'pending_konfirmasi' && (
                            <button
                              onClick={() => {
                                const updated = bookings.map(b => b.id === bk.id ? { ...b, status: 'aktif' as const } : b);
                                onUpdateBookings(updated);
                                onAddNotification('Konfirmasi Jasa Driver', `Booking driver ${bk.bookingCode} berhasil disetujui!`, 'success');
                              }}
                              className="text-[10px] text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Konfirmasi
                            </button>
                          )}
                          {!bk.driverId && bk.status !== 'dibatalkan' && bk.status !== 'selesai' && (
                            <select
                              onChange={(e) => {
                                const dId = e.target.value;
                                if (!dId) return;
                                const dr = allDrivers.find(d => d.id === dId);
                                if (!dr) return;
                                
                                const updatedBookings = bookings.map(b => {
                                  if (b.id === bk.id) {
                                    return {
                                      ...b,
                                      driverId: dId,
                                      driverNama: dr.nama
                                    };
                                  }
                                  return b;
                                });
                                onUpdateBookings(updatedBookings);

                                const updatedDrivers = allDrivers.map(d => {
                                  if (d.id === dId) {
                                    return { ...d, status: 'booking' as const };
                                  }
                                  return d;
                                });
                                onUpdateDrivers(updatedDrivers);

                                onAddNotification('Driver Ditugaskan', `Supir ${dr.nama} sukses ditugaskan ke booking ${bk.bookingCode}`, 'success');
                              }}
                              className="text-[10px] border border-amber-250 bg-amber-50 text-amber-750 px-1 py-0.5 rounded font-bold cursor-pointer focus:outline-none"
                            >
                              <option value="">-- Tugaskan Driver --</option>
                              {allDrivers.filter(d => d.status === 'aktif' && (d.aktif ?? true)).map(d => (
                                <option key={d.id} value={d.id}>{d.nama}</option>
                              ))}
                            </select>
                          )}
                          {bk.status === 'aktif' && (
                            <button
                              onClick={() => handleCompleteBooking(bk)}
                              className="text-[10px] text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Selesai Tugas
                            </button>
                          )}
                          {(bk.status === 'pending_dp' || bk.status === 'pending_konfirmasi' || bk.status === 'aktif') && (
                            <button
                              onClick={() => {
                                if (!window.confirm(`Batalkan booking supir ${bk.bookingCode}?`)) return;
                                const updated = bookings.map(b => b.id === bk.id ? { ...b, status: 'dibatalkan' as const } : b);
                                onUpdateBookings(updated);
                                if (bk.driverId) {
                                  const updatedDrivers = allDrivers.map(d => d.id === bk.driverId ? { ...d, status: 'aktif' as const } : d);
                                  onUpdateDrivers(updatedDrivers);
                                }
                                onAddNotification('Booking Supir Dibatalkan', `Booking ${bk.bookingCode} telah dibatalkan admin.`, 'warning');
                              }}
                              className="text-[10px] text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {bookings.filter(b => b.layanan === 'driver').length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400">Tidak ada reservasi driver pribadi yang terdaftar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5C. TAB DRIVERS - MONITOR JADWAL & STATUS */}
      {activeTab === 'drivers-schedules' && (
        <div className="space-y-4" id="drivers-schedules-timeline">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Dashboard Ketersediaan Driver & Jadwal</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Memantau ketersediaan driver secara visual, menugaskan waktu istirahat, dan melihat tugas berjalan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allDrivers.map(dri => {
              const currentTask = bookings.find(b => b.driverId === dri.id && b.status === 'aktif');
              
              return (
                <div key={dri.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-150 bg-slate-50 shrink-0">
                          <img src={dri.foto} alt={dri.nama} className="w-full h-full object-cover object-top" />
                        </div>
                        <div>
                          <strong className="text-slate-800 block text-xs">{dri.nama}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{dri.telepon}</span>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        dri.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        dri.status === 'booking' ? 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse' :
                        dri.status === 'istirahat' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {dri.status === 'aktif' ? 'Tersedia' : dri.status === 'booking' ? 'Bertugas' : dri.status}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-500 border-t border-slate-50 pt-2.5">
                      <div className="flex justify-between">
                        <span>Daily Rate:</span>
                        <strong className="text-slate-800 font-mono">Rp {dri.tarifPerHari.toLocaleString('id-ID')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating Penumpang:</span>
                        <strong className="text-slate-800">⭐ {dri.rating.toFixed(1)} ({dri.reviewCount} ulasan)</strong>
                      </div>
                    </div>

                    {currentTask ? (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-[10px] text-blue-800 space-y-1">
                        <strong>TUGAS BERJALAN:</strong>
                        <p className="leading-tight font-semibold">Booking {currentTask.bookingCode} - {currentTask.userNama}</p>
                        <p className="text-blue-600 font-mono">Periode: {currentTask.tanggalMulai} s/d {currentTask.tanggalSelesai}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[10px] text-slate-400 italic text-center">
                        Tidak ada tugas aktif berjalan
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 pt-2 border-t border-slate-50">
                    {dri.status === 'aktif' && (
                      <button
                        onClick={() => {
                          const updated = allDrivers.map(d => d.id === dri.id ? { ...d, status: 'istirahat' as const } : d);
                          onUpdateDrivers(updated);
                          onAddNotification('Status Driver Istirahat', `Driver ${dri.nama} diset istirahat.`, 'info');
                        }}
                        className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-extrabold text-[10.5px] py-1.5 rounded-lg cursor-pointer text-center"
                      >
                        Istirahatkan
                      </button>
                    )}
                    {dri.status === 'istirahat' && (
                      <button
                        onClick={() => {
                          const updated = allDrivers.map(d => d.id === dri.id ? { ...d, status: 'aktif' as const } : d);
                          onUpdateDrivers(updated);
                          onAddNotification('Status Driver Aktif', `Driver ${dri.nama} kembali bertugas.`, 'success');
                        }}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-[10.5px] py-1.5 rounded-lg cursor-pointer text-center"
                      >
                        Aktifkan (Ready)
                      </button>
                    )}
                    <select
                      value={dri.status}
                      onChange={(e) => {
                        const targetStatus = e.target.value as any;
                        const updated = allDrivers.map(d => d.id === dri.id ? { ...d, status: targetStatus } : d);
                        onUpdateDrivers(updated);
                        onAddNotification('Status Driver Diperbarui', `Status driver ${dri.nama} diubah ke ${targetStatus}.`, 'info');
                      }}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10.5px] px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none"
                    >
                      <option value="aktif">Ready</option>
                      <option value="istirahat">Istirahat</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB REFUNDS (MANAJEMEN REFUND) */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 text-left">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kelola Pengajuan Refund Dana ({refunds.length})</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Verifikasi permintaan pembatalan dan persetujuan pengembalian dana transaksi sewa.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">ID Refund</th>
                    <th className="py-3 px-4">Kode Booking</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Total Dibayar</th>
                    <th className="py-3 px-4 text-right">Nominal Refund</th>
                    <th className="py-3 px-4 text-left">Alasan Pembatalan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-655">
                  {refunds.map(ref => (
                    <tr key={ref.id} className="hover:bg-slate-50/40 text-left">
                      <td className="py-3 px-4 font-mono text-slate-850 font-black">{ref.id}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{ref.bookingCode}</td>
                      <td className="py-3 px-4 text-slate-800 font-bold">{ref.userNama}</td>
                      <td className="py-3 px-4 text-right font-mono">Rp {(ref.totalDibayar || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-650 font-bold">Rp {(ref.nominalRefund || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500 max-w-xs truncate" title={ref.alasanPembatalan}>
                        {ref.alasanPembatalan}
                        {ref.catatanTambahan && (
                          <span className="block text-[10px] text-slate-400 font-mono italic">Catatan: {ref.catatanTambahan}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase inline-block ${
                          ref.status === 'Menunggu Verifikasi' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                          ref.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          ref.status === 'Ditolak' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5 justify-center">
                          {ref.status === 'Menunggu Verifikasi' ? (
                            <>
                              <button
                                onClick={() => handleApproveRefund(ref)}
                                className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-0.5"
                              >
                                <Check className="w-3 h-3" /> Setujui
                              </button>
                              <button
                                onClick={() => handleRejectRefund(ref)}
                                className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-0.5"
                              >
                                <XCircle className="w-3 h-3" /> Tolak
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-semibold">Selesai</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {refunds.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-400 italic">Tidak ada pengajuan refund dana terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB INVOICES (MANAJEMEN INVOICE) */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Buku Pembukuan Invoice ({invoices.length})</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Pantau status piutang, pelunasan sisa sewa, tagihan denda keterlambatan, dan cetak slip resmi.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari kode invoice atau pelanggan..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs w-48 bg-white focus:outline-none"
              />
              <select
                value={invoiceFilterStatus}
                onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="belum_bayar">Belum Dibayar</option>
                <option value="dp_lunas">DP Lunas</option>
                <option value="lunas">Lunas</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                    <th className="py-3 px-4">Invoice Code</th>
                    <th className="py-3 px-4">Kode Booking</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Layanan</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Denda</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 text-[11px] font-medium font-mono">
                  {invoices
                    .filter(inv => {
                      const invCode = inv.invoiceCode || '';
                      const usrName = inv.userNama || '';
                      const matchSearch = invCode.toLowerCase().includes(invoiceSearch.toLowerCase()) || usrName.toLowerCase().includes(invoiceSearch.toLowerCase());
                      const matchStatus = invoiceFilterStatus === 'all' || inv.status === invoiceFilterStatus;
                      return matchSearch && matchStatus;
                    })
                    .map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{inv.invoiceCode || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{inv.bookingCode || '-'}</td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-800">{inv.userNama || '-'}</td>
                      <td className="py-3 px-4 font-sans capitalize">{inv.layanan ? inv.layanan.replace('_', ' + ') : '-'}</td>
                      <td className="py-3 px-4 text-right">Rp {(inv.subtotal || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right text-red-500 font-bold">Rp {(inv.denda || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right text-blue-600 font-bold">Rp {(inv.total || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-bold">Rp {(inv.terbayar || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-right text-amber-700 font-bold bg-amber-50/10">Rp {(inv.sisa || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          inv.status === 'lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          inv.status === 'dp_lunas' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {inv.status === 'lunas' ? 'Lunas' : inv.status === 'dp_lunas' ? 'DP Lunas' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto hover:bg-blue-50 p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Modal Visualizer */}
          {selectedInvoice && (() => {
            const bk = bookings.find(b => b.id === selectedInvoice.bookingId || b.bookingCode === selectedInvoice.bookingCode);
            const isLunas = selectedInvoice.terbayar >= selectedInvoice.total;
            const statusPembayaranText = bk?.statusPembayaran || (isLunas ? 'Lunas' : 'Belum Bayar');
            const statusRentalText = bk ? getStatusRentalText(bk.status) : 'Menunggu Pengambilan';
            const jenisBayarText = bk?.jenisPembayaran === 'dp' ? 'DP (30% Uang Muka)' : 'Lunas (100% Penuh)';
            
            const getPaymentDeadline = (tanggalBookingStr: string): string => {
              if (!tanggalBookingStr) return '-';
              const dateObj = new Date(tanggalBookingStr.replace(' ', 'T') + ':00');
              if (isNaN(dateObj.getTime())) return '-';
              dateObj.setHours(dateObj.getHours() + 24);
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const date = String(dateObj.getDate()).padStart(2, '0');
              const hours = String(dateObj.getHours()).padStart(2, '0');
              const minutes = String(dateObj.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${date} ${hours}:${minutes}`;
            };
            
            const deadlineVal = bk?.tanggalBooking ? getPaymentDeadline(bk.tanggalBooking) : '-';

            return (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
                <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-100">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-blue-600" /> Lembar Dokumen Invoice
                    </h3>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-4 overflow-y-auto text-xs text-slate-600 bg-white" id="printable-invoice-canvas">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                      <div>
                        <div className="text-xl font-black text-blue-600 font-display">AutoRent</div>
                        <p className="text-slate-400 mt-1">Sewa Mobil & Supir Premium Terpercaya</p>
                        <p className="text-slate-400">Bandung, Jawa Barat</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-sm font-bold text-slate-900">INVOICE RESMI</h4>
                        <p className="font-mono text-slate-700 font-semibold mt-1">NO: {selectedInvoice.invoiceCode}</p>
                        <p className="font-mono text-slate-400">Tanggal: {selectedInvoice.tanggalDibuat}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-600 text-left">
                      <div className="space-y-2">
                        <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Ditagihkan Kepada:</h5>
                        <div className="space-y-1 font-semibold">
                          <p className="text-slate-900 font-extrabold text-sm">{selectedInvoice.userNama}</p>
                          <p>ID Pelanggan: <span className="font-mono text-slate-800">{selectedInvoice.userId}</span></p>
                        </div>
                      </div>

                      <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-slate-700">
                        <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Detail Booking Reservasi:</h5>
                        <div className="space-y-1 font-semibold">
                          <p>Kode Booking: <strong className="font-mono text-slate-900">{selectedInvoice.bookingCode}</strong></p>
                          <p>Nama Customer: <span className="text-slate-800">{selectedInvoice.userNama}</span></p>
                          {bk?.mobilNama && <p>Armada Mobil: <span className="text-slate-850 font-bold">{bk.mobilNama}</span></p>}
                          {bk?.driverNama && <p>Driver: <span className="text-slate-850 font-bold">{bk.driverNama}</span></p>}
                          {bk?.tanggalMulai && (
                            <p>Periode Sewa: <span className="text-slate-850 font-bold">{bk.tanggalMulai} s/d {bk.tanggalSelesai} ({bk.durasiHari} Hari)</span></p>
                          )}
                          <p>Jenis Pembayaran: <span className="text-slate-800 font-bold">{jenisBayarText}</span></p>
                          <p>Metode Pembayaran: <span className="text-slate-800 font-bold">{selectedInvoice.metodePembayaran || 'Payment Gateway'}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3 text-xs font-semibold text-slate-650 p-4 border rounded-2xl bg-slate-50">
                        {selectedInvoice.status === 'refund' ? (
                          <div className="flex justify-between items-center text-red-650 font-black text-sm pt-2">
                            <span>Total Pengembalian Dana:</span>
                            <span className="font-mono">Rp {selectedInvoice.total.toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center text-slate-900 font-black text-sm pt-2">
                              <span>Total:</span>
                              <span className="font-mono text-blue-600">Rp {selectedInvoice.total.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 font-semibold text-sm pt-1">
                              <span>Pembayaran Diterima:</span>
                              <span className="font-mono text-emerald-600">Rp {(selectedInvoice.terbayar || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-700 font-black text-sm pt-1 mt-1 border-t border-slate-100">
                              <span>Sisa Tagihan:</span>
                              <span className="font-mono">Rp {(Math.max(0, selectedInvoice.total - (selectedInvoice.terbayar || 0))).toLocaleString('id-ID')}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
                    <button
                      onClick={() => {
                        onAddNotification('Kirim Invoice', `Invoice ${selectedInvoice.invoiceCode} dikirim ke e-mail pelanggan!`, 'success');
                        alert(`Invoice dikirim ke email customer.`);
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Kirim E-mail ke Pelanggan
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.write(`<html><head><title>Print Invoice</title></head><body>${document.getElementById('printable-invoice-canvas')?.innerHTML}</body></html>`);
                            win.document.close();
                            win.print();
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Printer className="w-4 h-4" /> Cetak Slip PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 8. TAB OPERASIONAL MOBIL (CARS OPS - UNIFIED CHECKOUT & GUARANTEE) */}
      {activeTab === 'cars-ops' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="autorent-cars-ops-panel">
          {/* Left Column: Handover, Return, and Guarantee Cards */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* 1. Form Serah Terima & Jaminan Unit */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-blue-600">
                  <CheckSquare className="w-5 h-5 shrink-0" /> Form Serah Terima & Jaminan Unit
                </h3>
                <p className="text-slate-500 text-[11px] mt-1">Lakukan serah terima kendaraan yang aktif dan catat jaminan kolateral.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Booking Sewa Aktif</label>
                  <select
                    value={selectedHandoverBookingId}
                    onChange={(e) => {
                      setSelectedHandoverBookingId(e.target.value);
                      setGuaranteeInputNumber('');
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Booking --</option>
                    {bookings
                      .filter(b => getStatusRentalText(b.status) === 'Menunggu Pengambilan' && (getStatusPembayaranText(b) === 'Lunas' || getStatusPembayaranText(b) === 'DP Dibayar' || b.statusPembayaran === 'Lunas' || b.statusPembayaran === 'DP Dibayar') && (!b.statusJaminan || b.statusJaminan === 'Belum Diserahkan') && (b.layanan === 'rental' || b.layanan === 'rental_driver'))
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bookingCode} - {b.userNama} - {b.mobilNama}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedHandoverBookingId && (() => {
                  const bk = bookings.find(b => b.id === selectedHandoverBookingId);
                  if (!bk) return null;
                  return (
                    <div className="space-y-4 pt-2 border-t border-slate-50 animate-fade-in">
                      <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider block">INFORMASI BOOKING</span>
                        <div className="text-[11px] text-slate-600 space-y-1">
                          <p>Kode Booking: <strong>{bk.bookingCode}</strong></p>
                          <p>Nama Customer: <strong>{bk.userNama}</strong></p>
                          <p>Armada: <strong>{bk.mobilNama}</strong></p>
                          <p>Periode Sewa: <strong>{bk.tanggalMulai} s/d {bk.tanggalSelesai}</strong> ({bk.durasiHari} hari)</p>
                          <p>Status Pembayaran: <strong className="text-emerald-600">{bk.statusPembayaran || 'Lunas'}</strong></p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider block border-b border-slate-100 pb-1">INFORMASI JAMINAN</span>
                        
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Jenis Jaminan</label>
                          <select
                            value={guaranteeInputType}
                            onChange={(e) => setGuaranteeInputType(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                          >
                            <option value="KTP">KTP</option>
                            <option value="SIM">SIM</option>
                            <option value="KTP + SIM">KTP + SIM</option>
                            <option value="KTP + STNK Motor">KTP + STNK Motor</option>
                            <option value="Motor">Motor</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Nomor Identitas Jaminan</label>
                          <input
                            type="text"
                            required
                            placeholder="Masukkan nomor KTP / SIM / Plat Motor jaminan..."
                            value={guaranteeInputNumber}
                            onChange={(e) => setGuaranteeInputNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Tanggal Serah Terima</label>
                          <input
                            type="date"
                            required
                            value={handoverDateInput}
                            onChange={(e) => setHandoverDateInput(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleHandoverVehicle(selectedHandoverBookingId, guaranteeInputType, guaranteeInputNumber, handoverDateInput)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <ShieldCheck className="w-4.5 h-4.5" /> ✅ Unit Diserahkan
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 2. Form Pengembalian Kendaraan */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-rose-600">
                  <CheckSquare className="w-5 h-5 shrink-0" /> Form Pengembalian Kendaraan
                </h3>
                <p className="text-slate-500 text-[11px] mt-1">Proses pengembalian unit sewa aktif dan hitung denda secara otomatis.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Unit Sedang Disewa</label>
                  <select
                    value={selectedReturnBookingId}
                    onChange={(e) => {
                      setSelectedReturnBookingId(e.target.value);
                      setActualReturnNotes('');
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Unit Disewa --</option>
                    {bookings
                      .filter(b => (b.status === 'Sewa Aktif' || b.status === 'aktif' || b.status === 'Dalam Sewa') && (b.layanan === 'rental' || b.layanan === 'rental_driver'))
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          {b.bookingCode} - {b.userNama} - {b.mobilNama}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedReturnBookingId && (() => {
                  const bk = bookings.find(b => b.id === selectedReturnBookingId);
                  if (!bk) return null;

                  const { days: computedDays, penalty: computedPenalty } = calculateDelayAndPenalty(bk.tanggalSelesai, actualReturnDate);

                  return (
                    <div className="space-y-4 pt-2 border-t border-slate-50 animate-fade-in">
                      <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-650">
                        <p>Customer: <strong>{bk.userNama}</strong></p>
                        <p>Armada: <strong>{bk.mobilNama}</strong></p>
                        <p>Jenis Jaminan: <strong>{bk.jenisJaminan || '-'}</strong></p>
                        <p>Status Jaminan: <strong className="text-amber-600">{bk.statusJaminan || 'Ditahan'}</strong></p>
                        <p>Jadwal Kembali: <strong>{bk.tanggalSelesai}</strong></p>
                      </div>

                       <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-600 mb-1">Tgl Kembali Aktual</label>
                            <input
                              type="date"
                              required
                              value={actualReturnDate}
                              onChange={(e) => setActualReturnDate(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-600 mb-1">Jam Kembali Aktual</label>
                            <input
                              type="time"
                              required
                              value={actualReturnTime}
                              onChange={(e) => setActualReturnTime(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-600 mb-1">Kilometer Awal</label>
                            <input
                              type="number"
                              disabled
                              value={handoverDetails[bk.id]?.kmAwal || bk.kilometerAwal || 12000}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-600 mb-1">Kilometer Akhir</label>
                            <input
                              type="number"
                              id="input-checkin-km"
                              required
                              min={handoverDetails[bk.id]?.kmAwal || bk.kilometerAwal || 12000}
                              value={checkinKm}
                              onChange={(e) => setCheckinKm(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-600 mb-1">Kondisi Kendaraan</label>
                            <input
                              type="text"
                              id="input-checkin-body"
                              required
                              placeholder="Kondisi body..."
                              value={checkinBody}
                              onChange={(e) => setCheckinBody(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-600 mb-1">BBM Akhir</label>
                            <input
                              type="text"
                              id="input-checkin-bbm"
                              required
                              placeholder="Isi bbm, e.g. Full..."
                              value={checkinBbm}
                              onChange={(e) => setCheckinBbm(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        {/* Damage Inputs */}
                        <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/60 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 text-xs">
                            <input
                              type="checkbox"
                              id="checkbox-checkin-damaged"
                              checked={checkinIsDamaged}
                              onChange={(e) => {
                                setCheckinIsDamaged(e.target.checked);
                                if (!e.target.checked) setCheckinDamagePenalty(0);
                              }}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span>Apakah Mobil Mengalami Kerusakan?</span>
                          </label>

                          {checkinIsDamaged && (
                            <div className="animate-fade-in space-y-1.5">
                              <label className="block font-semibold text-rose-700 text-[11px]">Denda Kerusakan (Rp)</label>
                              <input
                                type="number"
                                id="input-checkin-damage-penalty"
                                required
                                min="0"
                                value={checkinDamagePenalty || ''}
                                onChange={(e) => setCheckinDamagePenalty(Number(e.target.value))}
                                className="w-full px-3 py-1.5 border border-rose-200 rounded-lg bg-white text-rose-700 font-mono font-bold text-xs"
                                placeholder="Masukkan nominal denda kerusakan..."
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">Catatan (Opsional)</label>
                          <textarea
                            rows={2}
                            placeholder="Catatan kondisi mobil saat pengembalian..."
                            value={actualReturnNotes}
                            onChange={(e) => setActualReturnNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                          />
                        </div>

                        {/* Confirmation Checkboxes */}
                        <div className="flex flex-col gap-2 pt-2 text-[11px] text-slate-700 font-semibold text-left">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={confirmCarReturned}
                              onChange={(e) => setConfirmCarReturned(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Konfirmasi Mobil Dikembalikan</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={confirmGuaranteeReturned}
                              onChange={(e) => setConfirmGuaranteeReturned(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Konfirmasi Jaminan Dikembalikan</span>
                          </label>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block border-b border-slate-100 pb-1">INFORMASI DENDA</span>
                          <div className="flex justify-between">
                            <span>Jadwal Kembali:</span>
                            <span className="font-semibold">{bk.tanggalSelesai}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tgl Kembali Aktual:</span>
                            <span className="font-semibold">{actualReturnDate}</span>
                          </div>
                          <div className="flex justify-between text-rose-600">
                            <span>Jumlah Hari Terlambat:</span>
                            <span className="font-bold">{computedDays} Hari</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-extrabold text-xs pt-1 border-t border-dashed border-slate-200">
                            <span>Total Denda:</span>
                            <span>Rp {computedPenalty.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleReturnVehicle(selectedReturnBookingId, actualReturnDate, actualReturnTime, actualReturnNotes, confirmCarReturned, confirmGuaranteeReturned)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckSquare className="w-4.5 h-4.5" /> 🛠️ Konfirmasi Pengembalian
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 3. Card Pengembalian Jaminan */}
            {(() => {
              const readyToReturnBooking = bookings.find(b => 
                (b.status === 'Sewa Aktif' || b.status === 'aktif' || b.status === 'Dalam Sewa' || b.status === 'Menunggu Pelunasan Denda' || b.status === 'Selesai') && 
                b.statusJaminan === 'Ditahan' && 
                b.sisaPelunasan <= 0
              );

              if (!readyToReturnBooking) return null;

              return (
                <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 shadow-sm border-l-4 border-l-emerald-500 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-emerald-600">
                      <ShieldCheck className="w-5 h-5 shrink-0" /> Pengembalian Jaminan
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-1">Seluruh tagihan dan denda telah lunas. Kembalikan jaminan customer.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                    <p>Booking Code: <strong>{readyToReturnBooking.bookingCode}</strong></p>
                    <p>Customer: <strong>{readyToReturnBooking.userNama}</strong></p>
                    <p>Jenis Jaminan: <strong>{readyToReturnBooking.jenisJaminan}</strong></p>
                    <p>Keterangan: <strong>{readyToReturnBooking.keteranganJaminan}</strong></p>
                    <p>Status Jaminan: <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">{readyToReturnBooking.statusJaminan}</span></p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReturnGuarantee(readyToReturnBooking.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center cursor-pointer text-xs shadow-sm transition-all"
                  >
                    ✅ Jaminan Sudah Dikembalikan
                  </button>
                </div>
              );
            })()}

          </div>

          {/* Right Column: Active and Completed Operations Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tabel Operasional Mobil AutoRent</h4>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                Total: {bookings.filter(b => b.layanan === 'rental' || b.layanan === 'rental_driver').length} Transaksi
              </span>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9.5px] bg-slate-50">
                      <th className="py-3.5 px-4">Kode Booking</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Armada</th>
                      <th className="py-3.5 px-4">Tgl Mulai</th>
                      <th className="py-3.5 px-4">Tgl Selesai</th>
                      <th className="py-3.5 px-4">Status Rental</th>
                      <th className="py-3.5 px-4">Jenis Jaminan</th>
                      <th className="py-3.5 px-4">Status Jaminan</th>
                      <th className="py-3.5 px-4 text-right">Denda</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-650 text-[11px] font-medium font-sans">
                    {bookings
                      .filter(b => b.layanan === 'rental' || b.layanan === 'rental_driver')
                      .map(b => {
                        const statusRentalVal = b.status;
                        const statusJaminanVal = b.statusJaminan || 'Belum Diserahkan';
                        const dendaVal = b.denda || 0;
                        
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.bookingCode}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">{b.userNama}</td>
                            <td className="py-3.5 px-4">{b.mobilNama}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">{splitDateTime(b.tanggalMulai).date}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-500">{splitDateTime(b.tanggalSelesai).date}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                statusRentalVal === 'Menunggu Pengambilan' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                (statusRentalVal === 'Sewa Aktif' || statusRentalVal === 'Dalam Sewa') ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                                statusRentalVal === 'Menunggu Pelunasan Denda' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                statusRentalVal === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {statusRentalVal}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold">{b.jenisJaminan || '-'}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                statusJaminanVal === 'Belum Diserahkan' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                                statusJaminanVal === 'Ditahan' ? 'bg-rose-50 text-rose-700 border border-rose-150 animate-pulse' :
                                'bg-emerald-50 text-emerald-700 border border-emerald-150'
                              }`}>
                                {statusJaminanVal}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                              Rp {dendaVal.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex gap-1.5 items-center justify-center">
                                {statusRentalVal === 'Menunggu Pengambilan' && (
                                  <button
                                    onClick={() => {
                                      setSelectedHandoverBookingId(b.id);
                                      setGuaranteeInputNumber('');
                                      document.getElementById('autorent-cars-ops-panel')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[9.5px] px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                                  >
                                    Serahkan Unit
                                  </button>
                                )}
                                {(statusRentalVal === 'Sewa Aktif' || statusRentalVal === 'Dalam Sewa') && (
                                  <button
                                    onClick={() => {
                                      setSelectedReturnBookingId(b.id);
                                      setActualReturnNotes('');
                                      const kmA = handoverDetails[b.id]?.kmAwal || b.kilometerAwal || 12000;
                                      setCheckinKm(kmA + 100); // suggest a slight default increase
                                      setCheckinBody('Mulus');
                                      setCheckinBbm('Full');
                                      setCheckinIsDamaged(false);
                                      setCheckinDamagePenalty(0);
                                      document.getElementById('autorent-cars-ops-panel')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="bg-rose-600 hover:bg-rose-750 text-white text-[9.5px] px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                                  >
                                    Kembalikan Unit
                                  </button>
                                )}
                                {statusJaminanVal === 'Ditahan' && b.sisaPelunasan <= 0 && (
                                  <button
                                    onClick={() => {
                                      handleReturnGuarantee(b.id);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                                  >
                                    Kembalikan Jaminan
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const inv = invoices.find(i => i.bookingId === b.id);
                                    if (inv) {
                                      setSelectedInvoice(inv);
                                    } else {
                                      alert('Invoice tidak ditemukan.');
                                    }
                                  }}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-[9.5px] px-2 py-1 rounded font-bold cursor-pointer transition-colors"
                                >
                                  Detail
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB MAINTENANCE MOBIL (CARS MAINTENANCE) */}
      {activeTab === 'cars-maintenance' && (
        <div className="space-y-4" id="autorent-cars-maintenance-panel">
          
          {/* Top Info Banner & Metrics */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" /> Database Pemeliharaan & Perbaikan Armada
              </h3>
              <p className="text-slate-500 text-xs mt-1">Pantau status servis rutin dan perbaikan kerusakan berat/ringan. Ubah status perbaikan untuk memulihkan mobil.</p>
            </div>
            
            <div className="flex gap-4 text-xs font-semibold">
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 block uppercase">Di Bengkel</span>
                <strong className="text-amber-600 text-sm font-mono">{allCars.filter(c => c.status === 'maintenance').length} Unit</strong>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 block uppercase">Diperbaiki</span>
                <strong className="text-blue-600 text-sm font-mono">{maintenanceList.filter(r => r.status === 'Sedang Diperbaiki').length} Unit</strong>
              </div>
              <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 text-center min-w-[100px]">
                <span className="text-[10px] text-slate-400 block uppercase">Menunggu</span>
                <strong className="text-yellow-600 text-sm font-mono">{maintenanceList.filter(r => r.status === 'Menunggu Perbaikan').length} Unit</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Input Maintenance Manual */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm self-start">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
                Kirim Unit Ke Maintenance (Manual)
              </h4>

              <form onSubmit={handleCreateMaintenanceManual} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Pilih Unit Armada</label>
                  <select
                    value={maintCarId}
                    onChange={(e) => setMaintCarId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="">-- Pilih Mobil Tersedia --</option>
                    {allCars
                      .filter(c => c.status === 'tersedia')
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nama} ({c.platNomor})
                        </option>
                      ))}
                  </select>
                  <p className="text-[9.5px] text-slate-400 mt-1">Hanya menampilkan mobil yang sedang tidak disewa atau diperbaiki.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Jenis Kerusakan / Servis Rutin</label>
                  <textarea
                    required
                    placeholder="Contoh: Ganti oli mesin, tune-up berkala, ganti kampas rem depan."
                    value={maintKerusakan}
                    onChange={(e) => setMaintKerusakan(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Estimasi Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={maintEstimasi}
                    onChange={(e) => setMaintEstimasi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Wrench className="w-4 h-4" /> Masukkan ke Antrean Maintenance
                </button>
              </form>
            </div>

            {/* List Maintenance Records */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Log Perbaikan & Pemeliharaan Armada</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maintenanceList.map(rec => {
                  const targetCar = allCars.find(c => c.id === rec.mobilId);
                  
                  return (
                    <div key={rec.id} className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                      <div className="space-y-3 text-xs text-slate-600">
                        {/* Record Header */}
                        <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                          <div>
                            <strong className="text-slate-900 text-xs block">{rec.mobilNama}</strong>

                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            rec.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                            rec.status === 'Sedang Diperbaiki' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-150 animate-pulse'
                          }`}>
                            {rec.status}
                          </span>
                        </div>

                        {/* Record Body */}
                        <div className="space-y-2 text-[11px]">
                          <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50 leading-relaxed font-sans italic text-slate-700">
                            "{rec.kerusakan}"
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                            <div>
                              <span>Tanggal Masuk:</span>
                              <strong className="text-slate-600 block font-mono font-semibold">{rec.tanggalPengajuan}</strong>
                            </div>
                            <div>
                              <span>Estimasi Selesai:</span>
                              <strong className="text-slate-600 block font-mono font-semibold">{rec.estimasiSelesai}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Record Footer Actions */}
                      <div className="flex gap-2 border-t border-slate-50 pt-3 text-[10px]">
                        {rec.status === 'Menunggu Perbaikan' && (
                          <>
                            <button
                              onClick={() => handleUpdateMaintenanceStatus(rec.id, 'Sedang Diperbaiki')}
                              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-extrabold py-1.5 rounded-lg cursor-pointer text-center"
                            >
                              Mulai Perbaiki
                            </button>
                            <button
                              onClick={() => handleUpdateMaintenanceStatus(rec.id, 'Selesai')}
                              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 font-extrabold py-1.5 rounded-lg cursor-pointer text-center"
                            >
                              Tandai Selesai
                            </button>
                          </>
                        )}

                        {rec.status === 'Sedang Diperbaiki' && (
                          <button
                            onClick={() => handleUpdateMaintenanceStatus(rec.id, 'Selesai')}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-lg cursor-pointer text-center"
                          >
                            Tandai Selesai (Unit Ready)
                          </button>
                        )}

                        {rec.status === 'Selesai' && (
                          <span className="w-full text-center text-slate-400 font-bold italic py-1 bg-slate-50 rounded-lg">
                            ✓ Selesai & Unit Ready
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {maintenanceList.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
                    Tidak ada unit mobil yang sedang berada dalam proses maintenance.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. TAB REVIEWS (ULASAN & MODERASI) */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Review & Ulasan Customer ({reviews.length})</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Moderasi review yang diposting oleh pelanggan untuk mobil dan supir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-50">
                        <ProfileAvatar name={rev.userNama} avatarUrl={rev.userAvatar} className="w-full h-full text-[10px]" />
                      </div>
                      <div>
                        <strong className="text-slate-800 text-xs block">{rev.userNama}</strong>
                        <span className="text-[9px] text-slate-400">{rev.tanggal}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-yellow-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs font-sans leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                    "{rev.ulasan}"
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 text-[10px]">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize font-bold">
                    Target: {rev.tipe} ({rev.targetNama})
                  </span>
                  
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Review
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">Belum ada review pelanggan.</div>
            )}
          </div>
        </div>
      )}

      {/* 12. TAB NOTIFICATIONS (KIRIM PENGUMUMAN / NOTIFIKASI) */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Broadcast Form */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-4 space-y-4 shadow-sm self-start">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Kirim & Broadcast Notifikasi
            </h3>

            <form onSubmit={handleBroadcastNotification} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Target Penerima Notifikasi</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="all">Broadcast ke Semua Pelanggan</option>
                  {allUsers
                    .filter(u => u.role === 'customer')
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tipe Pesan</label>
                <div className="flex gap-2">
                  {(['info', 'success', 'warning'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBroadcastType(type)}
                      className={`flex-1 py-1.5 rounded-lg border text-center font-bold capitalize cursor-pointer transition-all ${
                        broadcastType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Judul / Subjek Notifikasi</label>
                <input
                  type="text"
                  required
                  placeholder="Promo Spesial Akhir Pekan"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Pesan Pengumuman</label>
                <textarea
                  required
                  placeholder="Tulis pesan pengumuman Anda di sini..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Kirim Notifikasi Realtime
              </button>
            </form>
          </div>

          {/* Broadcast Logs Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-800 text-xs">Riwayat Notifikasi & Pengumuman</h4>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log Pesan Sistem</span>
                <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-bold">Terhubung realtime</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-bold text-blue-800">
                    <span>Integrasi Payment Gateway Berhasil</span>
                    <span className="font-mono text-[9px] text-slate-400 font-normal">2026-06-05 10:00</span>
                  </div>
                  <p className="text-blue-700 text-[11px] leading-relaxed">
                    Layanan pembayaran otomatis Sandbox Midtrans telah aktif secara realtime. Pengguna kini dapat membayar tagihan dengan verifikasi instan.
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-bold text-amber-800">
                    <span>Antrian Audit Jaminan KTP Pasteur</span>
                    <span className="font-mono text-[9px] text-slate-400 font-normal">2026-06-05 08:30</span>
                  </div>
                  <p className="text-amber-700 text-[11px] leading-relaxed">
                    Harap verifikasi jaminan KTP + STNK Motor untuk booking rental mobil Veloz B 999 RFS sebelum penyerahan kunci check-out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 14. TAB REFUNDS (KELOLA REFUND) */}
      {activeTab === 'refunds' && (
        <div className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-red-600" /> Kelola Pengajuan Refund ({refunds.length})
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">Verifikasi dan kelola pengajuan pengembalian dana dari customer. Refund yang disetujui akan otomatis membatalkan booking dan merilis armada.</p>
          </div>

          {/* Refund Approval Modal */}
          {approvingRefund && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Setujui Refund: {approvingRefund.id}
                  </h3>
                  <button onClick={() => setApprovingRefund(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"><XCircle className="w-5 h-5" /></button>
                </div>
                <div className="p-4 overflow-y-auto space-y-5">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs space-y-2">
                    <p className="font-bold text-slate-800">Detail Pembayaran Awal</p>
                    <div className="flex justify-between text-slate-600"><span>Booking:</span><span className="font-mono">{approvingRefund.bookingCode}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Customer:</span><span className="font-semibold">{approvingRefund.userNama}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Metode Awal:</span><span className="font-semibold">{approvingRefund.metodePembayaranAwal || '-'}</span></div>
                    <div className="flex justify-between text-slate-600 border-t border-blue-100/50 pt-1"><span>Total Dibayar:</span><span className="font-mono font-bold text-slate-900">Rp {approvingRefund.totalDibayar.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Nominal Refund:</span><span className="font-mono font-black text-red-650">Rp {approvingRefund.nominalRefund.toLocaleString('id-ID')}</span></div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2">Informasi Pencairan Dana</h4>
                    
                    <div className="space-y-1.5 text-xs">
                      <label className="font-bold text-slate-700">Metode Pengembalian</label>
                      <select 
                        value={adminRefundMetode} 
                        onChange={(e) => setAdminRefundMetode(e.target.value as 'Transfer Bank')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="Transfer Bank">Transfer Bank</option>
                      </select>
                    </div>

                    {adminRefundMetode === 'Transfer Bank' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Bank</label>
                          <input type="text" value={adminRefundBank} onChange={(e) => setAdminRefundBank(e.target.value)} placeholder="Contoh: BCA / Mandiri" className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Rekening</label>
                          <input type="text" value={adminRefundRekening} onChange={(e) => setAdminRefundRekening(e.target.value)} placeholder="Nomor Rekening" className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Atas Nama</label>
                          <input type="text" value={adminRefundNama} onChange={(e) => setAdminRefundNama(e.target.value)} placeholder="Nama Pemilik" className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-[10px] text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <p>Setelah disetujui, booking akan langsung dibatalkan, armada dirilis kembali, dan <b>Invoice Refund</b> akan otomatis dibuat.</p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                  <button onClick={() => setApprovingRefund(null)} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Batal</button>
                  <button onClick={submitApproveRefund} className="px-4 py-2 text-xs font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Konfirmasi & Setujui</button>
                </div>
              </div>
            </div>
          )}

          {/* Refund Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-1 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total Pengajuan</span>
              <h4 className="text-lg font-black text-slate-900 font-mono">{refunds.length}</h4>
              <span className="text-[8px] text-slate-500 font-bold block">Sepanjang masa</span>
            </div>
            <div className="bg-white border border-amber-100 rounded-2xl p-4 space-y-1 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">Menunggu Verifikasi</span>
              <h4 className="text-lg font-black text-amber-600 font-mono">{refunds.filter(r => r.status === 'Menunggu Verifikasi').length}</h4>
              <span className="text-[8px] text-amber-500 font-bold block">Perlu tindakan</span>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-1 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">Disetujui</span>
              <h4 className="text-lg font-black text-emerald-600 font-mono">{refunds.filter(r => r.status === 'Disetujui').length}</h4>
              <span className="text-[8px] text-emerald-600 font-bold block">Dana dikembalikan</span>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl p-4 space-y-1 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-red-400 block tracking-wider">Total Refund Cair</span>
              <h4 className="text-sm font-black text-red-600 font-mono truncate">Rp {refunds.filter(r => r.status === 'Disetujui').reduce((s, r) => s + r.nominalRefund, 0).toLocaleString('id-ID')}</h4>
              <span className="text-[8px] text-red-500 font-bold block">Sudah dicairkan</span>
            </div>
          </div>

          {/* Refund List */}
          {refunds.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-10 h-10 mx-auto text-slate-200" />
              <p className="text-sm font-bold">Belum ada pengajuan refund</p>
              <p className="text-xs">Pengajuan refund dari customer akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Refunds First */}
              {refunds.filter(r => r.status === 'Menunggu Verifikasi').length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Menunggu Verifikasi ({refunds.filter(r => r.status === 'Menunggu Verifikasi').length})
                  </h4>
                  {refunds.filter(r => r.status === 'Menunggu Verifikasi').map(ref => (
                    <div key={ref.id} className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-xs">{ref.id}</span>
                            <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">Menunggu Verifikasi</span>
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{ref.userNama}</p>
                          <p className="text-[10px] text-slate-500">Booking: <span className="font-mono font-bold text-slate-700">{ref.bookingCode}</span></p>
                          <p className="text-[10px] text-slate-500">Diajukan: <span className="font-bold">{ref.tanggalPengajuan}</span></p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Nominal Refund</span>
                          <span className="text-lg font-black text-red-600 font-mono block">Rp {ref.nominalRefund.toLocaleString('id-ID')}</span>
                          <span className="text-[9px] text-slate-400 block">dari Rp {ref.totalDibayar.toLocaleString('id-ID')} dibayar</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-3 text-xs text-slate-600 space-y-1 border border-amber-100">
                        <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100/50 mb-2">
                          <p className="text-[9px] font-black uppercase text-amber-700 tracking-wider mb-1">Data Rekening Tujuan</p>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                            <div>Bank/E-Wallet: <span className="font-bold text-slate-800">{ref.bankNama || '-'}</span></div>
                            <div>No. Rek/Handphone: <span className="font-bold text-slate-800 font-mono">{ref.rekeningNomor || '-'}</span></div>
                            <div>Atas Nama: <span className="font-bold text-slate-800">{ref.rekeningNama || '-'}</span></div>
                            {ref.nomorTeleponRefund && <div>No. Telepon: <span className="font-bold text-slate-800 font-mono">{ref.nomorTeleponRefund}</span></div>}
                          </div>
                        </div>
                        <p className="font-bold text-slate-700">Alasan Pembatalan:</p>
                        <p className="italic text-slate-600 leading-relaxed">&ldquo;{ref.alasanPembatalan}&rdquo;</p>
                        {ref.catatanTambahan && (
                          <p className="text-slate-400 text-[10px] mt-1">Catatan: {ref.catatanTambahan}</p>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-amber-100 pt-3">
                        <button
                          onClick={() => handleApproveRefund(ref)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 text-xs transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Setujui Refund
                        </button>
                        <button
                          onClick={() => handleRejectRefund(ref)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold py-2.5 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 text-xs border border-red-200 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak Refund
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Processed Refunds */}
              {refunds.filter(r => r.status !== 'Menunggu Verifikasi').length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Riwayat Refund ({refunds.filter(r => r.status !== 'Menunggu Verifikasi').length})</h4>
                  {refunds.filter(r => r.status !== 'Menunggu Verifikasi').map(ref => (
                    <div key={ref.id} className={`border rounded-2xl p-5 space-y-3 ${
                      ref.status === 'Disetujui' ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-xs">{ref.id}</span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                              ref.status === 'Disetujui' || ref.status === 'Refund Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {ref.status}
                            </span>
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{ref.userNama} <span className="text-slate-400 font-normal">·</span> <span className="font-mono text-[10px] text-slate-500">{ref.bookingCode}</span></p>
                          <p className="text-[10px] text-slate-500 font-medium">Metode: <span className="font-bold">{ref.metodeRefund || '-'}</span></p>
                          {(ref.bankNama || ref.rekeningNomor) && (
                            <p className="text-[10px] text-slate-500 font-medium">
                              Rekening: <span className="font-bold text-slate-700">{ref.bankNama} - {ref.rekeningNomor} (a.n {ref.rekeningNama})</span>
                              {ref.nomorTeleponRefund && <span className="text-slate-400 ml-1">· Telp: {ref.nomorTeleponRefund}</span>}
                            </p>
                          )}
                          {ref.tanggalRefund && <p className="text-[10px] text-slate-400">Diproses: {ref.tanggalRefund}</p>}
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-black font-mono ${
                            ref.status === 'Disetujui' || ref.status === 'Refund Selesai' ? 'text-emerald-600' : 'text-slate-400 line-through'
                          }`}>
                            Rp {ref.nominalRefund.toLocaleString('id-ID')}
                          </span>
                          {ref.nomorRefund && (
                            <p className="text-[9px] text-slate-400 font-mono">{ref.nomorRefund}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}



      {/* Detail Booking Modal */}
      {selectedBookingForDetail && (() => {
        const bk = selectedBookingForDetail;
        const totalTagihan = bk.totalBayar;
        const sudahDibayar = bk.jumlahBayar;
        const sisaTagihan = Math.max(0, totalTagihan - sudahDibayar);
        const statusPembayaran = getStatusPembayaranText(bk);
        const statusRental = getStatusRentalText(bk.status);
        
        // Filter payments for this booking to show the Riwayat Pembayaran
        const bookingPayments = payments.filter(p => p.bookingId === bk.id || p.bookingCode === bk.bookingCode);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-base font-black text-slate-950">Detail Transaksi Booking</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Kode: {bk.bookingCode}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBookingForDetail(null);
                    setIsProcessingPelunasan(false);
                  }}
                  className="text-slate-450 hover:text-slate-700 text-lg font-bold bg-transparent border-0 cursor-pointer p-2"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 flex-1 text-xs">
                {/* 1. Informasi Booking */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Informasi Booking</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-medium">Nama Customer</span>
                      <strong className="block text-slate-800 text-[13px] mt-0.5">{bk.userNama}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Armada Kendaraan</span>
                      <strong className="block text-slate-800 text-[13px] mt-0.5">
                        {bk.mobilNama || '-'}
                        {bk.driverNama && <span className="block text-[10px] text-slate-400 font-normal">Driver: {bk.driverNama}</span>}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Tanggal Mulai</span>
                      <strong className="block text-slate-800 mt-0.5 font-mono">{bk.tanggalMulai || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Tanggal Selesai</span>
                      <strong className="block text-slate-800 mt-0.5 font-mono">{bk.tanggalSelesai || '-'}</strong>
                    </div>
                  </div>
                  
                  {/* Lokasi / Alamat */}
                  {(bk as any).alamatLengkap && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3 text-[11px]">
                      <span className="text-slate-500 font-bold block mb-1">Lokasi Penjemputan / Pengantaran</span>
                      <p className="text-slate-800 font-sans leading-relaxed">{(bk as any).alamatLengkap}</p>
                      {((bk as any).latitude && (bk as any).longitude) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${(bk as any).latitude},${(bk as any).longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md font-bold transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          Lihat di Google Maps
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Informasi Pembayaran */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Informasi Pembayaran</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 font-semibold block">Total Tagihan</span>
                      <strong className="text-sm font-black text-slate-900 font-mono mt-1 block">Rp {totalTagihan.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/30">
                      <span className="text-emerald-705 font-semibold block">Sudah Dibayar</span>
                      <strong className="text-sm font-black text-emerald-705 font-mono mt-1 block">Rp {sudahDibayar.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/30 col-span-2 lg:col-span-1">
                      <span className="text-rose-700 font-semibold block">Sisa Tagihan</span>
                      <strong className="text-sm font-black text-rose-700 font-mono mt-1 block">Rp {sisaTagihan.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-slate-400 font-medium">Metode Pembayaran Utama</span>
                      <strong className="block text-slate-800 mt-0.5 font-sans">
                        {bk.metodePembayaran === 'gateway' ? 'Payment Gateway (Midtrans)' : 'Manual'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Status Pembayaran</span>
                      <div className="mt-1">{renderStatusPembayaranBadge(statusPembayaran)}</div>
                    </div>
                  </div>
                </div>

                {/* 3. Riwayat Pembayaran */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Riwayat Pembayaran</h4>
                  {bookingPayments.length === 0 ? (
                    <div className="text-slate-400 italic text-[11px] py-1">Belum ada riwayat transaksi pembayaran tercatat.</div>
                  ) : (
                    <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-2xl border border-slate-100/50 p-3 space-y-2">
                      {bookingPayments.map((p, idx) => (
                        <div key={p.id} className="flex flex-col gap-2 py-2.5 text-[11px] border-b last:border-0 border-slate-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-850 capitalize">
                                {p.tipeBayar === 'dp' ? 'DP (Down Payment)' : p.tipeBayar === 'pelunasan' ? 'Pelunasan' : p.tipeBayar === 'denda' ? 'Denda' : 'Pembayaran Lunas'}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px] block mt-0.5">{p.tanggalBayar} via {p.metode}</span>
                            </div>
                            <div className="text-right">
                              <strong className="font-mono text-slate-950 block">Rp {p.jumlah.toLocaleString('id-ID')}</strong>
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                                p.status === 'disetujui' ? 'bg-green-150 text-green-700' : p.status === 'pending' ? 'bg-yellow-150 text-yellow-750 animate-pulse' : 'bg-red-150 text-red-750'
                              }`}>
                                {p.status === 'disetujui' ? 'Berhasil' : p.status === 'pending' ? 'Pending' : 'Gagal'}
                              </span>
                            </div>
                          </div>
                          
                          {p.buktiTransferUrl && (
                            <div className="mt-1">
                              <a 
                                href={p.buktiTransferUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-650 hover:underline font-semibold block text-[10px]"
                              >
                                📄 Lihat Resi Bukti Transfer
                              </a>
                            </div>
                          )}

                          {p.status === 'pending' && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => handleApprovePayment(p)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2 rounded text-[9.5px] border-0 cursor-pointer transition-colors"
                              >
                                Setujui Pembayaran
                              </button>
                              <button
                                onClick={() => handleDeclinePayment(p)}
                                className="bg-red-650 hover:bg-red-750 text-white font-bold py-1 px-2 rounded text-[9.5px] border-0 cursor-pointer transition-colors"
                              >
                                Tolak Pembayaran
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Form Pelunasan DP */}
                {sisaTagihan > 0 && (
                  <div className="bg-amber-50/30 border border-amber-200/50 rounded-2xl p-5 space-y-3 mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-[12px]">Pelunasan Tagihan</h5>
                        <p className="text-slate-500 text-[10.5px]">Konfirmasi pelunasan sisa tagihan secara manual untuk pembayaran offline.</p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-400 block uppercase">Sisa Tagihan</span>
                        <strong className="text-rose-650 text-sm font-black">Rp {sisaTagihan.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>

                    {!isProcessingPelunasan ? (
                      <button
                        onClick={() => {
                          setIsProcessingPelunasan(true);
                          setNominalDiterima(sisaTagihan);
                          setPelunasanMetode('Transfer');
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-4 rounded-xl text-center cursor-pointer transition-all shadow-xs"
                      >
                        ✅ Proses Pelunasan
                      </button>
                    ) : (
                      <div className="space-y-4 pt-2 border-t border-dashed border-amber-200/60 animate-fade-in text-xs">
                        <div className="space-y-2">
                          <label className="block font-bold text-slate-700">Pilih Metode Pembayaran</label>
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                              <input
                                type="radio"
                                name="pelunasanMetode"
                                checked={pelunasanMetode === 'Transfer'}
                                onChange={() => setPelunasanMetode('Transfer')}
                                className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                              />
                              <span>Transfer Bank</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                              <input
                                type="radio"
                                name="pelunasanMetode"
                                checked={pelunasanMetode === 'QRIS'}
                                onChange={() => setPelunasanMetode('QRIS')}
                                className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                              />
                              <span>QRIS</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                              <input
                                type="radio"
                                name="pelunasanMetode"
                                checked={pelunasanMetode === 'Cash'}
                                onChange={() => setPelunasanMetode('Cash')}
                                className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                              />
                              <span>Cash / Tunai</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-bold text-slate-700">Nominal Diterima (Rp)</label>
                          <input
                            type="number"
                            min="1"
                            max={sisaTagihan}
                            value={nominalDiterima || ''}
                            onChange={(e) => setNominalDiterima(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-[12px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="Masukkan nominal pembayaran..."
                          />
                          <p className="text-[10px] text-slate-400">
                            Masukkan nominal yang diterima di kasir. Maksimal Rp {sisaTagihan.toLocaleString('id-ID')}.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleKonfirmasiPembayaran(bk, pelunasanMetode, nominalDiterima)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-center cursor-pointer flex-1 transition-all"
                          >
                            ✅ Konfirmasi Pembayaran
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsProcessingPelunasan(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-center cursor-pointer transition-all"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedBookingForDetail(null);
                    setIsProcessingPelunasan(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm border-0"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Walk-in Booking Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative my-8 text-xs text-slate-700 border border-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-slate-100 p-4 bg-slate-50 rounded-t-3xl sticky top-0 z-10">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Buat Booking Manual (Walk-in)
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Catat penyewaan pelanggan yang datang langsung secara offline.</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1 border-0 bg-transparent cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <form id="walkInForm" onSubmit={handleWalkInSubmit} className="space-y-4">
                
                {/* Info Customer */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Customer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={walkInCustomerName}
                        onChange={(e) => setWalkInCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama Customer"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">No. WhatsApp <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={walkInCustomerPhone}
                        onChange={(e) => setWalkInCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="08123456789"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Sewa */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Sewa</h4>
                  
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Layanan <span className="text-red-500">*</span></label>
                    <select
                      value={walkInLayanan}
                      onChange={(e) => setWalkInLayanan(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="rental">Sewa Mobil Lepas Kunci</option>
                      <option value="rental_driver">Sewa Mobil + Supir</option>
                      <option value="driver">Sewa Supir Harian Saja</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(walkInLayanan === 'rental' || walkInLayanan === 'rental_driver') && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Pilih Mobil <span className="text-red-500">*</span></label>
                        <select
                          required
                          value={walkInMobilId}
                          onChange={(e) => setWalkInMobilId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Pilih Mobil Tersedia --</option>
                          {allCars.filter(c => (c.status || '').toLowerCase() === 'tersedia' && c.aktif !== false).map(c => (
                            <option key={c.id} value={c.id}>{c.brand} {c.nama} - Rp {c.hargaSewa.toLocaleString('id-ID')}/hari</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(walkInLayanan === 'driver' || walkInLayanan === 'rental_driver') && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Pilih Supir <span className="text-red-500">*</span></label>
                        <select
                          required
                          value={walkInDriverId}
                          onChange={(e) => setWalkInDriverId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Pilih Supir Tersedia --</option>
                          {allDrivers.filter(d => d.status === 'aktif' || d.status === 'istirahat').map(d => (
                            <option key={d.id} value={d.id}>{d.nama} - Rp {d.tarif.toLocaleString('id-ID')}/hari</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mulai <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={walkInStartDate}
                        onChange={(e) => setWalkInStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Selesai <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={walkInEndDate}
                        onChange={(e) => setWalkInEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                      <select
                        value={walkInMetodeBayar}
                        onChange={(e) => setWalkInMetodeBayar(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      >
                        <option value="Transfer">Transfer Bank Offline</option>
                        <option value="QRIS">QRIS Dinamis</option>
                        <option value="Cash">Cash / Tunai</option>
                      </select>
                    </div>
                  </div>
                </div>

                

              </form>
            </div>
            
            <div className="border-t border-slate-100 p-4 bg-white rounded-b-3xl sticky bottom-0 z-10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="walkInForm"
                className="px-5 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl shadow-sm hover:bg-blue-700 transition cursor-pointer border-0"
              >
                Proses Booking & Bayar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

