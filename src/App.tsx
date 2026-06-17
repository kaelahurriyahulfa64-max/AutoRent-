import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardCustomer from './components/DashboardCustomer';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardOwner from './components/DashboardOwner';
import SitemapAndDatabase from './components/SitemapAndDatabase';
import LoginRegisterPage from './components/LoginRegisterPage';
import GlobalLoading from './components/GlobalLoading';
import { ProfileAvatar } from './components/ProfileAvatar';
const PageSkeletonWrapper = ({ activeKey, children }: { activeKey: string, children: React.ReactNode }) => {
  return <>{children}</>;
};

import { User, Mobil, Driver, Booking, Pembayaran, Invoice, Review, AppNotification, CartItem, SystemSettings, Refund, MaintenanceRecord } from './types';
import { getStoredState, setStoredState, initLocalStorageOnLoad, getCarStatus, INITIAL_USERS, INITIAL_MOBIL, INITIAL_DRIVERS, INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_INVOICES, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_CART, INITIAL_SETTINGS, INITIAL_REFUNDS, INITIAL_MAINTENANCE } from './data';
import { Sparkles, HelpCircle, Layers, FileText, CheckCircle, Info, Star, Car, Users, Calendar, Calendar as CalendarIcon, Shield, UserCheck, TrendingUp, Home, ClipboardList, ShoppingCart, User as UserIcon, PhoneCall, LayoutDashboard, CreditCard, Receipt, Bell, Settings, Settings as SettingsIcon, LogOut, FileCheck, CheckSquare, ShieldCheck, ShieldAlert, Award, AlertCircle, MapPin, Wrench, RefreshCw, Search, Clock, X } from 'lucide-react';
import { ToastContainer, ConfirmModal, ToastData, ConfirmConfig, ToastType } from './components/ToastAndModal';

// Pure Guest user object — used as default when no session is active
const GUEST_USER: User = { id: 'guest', name: 'Guest', email: '', phone: '', role: 'customer' };

