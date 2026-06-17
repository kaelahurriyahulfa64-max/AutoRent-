import React, { useState, useEffect } from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { Mobil, Driver, Booking, Pembayaran, Invoice, Review, User, CartItem, SystemSettings, AppNotification, Refund } from '../types';
import { 
  Calendar, Clock, Receipt, CreditCard, ChevronRight, User as UserIcon, 
  MapPin, AlertTriangle, Star, CheckCircle, HelpCircle, FileText, UploadCloud, Grid,
  XCircle, Filter, Trash2, Edit2, ShoppingCart, PlusCircle, Check, LayoutDashboard, Bell, Settings, ArrowRight, ShieldCheck, RefreshCw, Send, Sparkles, Home, Info, Car, Printer, Users
} from 'lucide-react';
import { getCarStatus } from '../data';

interface DashboardCustomerProps {
  currentUser: User;
  allCars: Mobil[];
  allDrivers: Driver[];
  bookings: Booking[];
  payments: Pembayaran[];
  invoices: Invoice[];
  reviews: Review[];
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onUpdateBookings: (bookings: Booking[]) => void;
  onUpdatePayments: (payments: Pembayaran[]) => void;
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onProcessGatewayWebhook: (payload: { orderId: string; transactionStatus: string; grossAmount: number; paymentType: string; transactionTime: string; }) => Promise<boolean>;
  onSetActiveTab: (tab: string) => void;
  onUpdateReviews: (reviews: Review[]) => void;
  onUpdateUser: (user: User) => void;
  onUpdateCars: (cars: Mobil[]) => void;
  onUpdateDrivers: (drivers: Driver[]) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning', targetUserId?: string) => void;
  selectedBookingItem: { type: 'rental' | 'driver'; id: string } | null;
  clearBookingSelection: () => void;
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  settings: SystemSettings;
  activeSubTab: string;
  onUpdateActiveSubTab: (subTab: string) => void;
  refunds: Refund[];
  onUpdateRefunds: (refunds: Refund[]) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

// Helper: terjemahan status booking ke Bahasa Indonesia
const statusLabel = (status: string): string => {
  switch (status) {
    case 'pending_dp': return 'Menunggu DP';
    case 'pending_konfirmasi': return 'Verifikasi Admin';
    case 'aktif': return 'Dalam Sewa';
    case 'selesai': return 'Selesai';
    case 'dibatalkan': return 'Dibatalkan';
    case 'menunggu_pembayaran': return 'Menunggu Pembayaran';
    case 'dp_dibayar': return 'DP Dibayar';
    case 'pembayaran_sebagian': return 'Pembayaran Sebagian';
    case 'lunas': return 'Lunas';
    case 'diproses': return 'Diproses';
    case 'disetujui': return 'Disetujui';
    case 'sedang_berjalan': return 'Sedang Berjalan';
    case 'Menunggu Pengambilan': return 'Menunggu Pengambilan';
    case 'Sewa Aktif': return 'Dalam Sewa';
    case 'Dalam Sewa': return 'Dalam Sewa';
    case 'Menunggu Pelunasan Denda': return 'Menunggu Pelunasan Denda';
    case 'Selesai': return 'Selesai';
    default: return status;
  }
};

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'pending_dp': return 'bg-amber-100 text-amber-700';
    case 'pending_konfirmasi': return 'bg-blue-100 text-blue-700 animate-pulse';
    case 'aktif': return 'bg-sky-100 text-sky-700';
    case 'selesai': return 'bg-emerald-100 text-emerald-700';
    case 'dibatalkan': return 'bg-slate-100 text-slate-500';
    case 'menunggu_pembayaran': return 'bg-amber-100 text-amber-700';
    case 'dp_dibayar': return 'bg-teal-100 text-teal-700';
    case 'pembayaran_sebagian': return 'bg-amber-500/10 text-amber-600';
    case 'lunas': return 'bg-emerald-100 text-emerald-700';
    case 'diproses': return 'bg-indigo-100 text-indigo-700';
    case 'disetujui': return 'bg-teal-100 text-teal-700';
    case 'sedang_berjalan': return 'bg-sky-100 text-sky-700';
    case 'Menunggu Pengambilan': return 'bg-indigo-100 text-indigo-750';
    case 'Sewa Aktif': return 'bg-sky-105 text-sky-750';
    case 'Dalam Sewa': return 'bg-sky-105 text-sky-750';
    case 'Menunggu Pelunasan Denda': return 'bg-rose-100 text-rose-700 font-bold';
    case 'Selesai': return 'bg-emerald-100 text-emerald-750';
    default: return 'bg-slate-100 text-slate-500';
  }
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

