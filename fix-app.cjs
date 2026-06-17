const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const header = `const PageSkeletonWrapper = ({ activeKey, children }: { activeKey: string, children: React.ReactNode }) => {
  return <>{children}</>;
};

import { User, Mobil, Driver, Booking, Pembayaran, Invoice, Review, AppNotification, CartItem, SystemSettings, Refund, MaintenanceRecord } from './types';
import { getStoredState, setStoredState, initLocalStorageOnLoad, getCarStatus, INITIAL_USERS, INITIAL_MOBIL, INITIAL_DRIVERS, INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_INVOICES, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_CART, INITIAL_SETTINGS, INITIAL_REFUNDS, INITIAL_MAINTENANCE } from './data';
import { Sparkles, HelpCircle, Layers, FileText, CheckCircle, Info, Star, Car, Users, Calendar, Calendar as CalendarIcon, Shield, UserCheck, TrendingUp, Home, ClipboardList, ShoppingCart, User as UserIcon, PhoneCall, LayoutDashboard, CreditCard, Receipt, Bell, Settings, Settings as SettingsIcon, LogOut, FileCheck, CheckSquare, ShieldCheck, ShieldAlert, Award, AlertCircle, MapPin, Wrench, RefreshCw, Search, Clock, X } from 'lucide-react';
import { ToastContainer, ConfirmModal, ToastData, ConfirmConfig, ToastType } from './components/ToastAndModal';

export default function App() {`;

content = content.replace('  // Global State Managers', header + '\n  // Global State Managers');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed imports in App.tsx');