export default function App() {
  // Global State Managers — initLocalStorageOnLoad runs FIRST, synchronously
  const [users, setUsers] = useState<User[]>(() => {
    initLocalStorageOnLoad(); // Must run before any state is read
    return getStoredState('users', INITIAL_USERS);
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const list = getStoredState('users', INITIAL_USERS);
    try {
      const token = localStorage.getItem('autorent_session_token');
      const expiry = localStorage.getItem('autorent_session_expiry');
      if (token && expiry && Number(expiry) > Date.now()) {
        const parts = token.split('_');
        const userId = parts.slice(2).join('_');
        const matched = list.find(u => u.id === userId);
        if (matched) return matched;
      }
    } catch (e) {
      console.error('Error loading session from storage:', e);
    }
    // No valid session — start as Guest (NEVER auto-login to any customer account)
    return GUEST_USER;
  });


  const [cars, setCars] = useState<Mobil[]>(() => getStoredState('mobil', INITIAL_MOBIL));
  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredState('drivers', INITIAL_DRIVERS));

  const [bookings, setBookings] = useState<Booking[]>(() => getStoredState('bookings', INITIAL_BOOKINGS));
  const [payments, setPayments] = useState<Pembayaran[]>(() => getStoredState('payments', INITIAL_PAYMENTS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredState('invoices', INITIAL_INVOICES));
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = getStoredState('reviews', INITIAL_REVIEWS);
    return stored.length > 0 ? stored : INITIAL_REVIEWS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredState('notifications', INITIAL_NOTIFICATIONS));
  const [cart, setCart] = useState<CartItem[]>(() => getStoredState('cart', INITIAL_CART));
  const [settings, setSettings] = useState<SystemSettings>(() => {
    // Merge stored settings with INITIAL_SETTINGS as fallback
    // This ensures dpPercentage and other new fields always exist
    const stored = getStoredState('settings', INITIAL_SETTINGS);
    const merged: SystemSettings = {
      ...INITIAL_SETTINGS,
      ...stored,
      // Force dpPercentage to always be a valid number with default 30
      dpPercentage: (typeof stored.dpPercentage === 'number' && !isNaN(stored.dpPercentage) && stored.dpPercentage > 0)
        ? stored.dpPercentage
        : INITIAL_SETTINGS.dpPercentage,
      diskonPersen: (typeof stored.diskonPersen === 'number' && !isNaN(stored.diskonPersen))
        ? stored.diskonPersen
        : INITIAL_SETTINGS.diskonPersen,
    };
    return merged;
  });
  const [refunds, setRefunds] = useState<Refund[]>(() => getStoredState('refunds', INITIAL_REFUNDS));
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>(() => getStoredState('maintenanceList', INITIAL_MAINTENANCE));


  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmConfig({ isOpen: true, message, onConfirm });
  };

  // Cek apakah ada booking yang tertunda karena belum login
  useEffect(() => {
    if (currentUser.id !== 'guest') {
      const pendingStr = localStorage.getItem('autorent_pending_booking');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          localStorage.removeItem('autorent_pending_booking');
           setTimeout(() => {
            handleBookShortcut(pending.type, pending.id);
          }, 100);
        } catch (e) {
          console.error('Failed to parse pending booking', e);
        }
      }
    }
  }, [currentUser.id]);

  // Global Loading State
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const navigateWithLoading = (action: () => void, duration: number = 200) => {
    setIsGlobalLoading(true);
    setTimeout(() => {
      action();
      setTimeout(() => {
        setIsGlobalLoading(false);
      }, duration);
    }, 80);
  };

  // Trigger global loading overlay for data mutation processes
  const handleTriggerActionLoading = () => {
    setIsGlobalLoading(true);
    setTimeout(() => setIsGlobalLoading(false), 800);
  };

  const handleUpdateCart = (newCart: CartItem[]) => {
    handleTriggerActionLoading();
    setCart(newCart);
    setStoredState('cart', newCart);
  };

  const handleUpdateBookings = (newBookings: Booking[]) => {
    handleTriggerActionLoading();
    setBookings(newBookings);
    setStoredState('bookings', newBookings);
  };

  const handleUpdatePayments = (newPayments: Pembayaran[]) => {
    handleTriggerActionLoading();
    setPayments(newPayments);
    setStoredState('payments', newPayments);
  };

  const handleUpdateRefunds = (newRefunds: Refund[]) => {
    handleTriggerActionLoading();
    setRefunds(newRefunds);
    setStoredState('refunds', newRefunds);
  };

  const handleUpdateInvoices = (newInvoices: Invoice[]) => {
    if (!isGlobalLoading) handleTriggerActionLoading();
    setInvoices(newInvoices);
    setStoredState('invoices', newInvoices);
  };

  const processMidtransWebhook = async (wh: { id?: string; orderId: string; transactionStatus: string; grossAmount: number; paymentType: string; transactionTime: string; }): Promise<boolean> => {
    const currentBookings = getStoredState('bookings', INITIAL_BOOKINGS);
    const currentPayments = getStoredState('payments', INITIAL_PAYMENTS);
    const currentInvoices = getStoredState('invoices', INITIAL_INVOICES);
    const currentCars = getStoredState('mobil', INITIAL_MOBIL);
    const currentDrivers = getStoredState('drivers', INITIAL_DRIVERS);

    let updatedBookings = [...currentBookings];
    let updatedPayments = [...currentPayments];
    let updatedInvoices = [...currentInvoices];
    let updatedCars = [...currentCars];
    let updatedDrivers = [...currentDrivers];
    let stateChanged = false;

    const bk = updatedBookings.find(b => wh.orderId && (
      wh.orderId === b.bookingCode ||
      wh.orderId.includes(b.bookingCode) ||
      wh.orderId === b.midtransOrderId
    ));
    if (!bk) return false;

    if (wh.transactionStatus === 'settlement' || wh.transactionStatus === 'capture') {
      const amount = wh.grossAmount;
      const alreadyProcessedOrder = updatedPayments.some(p => p.midtransOrderId === wh.orderId);
      if (alreadyProcessedOrder) return false;

      const isFullPayment = bk.jumlahBayar + amount >= bk.totalBayar;
      const paymentType: Pembayaran['tipeBayar'] = bk.jumlahBayar === 0
        ? (isFullPayment ? 'lunas_full' : 'dp')
        : (isFullPayment ? 'lunas' : 'pelunasan');

      const newPayment: Pembayaran = {
        id: `p_wh_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        bookingId: bk.id,
        bookingCode: bk.bookingCode,
        userId: bk.userId,
        userNama: bk.userNama,
        tipeBayar: paymentType,
        jumlah: amount,
        metode: wh.paymentType ? wh.paymentType : 'Payment Gateway',
        buktiTransferUrl: '',
        tanggalBayar: wh.transactionTime || new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'disetujui',
        midtransOrderId: wh.orderId
      };
      updatedPayments = [newPayment, ...updatedPayments];

      const newJumlahBayar = bk.jumlahBayar + amount;
      const isLunas = newJumlahBayar >= bk.totalBayar;

      updatedBookings = updatedBookings.map(b => {
        if (b.id === bk.id) {
          return {
            ...b,
            jumlahBayar: newJumlahBayar,
            sisaPelunasan: Math.max(0, b.totalBayar - newJumlahBayar),
            status: 'Dikonfirmasi' as const,
            statusPembayaran: isLunas ? ('Lunas' as const) : ('DP Dibayar' as const),
            metodePembayaran: 'gateway' as const,
            midtransOrderId: wh.orderId
          };
        }
        return b;
      });

      const exists = updatedInvoices.some(inv => inv.bookingId === bk.id);
      if (exists) {
        updatedInvoices = updatedInvoices.map(inv => {
          if (inv.bookingId === bk.id) {
            const currentTerbayar = inv.terbayar || 0;
            const currentTotal = inv.total || bk.totalBayar;
            const newTerbayar = currentTerbayar + amount;
            return {
              ...inv,
              terbayar: newTerbayar,
              sisa: Math.max(0, currentTotal - newTerbayar),
              totalNominal: currentTotal,
              status: (newTerbayar >= currentTotal) ? 'lunas' : 'dp_lunas',
              metodePembayaran: wh.paymentType ? wh.paymentType : 'Payment Gateway',
              tanggalPembayaran: newPayment.tanggalBayar
            };
          }
          return inv;
        });
      } else {
        const invId = `i_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        const rincianText = bk.layanan === 'rental'
          ? `Sewa Lepas Kunci ${bk.mobilNama} (${bk.durasiHari || 0} hari)`
          : bk.layanan === 'rental_driver'
          ? `Sewa ${bk.mobilNama} (${bk.durasiHari || 0} hari) + Jasa Driver ${bk.driverNama}`
          : `Jasa Driver Profesional ${bk.driverNama}`;

        const newInvoice: Invoice = {
          id: invId,
          invoiceCode: `INV/${new Date().getFullYear()}/${bk.bookingCode}/${Date.now().toString().slice(-5)}`,
          bookingId: bk.id,
          bookingCode: bk.bookingCode,
          userId: bk.userId,
          userNama: bk.userNama,
          layanan: bk.layanan === 'rental' ? 'Rental Mobil' : bk.layanan === 'rental_driver' ? 'Rental + Driver' : 'Jasa Driver',
          rincianItem: rincianText,
          subtotal: bk.totalBayar,
          denda: bk.denda || 0,
          biayaTambahan: bk.biayaTambahan || 0,
          total: bk.totalBayar,
          totalNominal: bk.totalBayar,
          terbayar: amount,
          sisa: Math.max(0, bk.totalBayar - amount),
          status: amount >= bk.totalBayar ? 'lunas' : 'dp_lunas',
          tanggalDibuat: new Date().toISOString().substring(0, 10),
          tanggal: new Date().toISOString().substring(0, 10),
          metodePembayaran: wh.paymentType ? wh.paymentType : 'Payment Gateway',
          tanggalPembayaran: newPayment.tanggalBayar
        };
        updatedInvoices = [newInvoice, ...updatedInvoices];
      }

      if (bk.mobilId) {
        updatedCars = updatedCars.map(c => c.id === bk.mobilId ? { ...c, status: 'Disewa' as const } : c);
      }
      if (bk.driverId) {
        updatedDrivers = updatedDrivers.map(d => d.id === bk.driverId ? { ...d, status: 'booking' as const } : d);
      }

      const formattedTimestamp = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().replace('T', ' ').substring(0, 16);

      // Create target notifications
      const customerNotif: AppNotification = {
        id: `nt_cust_${Date.now()}`,
        userId: bk.userId,
        title: 'Pembayaran Berhasil',
        message: 'Pembayaran berhasil. Invoice telah dibuat.',
        type: 'success',
        read: false,
        timestamp: formattedTimestamp
      };

      const adminNotif: AppNotification = {
        id: `nt_admin_${Date.now()}`,
        userId: 'user_admin_1',
        title: 'Pembayaran Booking Diterima',
        message: `Pembayaran booking ${bk.bookingCode} berhasil diterima.`,
        type: 'success',
        read: false,
        timestamp: formattedTimestamp
      };

      const ownerNotif: AppNotification = {
        id: `nt_owner_${Date.now()}`,
        userId: 'user_owner_1',
        title: 'Transaksi Baru Tercatat',
        message: 'Transaksi baru berhasil tercatat.',
        type: 'success',
        read: false,
        timestamp: formattedTimestamp
      };

      setNotifications(prev => [customerNotif, adminNotif, ownerNotif, ...prev]);
      stateChanged = true;
    } else if (wh.transactionStatus === 'expire' || wh.transactionStatus === 'cancel' || wh.transactionStatus === 'deny') {
      updatedBookings = updatedBookings.map(b => {
        if (b.id === bk.id) {
          return {
            ...b,
            status: 'dibatalkan' as const,
            statusPembayaran: 'Belum Bayar' as const
          };
        }
        return b;
      });
      if (bk.mobilId) {
        updatedCars = updatedCars.map(c => c.id === bk.mobilId ? { ...c, status: 'Tersedia' as const } : c);
      }
      if (bk.driverId) {
        updatedDrivers = updatedDrivers.map(d => d.id === bk.driverId ? { ...d, status: 'aktif' as const } : d);
      }

      const formattedTimestamp = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().replace('T', ' ').substring(0, 16);

      const newNo: AppNotification = {
        id: `nt_wh_fail_${Date.now()}`,
        userId: bk.userId,
        title: 'Pembayaran Gagal / Kadaluarsa',
        message: `Pembayaran booking ${bk.bookingCode} gagal, dibatalkan, atau kadaluarsa. Jadwal telah dibebaskan.`,
        type: 'warning',
        read: false,
        timestamp: formattedTimestamp
      };
      setNotifications(prev => [newNo, ...prev]);
      stateChanged = true;
    }

    if (stateChanged) {
      // Synchronously write to localStorage
      setStoredState('bookings', updatedBookings);
      setStoredState('payments', updatedPayments);
      setStoredState('invoices', updatedInvoices);
      setStoredState('mobil', updatedCars);
      setStoredState('drivers', updatedDrivers);

      // Update React state
      setBookings(updatedBookings);
      setPayments(updatedPayments);
      setInvoices(updatedInvoices);
      setCars(updatedCars);
      setDrivers(updatedDrivers);
    }
    return stateChanged;
  };

  // Expose processMidtransWebhook for E2E testing in development mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__autorentProcessWebhook = processMidtransWebhook;
    }
  });

  // Current page router state
  const [rawActiveTab, setRawActiveTab] = useState<string>('landing');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  
  const [customerActiveSubTab, setRawCustomerActiveSubTab] = useState<string>('dashboard');
  const [selectedBookingItem, setSelectedBookingItem] = useState<{ type: 'rental' | 'driver'; id: string } | null>(null);
  const [adminActiveTab, setRawAdminActiveTab] = useState<string>('dashboard');
  const [ownerActiveTab, setRawOwnerActiveTab] = useState<string>('dashboard');

  // Wrapper functions to trigger loading
  const activeTab = rawActiveTab;
  const setActiveTab = (tab: string, isLogin: boolean = false) => {
    if (tab === rawActiveTab) return;
    if (isLogin) {
      navigateWithLoading(() => setRawActiveTab(tab), 600);
    } else {
      setRawActiveTab(tab);
    }
  };
  
  const setCustomerActiveSubTab = (tab: string) => setRawCustomerActiveSubTab(tab);
  const setAdminActiveTab = (tab: string) => setRawAdminActiveTab(tab);
  const setOwnerActiveTab = (tab: string) => setRawOwnerActiveTab(tab);

  // Filters catalog states
  const [carFilterType, setCarFilterType] = useState<string>('All');
  const [carSearchTerm, setCarSearchTerm] = useState<string>('');
  const [driverSearchTerm, setDriverSearchTerm] = useState<string>('');

  // Auto trigger save state on edits
  useEffect(() => {
    setStoredState('users', users);
  }, [users]);

  useEffect(() => {
    setStoredState('mobil', cars);
  }, [cars]);

  useEffect(() => {
    setStoredState('drivers', drivers);
  }, [drivers]);

  useEffect(() => {
    setStoredState('bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    setStoredState('payments', payments);
  }, [payments]);

  useEffect(() => {
    setStoredState('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    setStoredState('reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    setStoredState('maintenanceList', maintenanceList);
  }, [maintenanceList]);

  useEffect(() => {
    setStoredState('cart', cart);
  }, [cart]);

  useEffect(() => {
    setStoredState('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredState('settings', settings);
  }, [settings]);

  useEffect(() => {
    setStoredState('refunds', refunds);
  }, [refunds]);


  // One-time data migration: Fix broken Unsplash URLs in local storage
  useEffect(() => {
    const patchMap: Record<string, string> = {
      'https://images.unsplash.com/photo-1503376760367-15ea4dc08c87?auto=format&fit=crop&q=80&w=600': '/assets/macan.png',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600': '/assets/innova.png',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600': '/assets/civic.png',
      'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150': '/assets/driver3.png',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150': '/assets/driver4.png'
    };

    let localCars = getStoredState('mobil', INITIAL_MOBIL);
    let localDrivers = getStoredState('drivers', INITIAL_DRIVERS);
    let changed = false;

    localCars = localCars.map((c: any) => {
      if (patchMap[c.foto]) {
        changed = true;
        return { ...c, foto: patchMap[c.foto] };
      }
      return c;
    });

    localDrivers = localDrivers.map((d: any) => {
      if (patchMap[d.foto]) {
        changed = true;
        return { ...d, foto: patchMap[d.foto] };
      }
      return d;
    });

    if (changed) {
      setStoredState('mobil', localCars);
      setStoredState('drivers', localDrivers);
      setCars(localCars);
      setDrivers(localDrivers);
    }
  }, []);

  // Cross-tab synchronization — only fires when ANOTHER tab writes to localStorage
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      // Only react to autorent keys changed by OTHER tabs
      if (!e.key || !e.key.startsWith('autorent_')) return;

      const keyMap: Record<string, (val: any) => void> = {
        'autorent_users': (v) => setUsers(v || INITIAL_USERS),
        'autorent_mobil': (v) => setCars(v || INITIAL_MOBIL),
        'autorent_drivers': (v) => setDrivers(v || INITIAL_DRIVERS),
        'autorent_bookings': (v) => setBookings(v || INITIAL_BOOKINGS),
        'autorent_payments': (v) => setPayments(v || INITIAL_PAYMENTS),
        'autorent_invoices': (v) => setInvoices(v || INITIAL_INVOICES),
        'autorent_reviews': (v) => { const r = v || INITIAL_REVIEWS; setReviews(r.length > 0 ? r : INITIAL_REVIEWS); },
        'autorent_notifications': (v) => setNotifications(v || INITIAL_NOTIFICATIONS),
        'autorent_cart': (v) => setCart(v || INITIAL_CART),
        'autorent_settings': (v) => setSettings(v || INITIAL_SETTINGS),
        'autorent_refunds': (v) => setRefunds(v || INITIAL_REFUNDS),
        'autorent_maintenanceList': (v) => setMaintenanceList(v || INITIAL_MAINTENANCE),
      };

      const setter = keyMap[e.key];
      if (setter && e.newValue) {
        try {
          setter(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error parsing synced state for', e.key, err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Automatic booking expiration checker (24 hours deadline)
  useEffect(() => {
    const checkAndExpireBookings = () => {
      const now = new Date();
      let stateChanged = false;

      const updatedBookings = bookings.map(b => {
        const isUnpaid = b.jumlahBayar === 0 && (b.statusPembayaran === 'Menunggu Pembayaran' || b.statusPembayaran === 'Belum Bayar');
        const isNotEnded = b.status !== 'Expired' && b.status !== 'dibatalkan' && b.status !== 'Dibatalkan' && b.status !== 'selesai' && b.status !== 'Selesai';
        
        if (isUnpaid && isNotEnded && b.tanggalBooking) {
          const bookingTimeUtcStr = b.tanggalBooking.replace(' ', 'T') + ':00.000Z';
          const bookingTime = new Date(bookingTimeUtcStr);
          const diffMs = now.getTime() - bookingTime.getTime();
          const limitMs = 24 * 60 * 60 * 1000; // 24 hours

          if (diffMs >= limitMs) {
            stateChanged = true;
            return {
              ...b,
              status: 'Expired' as const,
              statusPembayaran: 'Kedaluwarsa' as const
            };
          }
        }
        return b;
      });

      if (stateChanged) {
        let updatedCars = [...cars];
        let updatedDrivers = [...drivers];
        let updatedInvoices = [...invoices];
        let newNotifications = [...notifications];

        bookings.forEach((b, idx) => {
          const updatedB = updatedBookings[idx];
          if (b.status !== 'Expired' && updatedB.status === 'Expired') {
            if (b.mobilId) {
              updatedCars = updatedCars.map(c => 
                c.id === b.mobilId ? { ...c, status: 'Tersedia' as const } : c
              );
            }
            if (b.driverId) {
              updatedDrivers = updatedDrivers.map(d => 
                d.id === b.driverId ? { ...d, status: 'aktif' as const } : d
              );
            }
            updatedInvoices = updatedInvoices.map(inv => 
              inv.bookingId === b.id ? { ...inv, status: 'Kedaluwarsa' as any } : inv
            );

            const newNo: AppNotification = {
              id: `nt_exp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              userId: b.userId,
              title: 'Booking Kadaluarsa',
              message: `Pemesanan ${b.bookingCode} telah dibatalkan otomatis karena melewati batas waktu pembayaran 24 jam.`,
              type: 'warning',
              read: false,
              timestamp: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().replace('T', ' ').substring(0, 16)
            };
            newNotifications = [newNo, ...newNotifications];
          }
        });

        setBookings(updatedBookings);
        setCars(updatedCars);
        setDrivers(updatedDrivers);
        setInvoices(updatedInvoices);
        setNotifications(newNotifications);
      }
    };

    checkAndExpireBookings();
    const interval = setInterval(checkAndExpireBookings, 5000);
    return () => clearInterval(interval);
  }, [bookings, cars, drivers, invoices, notifications]);

  // Polling webhook payments from local Express/Vite server
  useEffect(() => {
    const pollWebhooks = async () => {
      try {
        const response = await fetch('/api/webhook-payments');
        if (!response.ok) return;
        const webhooks = await response.json();
        if (!Array.isArray(webhooks) || webhooks.length === 0) return;

        const processedStr = localStorage.getItem('autorent_processed_webhooks') || '[]';
        let processed: string[] = JSON.parse(processedStr);

        for (const wh of webhooks) {
          if (processed.includes(wh.id)) {
            await fetch('/api/webhook-payments/clear', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: wh.id })
            });
            continue;
          }

          const webhookProcessed = await processMidtransWebhook({
            id: wh.id,
            orderId: wh.orderId || wh.order_id || '',
            transactionStatus: wh.transactionStatus || wh.transaction_status || '',
            grossAmount: Number(wh.grossAmount || wh.gross_amount || 0),
            paymentType: wh.paymentType || wh.payment_type || 'Payment Gateway',
            transactionTime: wh.transactionTime || wh.transaction_time || new Date().toISOString().replace('T', ' ').substring(0, 16)
          });

          if (webhookProcessed) {
            processed.push(wh.id);
            localStorage.setItem('autorent_processed_webhooks', JSON.stringify(processed));
          }

          await fetch('/api/webhook-payments/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: wh.id })
          });
        }
      } catch (err) {
        console.error('Failed polling webhooks:', err);
      }
    };

    pollWebhooks();
    const interval = setInterval(pollWebhooks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Dynamic User Role toggles
  const handleRoleChange = (role: 'customer' | 'admin' | 'owner') => {
    const target = users.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const handleUpdateUsers = (newUser: User) => {
    const exist = users.some(u => u.id === newUser.id);
    const updated = exist
      ? users.map(u => u.id === newUser.id ? newUser : u)
      : [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
  };

  // Add Dynamic Notif elements
  const handleAddNotification = (title: string, message: string, type: 'info' | 'success' | 'warning', targetUserId?: string) => {
    const newNo: AppNotification = {
      id: `nt_${Date.now()}`,
      userId: targetUserId || currentUser.id,
      title,
      message,
      type,
      read: false,
      timestamp: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().replace('T', ' ').substring(0, 16)
    };
    setNotifications([newNo, ...notifications]);
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleBookShortcut = (type: 'rental' | 'driver', id: string) => {
    // If user is Guest, save pending booking and redirect to login
    if (currentUser.id === 'guest') {
      localStorage.setItem('autorent_pending_booking', JSON.stringify({ type, id }));
      handleAddNotification('Akses Terbatas', 'Silakan login atau daftar terlebih dahulu untuk melakukan pemesanan.', 'warning');
      setActiveTab('login');
      return;
    }
    setSelectedBookingItem({ type, id });
    setActiveTab('booking');
  };

  const showSidebar = activeTab.startsWith('dashboard-') || activeTab === 'booking';

  const handleLogout = () => {
    showConfirm('Apakah Anda yakin ingin logout dari sesi Anda saat ini?', () => {
      navigateWithLoading(() => {
        localStorage.removeItem('autorent_session_token');
        localStorage.removeItem('autorent_session_expiry');
        
        // Return to pure Guest — NEVER auto-login to any customer
        setCurrentUser(GUEST_USER);
        
        setRawActiveTab('landing'); // Use raw setter to avoid double loading trigger
        handleAddNotification('Sesi Berakhir', 'Anda berhasil keluar dari sistem.', 'info');
      }, 600);
    });
  };

  // Automatically check for session expiration
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('autorent_session_token');
      const expiry = localStorage.getItem('autorent_session_expiry');
      if (token && expiry) {
        if (Date.now() > Number(expiry)) {
          // Session expired — return to pure Guest
          localStorage.removeItem('autorent_session_token');
          localStorage.removeItem('autorent_session_expiry');
          
          setCurrentUser(GUEST_USER);
          
          setActiveTab('landing');
          handleAddNotification(
            'Sesi Kadaluarsa',
            'Sesi login Anda telah berakhir. Silakan masuk kembali.',
            'warning'
          );
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [currentUser]);

  const renderMainAppContainer = () => {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 relative h-full overflow-hidden">
        {/* Dynamic Header */}
        <div className="sticky top-0 z-50 w-full shrink-0">
          <Navbar
            currentUser={currentUser}
            allUsers={users}
            onRoleChange={handleRoleChange}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotifRead}
            onSetCurrentUser={setCurrentUser}
            onRegisterUser={handleUpdateUsers}
            onAddNotification={handleAddNotification}
            bookings={bookings}
            adminActiveTab={adminActiveTab}
            setAdminActiveTab={setAdminActiveTab}
            payments={payments}
            allCars={cars}
            allDrivers={drivers}
            cart={cart}
            customerActiveSubTab={customerActiveSubTab}
            setCustomerActiveSubTab={setCustomerActiveSubTab}
            setLoginMode={setLoginMode}
            onLogout={handleLogout}
          />
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Geometric Sidebar Navigation - Left side (Deep Corporate Navy Theme) */}
          {showSidebar && (
            <aside className="w-64 bg-[#0a1128] text-white flex flex-col border-r border-[#152549] hidden md:flex shrink-0 h-full overflow-y-auto">


              {/* User Profile Card */}
              <div className="p-5 border-b border-[#152549] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden bg-slate-800 shrink-0">
                  <ProfileAvatar name={currentUser.name} avatarUrl={currentUser.avatar} className="w-full h-full text-[13px] tracking-wide" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white truncate leading-tight">{currentUser.name}</h4>
                  <p className="text-[9px] uppercase font-bold text-blue-400 tracking-wider mt-0.5">
                    {currentUser.role === 'customer' ? 'Pelanggan' : currentUser.role === 'admin' ? 'Administrator' : 'Mitra Owner'}
                  </p>
                </div>
              </div>

              {/* Scrollable Navigation Menu */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
                {currentUser.role === 'customer' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-customer');
                        setCustomerActiveSubTab('dashboard');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        (activeTab === 'dashboard-customer' || activeTab === 'booking') && customerActiveSubTab === 'dashboard'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-customer');
                        setCustomerActiveSubTab('rental');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        (activeTab === 'dashboard-customer' || activeTab === 'booking') && customerActiveSubTab === 'rental'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Car className="w-4 h-4" />
                      <span>Rental Mobil</span>
                    </button>




                    <button
                      onClick={() => {
                        setActiveTab('dashboard-customer');
                        setCustomerActiveSubTab('cart');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        (activeTab === 'dashboard-customer' || activeTab === 'booking') && customerActiveSubTab === 'cart'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-4 h-4 text-emerald-400" />
                        <span>Keranjang</span>
                      </div>
                      {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length > 0 && (
                        <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full select-none">
                          {cart.filter(item => item.userId === currentUser.id && item.status !== 'checkout' && item.status !== 'dibatalkan').length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-customer');
                        setCustomerActiveSubTab('my-bookings');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        (activeTab === 'dashboard-customer' || activeTab === 'booking') && customerActiveSubTab === 'my-bookings'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Booking Saya</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-customer');
                        setCustomerActiveSubTab('invoice');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        (activeTab === 'dashboard-customer' || activeTab === 'booking') && (customerActiveSubTab === 'invoice' || customerActiveSubTab === 'invoice-detail')
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-customer');
                        setCustomerActiveSubTab('profile');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        (activeTab === 'dashboard-customer' || activeTab === 'booking') && customerActiveSubTab === 'profile'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Profil</span>
                    </button>

                  </>
                )}

                {currentUser.role === 'admin' && (
                  <>
                    {/* CORE */}
                    <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-4 mb-1.5 px-4">CORE</div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('dashboard');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'dashboard'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Dashboard</span>
                    </button>

                    {/* MASTER DATA */}
                    <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-4 mb-1.5 px-4">MASTER DATA</div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('cars-data');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'cars-data'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Data Mobil</span>
                    </button>



                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('employees');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'employees'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Data Driver</span>
                    </button>

                    {/* TRANSAKSI */}
                    <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-4 mb-1.5 px-4">TRANSAKSI</div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('cars-bookings');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'cars-bookings'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Booking Mobil</span>
                      </div>
                      {bookings.filter(b => b.status === 'pending_konfirmasi' && (b.layanan === 'rental' || b.layanan === 'rental_driver')).length > 0 && (
                        <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">
                          {bookings.filter(b => b.status === 'pending_konfirmasi' && (b.layanan === 'rental' || b.layanan === 'rental_driver')).length}
                        </span>
                      )}
                    </button>




                    {/* OPERASIONAL */}
                    <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-4 mb-1.5 px-4">OPERASIONAL</div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('cars-ops');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'cars-ops'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Operasional Mobil</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('cars-maintenance');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'cars-maintenance'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Maintenance Mobil</span>
                      </div>
                      {cars.filter(c => c.status === 'maintenance').length > 0 && (
                        <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">
                          {cars.filter(c => c.status === 'maintenance').length}
                        </span>
                      )}
                    </button>



                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('drivers-schedules');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'drivers-schedules'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Jadwal Driver</span>
                    </button>

                    {/* KEUANGAN */}
                    <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-4 mb-1.5 px-4">KEUANGAN</div>
                    

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('invoices');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'invoices'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Receipt className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('refunds');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'refunds'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <RefreshCw className="w-4 h-4 text-blue-400 shrink-0 animate-spin-slow" />
                      <span>Kelola Refund</span>
                      {refunds.filter(r => r.status === 'Menunggu Verifikasi').length > 0 && (
                        <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full ml-auto animate-pulse">
                          {refunds.filter(r => r.status === 'Menunggu Verifikasi').length}
                        </span>
                      )}
                    </button>

                    {/* LAINNYA */}
                    <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-4 mb-1.5 px-4">LAINNYA</div>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-admin');
                        setAdminActiveTab('reviews');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-admin' && adminActiveTab === 'reviews'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>Review</span>
                    </button>


                  </>
                )}

                {currentUser.role === 'owner' && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('dashboard-owner');
                        setOwnerActiveTab('dashboard');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-owner' && ownerActiveTab === 'dashboard'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-owner');
                        setOwnerActiveTab('monitoring');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-owner' && ownerActiveTab === 'monitoring'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Car className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Monitoring Penyewaan</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-owner');
                        setOwnerActiveTab('maintenance');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-owner' && ownerActiveTab === 'maintenance'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Maintenance Mobil</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard-owner');
                        setOwnerActiveTab('reports-finance');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold cursor-pointer ${
                        activeTab === 'dashboard-owner' && ownerActiveTab === 'reports-finance'
                          ? 'bg-[#1E3A5F] text-white shadow-md border-l-4 border-blue-400 pl-3 font-bold'
                          : 'text-slate-300 hover:bg-[#121f3c] hover:text-white'
                      }`}
                    >
                      <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Laporan Keuangan</span>
                    </button>

                  </>
                )}

                {/* Common Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 cursor-pointer mt-6"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-[#152549]">
                <div className="bg-[#070d1e] p-3.5 rounded-xl border border-blue-950/70">
                  <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest mb-1 font-display">STATUS KONEKSI</p>
                  <div className="flex items-center gap-2 text-[11px] text-blue-200 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    Database Terhubung
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content Window */}
          <div className="flex-1 flex flex-col min-w-0 bg-white h-full overflow-y-auto">

            {/* Main Content Layout container */}
            <main className={`flex-1 overflow-x-hidden ${showSidebar ? 'pl-8 lg:pl-10 pr-4 lg:pr-8 py-6 max-w-[1600px] w-full mx-auto' : ''}`}>
              <PageSkeletonWrapper activeKey={`${activeTab}-${adminActiveTab}-${ownerActiveTab}-${customerActiveSubTab}`}>
              {/* 1. PUBLIC LANDING PAGE */}
              {activeTab === 'landing' && (
                <div className="w-full">
                  <LandingPage
                  cars={cars}
                  bookings={bookings}
                  drivers={drivers}
                  reviews={reviews}
                  setActiveTab={setActiveTab}
                  setSelectedBookingItem={handleBookShortcut}
                  currentUser={currentUser}
                  allUsers={users}
                  setAllUsers={setUsers}
                  setCurrentUser={setCurrentUser}
                  onAddNotification={handleAddNotification}
                />
                </div>
              )}

              {/* 2. SPEC SHEET DEVELOPER ZONE TAB */}
              {activeTab === 'sitemap-db' && (
                <SitemapAndDatabase />
              )}

              {/* 3. FLUID FULL CATALOG: RENTAL CARS DIRECT */}
              {activeTab === 'rental' && (
                <div className="space-y-8" id="full-car-catalog-page">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Katalog Rental Mobil</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Sewa armada harian lepas kunci terlengkap beserta detail bensin & plat kendaraan.</p>
                    </div>

                    {/* Filters & search */}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Cari model mobil..."
                        value={carSearchTerm}
                        onChange={(e) => setCarSearchTerm(e.target.value)}
                        className="px-3.5 py-1.5 focus:bg-white text-xs bg-slate-100 rounded-lg focus:outline-none border border-slate-200"
                      />

                      <select
                        value={carFilterType}
                        onChange={(e) => setCarFilterType(e.target.value)}
                        className="px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars
                      .filter(car => {
                        const mType = carFilterType === 'All' || car.tipe === carFilterType;
                        const mSearch = car.nama.toLowerCase().includes(carSearchTerm.toLowerCase()) || car.brand.toLowerCase().includes(carSearchTerm.toLowerCase());
                        return mType && mSearch;
                      })
                      .map((car) => (
                        <div key={car.id} className="bg-white rounded-2xl border border-slate-100/90 overflow-hidden hover:shadow-xl hover:border-blue-400/20 transition-all duration-300 group">
                          <div className="h-44 w-full bg-slate-50 relative overflow-hidden">
                            <img
                              src={car.foto}
                              alt={car.nama}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 bg-blue-600 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {car.tipe}
                            </span>
                            <span className={`absolute top-3 right-3 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase ${car.status === 'tersedia' ? 'bg-emerald-500' : car.status === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'
                              }`}>
                              {car.status}
                            </span>
                          </div>

                          <div className="p-4 space-y-3">
                            <div>
                              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{car.brand}</span>
                              <h5 className="font-bold text-slate-900 text-sm">{car.nama}</h5>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-50 text-[10px] text-slate-500">
                              <div>
                                <span className="block font-semibold text-slate-700">{car.kapasitas} Kursi</span>
                                Kapasitas
                              </div>
                              <div>
                                <span className="block font-semibold text-slate-700">{car.bensin}</span>
                                Bahan Bakar
                              </div>
                              <div>
                                <span className="block font-semibold text-slate-700 font-mono text-[9px]">{car.platNomor}</span>
                                No Polisi
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2">
                              <div>
                                <span className="text-[9px] text-slate-400 block font-medium">Tarif Sewa</span>
                                <span className="font-extrabold text-blue-600 text-sm">
                                  Rp {car.hargaSewa.toLocaleString('id-ID')}
                                  <span className="text-[10px] text-slate-400 font-normal"> /hari</span>
                                </span>
                              </div>

                              {currentUser.role === 'admin' || currentUser.role === 'owner' ? (
                                <button
                                  onClick={() => {
                                    setAdminActiveTab('cars');
                                    setActiveTab('dashboard-admin');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="bg-red-650 hover:bg-red-750 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                  Kelola Armada
                                </button>
                              ) : car.status === 'tersedia' ? (
                                <button
                                  onClick={() => handleBookShortcut('rental', car.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                  Pesan Sewa
                                </button>
                              ) : (
                                <span className="text-slate-400 text-xs font-semibold italic">Masa Booking</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}


              {/* 6. REDIRECT / ROUTER PORTAL FOR ROLE DASHBOARDS */}
              {activeTab === 'dashboard-customer' && (
                <DashboardCustomer
                  currentUser={currentUser}
                  allCars={cars}
                  allDrivers={drivers}
                  bookings={bookings}
                  payments={payments}
                  invoices={invoices}
                  reviews={reviews}
                  notifications={notifications}
                  onMarkNotificationRead={handleMarkNotifRead}
                  onUpdateBookings={handleUpdateBookings}
                  onUpdatePayments={handleUpdatePayments}
                  onUpdateInvoices={handleUpdateInvoices}
                  onProcessGatewayWebhook={processMidtransWebhook}
                  onSetActiveTab={setActiveTab}
                  onUpdateReviews={setReviews}
                  
                  onUpdateUser={handleUpdateUsers}
                  onUpdateCars={setCars}
                  onUpdateDrivers={setDrivers}
                  onAddNotification={handleAddNotification}
                  selectedBookingItem={selectedBookingItem}
                  clearBookingSelection={() => setSelectedBookingItem(null)}
                  cart={cart}
                  onUpdateCart={handleUpdateCart}
                  settings={settings}
                  activeSubTab={customerActiveSubTab}
                  onUpdateActiveSubTab={setCustomerActiveSubTab}
                  refunds={refunds}
                  onUpdateRefunds={handleUpdateRefunds}
                  onShowToast={showToast}
                  onShowConfirm={showConfirm}
                />
              )}

              {/* 7. REDIRECT FOR BOOKING SHORTCUT */}
              {activeTab === 'booking' && (
                <DashboardCustomer
                  currentUser={currentUser}
                  allCars={cars}
                  allDrivers={drivers}
                  bookings={bookings}
                  payments={payments}
                  invoices={invoices}
                  reviews={reviews}
                  notifications={notifications}
                  onMarkNotificationRead={handleMarkNotifRead}
                  onUpdateBookings={handleUpdateBookings}
                  onUpdatePayments={handleUpdatePayments}
                  onUpdateInvoices={handleUpdateInvoices}
                  onProcessGatewayWebhook={processMidtransWebhook}
                  onSetActiveTab={setActiveTab}
                  onUpdateReviews={setReviews}
                  onUpdateUser={handleUpdateUsers}
                  onUpdateCars={setCars}
                  onUpdateDrivers={setDrivers}
                  onAddNotification={handleAddNotification}
                  selectedBookingItem={selectedBookingItem}
                  clearBookingSelection={() => setSelectedBookingItem(null)}
                  cart={cart}
                  onUpdateCart={handleUpdateCart}
                  settings={settings}
                  activeSubTab={customerActiveSubTab}
                  onUpdateActiveSubTab={setCustomerActiveSubTab}
                  refunds={refunds}
                  onUpdateRefunds={handleUpdateRefunds}
                  onShowToast={showToast}
                  onShowConfirm={showConfirm}
                />
              )}

              {/* 8. ADMIN DASHBOARD */}
              {activeTab === 'dashboard-admin' && (
                <DashboardAdmin
                  allCars={cars}
                  allDrivers={drivers}
                  bookings={bookings}
                  payments={payments}
                  invoices={invoices}
                  maintenanceList={maintenanceList}
                  onUpdateMaintenanceList={setMaintenanceList}
                  onUpdateCars={setCars}
                  onUpdateDrivers={setDrivers}
                  onUpdateBookings={handleUpdateBookings}
                  onUpdatePayments={handleUpdatePayments}
                  onUpdateInvoices={handleUpdateInvoices}
                  onAddNotification={handleAddNotification}
                  activeTab={adminActiveTab}
                  setActiveTab={setAdminActiveTab}
                  settings={settings}
                  onUpdateSettings={setSettings}
                  allUsers={users}
                  onUpdateUsers={setUsers}
                  reviews={reviews}
                  onUpdateReviews={setReviews}
                  refunds={refunds}
                  onUpdateRefunds={handleUpdateRefunds}
                  onShowToast={showToast}
                  onShowConfirm={showConfirm}
                />
              )}

              {/* 9. OWNER DASHBOARD */}
              {activeTab === 'dashboard-owner' && (
                <DashboardOwner
                  bookings={bookings}
                  invoices={invoices}
                  payments={payments}
                  allCars={cars}
                  allDrivers={drivers}
                  refunds={refunds}
                  maintenanceList={maintenanceList}
                  onUpdateMaintenanceList={setMaintenanceList}
                  onAddNotification={handleAddNotification}
                  activeTab={ownerActiveTab}
                  setActiveTab={setOwnerActiveTab}
                  allUsers={users}
                  onUpdateUsers={setUsers}
                  onUpdateCars={setCars}
                  onUpdateDrivers={setDrivers}
                  onUpdateBookings={handleUpdateBookings}
                  reviews={reviews}
                  onUpdateReviews={setReviews}
                  onUpdateRefunds={handleUpdateRefunds}
                  onShowToast={showToast}
                  onShowConfirm={showConfirm}
                />
              )}

              </PageSkeletonWrapper>
            </main>

          </div> {/* End Main Content Window */}
        </div> {/* End flex-grow layout container */}

        {/* Geometric Footer */}
        <footer className="mt-auto px-8 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0 hidden md:flex">
          <div className="flex flex-wrap gap-6 items-center">
            <span>v2.1.0 Build Stable</span>
            <span className="text-slate-300">|</span>
            <span>AutoRent Indonesia</span>
            <span className="text-slate-300">|</span>
            <span>📞 Hotline: 0800-1234-567</span>
            <span className="text-slate-300">|</span>
            <span>⏰ 08.00–22.00 WIB</span>
          </div>
          <div className="flex gap-5 items-center">
            <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors" onClick={() => setActiveTab('landing')}>Beranda</span>
            <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors" onClick={() => setActiveTab('rental')}>Rental Mobil</span>
            <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors" onClick={() => setActiveTab('driver')}>Driver</span>
            <span className="text-slate-300 font-normal normal-case">© 2026 AutoRent Corp</span>
          </div>
        </footer>

      </div>
    );
  };



  return (
    <div className="h-screen overflow-hidden bg-[#fafafa] font-sans text-slate-900 flex flex-col" id="autorent-app-shell">
      <GlobalLoading isVisible={isGlobalLoading} />
      
      {activeTab === 'login' ? (
        <LoginRegisterPage
          allUsers={users}
          currentUser={currentUser}
          onSetCurrentUser={setCurrentUser}
          onRegisterUser={handleUpdateUsers}
          onAddNotification={handleAddNotification}
          onBackToHome={() => setActiveTab('landing')}
          initialMode={loginMode}
          setActiveTab={setActiveTab}
          onShowToast={showToast}
          onShowConfirm={showConfirm}
        />
      ) : (
        renderMainAppContainer()
      )}
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </div>
  );
}