const getStatusRentalText = (status: string): 'Menunggu Pengambilan' | 'Dalam Sewa' | 'Selesai' | 'Dibatalkan' => {
  if (status === 'selesai' || status === 'Selesai' || status === 'Menunggu Pelunasan Denda') return 'Selesai';
  if (status === 'aktif' || status === 'Sewa Aktif' || status === 'Dalam Sewa' || status === 'sedang_berjalan') return 'Dalam Sewa';
  if (status === 'dibatalkan' || status === 'Dibatalkan' || status === 'Ditolak') return 'Dibatalkan';
  return 'Menunggu Pengambilan';
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

const renderStatusRentalBadge = (status: 'Menunggu Pengambilan' | 'Dalam Sewa' | 'Selesai' | 'Dibatalkan') => {
  switch (status) {
    case 'Selesai':
      return (
        <span className="inline-flex items-center bg-slate-100 text-slate-605 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
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

export default function DashboardCustomer({
  currentUser,
  allCars,
  allDrivers,
  bookings,
  payments,
  invoices,
  reviews,
  notifications,
  onMarkNotificationRead,
  onUpdateBookings,
  onUpdatePayments,
  onUpdateInvoices,
  onProcessGatewayWebhook,
  onSetActiveTab,
  onUpdateReviews,
  onUpdateUser,
  onUpdateCars,
  onUpdateDrivers,
  onAddNotification,
  selectedBookingItem,
  clearBookingSelection,
  cart,
  onUpdateCart,
  settings,
  activeSubTab,
  onUpdateActiveSubTab: setActiveSubTab,
  refunds,
  onUpdateRefunds,
  onShowToast,
  onShowConfirm
}: DashboardCustomerProps) {
  
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [successPaymentNotification, setSuccessPaymentNotification] = useState<{ amount: number; invoiceId: string; bookingId: string } | null>(null);

  const [bookingForRefund, setBookingForRefund] = useState<Booking | null>(null);
  const [refundAlasan, setRefundAlasan] = useState('');
  const [refundCatatan, setRefundCatatan] = useState('');
  const [refundMetode, setRefundMetode] = useState<'Transfer Bank'>('Transfer Bank');
  const [refundBankNama, setRefundBankNama] = useState('');
  const [refundRekeningNomor, setRefundRekeningNomor] = useState('');
  const [refundRekeningNama, setRefundRekeningNama] = useState('');
  const [refundTelepon, setRefundTelepon] = useState('');

  // Create New Booking States
  const [serviceType, setServiceType] = useState<'rental' | 'driver'>('rental');

  useEffect(() => {
    if (activeSubTab === 'rental') {
      setServiceType('rental');
    } else if (activeSubTab === 'driver') {
      setServiceType('driver');
    }
  }, [activeSubTab]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [withDriver, setWithDriver] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('09:00');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end'>('start');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(() => new Date());
  const [selectingDateType, setSelectingDateType] = useState<'start' | 'end'>('start');
  const [tempDateSelected, setTempDateSelected] = useState<string>('');

  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur lokasi GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupLat(position.coords.latitude);
        setPickupLng(position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert('Gagal mengambil lokasi: ' + error.message);
      }
    );
  };


  // New rental package states
  const [selectedPackage, setSelectedPackage] = useState<string>('1d'); // Preset: '12h', '1d', '1.5d', '2d', '3d', '4d', '5d', '6d', '7d', 'custom'
  const [customDays, setCustomDays] = useState<number>(1);
  const [customHours, setCustomHours] = useState<number>(0);

  // Helper function to calculate end date, end time, and duration automatically
  const calculateEndDateTime = (
    sDate: string,
    sTime: string,
    pType: string,
    cDays: number,
    cHours: number
  ) => {
    if (!sDate || !sTime) return { endDate: '', endTime: '', duration: 1 };
    const startObj = parseDateTimeSafe(`${sDate}T${sTime}`);
    let hoursToAdd = 24;
    let duration = 1.0;

    switch (pType) {
      case '12h':
        hoursToAdd = 12;
        duration = 0.5;
        break;
      case '1d':
        hoursToAdd = 24;
        duration = 1.0;
        break;
      case '1.5d':
        hoursToAdd = 36;
        duration = 1.5;
        break;
      case '2d':
        hoursToAdd = 48;
        duration = 2.0;
        break;
      case '3d':
        hoursToAdd = 72;
        duration = 3.0;
        break;
      case '4d':
        hoursToAdd = 96;
        duration = 4.0;
        break;
      case '5d':
        hoursToAdd = 120;
        duration = 5.0;
        break;
      case '6d':
        hoursToAdd = 144;
        duration = 6.0;
        break;
      case '7d':
        hoursToAdd = 168;
        duration = 7.0;
        break;
      case 'custom':
        hoursToAdd = (cDays * 24) + cHours;
        duration = cDays + (cHours / 24);
        break;
      default:
        hoursToAdd = 24;
        duration = 1.0;
    }

    const endObj = new Date(startObj.getTime() + (hoursToAdd * 60 * 60 * 1000));
    
    // Format YYYY-MM-DD
    const endYear = endObj.getFullYear();
    const endMonth = String(endObj.getMonth() + 1).padStart(2, '0');
    const endDateStr = String(endObj.getDate()).padStart(2, '0');
    const calcEndDate = `${endYear}-${endMonth}-${endDateStr}`;
    
    // Format HH:mm
    const calcEndTime = `${String(endObj.getHours()).padStart(2, '0')}:${String(endObj.getMinutes()).padStart(2, '0')}`;

    return {
      endDate: calcEndDate,
      endTime: calcEndTime,
      duration: parseFloat(duration.toFixed(2))
    };
  };

  // Synchronize calculated end date/time
  useEffect(() => {
    if (startDate && startTime) {
      const { endDate: calculatedEndDate, endTime: calculatedEndTime, duration: calculatedDuration } = calculateEndDateTime(
        startDate,
        startTime,
        selectedPackage,
        customDays,
        customHours
      );
      setEndDate(calculatedEndDate);
      setEndTime(calculatedEndTime);
      setDurationDays(calculatedDuration);
    }
  }, [startDate, startTime, selectedPackage, customDays, customHours]);
  


  // Action states
  const [selectedBookingForPay, setSelectedBookingForPay] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentProofName, setPaymentProofName] = useState<string>('');
  const [paymentUploaded, setPaymentUploaded] = useState<boolean>(false);
  const [checkoutPaymentType, setCheckoutPaymentType] = useState<'full' | 'dp'>('full');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'gateway' | 'store'>('gateway');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
   const [cartSelectedIds, setCartSelectedIds] = useState<string[]>([]);
 
   const [isLoadingSnap, setIsLoadingSnap] = useState<boolean>(false);
   const [snapToken, setSnapToken] = useState<string>('');
   const [snapError, setSnapError] = useState<string>('');
   const [activeOrderId, setActiveOrderId] = useState<string>(() => {
     if (typeof window !== 'undefined') {
       return localStorage.getItem('autorent_activeOrderId') || '';
     }
     return '';
   });

  // Save activeOrderId to localStorage whenever it changes
  React.useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('autorent_activeOrderId', activeOrderId);
    } else {
      localStorage.removeItem('autorent_activeOrderId');
    }
  }, [activeOrderId]);
  const [activeTicketBooking, setActiveTicketBooking] = useState<Booking | null>(null);

  // Detail page views states
  const [viewingCarDetailId, setViewingCarDetailId] = useState<string | null>(null);

  const [viewingDriverDetailId, setViewingDriverDetailId] = useState<string | null>(null);
  const [viewingInvoiceDetailId, setViewingInvoiceDetailId] = useState<string | null>(null);

  // Catalog filters states
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [carTypeFilter, setCarTypeFilter] = useState('all');
  const [carTransFilter, setCarTransFilter] = useState('all');
  const [carBrandFilter, setCarBrandFilter] = useState('all');
  const [carMaxPriceFilter, setCarMaxPriceFilter] = useState(10000000);



  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverRatingFilter, setDriverRatingFilter] = useState(0);

  const handleDeleteCartItem = (itemId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) {
      onUpdateCart(cart.filter(item => item.id !== itemId));
      setCartSelectedIds(cartSelectedIds.filter(id => id !== itemId));
      onAddNotification('Item Dihapus', 'Layanan berhasil dihapus dari keranjang belanja.', 'info');
    }
  };

  const handleDeleteSelectedCartItems = () => {
    if (cartSelectedIds.length === 0) return alert('Tidak ada item terpilih!');
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${cartSelectedIds.length} item terpilih dari keranjang?`)) {
      onUpdateCart(cart.filter(item => !cartSelectedIds.includes(item.id)));
      setCartSelectedIds([]);
      onAddNotification('Item Terpilih Dihapus', 'Layanan terpilih berhasil dihapus dari keranjang belanja.', 'info');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh keranjang belanja?')) {
      onUpdateCart(cart.filter(item => item.userId !== currentUser.id));
      setCartSelectedIds([]);
      onAddNotification('Keranjang Dikosongkan', 'Seluruh isi keranjang belanja berhasil dihapus.', 'info');
    }
  };


  // Handle Checkout of selected cart items
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToCheckout = cart.filter(item => 
      item.userId === currentUser.id && 
      (cartSelectedIds.length === 0 ? item.status === 'siap_checkout' : cartSelectedIds.includes(item.id))
    );

    if (itemsToCheckout.length === 0) {
      return alert('Tidak ada item di keranjang yang dipilih untuk checkout!');
    }

    // Check availability one last time before checkout
    for (const item of itemsToCheckout) {
      if (item.mobilId && checkOverlappingBooking(item.mobilId, true, item.tanggalMulai || '', item.tanggalSelesai || '')) {
        return alert(`Armada ${item.mobilNama} sudah disewa customer lain pada tanggal tersebut! Silakan hapus atau edit item di keranjang.`);
      }
      if (item.driverId && checkOverlappingBooking(item.driverId, false, item.tanggalMulai || '', item.tanggalSelesai || '')) {
        return alert(`Driver ${item.driverNama} sudah bertugas pada tanggal tersebut! Silakan hapus atau edit item di keranjang.`);
      }
    }

    setIsCheckingOut(true);

    const generatedBookings: Booking[] = [];
    const generatedPayments: Pembayaran[] = [];
    const generatedInvoices: Invoice[] = [];

    itemsToCheckout.forEach(item => {
      const bId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const bookingCode = `AR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      const totalSewa = Number(item.totalHarga) || 0;
      const safeDpPct = (typeof settings.dpPercentage === 'number' && !isNaN(settings.dpPercentage) && settings.dpPercentage > 0) ? settings.dpPercentage : 30;
      const dpMin = Math.round(totalSewa * (safeDpPct / 100));
      
      let details: Booking = {
        id: bId,
        bookingCode,
        userId: currentUser.id,
        userNama: currentUser.name,
        layanan: item.layanan,
        totalSewa,
        denda: 0,
        totalBayar: totalSewa,
        dpMinimal: dpMin,
        jumlahBayar: 0,
        sisaPelunasan: totalSewa,
        status: 'Menunggu Pembayaran',
        statusPembayaran: 'Belum Bayar',
        tanggalBooking: new Date().toISOString().replace('T', ' ').substring(0, 16),
        jenisPembayaran: checkoutPaymentType === 'dp' ? 'dp' : 'full',
        metodePembayaran: 'gateway',
        paketSewa: item.paketSewa || '1d',
        customDurasiJam: item.customDurasiJam,
        alamatLengkap: item.alamatLengkap,
        latitude: item.latitude,
        longitude: item.longitude
      };

      // Set item-specific fields
      if (item.layanan === 'rental' || item.layanan === 'rental_driver') {
        details.mobilId = item.mobilId;
        details.mobilNama = item.mobilNama;
        details.tanggalMulai = item.tanggalMulai;
        details.tanggalSelesai = item.tanggalSelesai;
        details.durasiHari = item.durasiHari;
        details.denganDriver = item.denganDriver;
        details.driverId = item.driverId;
        details.driverNama = item.driverNama;
      }

      generatedBookings.push(details);
    });

    // Generate Invoice automatically for each booking
    generatedBookings.forEach(bk => {
      const invId = `i_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const rincianText = bk.layanan === 'rental'
        ? `Sewa Lepas Kunci ${bk.mobilNama} (${bk.durasiHari} hari)`
        : `Sewa ${bk.mobilNama} (${bk.durasiHari} hari) + Jasa Driver ${bk.driverNama}`;

      const newInvoice: Invoice = {
        id: invId,
        invoiceCode: `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        userId: bk.userId,
        userNama: bk.userNama,
        layanan: bk.layanan === 'rental' ? 'Rental Mobil' : 'Rental + Driver',
        rincianItem: rincianText,
        subtotal: bk.totalBayar,
        denda: 0,
        total: bk.totalBayar,
        terbayar: 0,
        sisa: bk.totalBayar,
        status: 'belum_bayar',
        tanggalDibuat: new Date().toISOString().substring(0, 10),
        metodePembayaran: 'Payment Gateway'
      };
      generatedInvoices.push(newInvoice);
    });

    // Update global state
    onUpdateBookings([...generatedBookings, ...bookings]);
    onUpdateInvoices([...generatedInvoices, ...invoices]);

    // Update vehicle statuses to Tersedia (payment not yet completed)
    let updatedCarsList = [...allCars];
    itemsToCheckout.forEach(item => {
      if (item.mobilId) {
        updatedCarsList = updatedCarsList.map(c => 
          c.id === item.mobilId ? { ...c, status: 'Tersedia' as const } : c
        );
      }
    });
    onUpdateCars(updatedCarsList);

    // Update cart: remove checked-out items
    const remainingCartItems = cart.filter(item => 
      !(item.userId === currentUser.id && (cartSelectedIds.length === 0 ? item.status === 'siap_checkout' : cartSelectedIds.includes(item.id)))
    );
    onUpdateCart(remainingCartItems);
    setCartSelectedIds([]);

    onAddNotification(
      'Checkout Berhasil', 
      `${itemsToCheckout.length} layanan berhasil dicheckout! Silakan lakukan pembayaran.`, 
      'success'
    );

    setIsCheckingOut(false);
    
    // Redirect appropriately
    if (generatedBookings.length > 0) {
      const firstB = generatedBookings[0];
      const initialAmt = checkoutPaymentType === 'dp' ? firstB.dpMinimal : firstB.totalBayar;
      setSelectedBookingForPay(firstB);
      setPaymentAmount(initialAmt);
      setPaymentMethod('Payment Gateway');
      setActiveSubTab('my-bookings');
    } else {
      setActiveSubTab('my-bookings');
    }
  };
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [editCarId, setEditCarId] = useState('');
  const [editDriverId, setEditDriverId] = useState('');
  const [editWithDriver, setEditWithDriver] = useState(false);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('09:00');
  const [editDurationDays, setEditDurationDays] = useState(1);
  const [editPickupPoint, setEditPickupPoint] = useState('');
  const [editPassengerName, setEditPassengerName] = useState('');
  const [editPassengerPhone, setEditPassengerPhone] = useState('');
  const [editSelectedSeats, setEditSelectedSeats] = useState<number[]>([]);

  const handleStartEditCartItem = (item: CartItem) => {
    setEditingCartItem(item);
    setEditCarId(item.mobilId || '');
    setEditDriverId(item.driverId || '');
    setEditWithDriver(item.denganDriver || false);
    
    const startParts = (item.tanggalMulai || '').split('T');
    const endParts = (item.tanggalSelesai || '').split('T');
    
    setEditStartDate(startParts[0] || '');
    setEditStartTime(startParts[1] || '09:00');
    setEditEndDate(endParts[0] || '');
    setEditEndTime(endParts[1] || '09:00');
    setEditDurationDays(item.durasiHari || 1);
  };

  const handleSaveCartEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCartItem) return;

    const otherBookings = bookings;
    const otherCart = cart.filter(item => item.id !== editingCartItem.id);

    const startDateTimeStr = `${editStartDate}T${editStartTime}`;
    const endDateTimeStr = `${editEndDate}T${editEndTime}`;

    const checkOverlapEdit = (id: string, isCar: boolean, startStr: string, endStr: string): boolean => {
      if (!startStr || !endStr) return false;
      const start = parseDateTimeSafe(startStr);
      const end = parseDateTimeSafe(endStr);
      
      const hasBookingOverlap = otherBookings.some(b => {
        if (b.status === 'dibatalkan' || b.status === 'selesai' || b.status === 'Selesai') return false;
        const targetId = isCar ? b.mobilId : b.driverId;
        if (targetId !== id) return false;
        if (!b.tanggalMulai || !b.tanggalSelesai) return false;
        const bStart = parseDateTimeSafe(b.tanggalMulai);
        const bEnd = parseDateTimeSafe(b.tanggalSelesai);
        return (start < bEnd && end > bStart);
      });

      const hasCartOverlap = otherCart.some(item => {
        if (item.userId !== currentUser.id || item.status === 'checkout' || item.status === 'dibatalkan') return false;
        const targetId = isCar ? item.mobilId : item.driverId;
        if (targetId !== id) return false;
        if (!item.tanggalMulai || !item.tanggalSelesai) return false;
        const cStart = parseDateTimeSafe(item.tanggalMulai);
        const cEnd = parseDateTimeSafe(item.tanggalSelesai);
        return (start < cEnd && end > cStart);
      });

      return hasBookingOverlap || hasCartOverlap;
    };

    if (editingCartItem.layanan === 'rental' || editingCartItem.layanan === 'rental_driver') {
      if (!editCarId) return alert('Silakan pilih mobil');
      if (!editStartDate || !editEndDate) return alert('Tanggal wajib diisi!');
      
      const startDt = parseDateTimeSafe(startDateTimeStr);
      const endDt = parseDateTimeSafe(endDateTimeStr);
      if (endDt <= startDt) return alert('Tanggal & jam selesai harus setelah tanggal & jam mulai!');

      if (checkOverlapEdit(editCarId, true, startDateTimeStr, endDateTimeStr)) {
        return alert('Armada mobil yang dipilih sudah disewa/ada di keranjang pada tanggal dan jam tersebut!');
      }
      if (editWithDriver && editDriverId) {
        if (checkOverlapEdit(editDriverId, false, startDateTimeStr, endDateTimeStr)) {
          return alert('Driver yang dipilih sudah bertugas/ada di keranjang pada tanggal dan jam tersebut!');
        }
      }
    }

    if (editingCartItem.layanan === 'driver') {
      if (!editDriverId) return alert('Silakan pilih driver');
      if (!editStartDate || !editEndDate) return alert('Tanggal wajib diisi!');
      
      const startDt = parseDateTimeSafe(startDateTimeStr);
      const endDt = parseDateTimeSafe(endDateTimeStr);
      if (endDt <= startDt) return alert('Tanggal & jam selesai harus setelah tanggal & jam mulai!');

      if (checkOverlapEdit(editDriverId, false, startDateTimeStr, endDateTimeStr)) {
        return alert('Driver yang dipilih sudah bertugas/ada di keranjang pada tanggal dan jam tersebut!');
      }
    }

    // Recalculate price
    let editPrice = 0;
    if (editingCartItem.layanan === 'rental' || editingCartItem.layanan === 'rental_driver') {
      const car = allCars.find(c => c.id === editCarId);
      editPrice = (car?.hargaSewa || 0) * editDurationDays;
      if (editWithDriver && editDriverId) {
        const d = allDrivers.find(dr => dr.id === editDriverId);
        editPrice += (d?.tarifPerHari || 0) * editDurationDays;
      }
    } else if (editingCartItem.layanan === 'driver') {
      const d = allDrivers.find(dr => dr.id === editDriverId);
      editPrice = (d?.tarifPerHari || 0) * editDurationDays;
    }

    const updatedCart = cart.map(item => {
      if (item.id === editingCartItem.id) {
        let updated: CartItem = {
          ...item,
          totalHarga: editPrice,
        };
        if (item.layanan === 'rental' || item.layanan === 'rental_driver') {
          const car = allCars.find(c => c.id === editCarId);
          updated.mobilId = editCarId;
          updated.mobilNama = car?.nama;
          updated.tanggalMulai = startDateTimeStr;
          updated.tanggalSelesai = endDateTimeStr;
          updated.durasiHari = editDurationDays;
          updated.denganDriver = editWithDriver;
          updated.layanan = editWithDriver ? 'rental_driver' : 'rental';
          if (editWithDriver && editDriverId) {
            const d = allDrivers.find(dr => dr.id === editDriverId);
            updated.driverId = editDriverId;
            updated.driverNama = d?.nama;
          } else {
            updated.driverId = undefined;
            updated.driverNama = undefined;
          }
        } else if (item.layanan === 'driver') {
          const d = allDrivers.find(dr => dr.id === editDriverId);
          updated.driverId = editDriverId;
          updated.driverNama = d?.nama;
          updated.tanggalMulai = startDateTimeStr;
          updated.tanggalSelesai = endDateTimeStr;
          updated.durasiHari = editDurationDays;
        }
        return updated;
      }
      return item;
    });

    onUpdateCart(updatedCart);
    setEditingCartItem(null);
    onAddNotification('Keranjang Diubah', 'Item keranjang belanja berhasil diperbarui.', 'success');
  };
  // Load Snap JS script dynamically based on isProduction setting
  React.useEffect(() => {
    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    const snapScriptUrl = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
      
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    if (!clientKey) return;
    
    // Check if script already exists
    let script = document.querySelector(`script[src="${snapScriptUrl}"]`) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Generate Snap Token securely using the Vercel function /api/midtrans-snap-token
  React.useEffect(() => {
    if (selectedBookingForPay && paymentMethod === 'Payment Gateway') {
      setIsLoadingSnap(true);
      setSnapToken('');
      setSnapError('');

      const generateToken = async (useExisting: boolean) => {
        const orderId = (useExisting && selectedBookingForPay.midtransOrderId)
          ? selectedBookingForPay.midtransOrderId
          : `${selectedBookingForPay.bookingCode}-${Date.now().toString().slice(-4)}`;
        
        setActiveOrderId(orderId);
        if (orderId !== selectedBookingForPay.midtransOrderId) {
          onUpdateBookings(bookings.map(b => b.id === selectedBookingForPay.id ? { ...b, midtransOrderId: orderId } : b));
        }

        try {
          const response = await fetch('/api/midtrans-snap-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId,
              grossAmount: paymentAmount
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            // If order ID is already taken, retry with a new orderId
            if (useExisting && (response.status === 400 || (errData.error && errData.error.includes('created')))) {
              console.log('Order ID already created on Midtrans. Regenerating order ID...');
              await generateToken(false);
              return;
            }
            throw new Error(errData.error || errData.detail || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data && data.token) {
            setSnapToken(data.token);
          } else {
            throw new Error('Snap token tidak ditemukan dalam respon.');
          }
        } catch (error: any) {
          console.error('Error generating Midtrans Snap token:', error);
          setSnapError(error.message || 'Gagal membuat token pembayaran');
          setSnapToken('');
        } finally {
          setIsLoadingSnap(false);
        }
      };

      // Try using existing midtransOrderId first if it exists
      generateToken(true);
    }
  }, [selectedBookingForPay, paymentMethod, paymentAmount]);

  const openSnapPopup = () => {
    if (!snapToken) return;
    
    const snap = (window as any).snap;
    if (!snap) {
      alert('Midtrans Snap JS belum terload dengan sempurna. Silakan tunggu sebentar atau muat ulang halaman.');
      return;
    }
    
    snap.pay(snapToken, {
      onSuccess: async (result: any) => {
        console.log('Payment success:', result);
        onShowToast('Pembayaran berhasil diproses!', 'success');
        
        // Process webhook payload via App.tsx orchestrator
        const processed = await onProcessGatewayWebhook({
          orderId: result.order_id,
          transactionStatus: 'settlement',
          grossAmount: Number(result.gross_amount),
          paymentType: result.payment_type || 'Payment Gateway',
          transactionTime: result.transaction_time || new Date().toISOString()
        });

        if (processed) {
          // Also call our middleware server-side webhook endpoint for logging
          fetch('/api/midtrans-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: result.order_id,
              transaction_status: 'settlement',
              gross_amount: result.gross_amount,
              payment_type: result.payment_type,
              transaction_time: result.transaction_time || new Date().toISOString()
            })
          }).catch(() => {});
        }

        // Navigate to invoice tab with a brief delay
        setTimeout(() => {
          if (selectedBookingForPay) {
            setViewingInvoiceDetailId(selectedBookingForPay.id);
            onSetActiveTab('invoice');
            setActiveSubTab('invoice-detail');
          }
          setActiveOrderId('');
          setSnapToken('');
          setSelectedBookingForPay(null);
        }, 1500);
      },
      onPending: (result: any) => {
        console.log('Payment pending:', result);
        onShowToast('Pembayaran menunggu penyelesaian.', 'info');
      },
      onError: (result: any) => {
        console.error('Payment error:', result);
        onShowToast('Pembayaran gagal dilakukan.', 'error');
      },
      onClose: () => {
        console.log('Customer closed the payment popup without finishing payment.');
        onShowToast('Pembayaran dibatalkan oleh pengguna.', 'info');
      }
    });
  };

  // Review states
  const [submittingReviewFor, setSubmittingReviewFor] = useState<{ id: string; nama: string; tipe: 'mobil' | 'driver' } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');

  // Perpanjangan (Extension) states
  const [extendingBooking, setExtendingBooking] = useState<Booking | null>(null);
  const [extensionDays, setExtensionDays] = useState<number>(1);

  // Profile states
  const [profileName, setProfileName] = useState<string>(currentUser.name);
  const [profilePhone, setProfilePhone] = useState<string>(currentUser.phone);
  const [profileAddress, setProfileAddress] = useState<string>(currentUser.address || '');
  const [profileNik, setProfileNik] = useState<string>(currentUser.nik || '');
  const [profileSim, setProfileSim] = useState<string>(currentUser.sim || '');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Review states
  const [reviewModalData, setReviewModalData] = useState<Booking | null>(null);
  const [ratingMobil, setRatingMobil] = useState<number>(5);
  const [ulasanMobil, setUlasanMobil] = useState<string>('');
  const [ratingDriver, setRatingDriver] = useState<number>(5);
  const [ulasanDriver, setUlasanDriver] = useState<string>('');

  // Pre-fill selected booking from Landing page shortcut
  React.useEffect(() => {
    if (selectedBookingItem) {
      setActiveSubTab('book-new');
      setServiceType(selectedBookingItem.type);
      if (selectedBookingItem.type === 'rental') {
        setSelectedCarId(selectedBookingItem.id);
        setWithDriver(false);
      } else if (selectedBookingItem.type === 'driver') {
        setSelectedDriverId(selectedBookingItem.id);
      }
      clearBookingSelection();
    }
  }, [selectedBookingItem, clearBookingSelection]);

  // Recalculate duration when date input changes (including times)
  const handleDateChange = (sDate: string, sTime: string, eDate: string, eTime: string) => {
    if (sDate && eDate) {
      const startStr = sTime ? `${sDate}T${sTime}` : `${sDate}T09:00`;
      const endStr = eTime ? `${eDate}T${eTime}` : `${eDate}T09:00`;
      const d1 = parseDateTimeSafe(startStr);
      const d2 = parseDateTimeSafe(endStr);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDurationDays(diffDays > 0 ? diffDays : 1);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 7; h <= 22; h++) {
      const hourStr = String(h).padStart(2, '0');
      const maxMin = h === 22 ? 0 : 55;
      for (let m = 0; m <= maxMin; m += 5) {
        const minStr = String(m).padStart(2, '0');
        slots.push(`${hourStr}:${minStr}`);
      }
    }
    return slots;
  };

  const isTimeSlotCartConflict = (id: string, isCar: boolean, dateStr: string, hourStr: string): boolean => {
    const slotStr = `${dateStr}T${hourStr}`;
    const slotTime = parseDateTimeSafe(slotStr);
    return cart.some(item => {
      if (item.userId !== currentUser.id || item.status === 'checkout' || item.status === 'dibatalkan') return false;
      const targetId = isCar ? item.mobilId : item.driverId;
      if (targetId !== id) return false;
      if (!item.tanggalMulai || !item.tanggalSelesai) return false;
      const cStart = parseDateTimeSafe(item.tanggalMulai);
      const cEnd = parseDateTimeSafe(item.tanggalSelesai);
      return (slotTime >= cStart && slotTime < cEnd);
    });
  };

  const getAvailabilityStatus = (dayStr: string, id: string, isCar: boolean): 'past' | 'booked' | 'pending' | 'available' => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dayStr < todayStr) return 'past';

    // We can define the day start and day end
    const dayStart = parseDateTimeSafe(`${dayStr}T00:00`);
    const dayEnd = parseDateTimeSafe(`${dayStr}T23:59`);

    // Find overlapping bookings
    const activeBookings = bookings.filter(b => {
      const statusLower = b.status.toLowerCase();
      if (statusLower === 'dibatalkan' || statusLower === 'selesai' || statusLower === 'ditolak') return false;
      const targetId = isCar ? b.mobilId : b.driverId;
      if (targetId !== id) return false;
      if (!b.tanggalMulai || !b.tanggalSelesai) return false;
      
      const bStart = parseDateTimeSafe(b.tanggalMulai);
      const bEnd = parseDateTimeSafe(b.tanggalSelesai);
      
      // Overlap checking: the booking interval overlaps with the day interval
      return (bStart < dayEnd && bEnd > dayStart);
    });

    if (activeBookings.length === 0) {
      return 'available';
    }

    // Check if any booking is confirmed/paid vs pending
    const hasRed = activeBookings.some(b => 
      ['Lunas', 'Sewa Aktif', 'Dalam Sewa', 'DP Dibayar', 'aktif', 'lunas', 'dp_dibayar', 'disetujui', 'sedang_berjalan', 'Lunas', 'Sewa Aktif', 'Dalam Sewa'].includes(b.status)
    );
    if (hasRed) return 'booked';

    const hasYellow = activeBookings.some(b => 
      ['Menunggu Pembayaran', 'pending_dp', 'menunggu_pembayaran', 'Menunggu Verifikasi Admin', 'pending_konfirmasi'].includes(b.status)
    );
    if (hasYellow) return 'pending';

    return 'booked'; // Fallback to booked
  };

  // Calendar helper calculations
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleCalendarPrevMonth = () => {
    setCurrentCalendarMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleCalendarNextMonth = () => {
    setCurrentCalendarMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const renderCustomCalendar = (targetId: string, isCar: boolean) => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    
    // Create grid array
    const gridCells = [];
    
    // Blank cells before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      gridCells.push(null);
    }
    
    // Day cells
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      gridCells.push(dayStr);
    }

    return (
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 select-none">
        {/* Calendar Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-200/40">
          <button
            type="button"
            onClick={handleCalendarPrevMonth}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer text-slate-650 font-bold"
          >
            &larr;
          </button>
          <span className="font-extrabold text-slate-800 text-xs tracking-wide uppercase">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleCalendarNextMonth}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer text-slate-650 font-bold"
          >
            &rarr;
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase">
          {daysOfWeek.map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {gridCells.map((cell, idx) => {
            if (cell === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }
            
            const dayNum = parseInt(cell.split('-')[2], 10);
            const status = getAvailabilityStatus(cell, targetId, isCar);
            
            let bgClass = 'bg-slate-100 text-slate-350 cursor-not-allowed';
            let titleText = 'Tidak dapat dipilih';
            let isClickable = false;

            if (status === 'available') {
              bgClass = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/40 cursor-pointer font-bold';
              titleText = 'Tersedia';
              isClickable = true;
            } else if (status === 'booked') {
              bgClass = 'bg-rose-50 text-rose-500 border border-rose-200/20 cursor-not-allowed line-through';
              titleText = 'Sudah Disewa';
            } else if (status === 'pending') {
              bgClass = 'bg-amber-50 text-amber-600 border border-amber-250/20 cursor-not-allowed';
              titleText = 'Menunggu Pembayaran';
            }

            // Highlight selected start and end dates
            const isSelectedStart = startDate === cell;
            const isSelectedEnd = endDate === cell;
            if (isSelectedStart) {
              bgClass = 'bg-blue-600 text-white font-black border border-blue-600 shadow-sm shadow-blue-500/20 scale-105 transition-all cursor-pointer';
              isClickable = true;
            } else if (isSelectedEnd) {
              bgClass = 'bg-violet-650 text-white font-semibold border border-violet-500 shadow-xs scale-105 transition-all';
              // calculated end is not clickable
            }

            return (
              <button
                key={cell}
                type="button"
                title={titleText}
                disabled={!isClickable}
                onClick={() => {
                  if (status !== 'available' && !isSelectedStart) return;
                  setTempDateSelected(cell);
                  setTimePickerTarget('start');
                  setIsTimePickerOpen(true);
                }}
                className={`aspect-square rounded-xl flex items-center justify-center text-[11px] transition-all ${bgClass}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 pt-2 border-t border-slate-200/30 text-[9px] text-slate-500 font-medium leading-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Tersedia (Hijau)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span>Disewa (Merah)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
            <span>Menunggu (Kuning)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span>
            <span>Lewat (Abu)</span>
          </div>
        </div>
      </div>
    );
  };

  // Helper calculation for total dynamic costs
  const calculateEstimate = () => {
    let rentalCost = 0;
    let driverCost = 0;
    
    if (serviceType === 'rental' && selectedCarId) {
      const car = allCars.find(c => c.id === selectedCarId);
      rentalCost = (car?.hargaSewa || 0) * durationDays;
      if (withDriver && selectedDriverId) {
        const d = allDrivers.find(dr => dr.id === selectedDriverId);
        driverCost = (d?.tarifPerHari || 0) * durationDays;
      }
    }

    return rentalCost + driverCost;
  };



  const parseDateTimeSafe = (dateTimeStr: string): Date => {
    if (!dateTimeStr) return new Date();
    const normalized = dateTimeStr.includes('T') ? dateTimeStr : dateTimeStr.replace(' ', 'T');
    const finalStr = normalized.length === 10 ? `${normalized}T00:00:00` : normalized.length === 16 ? `${normalized}:00` : normalized;
    return new Date(finalStr);
  };

  const checkOverlappingBooking = (id: string, isCar: boolean, startStr: string, endStr: string): boolean => {
    if (!startStr || !endStr) return false;
    const start = parseDateTimeSafe(startStr);
    const end = parseDateTimeSafe(endStr);
    return bookings.some(b => {
      const statusLower = b.status.toLowerCase();
      if (statusLower === 'dibatalkan' || statusLower === 'selesai' || statusLower === 'ditolak') return false;
      const targetId = isCar ? b.mobilId : b.driverId;
      if (targetId !== id) return false;
      if (!b.tanggalMulai || !b.tanggalSelesai) return false;
      const bStart = parseDateTimeSafe(b.tanggalMulai);
      const bEnd = parseDateTimeSafe(b.tanggalSelesai);
      return (start < bEnd && end > bStart);
    });
  };

  const checkCartConflict = (id: string, isCar: boolean, startStr: string, endStr: string): boolean => {
    if (!startStr || !endStr) return false;
    const start = parseDateTimeSafe(startStr);
    const end = parseDateTimeSafe(endStr);
    return cart.some(item => {
      if (item.userId !== currentUser.id || item.status === 'checkout' || item.status === 'dibatalkan') return false;
      const targetId = isCar ? item.mobilId : item.driverId;
      if (targetId !== id) return false;
      if (!item.tanggalMulai || !item.tanggalSelesai) return false;
      const cStart = parseDateTimeSafe(item.tanggalMulai);
      const cEnd = parseDateTimeSafe(item.tanggalSelesai);
      return (start < cEnd && end > cStart);
    });
  };

  const isTimeSlotBooked = (id: string, isCar: boolean, dateStr: string, hourStr: string): boolean => {
    const slotStr = `${dateStr}T${hourStr}`;
    const slotTime = parseDateTimeSafe(slotStr);
    return bookings.some(b => {
      if (b.status === 'dibatalkan' || b.status === 'selesai' || b.status === 'Selesai') return false;
      const targetId = isCar ? b.mobilId : b.driverId;
      if (targetId !== id) return false;
      if (!b.tanggalMulai || !b.tanggalSelesai) return false;
      const bStart = parseDateTimeSafe(b.tanggalMulai);
      const bEnd = parseDateTimeSafe(b.tanggalSelesai);
      return (slotTime >= bStart && slotTime < bEnd);
    });
  };

  // Submit New Item to Cart
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTimeStr = `${startDate}T${startTime}`;
    const endDateTimeStr = `${endDate}T${endTime}`;

    // Validasi dasar
    if (serviceType === 'rental') {
      if (!selectedCarId) return alert('Silakan pilih mobil');
      if (!startDate || !endDate) return alert('Tanggal mulai dan selesai wajib diisi!');
      
      const startDt = parseDateTimeSafe(startDateTimeStr);
      const endDt = parseDateTimeSafe(endDateTimeStr);
      if (endDt <= startDt) return alert('Tanggal & jam selesai harus setelah tanggal & jam mulai!');
      
      // Double Booking Check (Conflict Check)
      if (checkOverlappingBooking(selectedCarId, true, startDateTimeStr, endDateTimeStr)) {
        return alert('Armada mobil yang dipilih sudah disewa customer lain pada tanggal dan jam tersebut! Silakan pilih armada atau waktu lain.');
      }
      if (checkCartConflict(selectedCarId, true, startDateTimeStr, endDateTimeStr)) {
        return alert('Armada mobil yang dipilih sudah ada di keranjang untuk tanggal dan jam tersebut!');
      }
      if (withDriver && selectedDriverId) {
        if (checkOverlappingBooking(selectedDriverId, false, startDateTimeStr, endDateTimeStr)) {
          return alert('Driver yang dipilih sudah bertugas pada tanggal dan jam tersebut! Silakan pilih supir atau waktu lain.');
        }
        if (checkCartConflict(selectedDriverId, false, startDateTimeStr, endDateTimeStr)) {
          return alert('Driver yang dipilih sudah ada di keranjang untuk tanggal dan jam tersebut!');
        }
      }
    }



    setIsSubmitting(true);

    const cId = `cart_${Date.now()}`;
    const estimateTotal = calculateEstimate();

    let newItem: CartItem = {
      id: cId,
      userId: currentUser.id,
      layanan: withDriver ? 'rental_driver' : 'rental',
      totalHarga: estimateTotal,
      status: 'siap_checkout',
      paketSewa: selectedPackage,
      customDurasiJam: selectedPackage === 'custom' ? customHours : undefined,
      jenisPembayaran: 'full', // default, will be overridden during checkout
      metodePembayaran: 'gateway' // default, will be overridden during checkout
    };

    if (serviceType === 'rental') {
      const car = allCars.find(c => c.id === selectedCarId);
      newItem.mobilId = selectedCarId;
      newItem.mobilNama = car?.nama;
      newItem.tanggalMulai = startDateTimeStr;
      newItem.tanggalSelesai = endDateTimeStr;
      newItem.durasiHari = durationDays;
      newItem.denganDriver = withDriver;

      newItem.latitude = withDriver ? pickupLat : undefined;
      newItem.longitude = withDriver ? pickupLng : undefined;
      if (withDriver && selectedDriverId) {
        const d = allDrivers.find(dr => dr.id === selectedDriverId);
        newItem.driverId = selectedDriverId;
        newItem.driverNama = d?.nama;
      }
    }

    const newCart = [newItem, ...cart];
    onUpdateCart(newCart);

    onAddNotification(
      'Item Ditambahkan ke Keranjang', 
      `Layanan ${newItem.layanan.replace('_', ' + ')} berhasil dimasukkan ke keranjang belanja Anda.`, 
      'success'
    );

    // Reset fields
    setSelectedCarId('');
    setSelectedDriverId('');
    setWithDriver(false);
    setStartDate('');
    setStartTime('09:00');
    setEndDate('');
    setEndTime('09:00');
    setDurationDays(1);
    setSelectingDateType('start');
    setPickupLat(undefined);
    setPickupLng(undefined);
    
    // Auto redirect to cart sub tab
    setActiveSubTab('cart');
    setTimeout(() => setIsSubmitting(false), 500);
  };

  // Submit simulated payment (without file upload)
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isDenda = selectedBookingForPay.statusPembayaran === 'Menunggu Pelunasan Denda' || selectedBookingForPay.status === 'Menunggu Pelunasan Denda';
    const resolvedTipeBayar = isDenda ? 'denda' : (paymentAmount >= selectedBookingForPay.totalBayar ? 'lunas_full' : 'dp');
    const pId = `p_${Date.now()}`;
    const isGateway = paymentMethod === 'Payment Gateway';

    const newPayment: Pembayaran = {
      id: pId,
      bookingId: selectedBookingForPay.id,
      bookingCode: selectedBookingForPay.bookingCode,
      userId: currentUser.id,
      userNama: currentUser.name,
      tipeBayar: resolvedTipeBayar,
      jumlah: paymentAmount,
      metode: 'Payment Gateway',
      buktiTransferUrl: '', // No file upload
      tanggalBayar: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'disetujui'
    };

    onUpdatePayments([newPayment, ...payments]);

    const totalFinal = selectedBookingForPay.totalAkhir || selectedBookingForPay.totalBayar || 0;
    const newJumlahBayar = selectedBookingForPay.jumlahBayar + paymentAmount;
    const newSisa = Math.max(0, totalFinal - newJumlahBayar);
    const isLunas = newSisa <= 0;

    // Update booking status
    const updatedBookings = bookings.map(b => {
      if (b.id === selectedBookingForPay.id) {
        if (isGateway) {
          return { 
            ...b, 
            status: isDenda 
              ? (isLunas ? 'Selesai' as const : 'Menunggu Pelunasan Denda' as const)
              : ('Menunggu Pengambilan' as const),
            statusPembayaran: isLunas ? ('Lunas' as const) : (isDenda ? ('Menunggu Pelunasan Denda' as const) : ('DP Dibayar' as const)),
            jumlahBayar: newJumlahBayar,
            sisaPelunasan: newSisa,
            statusDenda: isDenda ? (isLunas ? ('Sudah Dibayar' as const) : ('Belum Dibayar' as const)) : b.statusDenda
          };
        } else {
          return { 
            ...b, 
            status: isDenda ? ('Menunggu Pelunasan Denda' as const) : ('Menunggu Verifikasi Admin' as const),
            statusPembayaran: 'Menunggu Verifikasi Admin' as const
          }; // Awaiting admin offline confirmation
        }
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // Update Invoice
    if (isGateway) {
      // If an invoice doesn't exist yet for this booking, create it now
      const inv = invoices.find(i => i.bookingId === selectedBookingForPay.id);
      if (!inv) {
        const invId = `i_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        const rincianText = selectedBookingForPay.layanan === 'rental'
          ? `Sewa Lepas Kunci ${selectedBookingForPay.mobilNama} (${selectedBookingForPay.durasiHari} hari)`
          : `Sewa ${selectedBookingForPay.mobilNama} (${selectedBookingForPay.durasiHari} hari) + Jasa Driver ${selectedBookingForPay.driverNama}`;

        const terbayar = paymentAmount;
        const total = selectedBookingForPay.totalBayar;
        const sisa = Math.max(0, total - terbayar);
        const statusInv = terbayar >= total ? 'lunas' : 'terbit';

        const newInvoice: Invoice = {
          id: invId,
          invoiceCode: `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
          bookingId: selectedBookingForPay.id,
          bookingCode: selectedBookingForPay.bookingCode,
          userId: currentUser.id,
          userNama: currentUser.name,
          layanan: selectedBookingForPay.layanan === 'rental' ? 'Rental Mobil' : 'Rental + Driver',
          rincianItem: rincianText,
          subtotal: total,
          denda: 0,
          total: total,
          terbayar: terbayar,
          sisa: sisa,
          status: statusInv as any,
          tanggalDibuat: new Date().toISOString().substring(0, 10),
          metodePembayaran: newPayment.metode,
          tanggalPembayaran: newPayment.tanggalBayar
        };

        onUpdateInvoices([newInvoice, ...invoices]);
      } else {
        // Update existing invoice
        const updatedInvoices = invoices.map(i => {
          if (i.bookingId === selectedBookingForPay.id) {
            return {
              ...i,
              terbayar: i.terbayar + paymentAmount,
              sisa: newSisa,
              status: isLunas ? ('lunas' as const) : i.status
            };
          }
          return i;
        });
        onUpdateInvoices(updatedInvoices);
      }

      if (!isDenda && selectedBookingForPay.mobilId) {
        const updatedCars = allCars.map(c => {
          if (c.id === selectedBookingForPay.mobilId) return { ...c, status: 'Disewa' as const };
          return c;
        });
        onUpdateCars(updatedCars);
      }

      if (selectedBookingForPay.driverId) {
        const updatedDrivers = allDrivers.map(dr => {
          if (dr.id === selectedBookingForPay.driverId) return { ...dr, status: 'booking' as const };
          return dr;
        });
        onUpdateDrivers(updatedDrivers);
      }
    }

    onAddNotification(
      'Pembayaran Berhasil', 
      `Pembayaran Gateway booking ${selectedBookingForPay.bookingCode} berhasil diverifikasi.`, 
      'info'
    );

    setSelectedBookingForPay(null);
  };

  // Poll Midtrans status API directly dari client tidak diperlukan lagi.
  // Polling ini sudah digantikan oleh poller di App.tsx yang memproses db_webhooks.json secara terpusat
  // sehingga mencegah race condition yang merusak data.

  // Synchronize payment status updates from parent/webhooks (e.g. Simulator webhook or Sandbox webhook parsed by App.tsx)
  React.useEffect(() => {
    if (!selectedBookingForPay) return;
    
    // Find the latest version of this booking from the bookings prop
    const updatedBooking = bookings.find(b => b.id === selectedBookingForPay.id);
    if (!updatedBooking) return;
    
    // If the amount paid has increased
    if (updatedBooking.jumlahBayar > selectedBookingForPay.jumlahBayar) {
      const addedAmount = updatedBooking.jumlahBayar - selectedBookingForPay.jumlahBayar;
      
      // Look for the corresponding invoice
      const matchingInvoice = invoices.find(i => i.bookingId === updatedBooking.id);
      const invoiceId = matchingInvoice ? matchingInvoice.id : `i_${Date.now()}`;
      
      // Auto redirect to invoice detail page
      setViewingInvoiceDetailId(updatedBooking.id);
      setActiveSubTab('invoice-detail');
      
      // Show success modal overlay
      setSuccessPaymentNotification({
        amount: addedAmount,
        invoiceId: invoiceId,
        bookingId: updatedBooking.id
      });
      
      // Clean up payment active state
      setSelectedBookingForPay(null);
      setSnapToken('');
      setActiveOrderId('');
    }
  }, [bookings, invoices, selectedBookingForPay]);

  // Submit Review Feedback
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingReviewFor || !reviewText.trim()) return;

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      userId: currentUser.id,
      userNama: currentUser.name,
      userAvatar: currentUser.avatar,
      targetId: submittingReviewFor.id,
      targetNama: submittingReviewFor.nama,
      tipe: submittingReviewFor.tipe,
      rating: reviewRating,
      ulasan: reviewText,
      tanggal: new Date().toISOString().substring(0, 10)
    };

    onUpdateReviews([newRev, ...reviews]);

    // Update driver rating dynamically if reviewed
    if (newRev.tipe === 'driver') {
      const driverReviews = [newRev, ...reviews].filter(r => r.targetId === newRev.targetId && r.tipe === 'driver');
      const totalRating = driverReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = Number((totalRating / driverReviews.length).toFixed(1));
      
      const updatedDrivers = allDrivers.map(d => {
        if (d.id === newRev.targetId) {
          return {
            ...d,
            rating: avg,
            reviewCount: driverReviews.length
          };
        }
        return d;
      });
      onUpdateDrivers(updatedDrivers);
    }

    onAddNotification('Ulasan Dipublikasikan', `Terima kasih atas ulasan bintang ${reviewRating} Anda untuk ${submittingReviewFor.nama}!`, 'success');

    setSubmittingReviewFor(null);
    setReviewText('');
    setReviewRating(5);
  };

  // Submit Extension Request
  const handleExtendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingBooking) return;

    let ratePerDay = 0;
    if (extendingBooking.mobilId) {
      const car = allCars.find(c => c.id === extendingBooking.mobilId);
      ratePerDay += car?.hargaSewa || 0;
    }
    if (extendingBooking.driverId) {
      const dri = allDrivers.find(d => d.id === extendingBooking.driverId);
      ratePerDay += dri?.tarifPerHari || 0;
    }

    const addedCost = ratePerDay * extensionDays;
    const updatedBookings = bookings.map(b => {
      if (b.id === extendingBooking.id) {
        const originalEnd = b.tanggalSelesai ? new Date(b.tanggalSelesai) : new Date();
        originalEnd.setDate(originalEnd.getDate() + extensionDays);
        const newEndStr = originalEnd.toISOString().substring(0, 10);

        return {
          ...b,
          durasiHari: (b.durasiHari || 0) + extensionDays,
          tanggalSelesai: newEndStr,
          totalSewa: b.totalSewa + addedCost,
          totalBayar: b.totalBayar + addedCost,
          sisaPelunasan: b.sisaPelunasan + addedCost
        };
      }
      return b;
    });

    onUpdateBookings(updatedBookings);

    const updatedInvoices = invoices.map(i => {
      if (i.bookingId === extendingBooking.id) {
        return {
          ...i,
          rincianItem: i.rincianItem + ` + Perpanjangan ${extensionDays} Hari`,
          subtotal: i.subtotal + addedCost,
          total: i.total + addedCost,
          sisa: i.sisa + addedCost,
          status: 'belum_bayar' as const
        };
      }
      return i;
    });
    onUpdateInvoices(updatedInvoices);

    onAddNotification(
      'Perpanjangan Ditambahkan', 
      `Penambahan ${extensionDays} hari sewa untuk ${extendingBooking.bookingCode} berhasil diajukan (+Rp ${addedCost.toLocaleString('id-ID')})`, 
      'success'
    );

    setExtendingBooking(null);
    setExtensionDays(1);
  };

  // ✅ BUG FIX #2: Return car & reset status mobil + driver
  const handleReturnCar = (booking: Booking) => {
    const hoursLate = Math.floor(Math.random() * 6);
    let dendaAuto = 0;
    let fineMsg = '';

    if (hoursLate > 2) {
      let hourlyRate = 50000;
      if (booking.driverId) {
        const dri = allDrivers.find(d => d.id === booking.driverId);
        hourlyRate += (dri?.tarifLemburPerJam || 25000);
      }
      dendaAuto = hourlyRate * (hoursLate - 2);
      fineMsg = ` (Terlambat ${hoursLate} jam. Denda keterlambatan Rp ${dendaAuto.toLocaleString('id-ID')} otomatis diterapkan)`;
    }

    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return {
          ...b,
          status: 'Selesai' as const,
          denda: dendaAuto,
          totalBayar: b.totalBayar + dendaAuto,
          jumlahBayar: b.jumlahBayar + dendaAuto,
          statusDenda: dendaAuto > 0 ? ('Belum Dibayar' as const) : ('none' as const)
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // ✅ Reset status mobil ke 'tersedia' dan driver ke 'aktif'
    if (booking.mobilId) {
      const updatedCars = allCars.map(c => {
        if (c.id === booking.mobilId) return { ...c, status: 'tersedia' as const };
        return c;
      });
      onUpdateCars(updatedCars);
    }

    if (booking.driverId) {
      const updatedDrivers = allDrivers.map(d => {
        if (d.id === booking.driverId) return { ...d, status: 'aktif' as const };
        return d;
      });
      onUpdateDrivers(updatedDrivers);
    }

    // Update Counterpart Invoice
    const updatedInvoiced = invoices.map(i => {
      if (i.bookingId === booking.id) {
        return {
          ...i,
          denda: dendaAuto,
          total: i.total + dendaAuto,
          terbayar: i.total + dendaAuto,
          sisa: 0,
          status: 'lunas' as const
        };
      }
      return i;
    });
    onUpdateInvoices(updatedInvoiced);

    onAddNotification(
      'Armada Dikembalikan', 
      `Peminjaman ${booking.bookingCode} selesai.${fineMsg} Silakan memberikan ulasan perjalanan!`, 
      dendaAuto > 0 ? 'warning' : 'success'
    );

    if (booking.mobilId) {
      setSubmittingReviewFor({ id: booking.mobilId, nama: booking.mobilNama || 'Unit Rental', tipe: 'mobil' });
    } else if (booking.driverId) {
      setSubmittingReviewFor({ id: booking.driverId, nama: booking.driverNama || 'Driver', tipe: 'driver' });
    }
  };

  // ✅ Fitur #11: Batalkan booking yang masih pending_dp
  const handleCancelBooking = (booking: Booking) => {
    if (!confirm(`Batalkan booking ${booking.bookingCode}? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return { ...b, status: 'dibatalkan' as const };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // Update invoice status
    const updatedInvoices = invoices.map(i => {
      if (i.bookingId === booking.id) {
        return { ...i, status: 'belum_bayar' as const, sisa: 0, total: 0 };
      }
      return i;
    });
    onUpdateInvoices(updatedInvoices);

    onAddNotification('Booking Dibatalkan', `Reservasi ${booking.bookingCode} berhasil dibatalkan.`, 'warning');
  };

  // Helper: cek apakah sudah ada refund aktif untuk booking tertentu (BUG #1 fix)
  const getActiveRefundByBookingId = (bookingId: string): boolean => {
    return refunds.some(
      r => r.bookingId === bookingId && r.status !== 'Ditolak'
    );
  };

  const handleSubmitRefund = () => {
    if (!bookingForRefund) return;
    if (!refundAlasan.trim()) {
      alert('Alasan pembatalan wajib diisi.');
      return;
    }

    // (A) Prevent duplicate refund — block jika sudah ada refund aktif
    if (getActiveRefundByBookingId(bookingForRefund.id)) {
      alert('Pengajuan refund untuk booking ini sudah ada dan sedang diproses. Harap tunggu keputusan admin.');
      setBookingForRefund(null);
      return;
    }

    if (refundMetode === 'Transfer Bank') {
      if (!refundBankNama.trim() || !refundRekeningNomor.trim() || !refundRekeningNama.trim()) {
        alert('Data rekening bank wajib diisi untuk metode Transfer Bank.');
        return;
      }
    }

    // (B) totalDibayar & nominalRefund SELALU dari booking.jumlahBayar (source of truth)
    const totalDibayar = bookingForRefund.jumlahBayar || 0;
    const nominalRefund = totalDibayar;

    const newRefund: Refund = {
      id: 'RFD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      bookingId: bookingForRefund.id,
      bookingCode: bookingForRefund.bookingCode,
      userId: currentUser.id,
      userNama: currentUser.name,
      totalDibayar: totalDibayar,
      nominalRefund: nominalRefund,
      alasanPembatalan: refundAlasan,
      catatanTambahan: refundCatatan,
      metodeRefund: refundMetode,
      metodePembayaranAwal: 'Payment Gateway',
      bankNama: refundBankNama,
      rekeningNomor: refundRekeningNomor,
      rekeningNama: refundRekeningNama,
      nomorTeleponRefund: refundTelepon,
      status: 'Menunggu Verifikasi',
      tanggalPengajuan: new Date().toISOString().substring(0, 10) + ' ' + new Date().toTimeString().substring(0, 5)
    };

    // Update bookings state
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingForRefund.id) {
        return { 
          ...b, 
          status: 'Menunggu Verifikasi Refund' as const
        };
      }
      return b;
    });
    onUpdateBookings(updatedBookings);

    // Save refund state
    onUpdateRefunds([newRefund, ...refunds]);

    // Send notifications to Customer, Admin, and Owner
    onAddNotification(
      'Pengajuan Refund Berhasil', 
      `Permintaan pengembalian dana untuk booking ${bookingForRefund.bookingCode} sebesar Rp ${nominalRefund.toLocaleString('id-ID')} telah dikirim.`, 
      'info'
    );
    onAddNotification(
      'Refund Diajukan',
      `Customer ${currentUser.name} mengajukan refund sebesar Rp ${nominalRefund.toLocaleString('id-ID')} untuk booking ${bookingForRefund.bookingCode}.`,
      'warning',
      'user_admin_1'
    );
    onAddNotification(
      'Refund Diajukan',
      `Customer ${currentUser.name} mengajukan refund sebesar Rp ${nominalRefund.toLocaleString('id-ID')} untuk booking ${bookingForRefund.bookingCode}.`,
      'warning',
      'user_owner_1'
    );

    // Close modal
    setBookingForRefund(null);
  };


  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      nik: profileNik,
      sim: profileSim
    });
    onAddNotification('Profil Diubah', 'Biodata KTP, SIM A dan nomor handphone Anda aman diperbarui!', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    // Asumsikan validasi sederhana
    onUpdateUser({
      ...currentUser,
      passwordHash: newPassword
    });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(false);
    onAddNotification('Password Diubah', 'Password Anda berhasil diperbarui!', 'success');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalData) return;

    const newReviews = [...reviews];
    const newId = `REV-${Date.now()}`;

    // Mobil Review
    if (reviewModalData.mobilId) {
      newReviews.push({
        id: `${newId}-1`,
        bookingId: reviewModalData.id,
        bookingCode: reviewModalData.bookingCode,
        userId: currentUser.id,
        userNama: currentUser.name,
        targetId: reviewModalData.mobilId,
        targetNama: reviewModalData.mobilNama || 'Mobil',
        tipe: 'mobil',
        rating: ratingMobil,
        ulasan: ulasanMobil,
        tanggal: new Date().toISOString().split('T')[0]
      });
    }

    // Driver Review
    if (reviewModalData.driverId && reviewModalData.layanan !== 'rental') {
      newReviews.push({
        id: `${newId}-2`,
        bookingId: reviewModalData.id,
        bookingCode: reviewModalData.bookingCode,
        userId: currentUser.id,
        userNama: currentUser.name,
        targetId: reviewModalData.driverId,
        targetNama: reviewModalData.driverNama || 'Driver',
        tipe: 'driver',
        rating: ratingDriver,
        ulasan: ulasanDriver,
        tanggal: new Date().toISOString().split('T')[0]
      });
    }

    onUpdateReviews(newReviews);
    setReviewModalData(null);
    setRatingMobil(5);
    setUlasanMobil('');
    setRatingDriver(5);
    setUlasanDriver('');
    onAddNotification('Review Terkirim', 'Terima kasih atas ulasan Anda!', 'success');
  };

  const currentCustomerBookings = bookings.filter(b => b.userId === currentUser.id);

  const filteredBookings = bookingStatusFilter === 'all' 
    ? currentCustomerBookings 
    : currentCustomerBookings.filter(b => {
        const s = b.status.toLowerCase();
        if (bookingStatusFilter === 'pending_dp') {
          return s === 'pending_dp' || s === 'menunggu pembayaran' || s === 'menunggu verifikasi admin';
        }
        if (bookingStatusFilter === 'aktif') {
          return s === 'aktif' || s === 'sewa aktif' || s === 'dalam sewa' || s === 'sedang_berjalan';
        }
        if (bookingStatusFilter === 'selesai') {
          return s === 'selesai';
        }
        return s === bookingStatusFilter.toLowerCase();
      });

  return (
    <div className="space-y-4" id="customer-view-root">
      
      <div className="space-y-4">
         {/* TAB 0: CUSTOMER OVERVIEW DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Header Area */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Selamat Datang Kembali, {currentUser.name}!</h2>
                <p className="text-slate-500 text-xs font-medium">
                  Akses portal AutoRent Anda untuk mengelola sewa kendaraan, driver VVIP, dan tagihan invoice Anda.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setViewingCarDetailId(null);
                    setViewingDriverDetailId(null);
                    setActiveSubTab('rental');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer flex items-center gap-1.5 border-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sewa Mobil Sekarang</span>
                </button>
              </div>
            </div>

            {/* 1. Five specific widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Widget 1: Booking Aktif */}
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Booking Aktif</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Car className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    {currentCustomerBookings.filter(b => b.status === 'aktif' || b.status === 'sedang_berjalan').length}
                  </h4>
                  <span className="text-[9.5px] text-emerald-600 font-bold block mt-0.5">Sedang Berjalan</span>
                </div>
              </div>

              {/* Widget 2: Total Transaksi */}
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Transaksi</span>
                  <div className="p-2 bg-emerald-50 text-emerald-650 rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-xl font-black text-slate-900 font-mono truncate">
                    Rp {payments.filter(p => p.userId === currentUser.id && p.status === 'disetujui').reduce((sum, p) => sum + p.jumlah, 0).toLocaleString('id-ID')}
                  </h4>
                  <span className="text-[9.5px] text-blue-600 font-bold block mt-0.5">Lunas Terverifikasi</span>
                </div>
              </div>

              {/* Widget 3: Tagihan Belum Lunas */}
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tagihan Belum Lunas</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-xl font-black text-amber-650 font-mono truncate">
                    Rp {currentCustomerBookings.filter(b => b.status !== 'selesai' && b.status !== 'dibatalkan').reduce((sum, b) => sum + (b.sisaPelunasan || 0), 0).toLocaleString('id-ID')}
                  </h4>
                  <span className="text-[9.5px] text-amber-600 font-bold block mt-0.5">Sisa Pelunasan DP</span>
                </div>
              </div>

              {/* Widget 4: Invoice Belum Dibayar */}
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Invoice Belum Bayar</span>
                  <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-xl font-black text-red-600 font-mono">
                    {invoices.filter(i => i.userId === currentUser.id && i.status === 'terbit').length}
                  </h4>
                  <span className="text-[9.5px] text-red-500 font-bold block mt-0.5">Harus Segera Dibayar</span>
                </div>
              </div>

              {/* Widget 5: Notifikasi Baru */}
              <div className="bg-white border border-slate-100 p-4.5 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Notifikasi Baru</span>
                  <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    {notifications.filter(n => !n.read && (n.userId === 'all' || n.userId === currentUser.id)).length}
                  </h4>
                  <span className="text-[9.5px] text-red-500 font-bold block mt-0.5">Pemberitahuan Baru</span>
                </div>
              </div>
            </div>

            {/* 2. Four Quick Actions */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Aksi Cepat Layanan</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Action 1: Sewa Mobil */}
                <button
                  onClick={() => {
                    setViewingCarDetailId(null);
                    setActiveSubTab('rental');
                  }}
                  className="bg-white hover:bg-blue-50/20 border border-slate-150 p-5 rounded-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 text-left flex items-start gap-4 shadow-2xs hover:shadow-sm cursor-pointer group md:col-span-2"
                >
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white rounded-xl transition-all">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">Sewa Mobil</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Armada MPV, SUV, & Sedan lepas kunci</p>
                  </div>
                </button>




                {/* Action 4: Lihat Keranjang */}
                <button
                  onClick={() => setActiveSubTab('cart')}
                  className="bg-white hover:bg-emerald-50/20 border border-slate-150 p-5 rounded-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 text-left flex items-start gap-4 shadow-2xs hover:shadow-sm cursor-pointer group animate-pulse"
                >
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white rounded-xl transition-all">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">Lihat Keranjang</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout').length} item siap checkout
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Five Canvas Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Left Column (2 section spans) */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Section 1: Booking Aktif */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Sewa Berjalan (Booking Aktif)</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                      {currentCustomerBookings.filter(b => b.status.toLowerCase() === 'aktif' || b.status.toLowerCase() === 'sewa aktif' || b.status.toLowerCase() === 'dalam sewa' || b.status.toLowerCase() === 'sedang_berjalan').length} Dalam Sewa
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentCustomerBookings.filter(b => b.status.toLowerCase() === 'aktif' || b.status.toLowerCase() === 'sewa aktif' || b.status.toLowerCase() === 'dalam sewa' || b.status.toLowerCase() === 'sedang_berjalan').map(bk => (
                      <div key={bk.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 hover:bg-slate-50/50 transition-colors space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-800">#{bk.bookingCode}</span>
                          <span className="bg-sky-100 text-sky-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                            {bk.layanan.replace('_', ' + ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-slate-500 font-semibold">
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Unit Armada</span>
                            <span className="text-slate-800 text-[11px] font-bold">{bk.mobilNama || bk.driverNama}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 uppercase">Periode</span>
                            <span className="text-slate-800 text-[11px] font-bold">
                              {bk.tanggalMulai ? `${bk.tanggalMulai} s/d ${bk.tanggalSelesai}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="font-mono text-blue-600 font-bold">Rp {bk.totalBayar.toLocaleString('id-ID')}</span>
                          <button
                            onClick={() => {
                              setViewingInvoiceDetailId(bk.id);
                              setActiveSubTab('invoice-detail');
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold border-0 bg-transparent cursor-pointer flex items-center gap-0.5 hover:underline"
                          >
                            <span>Lihat Nota Invoice</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {currentCustomerBookings.filter(b => b.status.toLowerCase() === 'aktif' || b.status.toLowerCase() === 'sewa aktif' || b.status.toLowerCase() === 'dalam sewa' || b.status.toLowerCase() === 'sedang_berjalan').length === 0 && (
                      <div className="py-8 text-center text-slate-400 italic">
                        Tidak ada sewa kendaraan yang sedang berjalan hari ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Riwayat Booking Terbaru */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Riwayat Booking Terbaru</h3>
                    </div>
                    <button
                      onClick={() => setActiveSubTab('my-bookings')}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-2">LAYANAN</th>
                          <th className="py-2.5 px-2">DURASI</th>
                          <th className="py-2.5 px-2 text-right">TOTAL BIAYA</th>
                          <th className="py-2.5 px-2">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-600 text-[11px]">
                        {currentCustomerBookings.slice(0, 5).map((bk) => (
                          <tr key={bk.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-2">
                              <div>
                                <span className="font-bold text-slate-800 block truncate max-w-[150px]">
                                  {bk.mobilNama || bk.driverNama || 'Layanan'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">#{bk.bookingCode}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 font-mono">
                              {bk.tanggalMulai ? `${bk.durasiHari} Hari` : ''}
                            </td>
                            <td className="py-3 px-2 text-right font-bold text-blue-600 font-mono">
                              Rp {bk.totalBayar.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusBadgeClass(bk.status)}`}>
                                {statusLabel(bk.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {currentCustomerBookings.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 italic">Belum ada pemesanan.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column (1 section span) */}
              <div className="lg:col-span-1 space-y-4">

                {/* Section 3: Status Pembayaran */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Status Pembayaran</h3>
                  </div>

                  <div className="bg-gradient-to-br from-[#0f1d40] to-[#1e2f5c] text-white rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
                    <div className="space-y-1 z-10 relative">
                      <span className="text-[9px] uppercase font-bold text-blue-300 tracking-wider">Total Tagihan Tertunda</span>
                      <h4 className="text-2xl font-black font-mono">
                        Rp {currentCustomerBookings.filter(b => b.status !== 'selesai' && b.status !== 'dibatalkan').reduce((sum, b) => sum + (b.sisaPelunasan || 0), 0).toLocaleString('id-ID')}
                      </h4>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex justify-between text-[11px] font-semibold text-blue-200 z-10 relative">
                      <div>
                        <span className="block text-[8px] text-blue-400 uppercase">Metode Pilihan</span>
                        <span>Payment Gateway</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] text-blue-400 uppercase">Keanggotaan</span>
                        <span className="text-white font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-400 inline" /> Gold</span>
                      </div>
                    </div>
                    {/* Decorative abstract shapes */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full"></div>
                  </div>

                  <button
                    onClick={() => setActiveSubTab('pembayaran')}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Kelola Pembayaran & Resi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section 4: Promo & Penawaran */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                    <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Promo & Penawaran</h3>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-100/70 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        DISKON DP 10%
                      </span>
                      <span className="text-[10px] text-amber-700 font-extrabold">Rental Toyota HiAce</span>
                    </div>
                    <p className="text-slate-650 text-[10.5px] leading-relaxed font-medium">
                      Gunakan kode voucher <strong className="text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">AUTORENT2026</strong> untuk diskon sisa pelunasan rental sebesar 10%!
                    </p>
                  </div>
                </div>



              </div>
            </div>
          </div>
        )}

        {/* TAB 1: MY BOOKINGS LIST */}
        {activeSubTab === 'my-bookings' && (
          <div className="space-y-4" id="bookings-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Daftar Reservasi Anda</h3>
              {/* ✅ Fitur #10: Filter status */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                <Filter className="w-3 h-3 text-slate-400 ml-1" />
                {[
                  { val: 'all', label: 'Semua' },
                  { val: 'pending_dp', label: 'Menunggu DP' },
                  { val: 'aktif', label: 'Aktif' },
                  { val: 'selesai', label: 'Selesai' },
                ].map(f => (
                  <button
                    key={f.val}
                    onClick={() => setBookingStatusFilter(f.val)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                      bookingStatusFilter === f.val ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment form overlay */}
            {selectedBookingForPay && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-4 space-y-4 shadow-md animate-fadeIn" id="pay-flow-form">
                <div className="flex items-center justify-between border-b border-blue-150 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900">Form Pembayaran Booking: {selectedBookingForPay.bookingCode}</h4>
                  <button onClick={() => {
                    setSelectedBookingForPay(null);
                    setSnapToken('');
                  }} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-0 cursor-pointer">Batal ×</button>
                </div>
                
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Nominal Pembayaran</span>
                      <span className="font-mono text-base font-black text-blue-600 block mt-1">
                        Rp {paymentAmount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-1 font-semibold">
                        Tipe Pembayaran: {selectedBookingForPay.jenisPembayaran === 'dp' ? 'DP 30%' : 'Lunas 100%'}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-2">Metode Pembayaran</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Payment Gateway')}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg border text-center font-bold text-[10px] cursor-pointer transition-colors ${
                            paymentMethod === 'Payment Gateway'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Online Gateway
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('Bank Transfer')}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg border text-center font-bold text-[10px] cursor-pointer transition-colors ${
                            paymentMethod === 'Bank Transfer'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Manual Transfer
                        </button>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'Payment Gateway' ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2.5 text-slate-500 font-semibold">
                        <CreditCard className="w-5 h-5 text-blue-600 animate-pulse" />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Pembayaran Gateway Terintegrasi</span>
                          <span className="text-[10px] text-slate-500 font-normal">Mendukung QRIS, GoPay, Virtual Account, & Kartu Kredit.</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-b border-slate-100 py-2.5 my-2">
                        <span className="text-slate-500 font-semibold">Order ID Booking:</span>
                        <span className="font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded font-extrabold text-[11px]">{selectedBookingForPay.bookingCode}</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isLoadingSnap || !snapToken) {
                              alert('Sedang menyiapkan transaksi dari Midtrans Sandbox, silakan tunggu...');
                              return;
                            }
                            openSnapPopup();
                          }}
                          className={`w-full text-white font-extrabold py-3 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 text-xs ${
                            isLoadingSnap || !snapToken
                              ? 'bg-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10'
                          }`}
                          disabled={isLoadingSnap || !snapToken}
                        >
                          {isLoadingSnap ? 'Menyiapkan Transaksi...' : 'Bayar Sekarang via Snap Popup'} <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        {isLoadingSnap && (
                          <span className="text-blue-600 animate-pulse text-[10px] text-center block font-semibold">
                            🔄 Menghubungi API Gateway Sandbox...
                          </span>
                        )}
                        {!isLoadingSnap && snapError && (
                          <span className="text-rose-600 text-[10px] text-center block font-semibold">
                            ❌ Gagal menyiapkan pembayaran Sandbox: {snapError}
                          </span>
                        )}
                        {!isLoadingSnap && snapToken && !snapError && (
                          <div className="flex flex-col gap-2">
                            <span className="text-emerald-600 text-[10px] text-center block font-semibold">
                              ✓ Transaksi sukses disiapkan! Nominal Rp {paymentAmount.toLocaleString('id-ID')} siap dibayar.
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await fetch('/api/midtrans-webhook', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      order_id: activeOrderId,
                                      transaction_status: 'settlement',
                                      gross_amount: paymentAmount.toString(),
                                      payment_type: 'bank_transfer',
                                      transaction_time: new Date().toISOString()
                                    })
                                  });
                                  setTimeout(() => {
                                    if (selectedBookingForPay) {
                                      setViewingInvoiceDetailId(selectedBookingForPay.id);
                                      onSetActiveTab('invoice');
                                      setActiveSubTab('invoice-detail');
                                    }
                                    setActiveOrderId('');
                                    setSnapToken('');
                                    setSelectedBookingForPay(null);
                                    alert('Simulasi Webhook berhasil dikirim! App.tsx sedang memproses data...');
                                  }, 1000);
                                } catch(e) {
                                  alert('Gagal simulasi webhook: ' + e);
                                }
                              }}
                              className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 font-bold py-2 rounded-xl text-xs cursor-pointer transition-colors"
                            >
                              🚀 Simulasikan Pembayaran Sukses (Local Test)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : paymentMethod === 'Bank Transfer' ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-2xs text-left">
                      <div className="flex items-center gap-2.5 text-slate-500 font-semibold">
                        <Receipt className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Transfer Bank Manual</span>
                          <span className="text-[10px] text-slate-500 font-normal">Silakan transfer ke rekening resmi AutoRent berikut.</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Bank Tujuan:</span>
                          <strong className="text-slate-800">BCA (Bank Central Asia)</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Nomor Rekening:</span>
                          <strong className="font-mono text-blue-600 text-[13px]">123-456-7890</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Atas Nama:</span>
                          <strong className="text-slate-850">PT AUTORENT INDONESIA</strong>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200/50 pt-2.5 mt-2.5">
                          <span className="text-slate-500">Nominal Transfer:</span>
                          <strong className="font-mono text-emerald-650 text-[13px]">Rp {paymentAmount.toLocaleString('id-ID')}</strong>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">Nama Pengirim / Berita Acara</label>
                          <input
                            type="text"
                            value={paymentProofName}
                            onChange={(e) => setPaymentProofName(e.target.value)}
                            placeholder="Contoh: Transfer a.n Budi Santoso"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">Pilih File Resi / Bukti Transfer</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              id="manual-receipt-upload"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setPaymentProofName(e.target.files[0].name);
                                  setPaymentUploaded(true);
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="manual-receipt-upload"
                              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-[11px] cursor-pointer transition-colors"
                            >
                              <UploadCloud className="w-4 h-4" /> Unggah File
                            </label>
                            <span className="text-[10px] text-slate-500 italic max-w-[200px] truncate">
                              {paymentUploaded ? `✓ ${paymentProofName}` : 'Belum ada resi terpilih'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!paymentProofName}
                          onClick={() => {
                            const isDenda = selectedBookingForPay.statusPembayaran === 'Menunggu Pelunasan Denda' || selectedBookingForPay.status === 'Menunggu Pelunasan Denda';
                            const resolvedTipeBayar = isDenda ? 'denda' : (paymentAmount >= selectedBookingForPay.totalBayar ? 'lunas_full' : 'dp');
                            const pId = `p_manual_${Date.now()}`;
                            const newPayment: Pembayaran = {
                              id: pId,
                              bookingId: selectedBookingForPay.id,
                              bookingCode: selectedBookingForPay.bookingCode,
                              userId: currentUser.id,
                              userNama: currentUser.name,
                              tipeBayar: resolvedTipeBayar,
                              jumlah: paymentAmount,
                              metode: 'Manual Bank Transfer',
                              buktiTransferUrl: '/assets/receipts/proof_dummy.png', // dummy file URL for visual approval
                              tanggalBayar: new Date().toISOString().replace('T', ' ').substring(0, 16),
                              status: 'pending' // crucial!
                            };

                            onUpdatePayments([newPayment, ...payments]);

                            const updatedBookings = bookings.map(b => {
                              if (b.id === selectedBookingForPay.id) {
                                return {
                                  ...b,
                                  status: isDenda ? ('Menunggu Pelunasan Denda' as const) : ('pending_konfirmasi' as const),
                                  statusPembayaran: 'Menunggu Verifikasi Admin' as const
                                };
                              }
                              return b;
                            });
                            onUpdateBookings(updatedBookings);

                            onAddNotification(
                              'Bukti Transfer Dilaporkan',
                              `Bukti transfer untuk booking ${selectedBookingForPay.bookingCode} berhasil dilaporkan! Mohon tunggu verifikasi admin.`,
                              'success'
                            );

                            onAddNotification(
                              'Verifikasi Pembayaran Baru',
                              `Customer ${currentUser.name} telah melaporkan transfer bukti manual untuk booking ${selectedBookingForPay.bookingCode}.`,
                              'info',
                              'user_admin_1'
                            );

                            setSelectedBookingForPay(null);
                            setPaymentProofName('');
                            setPaymentUploaded(false);
                            alert('Bukti pembayaran Anda berhasil dikirim! Silakan tunggu verifikasi admin.');
                          }}
                          className={`w-full py-3 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-md border-0 ${
                            !paymentProofName
                              ? 'bg-slate-300 cursor-not-allowed shadow-none'
                              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                          }`}
                        >
                          Kirim Bukti Pembayaran
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-5 text-center space-y-3">
                      <p className="text-slate-655 font-bold">Silakan lakukan pembayaran langsung di kasir AutoRent sebesar <strong className="text-blue-600 font-mono">Rp {paymentAmount.toLocaleString('id-ID')}</strong>.</p>
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForPay(null)}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer border-0 text-xs"
                      >
                        Tutup
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund form overlay */}
            {bookingForRefund && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-4 space-y-4 shadow-md animate-fadeIn text-left animate-fadeIn" id="refund-flow-form">
                <div className="flex items-center justify-between border-b border-red-150 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900">Form Pengajuan Refund Booking: {bookingForRefund.bookingCode}</h4>
                  <button onClick={() => {
                    setBookingForRefund(null);
                  }} className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-0 cursor-pointer">Batal ×</button>
                </div>
                
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Total yang Telah Dibayar</span>
                      <span className="font-mono text-base font-black text-slate-800 block mt-1">
                        Rp {(bookingForRefund.jumlahBayar || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-1 font-semibold">
                        Status Pembayaran: {bookingForRefund.statusPembayaran || (bookingForRefund.jumlahBayar > 0 ? 'DP/Lunas' : 'Belum Bayar')}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Estimasi Pengembalian Dana</span>
                      <span className="font-mono text-base font-black text-red-650 block mt-1">
                        Rp {(bookingForRefund.jumlahBayar || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] text-red-650 block mt-1 font-bold">
                        Refund 100% dari nominal yang dibayarkan
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Alasan Pembatalan <span className="text-red-500">*</span></label>
                    <textarea
                      value={refundAlasan}
                      onChange={(e) => setRefundAlasan(e.target.value)}
                      placeholder="Tulis alasan pembatalan reservasi..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-750 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Metode Pengembalian Dana <span className="text-red-500">*</span></label>
                    <select
                      value={refundMetode}
                      onChange={(e) => setRefundMetode(e.target.value as 'Transfer Bank')}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-750 font-bold focus:ring-2 focus:ring-red-400 focus:outline-none"
                    >
                      <option value="Transfer Bank">Transfer Bank</option>
                    </select>
                  </div>

                  {refundMetode === 'Transfer Bank' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Nama Bank / E-Wallet <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={refundBankNama}
                          onChange={(e) => setRefundBankNama(e.target.value)}
                          placeholder="Misal: BCA, Mandiri, OVO, Dana"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-750 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Nomor Rekening / E-Wallet <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={refundRekeningNomor}
                          onChange={(e) => setRefundRekeningNomor(e.target.value)}
                          placeholder="Nomor Rekening / E-Wallet"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-750 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Nama Pemilik Rekening <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={refundRekeningNama}
                          onChange={(e) => setRefundRekeningNama(e.target.value)}
                          placeholder="Atas Nama"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-750 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Nomor Telepon (Opsional)</label>
                        <input
                          type="text"
                          value={refundTelepon}
                          onChange={(e) => setRefundTelepon(e.target.value)}
                          placeholder="Nomor Handphone (jika menggunakan E-Wallet)"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-750 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase text-slate-700 tracking-wider">Catatan Tambahan (Opsional)</label>
                    <input
                      type="text"
                      value={refundCatatan}
                      onChange={(e) => setRefundCatatan(e.target.value)}
                      placeholder="Informasi tambahan lain jika ada..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-750 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingForRefund(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitRefund}
                      className="bg-red-600 hover:bg-red-750 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md text-xs"
                    >
                      Kirim Permintaan Refund
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extension overlay */}
            {extendingBooking && (
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 space-y-4" id="extension-overlay">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    Perpanjang Sewa: {extendingBooking.bookingCode}
                  </h4>
                  <button onClick={() => setExtendingBooking(null)} className="text-xs text-slate-400 font-semibold text-[13px]">Batal ×</button>
                </div>
                
                <form onSubmit={handleExtendSubmit} className="flex flex-wrap items-end gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Durasi Tambahan (Hari)</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={extensionDays}
                      onChange={(e) => setExtensionDays(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3.5 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-xs cursor-pointer"
                  >
                    Konfirmasi Tambah Hari
                  </button>
                </form>
              </div>
            )}

            {/* Review form overlay */}
            {submittingReviewFor && (
              <form onSubmit={handleReviewSubmit} className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 space-y-4 text-xs" id="review-feedback-form">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-current" /> Berikan Ulasan Ke: {submittingReviewFor.nama}
                  </h4>
                  <button onClick={() => setSubmittingReviewFor(null)} className="text-slate-400 font-bold">Tutup ×</button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rating Penilaian (1-5 Bintang)</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setReviewRating(stars)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${stars <= reviewRating ? 'text-amber-400 fill-current' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ulasan Tertulis</label>
                    <textarea
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Bagikan pengalaman mengemudi atau perjalanan Anda..."
                      className="w-full p-3 border border-slate-200 bg-white rounded-lg focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer shadow-xs"
                  >
                    Kirim Ulasan Sah
                  </button>
                </div>
              </form>
            )}

            {/* Bookings Feed */}
            {filteredBookings.length === 0 ? (
              <div className="bg-slate-50 py-12 rounded-2xl text-center text-xs text-slate-400">
                {bookingStatusFilter === 'all' 
                  ? 'Anda belum melakukan pemesanan sewa apapun.'
                  : `Tidak ada booking dengan status "${statusLabel(bookingStatusFilter)}".`
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((bk) => {
                  const correlatedInvoice = invoices.find(inv => inv.bookingId === bk.id);
                  const isPendingDP = bk.status === 'pending_dp' || bk.status === 'Menunggu Pembayaran' || getStatusPembayaranText(bk) === 'Belum Bayar';
                  const isAktif = bk.status === 'aktif' || bk.status === 'Sewa Aktif' || bk.status === 'Dalam Sewa';
                  
                  return (
                    <div key={bk.id} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold font-mono block">Kode: {bk.bookingCode}</span>
                          <span className="capitalize bg-slate-100 text-slate-700 font-extrabold text-[9px] px-2 py-0.5 rounded-md">
                            Layanan {bk.layanan.replace('_', ' + ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {renderStatusPembayaranBadge(getStatusPembayaranText(bk))}
                          {renderStatusRentalBadge(getStatusRentalText(bk.status))}
                        </div>
                      </div>

                      {/* Detail */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Info Unit / Jadwal</span>
                          {bk.mobilNama && <div><strong>Armada:</strong> {bk.mobilNama}</div>}
                          {bk.driverNama && <div><strong>Sopir:</strong> {bk.driverNama}</div>}

                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Masa Sewa</span>
                          {bk.tanggalMulai && (
                            <div>
                              <span>{bk.tanggalMulai} s/d {bk.tanggalSelesai}</span>
                              <span className="text-slate-400 font-medium block">Durasi: {bk.durasiHari} Hari</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 md:border-l md:border-slate-50 md:pl-4">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tagihan Sewa</span>
                          <div className="flex items-center justify-between">
                            <span>Sewa Bersih:</span>
                            <span className="font-mono text-slate-700">Rp {bk.totalSewa.toLocaleString('id-ID')}</span>
                          </div>
                          {bk.denda > 0 && (
                            <div className="flex items-center justify-between text-red-600 font-bold">
                              <span>Denda Telat:</span>
                              <span className="font-mono">Rp {bk.denda.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-slate-50 pt-1 text-slate-900 font-extrabold">
                            <span>Total Bayar:</span>
                            <span className="font-mono text-blue-600">Rp {bk.totalBayar.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-50">
                        {correlatedInvoice && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                            <span>Invoice: <button onClick={() => { setViewingInvoiceDetailId(correlatedInvoice.bookingId || correlatedInvoice.id); setActiveSubTab('invoice-detail'); }} className="text-blue-605 font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer font-mono">{correlatedInvoice.invoiceCode}</button></span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              correlatedInvoice.status === 'lunas' ? 'bg-emerald-50 text-emerald-700' :
                              correlatedInvoice.status === 'dp_lunas' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {correlatedInvoice.status === 'lunas' ? 'Lunas' : correlatedInvoice.status === 'dp_lunas' ? 'DP Terbayar' : 'Belum Bayar'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          {/* 1. Payment Action */}
                          {bk.sisaPelunasan > 0 && bk.status !== 'dibatalkan' && bk.status !== 'selesai' && (
                            <button
                              onClick={() => {
                                setSelectedBookingForPay(bk);
                                setPaymentAmount(bk.jumlahBayar === 0 ? bk.dpMinimal : bk.sisaPelunasan);
                                setPaymentMethod('Payment Gateway');
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3 h-3" /> {bk.jumlahBayar === 0 ? `Bayar DP (Rp ${bk.dpMinimal.toLocaleString('id-ID')})` : `Bayar Pelunasan (Rp ${bk.sisaPelunasan.toLocaleString('id-ID')})`}
                            </button>
                          )}
                          {/* ✅ Fitur #11: Batalkan booking jika belum bayar */}
                          {bk.jumlahBayar === 0 && (bk.status === 'pending_dp' || bk.status === 'Menunggu Pembayaran' || bk.status === 'pending_konfirmasi' || bk.status === 'Menunggu Pengambilan') && (
                            <button
                              onClick={() => handleCancelBooking(bk)}
                              className="bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer border border-red-100"
                            >
                              <XCircle className="w-3 h-3" /> Batalkan
                            </button>
                          )}

                          {/* ✅ Fitur Refund: Ajukan Refund jika sudah bayar tapi belum diserahterimakan */}
                          {bk.jumlahBayar > 0 && 
                           bk.status !== 'dibatalkan' && 
                           bk.status !== 'selesai' && 
                           bk.status !== 'Selesai' && 
                           bk.status !== 'Dalam Sewa' && 
                           bk.status !== 'Sewa Aktif' && 
                           bk.status !== 'Menunggu Verifikasi Refund' && 
                           (bk.status === 'Menunggu Pengambilan' || bk.status === 'DP Dibayar' || bk.status === 'Lunas' || bk.status === 'pending_konfirmasi' || bk.status === 'disetujui') && (
                            <button
                              onClick={() => {
                                setBookingForRefund(bk);
                                setRefundAlasan('');
                                setRefundCatatan('');
                                setRefundMetode('Transfer Bank');
                                setRefundBankNama('');
                                setRefundRekeningNomor('');
                                setRefundRekeningNama('');
                                setRefundTelepon('');
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer border border-red-100 transition-colors animate-pulse"
                            >
                              <RefreshCw className="w-3 h-3 text-red-600" /> Ajukan Refund
                            </button>
                          )}

                          {/* Badge status refund pending */}
                          {refunds.find(r => r.bookingId === bk.id) && (
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border ${
                                (() => {
                                  const st = refunds.find(r => r.bookingId === bk.id)?.status;
                                  if (st === 'Menunggu Verifikasi') return 'bg-amber-100 text-amber-700 border-amber-200';
                                  if (st === 'Refund Diproses') return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
                                  if (st === 'Refund Selesai' || st === 'Disetujui') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                                  if (st === 'Ditolak') return 'bg-rose-100 text-rose-700 border-rose-200';
                                  return 'bg-slate-100 text-slate-700 border-slate-200';
                                })()
                              }`}>
                                {refunds.find(r => r.bookingId === bk.id)?.status === 'Menunggu Verifikasi' ? '⌛ Menunggu Verifikasi Refund' : 
                                 refunds.find(r => r.bookingId === bk.id)?.status === 'Refund Diproses' ? '💸 Refund Diproses' :
                                 refunds.find(r => r.bookingId === bk.id)?.status === 'Disetujui' ? '✅ Refund Disetujui' :
                                 refunds.find(r => r.bookingId === bk.id)?.status === 'Refund Selesai' ? '✅ Refund Selesai' :
                                 refunds.find(r => r.bookingId === bk.id)?.status === 'Ditolak' ? '❌ Refund Ditolak' : 'Refund Status'}
                              </span>
                              {refunds.find(r => r.bookingId === bk.id)?.status === 'Ditolak' && refunds.find(r => r.bookingId === bk.id)?.alasan && (
                                <span className="text-[10px] text-rose-600 italic font-semibold mt-0.5">
                                  Alasan Penolakan: {refunds.find(r => r.bookingId === bk.id)?.alasan}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 2. Sewa Extension */}
                          {isAktif && (bk.layanan === 'rental' || bk.layanan === 'rental_driver') && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setExtendingBooking(bk)}
                                className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                              >
                                Perpanjang Hari
                              </button>
                            </div>
                          )}

                          {(bk.status === 'selesai' || bk.status === 'Selesai') && (
                            <button
                              onClick={() => {
                                if (bk.mobilId) {
                                  setSubmittingReviewFor({ id: bk.mobilId, nama: bk.mobilNama || 'Unit', tipe: 'mobil' });
                                } else if (bk.driverId) {
                                  setSubmittingReviewFor({ id: bk.driverId, nama: bk.driverNama || 'Driver', tipe: 'driver' });
                                }
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Star className="w-3 h-3 text-amber-500 fill-current" /> Berikan Ulasan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: KERANJANG BELANJA */}
        {activeSubTab === 'cart' && (
          <div className="space-y-4" id="cart-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" /> Keranjang Belanja Anda
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Pilih layanan yang ingin Anda checkout. Pembayaran DP menyesuaikan pengaturan sistem.
                </p>
              </div>

              {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearCart}
                    className="px-3 py-1.5 text-[11px] font-bold text-red-650 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer border border-red-100 transition-colors"
                  >
                    Kosongkan Keranjang
                  </button>
                </div>
              )}
            </div>

            {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl py-12 text-center text-slate-400 space-y-4">
                <ShoppingCart className="w-12 h-12 mx-auto text-slate-200" />
                <div className="text-xs font-semibold">Keranjang belanja Anda kosong.</div>
                <button
                  onClick={() => setActiveSubTab('book-new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer inline-block"
                >
                  Mulai Pesan Layanan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* List of Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Select All Action */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
                    <label className="flex items-center gap-2.5 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={
                          cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length > 0 &&
                          cartSelectedIds.length === cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length
                        }
                        onChange={() => {
                          const items = cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan');
                          if (cartSelectedIds.length === items.length) {
                            setCartSelectedIds([]);
                          } else {
                            setCartSelectedIds(items.map(item => item.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Pilih Semua ({cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length} item)</span>
                    </label>

                    {cartSelectedIds.length > 0 && (
                      <button
                        onClick={handleDeleteSelectedCartItems}
                        className="text-red-650 hover:text-red-750 font-bold flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Terpilih ({cartSelectedIds.length})
                      </button>
                    )}
                  </div>

                  {cart
                    .filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan')
                    .map((item) => {
                      const isChecked = cartSelectedIds.includes(item.id);
                      let detailsTitle = '';
                      let detailsSub = '';
                      let detailsMeta = '';
                      let imageSrc = '';

                      if (item.layanan === 'rental' || item.layanan === 'rental_driver') {
                        const car = allCars.find(c => c.id === item.mobilId);
                        detailsTitle = item.mobilNama || 'Unit Sewa Mobil';
                        detailsSub = `Rental Mobil ${item.denganDriver ? '+ Jasa Driver' : 'Lepas Kunci'} (${item.durasiHari} Hari)`;
                        detailsMeta = `${item.tanggalMulai} s/d ${item.tanggalSelesai} ${item.driverNama ? `| Driver: ${item.driverNama}` : ''}`;
                        imageSrc = car?.foto || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600';
                      } else if (item.layanan === 'driver') {
                        const d = allDrivers.find(dr => dr.id === item.driverId);
                        detailsTitle = item.driverNama || 'Jasa Driver';
                        detailsSub = `Sewa Jasa Driver Profesional (${item.durasiHari} Hari)`;
                        detailsMeta = `${item.tanggalMulai} s/d ${item.tanggalSelesai}`;
                        imageSrc = d?.foto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150';

                      }

                      return (
                        <div
                          key={item.id}
                          className={`bg-white border rounded-2xl p-4 flex gap-4 items-start transition-all hover:shadow-sm ${
                            isChecked ? 'border-blue-200 bg-blue-50/5' : 'border-slate-100'
                          }`}
                        >
                          <div className="pt-1 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setCartSelectedIds(cartSelectedIds.filter(id => id !== item.id));
                                } else {
                                  setCartSelectedIds([...cartSelectedIds, item.id]);
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </div>

                          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                            <img src={imageSrc} alt={detailsTitle} className="w-full h-full object-cover" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1 text-xs">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm truncate">{detailsTitle}</h4>
                                <p className="text-slate-500 font-semibold text-[11px]">{detailsSub}</p>
                              </div>
                              <span className="font-extrabold text-slate-950 text-right shrink-0 font-mono">
                                Rp {item.totalHarga.toLocaleString('id-ID')}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                              {detailsMeta}
                            </p>

                            <div className="flex gap-2 pt-2 justify-end">
                              <button
                                onClick={() => handleStartEditCartItem(item)}
                                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50/50 px-2.5 py-1 rounded-lg cursor-pointer border border-blue-50/30"
                              >
                                <Edit2 className="w-3 h-3" /> Edit Detail
                              </button>
                              <button
                                onClick={() => handleDeleteCartItem(item.id)}
                                className="text-red-650 hover:text-red-800 font-bold flex items-center gap-1 bg-red-50/50 px-2.5 py-1 rounded-lg cursor-pointer border border-red-50/30"
                              >
                                <Trash2 className="w-3 h-3" /> Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Checkout Summary panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-5 shadow-xs sticky top-4">
                    <h4 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-2">
                      Ringkasan Pemesanan
                    </h4>

                    {/* Cost summaries */}
                    <div className="space-y-3 text-xs text-slate-500">
                      <div className="flex justify-between items-center">
                        <span>Total Items Terpilih:</span>
                        <span className="font-bold text-slate-800">
                          {cartSelectedIds.length} item
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Subtotal Sewa Bersih:</span>
                        <span className="font-bold text-slate-800 font-mono text-sm">
                          Rp {cart
                            .filter(item => cartSelectedIds.includes(item.id))
                            .reduce((sum, item) => sum + item.totalHarga, 0)
                            .toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-50 pt-2 text-[10.5px]">
                        {(() => {
                          const dpPct = (typeof settings.dpPercentage === 'number' && !isNaN(settings.dpPercentage) && settings.dpPercentage > 0) ? settings.dpPercentage : 30;
                          const dpTotal = Math.round(
                            cart
                              .filter(item => cartSelectedIds.includes(item.id))
                              .reduce((sum, item) => {
                                const harga = Number(item.totalHarga) || 0;
                                return sum + (harga * dpPct / 100);
                              }, 0)
                          );
                          return (
                            <>
                              <span className="text-amber-600">Ketentuan Minimal DP ({dpPct}%):</span>
                              <span className="font-bold text-amber-600 font-mono">
                                Rp {dpTotal.toLocaleString('id-ID')}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Checkout Form Inputs */}
                    <form onSubmit={handleCheckout} className="space-y-4 border-t border-slate-100 pt-4">
                      {/* DP Options */}
                      <div className="space-y-2 text-xs">
                        <label className="block text-[11px] font-bold text-slate-700">Tipe Pelunasan Checkout</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutPaymentType('dp')}
                            className={`py-2 rounded-lg border font-bold text-[10.5px] text-center cursor-pointer transition-all ${
                              checkoutPaymentType === 'dp'
                                ? 'border-amber-500 bg-amber-50/50 text-amber-700 font-bold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Bayar DP Sewa
                          </button>
                          <button
                            type="button"
                            onClick={() => setCheckoutPaymentType('full')}
                            className={`py-2 rounded-lg border font-bold text-[10.5px] text-center cursor-pointer transition-all ${
                              checkoutPaymentType === 'full'
                                ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Bayar Lunas (100%)
                          </button>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-2 text-xs">
                        <label className="block text-[11px] font-bold text-slate-700">Metode Transaksi Pembayaran</label>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutPaymentMethod('gateway')}
                            className={`py-2 rounded-lg border font-bold text-[10.5px] text-center cursor-pointer transition-all ${
                              checkoutPaymentMethod === 'gateway'
                                ? 'border-blue-600 bg-blue-50/50 text-blue-600 font-bold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            Payment Gateway
                          </button>
                        </div>
                      </div>

                      {/* Summary Pay Amount */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Pembayaran Awal</span>
                        {(() => {
                          const dpPct = (typeof settings.dpPercentage === 'number' && !isNaN(settings.dpPercentage) && settings.dpPercentage > 0) ? settings.dpPercentage : 30;
                          const totalAwal = Math.round(
                            cart
                              .filter(item => cartSelectedIds.includes(item.id))
                              .reduce((sum, item) => {
                                const harga = Number(item.totalHarga) || 0;
                                if (checkoutPaymentType === 'dp') {
                                  return sum + (harga * dpPct / 100);
                                } else {
                                  return sum + harga;
                                }
                              }, 0)
                          );
                          return (
                            <span className="font-mono text-base font-black text-blue-600">
                              Rp {totalAwal.toLocaleString('id-ID')}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={cartSelectedIds.length === 0 || isCheckingOut}
                        className={`w-full py-3 text-white font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-md border-0 ${
                          cartSelectedIds.length === 0 || isCheckingOut
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/10'
                        }`}
                      >
                        {isCheckingOut ? 'Sedang Checkout...' : `Lanjutkan Pemesanan & Bayar (${cartSelectedIds.length})`}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATALOGS & DETAIL VIEWS (RENTAL, DRIVER) */}
        {(activeSubTab === 'book-new' || activeSubTab === 'rental' || activeSubTab === 'driver') && (
          <div className="space-y-4" id="catalog-booking-flow">
            
            {/* 1. Subtab Selector inside page */}
            <div className="bg-white rounded-2xl border border-slate-100 p-2 flex gap-1.5 shadow-2xs">
              <button
                onClick={() => {
                  setActiveSubTab('rental');
                }}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs text-center transition-all cursor-pointer ${
                  activeSubTab === 'rental' || (activeSubTab === 'book-new' && serviceType === 'rental')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                1. Katalog Mobil Rental
              </button>
              <button
                onClick={() => {
                  setActiveSubTab('driver');
                }}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs text-center transition-all cursor-pointer ${
                  activeSubTab === 'driver' || (activeSubTab === 'book-new' && serviceType === 'driver')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-650 hover:bg-slate-50'
                }`}
              >
                2. Katalog Driver Profesional
              </button>
            </div>

            {/* -------------------- RENTAL MOBIL CATALOG -------------------- */}
            {(activeSubTab === 'rental' || (activeSubTab === 'book-new' && serviceType === 'rental')) && (
              <div>
                {viewingCarDetailId === null ? (
                  // Katalog Grid View
                  <div className="space-y-4">
                    {/* Filters Bar */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs space-y-4 text-xs">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <input
                          type="text"
                          placeholder="Cari nama atau brand mobil..."
                          value={carSearchQuery}
                          onChange={(e) => setCarSearchQuery(e.target.value)}
                          className="w-full md:w-80 px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white"
                        />
                        
                        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                          {/* Brand Filter */}
                          <select
                            value={carBrandFilter}
                            onChange={(e) => setCarBrandFilter(e.target.value)}
                            className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold"
                          >
                            <option value="all">Semua Brand</option>
                            <option value="Toyota">Toyota</option>
                            <option value="Honda">Honda</option>
                          </select>

                          {/* Tipe Filter */}
                          <select
                            value={carTypeFilter}
                            onChange={(e) => setCarTypeFilter(e.target.value)}
                            className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold"
                          >
                            <option value="all">Semua Tipe</option>
                            <option value="MPV">MPV</option>
                            <option value="SUV">SUV</option>
                            <option value="Sedan">Sedan</option>
                            <option value="Van">Van</option>
                            <option value="Hatchback">Hatchback</option>
                          </select>

                          {/* Transmisi Filter */}
                          <select
                            value={carTransFilter}
                            onChange={(e) => setCarTransFilter(e.target.value)}
                            className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold"
                          >
                            <option value="all">Semua Transmisi</option>
                            <option value="Matic">Matic (Otomatis)</option>
                            <option value="Manual">Manual (Gigi)</option>
                          </select>
                        </div>
                      </div>

                      {/* Price range filter */}
                      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-600 shrink-0">Batas Harga Sewa:</span>
                        <input
                          type="range"
                          min={300000}
                          max={10000000}
                          step={50000}
                          value={carMaxPriceFilter}
                          onChange={(e) => setCarMaxPriceFilter(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="font-mono font-bold text-blue-600 shrink-0 text-xs">
                          Maks Rp {carMaxPriceFilter.toLocaleString('id-ID')}/Hari
                        </span>
                      </div>
                    </div>

                    {/* Cars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {allCars
                        .filter(c => {
                          const matchesSearch = c.nama.toLowerCase().includes(carSearchQuery.toLowerCase()) || c.brand.toLowerCase().includes(carSearchQuery.toLowerCase());
                          const matchesBrand = carBrandFilter === 'all' || c.brand === carBrandFilter;
                          const matchesType = carTypeFilter === 'all' || c.tipe === carTypeFilter;
                          const matchesTrans = carTransFilter === 'all' || c.transmisi === carTransFilter;
                          const matchesPrice = c.hargaSewa <= carMaxPriceFilter;
                          // Hide maintenance, inactive, or explicitly disabled cars
                          const statusLower = c.status ? c.status.toLowerCase() : '';
                          const isVisible = c.aktif !== false && statusLower !== 'maintenance' && statusLower !== 'nonaktif';
                          return matchesSearch && matchesBrand && matchesType && matchesTrans && matchesPrice && isVisible;
                        })
                        .map(car => (
                          <div key={car.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="relative h-44 bg-slate-50 select-none">
                              <img src={car.foto} alt={car.nama} className="w-full h-full object-cover" />
                              {(() => {
                                const currentStatus = 'Tersedia';
                                let badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                                
                                return (
                                  <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${badgeClass}`}>
                                    {currentStatus}
                                  </span>
                                );
                              })()}
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
                                  onClick={() => {
                                    setViewingCarDetailId(car.id);
                                    setSelectedCarId(car.id);
                                    setWithDriver(false);
                                  }}
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
                ) : (
                  // Detail Mobil View
                  (() => {
                    const car = allCars.find(c => c.id === viewingCarDetailId);
                    if (!car) return <div className="text-slate-400 text-center py-6">Mobil tidak ditemukan!</div>;
                    const carReviews = reviews.filter(r => r.targetId === car.id && r.tipe === 'mobil');

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start" id="car-detail-container">
                        {/* Main Details and specs */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                            <div className="h-80 bg-slate-100 select-none">
                              <img src={car.foto} alt={car.nama} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-50 pb-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                    {car.brand} · {car.tipe}
                                  </span>
                                  <h3 className="text-lg font-black text-slate-900 leading-tight mt-1">{car.nama}</h3>
                                  <span className="text-xs text-slate-400 font-mono block">Plat Nomor: {car.platNomor}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Tarif Lepas Kunci</span>
                                  <span className="font-mono text-lg font-black text-blue-600">Rp {car.hargaSewa.toLocaleString('id-ID')}</span>
                                  <span className="text-[10px] text-slate-500 block">/ Hari</span>
                                </div>
                              </div>

                              <div className="space-y-2.5 text-xs text-slate-650">
                                <h4 className="font-extrabold text-slate-900">Spesifikasi Kendaraan</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl">
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Transmisi</span>
                                    <strong className="text-slate-800 text-[11px]">{car.transmisi}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Kapasitas</span>
                                    <strong className="text-slate-800 text-[11px]">{car.kapasitas} Penumpang</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Bahan Bakar</span>
                                    <strong className="text-slate-800 text-[11px]">{car.bensin}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Status Layanan</span>
                                    <strong className="text-emerald-600 text-[11px] capitalize">{car.status}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2.5 text-xs text-slate-650 pt-2">
                                <h4 className="font-extrabold text-slate-900">Fasilitas Kenyamanan Utama</h4>
                                <div className="flex flex-wrap gap-2">
                                  {['AC Double Blower', 'Audio Bluetooth & CarPlay', 'P3K & Emergency Tool Kit', 'Kamera Parkir Mundur', 'Asuransi All-Risk Prima Setia'].map(f => (
                                    <span key={f} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-medium text-[10.5px]">
                                      ✓ {f}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reviews List */}
                          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
                            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Ulasan & Review Pelanggan ({carReviews.length})</h4>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                              {carReviews.map(rev => (
                                <div key={rev.id} className="border-b border-slate-50 pb-3.5 space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <strong className="text-slate-800">{rev.userNama}</strong>
                                    <span className="text-yellow-400">★ {rev.rating}/5</span>
                                  </div>
                                  <p className="text-slate-500 italic text-[11.5px]">"{rev.ulasan}"</p>
                                </div>
                              ))}
                              {carReviews.length === 0 && (
                                <div className="text-slate-400 italic text-center py-4 text-xs">Belum ada review untuk unit mobil ini.</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Booking Add to Cart Form Panel */}
                        <div className="lg:col-span-1">
                          <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-5 shadow-xs sticky top-4 text-xs text-slate-600">
                            <h4 className="font-black text-slate-900 text-sm border-b border-slate-50 pb-2">
                              Form Sewa & Tambah Keranjang
                            </h4>
                            
                            <form onSubmit={handleAddToCart} className="space-y-4">
                              <div className="space-y-3.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    👉 Pilih Tanggal & Jam Mulai Sewa
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStartDate('');
                                      setStartTime('09:00');
                                      setEndDate('');
                                      setEndTime('09:00');
                                      setDurationDays(1);
                                      setSelectedPackage('1d');
                                      setSelectingDateType('start');
                                    }}
                                    className="text-[10px] text-blue-600 hover:text-blue-700 font-extrabold cursor-pointer border-0 bg-transparent"
                                  >
                                    Reset Pilihan
                                  </button>
                                </div>

                                {/* Availability Calendar */}
                                {renderCustomCalendar(car.id, true)}

                                {/* Selected Period Summary Card */}
                                <div className="space-y-2 bg-slate-50 border border-slate-200/50 rounded-2xl p-3.5">
                                  <div className="flex justify-between items-center text-[10.5px]">
                                    <span className="text-slate-400 font-bold uppercase font-mono">Mulai Sewa:</span>
                                    <span className="font-mono text-slate-800 font-black">
                                      {startDate ? `${startDate} pukul ${startTime}` : '- Belum dipilih -'}
                                    </span>
                                  </div>
                                </div>

                                {startDate && startTime && (
                                  <div className="space-y-2.5">
                                    <label className="block text-[11px] font-bold text-slate-700">Pilih Paket Sewa</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                      {[
                                        { id: '12h', label: '1/2 Hari (12j)' },
                                        { id: '1d', label: '1 Hari' },
                                        { id: '1.5d', label: '1,5 Hari' },
                                        { id: '2d', label: '2 Hari' },
                                        { id: '3d', label: '3 Hari' },
                                        { id: '4d', label: '4 Hari' },
                                        { id: '5d', label: '5 Hari' },
                                        { id: '6d', label: '6 Hari' },
                                        { id: '7d', label: '7 Hari' },
                                      ].map((pkg) => (
                                        <button
                                          key={pkg.id}
                                          type="button"
                                          onClick={() => setSelectedPackage(pkg.id)}
                                          className={`py-2 px-1 rounded-xl border text-center transition-all text-[10px] font-extrabold cursor-pointer ${
                                            selectedPackage === pkg.id
                                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                          }`}
                                        >
                                          {pkg.label}
                                        </button>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPackage('custom')}
                                        className={`py-2 px-1 rounded-xl border text-center transition-all col-span-3 text-[10px] font-extrabold cursor-pointer ${
                                          selectedPackage === 'custom'
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                      >
                                        Custom Durasi
                                      </button>
                                    </div>

                                    {selectedPackage === 'custom' && (
                                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div>
                                          <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Jumlah Hari</label>
                                          <input
                                            type="number"
                                            min={1}
                                            value={customDays}
                                            onChange={(e) => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {startDate && endDate && (() => {
                                  const sDtStr = `${startDate}T${startTime}`;
                                  const eDtStr = `${endDate}T${endTime}`;
                                  const isCarConflict = checkOverlappingBooking(car.id, true, sDtStr, eDtStr);
                                  const isCarCartConflict = checkCartConflict(car.id, true, sDtStr, eDtStr);
                                  const isDriverConflict = withDriver && selectedDriverId && checkOverlappingBooking(selectedDriverId, false, sDtStr, eDtStr);
                                  const isDriverCartConflict = withDriver && selectedDriverId && checkCartConflict(selectedDriverId, false, sDtStr, eDtStr);
                                  const hasConflict = isCarConflict || isCarCartConflict || isDriverConflict || isDriverCartConflict;

                                  return (
                                    <div className="space-y-2.5">
                                      <div className="bg-blue-50/40 border border-blue-500/10 rounded-2xl p-3.5 space-y-2.5 shadow-xs">
                                        <h5 className="font-black text-blue-900 text-[11px] flex items-center gap-1.5 leading-none">
                                          <Calendar className="w-3.5 h-3.5 text-blue-600" /> Detail Periode Sewa
                                        </h5>
                                        <div className="grid grid-cols-2 gap-3 text-[10.5px] text-slate-650 pt-1 leading-tight font-semibold">
                                          <div>
                                            <span className="text-[9px] text-slate-400 uppercase block font-bold">Waktu Mulai</span>
                                            <strong className="text-slate-800 font-mono">{startDate} {startTime}</strong>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-slate-400 uppercase block font-bold">Waktu Selesai</span>
                                            <strong className="text-slate-800 font-mono">{endDate} {endTime}</strong>
                                          </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center">
                                          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Durasi Sewa</span>
                                          <span className="font-mono text-xs font-black text-blue-750 bg-blue-50 px-2 py-0.5 rounded-md">
                                            {durationDays} Hari
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10.5px] border-t border-slate-200/30 pt-2 text-slate-650">
                                          <span>DP Minimal (30%):</span>
                                          <span className="font-mono text-slate-800 font-bold">Rp {Math.round(calculateEstimate() * 0.3).toLocaleString('id-ID')}</span>
                                        </div>
                                      </div>

                                      {hasConflict && (
                                        <div className="p-3 bg-red-50 text-red-700 text-[11.5px] font-extrabold rounded-xl border border-red-150 text-left">
                                          ⚠️ Tidak Tersedia: Jadwal bentrok dengan booking lain atau sudah ada di keranjang pada periode ini!
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                  <input
                                    type="checkbox"
                                    checked={withDriver}
                                    onChange={(e) => {
                                      setWithDriver(e.target.checked);
                                      if (!e.target.checked) setSelectedDriverId('');
                                    }}
                                    className="rounded text-blue-600 w-4 h-4"
                                  />
                                  <span>Gunakan Jasa Driver VVIP</span>
                                </label>
                              </div>

                              {withDriver && (
                                <div className="space-y-1">
                                  <label className="block text-[11px] font-bold text-slate-700">Pilih Driver Tersedia</label>
                                  <select
                                    value={selectedDriverId}
                                    required={withDriver}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold"
                                  >
                                    <option value="">-- Pilih supir pribadi --</option>
                                    {allDrivers.filter(d => {
                                      if (d.status !== 'aktif' || d.aktif === false) return false;
                                      if (startDate && endDate) {
                                        const dtStart = `${startDate}T${startTime}`;
                                        const dtEnd = `${endDate}T${endTime}`;
                                        if (checkOverlappingBooking(d.id, false, dtStart, dtEnd)) return false;
                                        if (checkCartConflict(d.id, false, dtStart, dtEnd)) return false;
                                      }
                                      return true;
                                    }).map(d => (
                                      <option key={d.id} value={d.id}>
                                        {d.nama} (+Rp {d.tarifPerHari.toLocaleString('id-ID')}/Hari)
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}



                              <div className="bg-slate-50 rounded-2xl p-4.5 text-center space-y-1 border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none">Estimasi Biaya Total</span>
                                <span className="font-mono text-base font-black text-blue-600">
                                  Rp {calculateEstimate().toLocaleString('id-ID')}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setViewingCarDetailId(null)}
                                  className="flex-1 py-3 text-slate-600 border border-slate-250 bg-white font-extrabold rounded-xl transition-all cursor-pointer text-center text-xs"
                                >
                                  Kembali
                                </button>
                                {(() => {
                                  const sDtStr = `${startDate}T${startTime}`;
                                  const eDtStr = `${endDate}T${endTime}`;
                                  const isCarConflict = checkOverlappingBooking(car.id, true, sDtStr, eDtStr);
                                  const isCarCartConflict = checkCartConflict(car.id, true, sDtStr, eDtStr);
                                  const isDriverConflict = withDriver && selectedDriverId && checkOverlappingBooking(selectedDriverId, false, sDtStr, eDtStr);
                                  const isDriverCartConflict = withDriver && selectedDriverId && checkCartConflict(selectedDriverId, false, sDtStr, eDtStr);
                                  const hasConflict = isCarConflict || isCarCartConflict || isDriverConflict || isDriverCartConflict;
                                  const isSubmitDisabled = !startDate || !startTime || hasConflict;

                                  return (
                                    <button
                                      type="submit"
                                      disabled={isSubmitDisabled}
                                      className={`flex-1 py-3 font-extrabold rounded-xl transition-all cursor-pointer border-0 text-center text-xs text-white ${
                                        isSubmitDisabled
                                          ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                          : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10'
                                      }`}
                                    >
                                      + Keranjang
                                    </button>
                                  );
                                })()}
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* -------------------- DRIVER PROFESSIONAL CATALOG -------------------- */}
            {(activeSubTab === 'driver') && (
              <div>
                {viewingDriverDetailId === null ? (
                  <div className="space-y-4">
                    {/* Filters Bar */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs space-y-4 text-xs">
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <input
                          type="text"
                          placeholder="Cari nama driver..."
                          value={driverSearchQuery}
                          onChange={(e) => setDriverSearchQuery(e.target.value)}
                          className="w-full md:w-1/3 px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Driver Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {allDrivers
                        .filter(dri => {
                          const matchesSearch = dri.nama.toLowerCase().includes(driverSearchQuery.toLowerCase());
                          const isActive = dri.status === 'aktif' && dri.aktif !== false;
                          return matchesSearch && isActive;
                        })
                        .map(dri => (
                          <div key={dri.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="relative h-44 bg-slate-50 select-none">
                              <img src={dri.foto} alt={dri.nama} className="w-full h-full object-cover object-top" />
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
                                  onClick={() => {
                                    setViewingDriverDetailId(dri.id);
                                  }}
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
                ) : (
                  // Detail Driver View
                  (() => {
                    const dri = allDrivers.find(d => d.id === viewingDriverDetailId);
                    if (!dri) return <div className="p-4 text-center text-slate-500 text-xs font-bold">Driver tidak ditemukan.</div>;

                    return (
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden text-xs">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                        
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 relative z-10">
                          <button
                            onClick={() => setViewingDriverDetailId(null)}
                            className="text-slate-400 hover:text-slate-700 font-bold p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border-0"
                          >
                            ← Kembali
                          </button>
                          <div>
                            <h2 className="text-lg font-black text-slate-900 leading-none">{dri.nama}</h2>
                            <p className="text-[11px] text-slate-500 mt-1">Profil Driver Profesional AutoRent</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                          <div className="space-y-4">
                            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-xs h-64 bg-slate-50">
                              <img src={dri.foto} alt={dri.nama} className="w-full h-full object-cover object-top" />
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                                Driver Tersedia
                              </span>
                              <h3 className="text-xl font-black text-slate-900">{dri.nama}</h3>
                              <p className="text-[11px] font-bold text-slate-500 mt-1.5 uppercase tracking-wide">Pengalaman {dri.pengalamanTahun} Tahun</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                              <h4 className="font-bold text-slate-800 text-sm">Deskripsi Driver</h4>
                              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                {dri.nama} adalah driver profesional kami dengan pengalaman lebih dari {dri.pengalamanTahun} tahun mengemudi berbagai jenis kendaraan. Siap melayani perjalanan dalam dan luar kota dengan aman dan nyaman.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tarif Harian</span>
                                <span className="block text-lg font-black text-blue-600 font-mono">Rp {dri.tarifPerHari.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Biaya Lembur</span>
                                <span className="block text-lg font-black text-blue-600 font-mono">Rp {dri.tarifLemburPerJam.toLocaleString('id-ID')}<span className="text-[10px] text-slate-400">/Jam</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER PROFILE */}
        {activeSubTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-8 space-y-4" id="profile-sheet-canvas">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 shadow-sm">
                <ProfileAvatar name={currentUser.name} avatarUrl={currentUser.avatar} className="w-full h-full text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Biodata Pengguna</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Lengkapi data diri Anda untuk keperluan verifikasi penyewaan kendaraan.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nama Lengkap Sesuai KTP</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nomor Handphone Aktif</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nomor NIK KTP (Wajib Jaminan)</label>
                  <input
                    type="text"
                    value={profileNik}
                    onChange={(e) => setProfileNik(e.target.value)}
                    placeholder="327301XXXXXXXXXX"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nomor SIM A (Jika Sewa Tanpa Supir)</label>
                  <input
                    type="text"
                    value={profileSim}
                    onChange={(e) => setProfileSim(e.target.value)}
                    placeholder="9401XXXXXXXX"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Alamat Domisili Sekarang</label>
                <textarea
                  rows={3}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg font-sans"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg border border-slate-200 cursor-pointer"
                >
                  Ubah Password
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Perubahan Dokumen
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* MODAL UBAH PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative my-8 text-xs text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Ubah Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 border-0 bg-transparent cursor-pointer"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Password Lama</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md cursor-pointer"
              >
                Simpan Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT ITEM KERANJANG */}
      {editingCartItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl p-4 md:p-8 space-y-4 shadow-2xl relative my-8 text-xs text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Ubah Detail Item Keranjang</h3>
              <button
                onClick={() => setEditingCartItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 border-0 bg-transparent cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCartEdit} className="space-y-4">
              {/* Rental / Rental Driver fields */}
              {(editingCartItem.layanan === 'rental' || editingCartItem.layanan === 'rental_driver') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ganti Unit Mobil</label>
                    <select
                      value={editCarId}
                      required
                      onChange={(e) => setEditCarId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {allCars.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.brand} {c.nama} (Rp {c.hargaSewa.toLocaleString('id-ID')}/hari) - Status: {c.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={editWithDriver}
                        onChange={(e) => setEditWithDriver(e.target.checked)}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <span>Gunakan Supir Tambahan</span>
                    </label>
                  </div>

                  {editWithDriver && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Driver</label>
                      <select
                        value={editDriverId}
                        required={editWithDriver}
                        onChange={(e) => setEditDriverId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="">-- Ganti Supir --</option>
                        {allDrivers.filter(d => {
                          if (d.status !== 'aktif' || d.aktif === false) return false;
                          if (editStartDate && editEndDate) {
                            const dtStart = `${editStartDate}T${editStartTime}`;
                            const dtEnd = `${editEndDate}T${editEndTime}`;
                            if (checkOverlappingBooking(d.id, false, dtStart, dtEnd)) return false;
                            
                            const hasCartConflict = cart.some(item => {
                              if (item.id === editingCartItem?.id) return false;
                              if (item.userId !== currentUser.id || item.status === 'checkout' || item.status === 'dibatalkan') return false;
                              if (item.driverId !== d.id) return false;
                              if (!item.tanggalMulai || !item.tanggalSelesai) return false;
                              
                              const start = new Date(dtStart.replace('T', ' '));
                              const end = new Date(dtEnd.replace('T', ' '));
                              const cStart = new Date(item.tanggalMulai.replace('T', ' '));
                              const cEnd = new Date(item.tanggalSelesai.replace('T', ' '));
                              
                              if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(cStart.getTime()) || isNaN(cEnd.getTime())) return false;
                              
                              return (start < cEnd && end > cStart);
                            });
                            if (hasCartConflict) return false;
                          }
                          return true;
                        }).map(d => (
                          <option key={d.id} value={d.id}>
                            {d.nama} (Rp {d.tarifPerHari.toLocaleString('id-ID')}/hari)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal & Jam Mulai</label>
                      <div className="flex gap-1.5">
                        <input
                          type="date"
                          value={editStartDate}
                          required
                          onChange={(e) => {
                            setEditStartDate(e.target.value);
                            if (e.target.value && editEndDate) {
                              const d1 = parseDateTimeSafe(`${e.target.value}T${editStartTime}`);
                              const d2 = parseDateTimeSafe(`${editEndDate}T${editEndTime}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="flex-grow px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                        />
                        <select
                          value={editStartTime}
                          onChange={(e) => {
                            setEditStartTime(e.target.value);
                            if (editStartDate && editEndDate) {
                              const d1 = parseDateTimeSafe(`${editStartDate}T${e.target.value}`);
                              const d2 = parseDateTimeSafe(`${editEndDate}T${editEndTime}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="px-2 py-2 border border-slate-200 rounded-lg bg-white font-mono text-xs shrink-0"
                        >
                          {generateTimeSlots().map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal & Jam Selesai</label>
                      <div className="flex gap-1.5">
                        <input
                          type="date"
                          value={editEndDate}
                          required
                          min={editStartDate}
                          onChange={(e) => {
                            setEditEndDate(e.target.value);
                            if (editStartDate && e.target.value) {
                              const d1 = parseDateTimeSafe(`${editStartDate}T${editStartTime}`);
                              const d2 = parseDateTimeSafe(`${e.target.value}T${editEndTime}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="flex-grow px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                        />
                        <select
                          value={editEndTime}
                          onChange={(e) => {
                            setEditEndTime(e.target.value);
                            if (editStartDate && editEndDate) {
                              const d1 = parseDateTimeSafe(`${editStartDate}T${editStartTime}`);
                              const d2 = parseDateTimeSafe(`${editEndDate}T${e.target.value}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="px-2 py-2 border border-slate-200 rounded-lg bg-white font-mono text-xs shrink-0"
                        >
                          {generateTimeSlots().map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver Saja fields */}
              {editingCartItem.layanan === 'driver' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Driver</label>
                    <select
                      value={editDriverId}
                      required
                      onChange={(e) => setEditDriverId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {allDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nama} (Rp {d.tarifPerHari.toLocaleString('id-ID')}/hari) - Status: {d.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal & Jam Mulai</label>
                      <div className="flex gap-1.5">
                        <input
                          type="date"
                          value={editStartDate}
                          required
                          onChange={(e) => {
                            setEditStartDate(e.target.value);
                            if (e.target.value && editEndDate) {
                              const d1 = parseDateTimeSafe(`${e.target.value}T${editStartTime}`);
                              const d2 = parseDateTimeSafe(`${editEndDate}T${editEndTime}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="flex-grow px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                        />
                        <select
                          value={editStartTime}
                          onChange={(e) => {
                            setEditStartTime(e.target.value);
                            if (editStartDate && editEndDate) {
                              const d1 = parseDateTimeSafe(`${editStartDate}T${e.target.value}`);
                              const d2 = parseDateTimeSafe(`${editEndDate}T${editEndTime}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="px-2 py-2 border border-slate-200 rounded-lg bg-white font-mono text-xs shrink-0"
                        >
                          {generateTimeSlots().map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal & Jam Selesai</label>
                      <div className="flex gap-1.5">
                        <input
                          type="date"
                          value={editEndDate}
                          required
                          min={editStartDate}
                          onChange={(e) => {
                            setEditEndDate(e.target.value);
                            if (editStartDate && e.target.value) {
                              const d1 = parseDateTimeSafe(`${editStartDate}T${editStartTime}`);
                              const d2 = parseDateTimeSafe(`${e.target.value}T${editEndTime}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="flex-grow px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
                        />
                        <select
                          value={editEndTime}
                          onChange={(e) => {
                            setEditEndTime(e.target.value);
                            if (editStartDate && editEndDate) {
                              const d1 = parseDateTimeSafe(`${editStartDate}T${editStartTime}`);
                              const d2 = parseDateTimeSafe(`${editEndDate}T${e.target.value}`);
                              const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                              setEditDurationDays(diffDays > 0 ? diffDays : 1);
                            }
                          }}
                          className="px-2 py-2 border border-slate-200 rounded-lg bg-white font-mono text-xs shrink-0"
                        >
                          {generateTimeSlots().map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCartItem(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold bg-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer border-0"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIME PICKER MODAL */}
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 space-y-4 shadow-2xl relative my-8 text-xs text-slate-700">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Pilih Jam Mulai Sewa
              </h3>
              <button
                type="button"
                onClick={() => setIsTimePickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 border-0 bg-transparent cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-slate-500 font-medium">
              Tanggal terpilih: <strong className="text-slate-800">{tempDateSelected}</strong>. 
              Silakan pilih jam operasional mulai sewa (07:00 - 22:00).
            </p>

            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
              {generateTimeSlots().map(slot => {
                const targetId = serviceType === 'rental' ? selectedCarId : selectedDriverId;
                const isCar = serviceType === 'rental';
                const isBooked = isTimeSlotBooked(targetId, isCar, tempDateSelected, slot);
                const isConflict = isTimeSlotCartConflict(targetId, isCar, tempDateSelected, slot);
                
                // If it is End Time, we should check that the combined dateTime is after the Start DateTime
                let isBeforeOrEqualStart = false;
                if (timePickerTarget === 'end' && startDate) {
                  const currentSlotDateTime = parseDateTimeSafe(`${tempDateSelected}T${slot}`);
                  const startDateTime = parseDateTimeSafe(`${startDate}T${startTime}`);
                  if (currentSlotDateTime <= startDateTime) {
                    isBeforeOrEqualStart = true;
                  }
                }

                // Check overlap with existing booking
                let overlapsExistingBooking = false;
                if (timePickerTarget === 'end' && startDate) {
                  const startDateTimeStr = `${startDate}T${startTime}`;
                  const endDateTimeStr = `${tempDateSelected}T${slot}`;
                  if (checkOverlappingBooking(targetId, isCar, startDateTimeStr, endDateTimeStr)) {
                    overlapsExistingBooking = true;
                  }
                }

                // Check if the time slot is in the past for today's date
                let isPastTimeToday = false;
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
                
                if (tempDateSelected === todayStr) {
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  const [slotHourStr, slotMinuteStr] = slot.split(':');
                  const slotHour = parseInt(slotHourStr, 10);
                  const slotMinute = parseInt(slotMinuteStr, 10);
                  
                  if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                    isPastTimeToday = true;
                  }
                }

                const isDisabled = isBooked || isConflict || isBeforeOrEqualStart || overlapsExistingBooking || isPastTimeToday;
                
                let btnClass = 'bg-slate-50 hover:bg-slate-100 text-slate-755 font-semibold border border-slate-100';
                if (isDisabled) {
                  btnClass = 'bg-slate-100 text-slate-350 line-through cursor-not-allowed border border-slate-100';
                } else {
                  const isCurrentSelected = (timePickerTarget === 'start' && startTime === slot && startDate === tempDateSelected) ||
                                            (timePickerTarget === 'end' && endTime === slot && endDate === tempDateSelected);
                  if (isCurrentSelected) {
                    btnClass = 'bg-blue-600 text-white font-black border border-blue-600 shadow-sm shadow-blue-500/20';
                  }
                }

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      setStartDate(tempDateSelected);
                      setStartTime(slot);
                      setIsTimePickerOpen(false);
                      onAddNotification('Waktu Mulai Dipilih', `Jam mulai sewa diatur ke ${slot}.`, 'info');
                    }}
                    className={`py-2 rounded-xl text-center text-[10.5px] cursor-pointer transition-all ${btnClass}`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTimePickerOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer border-0"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUBTABS FOR CUSTOMER SIDEBAR REDESIGN */}
      {activeSubTab === 'pembayaran' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Riwayat Pembayaran</h3>
            <p className="text-xs text-slate-400 mt-1">Daftar transaksi pembayaran DP dan pelunasan yang Anda kirimkan.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">KODE BOOKING</th>
                  <th className="py-2.5 px-3">TIPE</th>
                  <th className="py-2.5 px-3 text-right">JUMLAH</th>
                  <th className="py-2.5 px-3">METODE</th>
                  <th className="py-2.5 px-3">TANGGAL</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-600 text-[11px]">
                {payments.filter(p => p.userId === currentUser.id).map(p => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-bold text-slate-800">{p.bookingCode}</td>
                    <td className="py-3 px-3 capitalize font-sans">{p.tipeBayar.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-right font-bold text-blue-600">Rp {p.jumlah.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-3 font-sans">{p.metode}</td>
                    <td className="py-3 px-3 text-slate-400">{p.tanggalBayar}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        p.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'ditolak' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {payments.filter(p => p.userId === currentUser.id).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic font-sans">Belum ada riwayat pembayaran.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(activeSubTab === 'invoice' || activeSubTab === 'invoice-detail') && (
        viewingInvoiceDetailId ? (
          (() => {
            const invoice = invoices.find(inv => inv.bookingId === viewingInvoiceDetailId || inv.id === viewingInvoiceDetailId);
            if (!invoice) {
              return (
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs text-center text-slate-400 py-12">
                  <p>Invoice tidak ditemukan atau telah dihapus.</p>
                  <button
                    onClick={() => {
                      setViewingInvoiceDetailId(null);
                      setActiveSubTab('invoice');
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl border-0 cursor-pointer"
                  >
                    Kembali ke Daftar
                  </button>
                </div>
              );
            }

            const booking = bookings.find(b => b.id === invoice.bookingId);
            
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
                default: return p;
              }
            };

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
            const batasPembayaran = booking?.tanggalBooking ? getPaymentDeadline(booking.tanggalBooking) : '-';

            const nominalYangHarusDibayar = booking 
              ? Math.round(
                  booking.jumlahBayar === 0 
                    ? (booking.jenisPembayaran === 'dp' ? booking.dpMinimal : booking.totalBayar) 
                    : booking.sisaPelunasan
                )
              : 0;
            
            // Retrieve guarantee & handover details dynamically from the reactive bookings prop
            const bookingForInvoice = bookings.find(b => b.id === invoice.bookingId);
            const handoverDetails = (() => {
              try {
                const saved = localStorage.getItem('autorent_handoverDetails');
                return saved ? JSON.parse(saved) : {};
              } catch (e) {
                return {};
              }
            })();
            const handover = handoverDetails[invoice.bookingId];
            
            const gType = bookingForInvoice?.jenisJaminan || '- Belum diserahkan -';
            const gStatusRaw = (bookingForInvoice?.statusJaminan || 'Belum Diserahkan').toLowerCase();
            const gStatus = bookingForInvoice?.statusJaminan === 'Ditahan' ? 'Diterima & Diverifikasi'
                          : bookingForInvoice?.statusJaminan === 'Dikembalikan' ? 'Sudah Dikembalikan'
                          : 'Belum Diserahkan';
            
            let handoverStatus = 'Belum Diserahkan';
            if (bookingForInvoice?.status === 'Sewa Aktif' || bookingForInvoice?.status === 'Dalam Sewa') {
              handoverStatus = 'Sudah Diserahkan';
            } else if (bookingForInvoice?.status === 'Selesai') {
              handoverStatus = 'Sudah Dikembalikan';
            }

            const subtotalVal = invoice.subtotal || 0;
            const dendaVal = invoice.denda || 0;
            const totalVal = subtotalVal + dendaVal;
            const terbayarVal = invoice.terbayar || 0;
            const sisaVal = Math.max(0, totalVal - terbayarVal);
            
            const isLunas = invoice.status === 'lunas' || sisaVal === 0;

            return (
              <div className="space-y-4 animate-fadeIn" id="invoice-detail-container">
                {/* Print area wrapper */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs max-w-4xl mx-auto space-y-4 print:border-0 print:shadow-none print:p-0" id="invoice-print-area">
                  
                  {/* Top Branding Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900">AutoRent Indonesia</span>
                      </div>
                      <p className="text-slate-400 text-[10.5px] leading-relaxed font-semibold">
                        Gedung AutoRent Center, Jl. Raya Pasteur No. 120 B<br />
                        Bandung, Jawa Barat, Indonesia 40161<br />
                        Telepon: (022) 203-4567 | WhatsApp: 0812-3456-7890
                      </p>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <span className="text-xs bg-blue-50 text-blue-750 font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                        NOTA INVOICE RESMI
                      </span>
                      <h4 className="text-lg font-black text-slate-955 font-mono mt-2">{invoice.invoiceCode}</h4>
                      <p className="text-[10.5px] text-slate-400 font-semibold font-mono">
                        Tanggal Dibuat: {invoice.tanggalDibuat}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Booking details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 text-left">
                    <div className="space-y-2">
                      <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Ditagihkan Kepada:</h5>
                      <div className="space-y-1 font-semibold">
                        <p className="text-slate-900 font-extrabold text-sm">{currentUser.name}</p>
                        <p>NIK KTP: <span className="font-mono text-slate-800">{currentUser.nik || '- Belum diisi -'}</span></p>
                        <p>No. SIM A: <span className="font-mono text-slate-800">{currentUser.sim || '- Belum diisi -'}</span></p>
                        <p>No. Handphone: <span className="text-slate-800">{currentUser.phone}</span></p>
                        <p>Email: <span className="text-slate-800">{currentUser.email}</span></p>
                      </div>
                    </div>

                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-slate-700">
                      <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Detail Booking Reservasi:</h5>
                      <div className="space-y-1 font-semibold">
                        <p>Kode Booking: <strong className="font-mono text-slate-900">{invoice.bookingCode}</strong></p>
                        <p>Nama Customer: <span className="text-slate-800">{invoice.userNama}</span></p>
                        {booking?.mobilNama && <p>Armada Mobil: <span className="text-slate-850 font-bold">{booking.mobilNama}</span></p>}
                        {booking?.tanggalMulai && (
                          <p>Periode Sewa: <span className="text-slate-800 font-bold">{booking.tanggalMulai} s/d {booking.tanggalSelesai} ({booking.durasiHari} Hari)</span></p>
                        )}
                        {booking?.paketSewa && (
                          <p>Paket Sewa: <span className="text-slate-800 font-bold">{formatPaketSewa(booking.paketSewa, booking.customDurasiJam)}</span></p>
                        )}
                        <p>Jenis Pembayaran: <span className="text-slate-800 font-bold">{booking?.jenisPembayaran === 'dp' ? 'DP (30% Uang Muka)' : 'Lunas (100% Penuh)'}</span></p>
                        {booking?.jenisPembayaran === 'dp' && <p>Nominal DP: <span className="text-slate-800 font-bold">Rp {(booking?.dpMinimal || 0).toLocaleString('id-ID')}</span></p>}
                        <p>Status Pembayaran: <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${isLunas ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{isLunas ? 'Lunas' : 'DP Dibayar'}</span></p>
                        <p>Metode Pembayaran: <span className="text-slate-800 font-bold">Payment Gateway</span></p>
                        <p>Tanggal Pembayaran: <span className="text-slate-800 font-bold">{invoice.status !== 'belum_bayar' ? payments.find(p => p.bookingId === invoice.bookingId)?.tanggalBayar || invoice.tanggalDibuat : '-'}</span></p>
                        
                        {booking?.tanggalBooking && booking?.jumlahBayar === 0 && (
                          <p className="text-red-650 font-bold">
                            Batas Pembayaran: <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">{batasPembayaran}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rincian Item Table */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] pl-1">Rincian Item Pembayaran:</h5>
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-4">Deskripsi Layanan</th>
                            <th className="py-3 px-4 text-center">Durasi / Qty</th>
                            <th className="py-3 px-4 text-right">Tarif Satuan</th>
                            <th className="py-3 px-4 text-right">Total Harga</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-650">
                          {invoice.status === 'refund' ? (
                            <tr>
                              <td className="py-3 px-4 text-slate-800 font-extrabold text-left">
                                Pengembalian Dana (Refund) Pembatalan Transaksi - Booking {invoice.bookingCode}
                              </td>
                              <td className="py-3 px-4 text-center font-mono">1 Transaksi</td>
                              <td className="py-3 px-4 text-right font-mono">
                                Rp {invoice.total.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-red-650 font-bold">
                                Rp {invoice.total.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ) : (
                            <>
                              {booking?.mobilNama && (
                                <tr>
                                  <td className="py-3 px-4 text-slate-800 font-extrabold text-left">
                                    Sewa Armada Mobil: {booking.mobilNama} {booking.denganDriver ? '+ Driver' : 'Lepas Kunci'}
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono">{booking.durasiHari} Hari</td>
                                  <td className="py-3 px-4 text-right font-mono">
                                    Rp {Math.round((booking.totalSewa - (booking.driverNama ? (allDrivers.find(d=>d.id===booking.driverId)?.tarifPerHari || 200000) * booking.durasiHari : 0)) / booking.durasiHari).toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono">
                                    Rp {Math.round(booking.totalSewa - (booking.driverNama ? (allDrivers.find(d=>d.id===booking.driverId)?.tarifPerHari || 200000) * booking.durasiHari : 0)).toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              )}
                              {booking?.driverNama && booking.layanan === 'rental_driver' && (
                                <tr>
                                  <td className="py-3 px-4 text-slate-800 font-extrabold text-left">
                                    Layanan Jasa Driver: {booking.driverNama}
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono">{booking.durasiHari} Hari</td>
                                  <td className="py-3 px-4 text-right font-mono">
                                    Rp {(allDrivers.find(d => d.id === booking.driverId)?.tarifPerHari || 200000).toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono">
                                    Rp {((allDrivers.find(d => d.id === booking.driverId)?.tarifPerHari || 200000) * booking.durasiHari).toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              )}

                              {booking?.layanan === 'driver' && (
                                <tr>
                                  <td className="py-3 px-4 text-slate-800 font-extrabold text-left">
                                    Jasa Supir Profesional Harian: {booking.driverNama}
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono">{booking.durasiHari} Hari</td>
                                  <td className="py-3 px-4 text-right font-mono">
                                    Rp {(allDrivers.find(d => d.id === booking.driverId)?.tarifPerHari || 200000).toLocaleString('id-ID')}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono">
                                    Rp {booking.totalSewa.toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Calculations & Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-left">
                    {/* Guarantee & Handover Info Box */}
                    {invoice.status === 'refund' ? (
                      <div className="bg-red-50/20 border border-red-100/70 p-5 rounded-2xl space-y-3 text-xs text-slate-600 font-semibold h-fit">
                        <h5 className="font-extrabold text-red-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-red-100 pb-2">
                          <Info className="w-4 h-4 text-red-650" />
                          <span>Status Transaksi Refund</span>
                        </h5>
                        
                        <div className="space-y-2 pt-1 font-semibold">
                          <div className="flex justify-between items-center">
                            <span>Status Pengembalian:</span>
                            <span className="font-bold text-red-750 bg-red-100 border border-red-200 px-2 py-0.5 rounded uppercase text-[10px]">Disetujui</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Metode Transfer:</span>
                            <span className="font-bold text-slate-800 bg-white border border-slate-100 px-2 py-0.5 rounded">Bank Transfer</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                            Pengembalian dana 100% diproses oleh pihak finansial AutoRent sesuai dengan ketentuan pembatalan sebelum serah terima.
                          </p>
                        </div>
                      </div>
                    ) : (invoice.layanan.includes('Mobil') || booking?.layanan === 'rental' || booking?.layanan === 'rental_driver') ? (
                      <div className="bg-blue-50/20 border border-blue-100/70 p-5 rounded-2xl space-y-3 text-xs text-slate-600 font-semibold h-fit">
                        <h5 className="font-extrabold text-blue-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 border-b border-blue-100 pb-2">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Status Jaminan & Serah Terima Unit</span>
                        </h5>
                        
                        <div className="space-y-2 pt-1 font-semibold">
                          <div className="flex justify-between items-center">
                            <span>Jenis Jaminan:</span>
                            <span className="font-bold text-slate-800 bg-white border border-slate-100 px-2 py-0.5 rounded">{gType}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Status Verifikasi Jaminan:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              gStatusRaw === 'diverifikasi' ? 'bg-emerald-100 text-emerald-700' :
                              gStatusRaw === 'dikembalikan' ? 'bg-slate-100 text-slate-500' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {gStatus}
                            </span>
                          </div>

                          <div className="flex justify-between items-center border-t border-slate-100/60 pt-2">
                            <span>Serah Terima Mobil:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              handoverStatus === 'Sudah Dikembalikan' ? 'bg-emerald-100 text-emerald-700' :
                              handoverStatus === 'Sudah Diserahkan' ? 'bg-blue-100 text-blue-750 animate-pulse' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {handoverStatus}
                            </span>
                          </div>

                          {handover && (
                            <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-1 text-[11px] font-medium text-slate-500 mt-2">
                              <div>KM Awal Keluar: <strong className="text-slate-800 font-mono">{handover.kmAwal} KM</strong></div>
                              <div>Kondisi Bodi: <span className="text-slate-800 font-semibold">{handover.bodyAwal}</span></div>
                              <div>BBM Awal Keluar: <span className="text-slate-800 font-semibold">{handover.bbmAwal}</span></div>
                              {handover.kmAkhir && (
                                <div className="border-t border-slate-100 pt-1.5 mt-1.5 space-y-1">
                                  <div>KM Akhir Masuk: <strong className="text-slate-800 font-mono">{handover.kmAkhir} KM</strong></div>
                                  <div>Kondisi Bodi Masuk: <span className="text-slate-800 font-semibold">{handover.bodyAkhir}</span></div>
                                  <div>BBM Akhir Masuk: <span className="text-slate-800 font-semibold">{handover.bbmAkhir}</span></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 italic text-xs h-32">
                        Layanan sewa driver tidak memerlukan jaminan fisik & serah terima kunci.
                      </div>
                    )}

                    {/* Breakdown Cost Math Column */}
                    {invoice.status === 'refund' ? (
                      <div className="space-y-3 text-xs font-semibold text-slate-650 pl-2">
                        <div className="flex justify-between items-center text-red-650 font-black text-sm border-t border-red-200 pt-2">
                          <span>Total Pengembalian Dana:</span>
                          <span className="font-mono">Rp {invoice.total.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs font-semibold text-slate-650 pl-2">
                        <div className="flex justify-between items-center text-slate-900 font-black text-sm pt-2">
                          <span>Total:</span>
                          <span className="font-mono text-blue-600">Rp {totalVal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 font-semibold text-sm pt-1">
                          <span>Pembayaran Diterima:</span>
                          <span className="font-mono text-emerald-600">Rp {terbayarVal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-700 font-black text-sm pt-1 mt-1 border-t border-slate-100">
                          <span>Sisa Tagihan:</span>
                          <span className="font-mono">Rp {sisaVal.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Notes Box */}
                  <div className={`border rounded-2xl p-4.5 text-xs font-semibold ${
                    invoice.status === 'refund'
                      ? 'bg-red-50/45 border-red-150 text-red-800'
                      : isLunas 
                      ? 'bg-emerald-50/45 border-emerald-150 text-emerald-800'
                      : 'bg-amber-50/45 border-amber-150 text-amber-800'
                  }`}>
                    <div className="flex items-start gap-2.5 text-left">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        invoice.status === 'refund'
                          ? 'bg-red-100 text-red-750'
                          : isLunas 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <strong className="block text-[11px] uppercase tracking-wider">
                          {invoice.status === 'refund' ? 'Catatan Pengembalian Dana:' : 'Catatan Pengambilan Kendaraan:'}
                        </strong>
                        <p className="leading-relaxed">
                          {invoice.status === 'refund'
                            ? "Refund telah disetujui pihak AutoRent dan dana dikembalikan penuh ke rekening asal."
                            : isLunas 
                            ? "Kendaraan dapat diserahkan setelah verifikasi data dan jaminan selesai."
                            : "Kendaraan belum dapat diserahkan karena pembayaran belum lunas."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print/Payment Buttons in Customer UI */}
                <div className="flex flex-col gap-4 max-w-4xl mx-auto print:hidden">
                  
                  {/* Inline Payment Gateway / Store Actions */}
                  {/* Inline Payment Gateway */}
                  {!isLunas && booking && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 text-xs space-y-4 text-left">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-5 h-5 text-blue-600 animate-pulse" />
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block">Payment Gateway Terintegrasi</span>
                            <span className="text-[10px] text-slate-500 font-normal">Mendukung QRIS, GoPay, ShopeePay, Virtual Account, & Kartu Kredit.</span>
                          </div>
                        </div>
                        
                        

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedBookingForPay?.id === booking.id && snapToken) {
                                openSnapPopup();
                              } else {
                                setSelectedBookingForPay(booking);
                                setPaymentAmount(nominalYangHarusDibayar);
                                setPaymentMethod('Payment Gateway');
                              }
                            }}
                            className={`w-full text-white font-extrabold py-3 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 text-xs ${
                              selectedBookingForPay?.id === booking.id && isLoadingSnap
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10'
                            }`}
                            disabled={selectedBookingForPay?.id === booking.id && isLoadingSnap}
                          >
                            {selectedBookingForPay?.id === booking.id && isLoadingSnap 
                              ? 'Menyiapkan Transaksi...' 
                              : selectedBookingForPay?.id === booking.id && snapToken
                              ? 'Buka Popup Pembayaran'
                              : 'Bayar Sekarang via Midtrans Sandbox'} 
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          
                          {selectedBookingForPay?.id === booking.id && isLoadingSnap && (
                            <span className="text-blue-600 animate-pulse text-[10px] text-center block font-semibold">
                              🔄 Menghubungi API Gateway Sandbox...
                            </span>
                          )}
                          {selectedBookingForPay?.id === booking.id && snapError && (
                            <span className="text-rose-600 text-[10px] text-center block font-semibold">
                              ❌ Gagal menyiapkan pembayaran Sandbox: {snapError}
                            </span>
                          )}
                          {selectedBookingForPay?.id === booking.id && snapToken && !snapError && (
                            <span className="text-emerald-600 text-[10px] text-center block font-semibold">
                              ✓ Transaksi sukses disiapkan! Silakan klik tombol di atas untuk membuka popup.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-3.5 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                    <button
                      onClick={() => {
                        setViewingInvoiceDetailId(null);
                        setActiveSubTab('invoice');
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      Kembali ke Daftar
                    </button>

                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border-0"
                    >
                      <Printer className="w-4 h-4" /> Cetak Nota Invoice (PDF)
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tagihan & Invoice Anda</h3>
                <p className="text-xs text-slate-400 mt-1">Gunakan berkas tagihan resmi di bawah ini untuk keperluan laporan/klaim.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">KODE INVOICE</th>
                    <th className="py-2.5 px-3">KODE BOOKING</th>
                    <th className="py-2.5 px-3">LAYANAN</th>
                    <th className="py-2.5 px-3 text-right">TOTAL</th>
                    <th className="py-2.5 px-3 text-right">TERBAYAR</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-650 text-[11px]">
                  {invoices.filter(i => i.userId === currentUser.id).map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-950">
                        <button
                          onClick={() => {
                            setViewingInvoiceDetailId(i.bookingId);
                            setActiveSubTab('invoice-detail');
                          }}
                          className="text-blue-650 hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
                        >
                          {i.invoiceCode}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{i.bookingCode}</td>
                      <td className="py-3 px-3 font-sans text-slate-700">{i.layanan}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">Rp {i.total.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right text-emerald-600">Rp {i.terbayar.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          i.status === 'lunas' ? 'bg-emerald-50 text-emerald-700' :
                          i.status === 'dp_lunas' ? 'bg-blue-50 text-blue-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {i.status === 'lunas' ? 'Lunas' :
                           i.status === 'dp_lunas' ? 'DP Terbayar' :
                           'Belum Bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setViewingInvoiceDetailId(i.bookingId);
                            setActiveSubTab('invoice-detail');
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-750 font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0"
                        >
                          Lihat Nota
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.filter(i => i.userId === currentUser.id).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic font-sans">Belum ada invoice yang diterbitkan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {activeSubTab === 'riwayat' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Riwayat Selesai & Batal</h3>
            <p className="text-xs text-slate-400 mt-1">Daftar transaksi penyewaan AutoRent Anda yang telah selesai maupun dibatalkan.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">KODE BOOKING</th>
                  <th className="py-2.5 px-3">LAYANAN</th>
                  <th className="py-2.5 px-3 text-right">TOTAL BIAYA</th>
                  <th className="py-2.5 px-3">TANGGAL SELESAI</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-600 text-[11px]">
                {currentCustomerBookings.filter(b => b.status.toLowerCase() === 'selesai' || b.status.toLowerCase() === 'dibatalkan' || b.status.toLowerCase() === 'ditolak').map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-800">{b.bookingCode}</td>
                    <td className="py-3 px-3 font-sans">{b.mobilNama ? `${b.mobilNama} (Rental)` : b.driverNama ? 'Supir Harian' : 'Layanan'}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">Rp {b.totalBayar.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-3 text-slate-400">{b.tanggalSelesai || '-'}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        b.status.toLowerCase() === 'selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {b.status.toLowerCase() === 'selesai' && !reviews.some(r => r.bookingId === b.id) && (
                        <button
                          onClick={() => setReviewModalData(b)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer border-0"
                        >
                          Beri Ulasan
                        </button>
                      )}
                      {reviews.some(r => r.bookingId === b.id) && (
                        <span className="text-emerald-600 text-[10px] font-bold">✓ Direview</span>
                      )}
                    </td>
                  </tr>
                ))}
                {currentCustomerBookings.filter(b => b.status.toLowerCase() === 'selesai' || b.status.toLowerCase() === 'dibatalkan' || b.status.toLowerCase() === 'ditolak').length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic font-sans">Belum ada riwayat transaksi selesai/batal.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'notifikasi' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Notifikasi Masuk</h3>
            <p className="text-xs text-slate-400 mt-1">Daftar pesan notifikasi dari sistem mengenai transaksi dan akun Anda.</p>
          </div>
          <div className="space-y-3">
            {notifications.filter(n => n.userId === 'all' || n.userId === currentUser.id).map(n => (
              <div key={n.id} className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${n.read ? 'bg-slate-50/50 border-slate-100' : 'bg-blue-50/30 border-blue-100'}`}>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs">{n.title}</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-2 font-mono">{n.timestamp}</span>
                </div>
                {!n.read && (
                  <button
                    onClick={() => onMarkNotificationRead(n.id)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-extrabold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer border-0"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>
            ))}
            {notifications.filter(n => n.userId === 'all' || n.userId === currentUser.id).length === 0 && (
              <div className="py-8 text-center text-slate-400 italic">Tidak ada notifikasi.</div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'settings' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pengaturan Akun</h3>
            <p className="text-xs text-slate-400 mt-1">Kelola preferensi akun Pelanggan Anda.</p>
          </div>
          
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Bahasa</label>
                <select className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white" disabled>
                  <option>Bahasa Indonesia (Default)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Zona Waktu</label>
                <select className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-700 bg-white" disabled>
                  <option>WIB (Asia/Jakarta)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/70">
              <h4 className="font-bold text-slate-800 text-xs">Verifikasi Akun</h4>
              <p className="text-slate-500 text-[10px] mt-1">Status Keanggotaan Anda saat ini terverifikasi. Anda dapat langsung menyewa semua kendaraan dengan jaminan standar.</p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mt-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Akun Terverifikasi Standard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {successPaymentNotification && (() => {
        const item = successPaymentNotification;
        return (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl border border-slate-100 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">✅ Pembayaran Berhasil</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Pembayaran sebesar <strong className="text-blue-600 font-mono">Rp {item.amount.toLocaleString('id-ID')}</strong> berhasil diterima. Invoice telah dibuat secara otomatis.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2 text-xs">
                <button
                  onClick={() => {
                    setViewingInvoiceDetailId(item.bookingId);
                    setActiveSubTab('invoice-detail');
                    setSuccessPaymentNotification(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 border-0"
                >
                  <FileText className="w-4 h-4" /> Lihat Invoice
                </button>
                <button
                  onClick={() => {
                    setViewingInvoiceDetailId(item.bookingId);
                    setActiveSubTab('invoice-detail');
                    setSuccessPaymentNotification(null);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1.5 border-0"
                >
                  <Printer className="w-4 h-4" /> Download PDF / Cetak
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL AJUKAN REFUND */}
      {bookingForRefund && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 shadow-2xl relative my-8 text-xs text-slate-700 space-y-5 border border-red-100/30">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-red-600" /> Ajukan Pengembalian Dana
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Booking: <span className="font-mono font-bold text-slate-600">{bookingForRefund.bookingCode}</span></p>
              </div>
              <button
                onClick={() => setBookingForRefund(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1 border-0 bg-transparent cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            {/* Refund Summary Card */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Total Dibayar:</span>
                <span className="font-mono font-extrabold text-slate-800">Rp {bookingForRefund.jumlahBayar.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center border-t border-red-100 pt-3">
                <span className="text-red-700 font-extrabold">Estimasi Refund:</span>
                <span className="font-mono font-extrabold text-red-600 text-sm">
                  Rp {bookingForRefund.jumlahBayar.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {bookingForRefund.jumlahBayar > 0
                  ? 'Dana yang sudah dibayar (DP/Lunas) akan dikembalikan 100% setelah diverifikasi admin.'
                  : '⚠️ Tidak ada dana yang dibayar. Refund sebesar Rp 0.'}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alasan Pembatalan <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundAlasan}
                  onChange={(e) => setRefundAlasan(e.target.value)}
                  placeholder="Contoh: Rencana perjalanan berubah, tidak jadi berangkat..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 resize-none font-sans"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Tambahan <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={refundCatatan}
                  onChange={(e) => setRefundCatatan(e.target.value)}
                  placeholder="Informasi tambahan jika diperlukan..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none font-sans"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-700 leading-relaxed">
              ⚠️ Pengajuan refund akan diproses oleh admin dalam 1&times;24 jam. Setelah disetujui, status booking akan berubah menjadi <strong>Dibatalkan</strong> dan dana akan dikembalikan via metode pembayaran awal.
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBookingForRefund(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-center cursor-pointer hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitRefund}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-center cursor-pointer shadow-md shadow-red-500/10 transition-all border-0"
              >
                Kirim Pengajuan Refund
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL REVIEW CUSTOMER */}
      {reviewModalData && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-4 shadow-2xl relative my-8 text-xs text-slate-700 space-y-5 border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Beri Ulasan</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Booking: <span className="font-mono font-bold text-slate-600">{reviewModalData.bookingCode}</span></p>
              </div>
              <button
                onClick={() => setReviewModalData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1 border-0 bg-transparent cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {reviewModalData.mobilId && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-800">Ulasan Mobil ({reviewModalData.mobilNama})</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rating</label>
                    <select
                      value={ratingMobil}
                      onChange={e => setRatingMobil(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (Sangat Baik)</option>
                      <option value="4">⭐⭐⭐⭐ (Baik)</option>
                      <option value="3">⭐⭐⭐ (Cukup)</option>
                      <option value="2">⭐⭐ (Buruk)</option>
                      <option value="1">⭐ (Sangat Buruk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Komentar</label>
                    <textarea
                      required
                      rows={2}
                      value={ulasanMobil}
                      onChange={e => setUlasanMobil(e.target.value)}
                      placeholder="Bagaimana kondisi dan kenyamanan mobil?"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                    />
                  </div>
                </div>
              )}

              {reviewModalData.driverId && reviewModalData.layanan !== 'rental' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-blue-900">Ulasan Supir ({reviewModalData.driverNama})</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 mb-1">Rating</label>
                    <select
                      value={ratingDriver}
                      onChange={e => setRatingDriver(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (Sangat Baik)</option>
                      <option value="4">⭐⭐⭐⭐ (Baik)</option>
                      <option value="3">⭐⭐⭐ (Cukup)</option>
                      <option value="2">⭐⭐ (Buruk)</option>
                      <option value="1">⭐ (Sangat Buruk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 mb-1">Komentar</label>
                    <textarea
                      required
                      rows={2}
                      value={ulasanDriver}
                      onChange={e => setUlasanDriver(e.target.value)}
                      placeholder="Bagaimana pelayanan dan keramahan supir?"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalData(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-center cursor-pointer hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-center cursor-pointer border-0"
                >
                  Kirim Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

