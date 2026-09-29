import React, { useState, useEffect } from 'react';
import { Transaction, ServiceType, ServiceDefinition } from './types';
import { SYSTEM_SERVICES, OFFICIAL_GOVT_SEAL } from './data';
import WalletGateComponent, { WalletGate as NamedWalletGate, PaymentMethod } from './components/WalletGate';
import ServiceViews from './components/ServiceViews';
import { AuthScreen } from './components/AuthScreen';
import { localAuth, LocalUser } from './lib/localAuth';
import { 
  Search, CreditCard, CheckCircle, Sparkles, Clock, 
  Layers, ShieldCheck, LogOut, Smartphone,
  Wallet, ArrowRight, AlertTriangle, UserCheck, LogIn, X
} from 'lucide-react';
import * as Icons from 'lucide-react';

// Default এবং Named Export উভয়ের সাথে কম্প্যাটিবল
const WalletGate = WalletGateComponent || NamedWalletGate;

const brandLogo = OFFICIAL_GOVT_SEAL || "https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg";

// অফিসিয়াল WhatsApp লিংক
const WHATSAPP_LINK = "https://wa.me/message/S4MFPRCMSQEJO1";

export default function App() {
  // ড্যাশবোর্ডে সরাসরি প্রবেশের জন্য ইউজার স্টেট (রেজিস্টার্ড কি না তা চেনার জন্য isGuest ফ্ল্যাগ)
  const [currentUser, setCurrentUser] = useState<LocalUser & { isGuest?: boolean }>(() => {
    const active = localAuth.getCurrentUser();
    if (active) {
      return { ...active, isGuest: false };
    }
    return {
      uid: 'CITIZEN-' + Math.floor(100000 + Math.random() * 900000),
      email: 'citizen@service.gov.bd',
      displayName: 'সাধারণ নাগরিক (গেস্ট)',
      balance: 0,
      role: 'citizen',
      isGuest: true
    };
  });

  const [balance, setBalance] = useState<number>(() => {
    const active = localAuth.getCurrentUser();
    if (active && typeof active.balance === 'number' && !isNaN(active.balance)) {
      return active.balance;
    }
    const saved = localStorage.getItem('citizen_wallet_balance');
    return saved ? parseFloat(saved) : 0;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeServiceId, setActiveServiceId] = useState<ServiceType | null>(null);
  const [isWalletViewActive, setIsWalletViewActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // রেজিস্ট্রেশন / লগইন মোডাল স্টেট
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast State & Notice
  const [toast, setToast] = useState<{ title: string; message: string; show: boolean } | null>(null);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);

  const SERVICE_ICON_THEME: Record<string, { bg: string; icon: string }> = {
    nid: { bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: 'text-emerald-600' },
    birth: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', icon: 'text-blue-600' },
    birth_death: { bg: 'bg-blue-50 text-blue-600 border border-blue-100', icon: 'text-blue-600' },
    tin: { bg: 'bg-amber-50 text-amber-600 border border-amber-100', icon: 'text-amber-600' },
    tax: { bg: 'bg-amber-50 text-amber-600 border border-amber-100', icon: 'text-amber-600' },
    tax_tin: { bg: 'bg-amber-50 text-amber-600 border border-amber-100', icon: 'text-amber-600' },
    mobile: { bg: 'bg-indigo-50 text-indigo-600 border border-indigo-100', icon: 'text-indigo-600' },
    telecom: { bg: 'bg-indigo-50 text-indigo-600 border border-indigo-100', icon: 'text-indigo-600' },
    location: { bg: 'bg-rose-50 text-rose-600 border border-rose-100', icon: 'text-rose-600' },
    certificate: { bg: 'bg-teal-50 text-teal-600 border border-teal-100', icon: 'text-teal-600' },
    cert: { bg: 'bg-teal-50 text-teal-600 border border-teal-100', icon: 'text-teal-600' },
    land: { bg: 'bg-green-50 text-green-600 border border-green-100', icon: 'text-green-600' },
    education: { bg: 'bg-cyan-50 text-cyan-600 border border-cyan-100', icon: 'text-cyan-600' },
    trade: { bg: 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100', icon: 'text-fuchsia-600' },
    others: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', icon: 'text-purple-600' },
    other: { bg: 'bg-purple-50 text-purple-600 border border-purple-100', icon: 'text-purple-600' }
  };

  const renderServiceIcon = (iconName: string, category: string, serviceId?: string) => {
    const iconMap: Record<string, keyof typeof Icons> = {
      'server_copy': 'Database',
      'server-copy': 'Database',
      'sajib_copy': 'UserCheck',
      'nid_by_no': 'ScanFace',
      'nid-pdf': 'ScanFace',
      'nid_form_no': 'Fingerprint',
      'form-sign-copy': 'Fingerprint',
      'nid-voter-number': 'UserCheck',
      'sign_copy': 'Feather',
      'sign-copy': 'Feather',
      'official_server_copy': 'ShieldAlert',
      'official-server-copy': 'ShieldAlert',
      // আইডি কার্ড সংশোধনের আইকনসমূহ
      'nid-full-name-correction': 'Sliders',
      'nid-age-correction': 'Calendar',
      'nid-partial-name-correction': 'PenTool',
      'nid-address-transfer': 'Compass',
      'nid_correction': 'Sliders',
      'nid-correction': 'Sliders',
      'nid_address_change': 'Compass',
      'nid-address-change': 'Compass',
      'smart_nid': 'Sparkles',
      'smart-id-card': 'Sparkles',
      'auto_birth': 'FileCheck',
      'new-birth-reg': 'FileCheck',
      'new-birth-registration': 'FileCheck',
      'information_correction': 'SearchCheck',
      'birth-copy': 'SearchCheck',
      'birth_correction': 'PenTool',
      'birth-correction': 'PenTool',
      'auto_death': 'FileX',
      'death-certificate': 'FileX',
      'tin_certificate': 'Receipt',
      'tin-certificate': 'Receipt',
      'new_tin_registration': 'UserPlus',
      'tin-new': 'UserPlus',
      'zero_tax': 'Coins',
      'income-tax-return': 'Coins',
      'sim_biometric': 'Contact',
      'sim-biometric': 'Contact',
      'owner_by_phone': 'Smartphone',
      'bKash_info': 'Coins',
      'bkash-info': 'Coins',
      'nagad_info': 'CreditCard',
      'nagad-info': 'CreditCard',
      'rocket_info': 'Send',
      'rocket-info': 'Send',
      'sims_by_nid': 'KeyRound',
      'phone_imei': 'Cpu',
      'imei-number': 'Cpu',
      'sim_by_imei': 'Radio',
      'call_list': 'PhoneCall',
      'call-list': 'PhoneCall',
      'sms_list': 'MessageSquare',
      'sms-list': 'MessageSquare',
      'mfs_checker': 'CheckCircle',
      'location_tracker': 'MapPin',
      'number_to_location': 'Globe',
      'number-location': 'MapPin',
      'live-location': 'Globe',
      'landless_certificate': 'Award',
      'bmet-service': 'Plane',
      'police-clearance': 'ShieldCheck',
      'char-certificate': 'GraduationCap',
      'driving-license': 'Car',
      'passport-apply': 'BookOpen',
      'land_service': 'Landmark',
      'land-service': 'Landmark',
      'namzari_application': 'FileSymlink',
      'land-mutation': 'FileSymlink',
      'land_record': 'Key',
      'land-record': 'Key',
      'porcha_card': 'Map',
      'porcha-copy': 'Map',
      'land_khatian': 'Map',
      'board_result': 'GraduationCap',
      'ssc_form': 'GraduationCap',
      'ssc-certificate': 'GraduationCap',
      'hsc_form': 'School',
      'hsc-certificate': 'School',
      'admit_card': 'BookOpen',
      'marksheet': 'BookOpen',
      'general_service': 'Layers',
      'cv_make': 'FileUser',
      'make-cv': 'FileUser',
      'voter_list': 'Users',
      'voter-list': 'Users',
      'electricity_bill': 'Zap',
      'electric-bill': 'Zap',
      'water_bill': 'Droplet',
      'water-bill': 'Droplet',
      'gas_bill': 'Flame',
      'gas-bill': 'Flame',
      'marriage_certificate': 'Heart',
      'marriage-cert': 'Heart',
      'otp_bypass': 'Unlock',
      'sms_bomber': 'Send',
      'lock_prompter': 'ShieldAlert'
    };

    const selectedName = (serviceId && iconMap[serviceId]) || iconName || 'Smartphone';
    const normalizedName = String(selectedName).trim();
    const lookupKeys = [
      normalizedName,
      `${normalizedName.charAt(0).toUpperCase()}${normalizedName.slice(1)}`,
      `${normalizedName}Icon`,
      `${normalizedName.charAt(0).toUpperCase()}${normalizedName.slice(1)}Icon`
    ];

    const IconComponent = lookupKeys
      .map(key => (Icons as any)[key])
      .find(Boolean) as React.ComponentType<any> | undefined;
    const Icon = IconComponent || Icons.Smartphone;

    const iconColorClass = SERVICE_ICON_THEME[category]?.icon || 'text-purple-600';

    return (
      <Icon 
        size={21} 
        strokeWidth={2.3} 
        className={`transition-all duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 group-hover:text-white ${iconColorClass}`} 
      />
    );
  };

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial State Database Check
  useEffect(() => {
    async function initAndCheck() {
      try {
        await localAuth.checkDatabaseStatus();
        const user = localAuth.getCurrentUser();
        if (user) {
          setCurrentUser({ ...user, isGuest: false });
          if (typeof user.balance === 'number' && !isNaN(user.balance)) {
            setBalance(user.balance);
            localStorage.setItem('citizen_wallet_balance', user.balance.toString());
          }
          const txs = await localAuth.getTransactions(user.uid);
          setTransactions(txs);
        }
      } catch (err) {
        console.error("Error setting up live database handshake:", err);
      }
    }
    initAndCheck();
  }, []);

  const triggerToast = (title: string, message: string) => {
    setToast({ title, message, show: true });
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, show: false } : null);
    }, 4500);
  };

  // সার্ভিস কার্ডে ক্লিক করার সময় রেজিস্ট্রেশন ও ব্যালেন্স চেক
  const handleServiceClick = (serviceItem: ServiceDefinition) => {
    // ১. যদি ইউজার গেস্ট থাকে, তাহলে আগে রেজিস্ট্রেশন করতে বলা হবে
    if (currentUser.isGuest) {
      triggerToast(
        '🔒 একাউন্ট রেজিস্ট্রেশন প্রয়োজন',
        `"${serviceItem.banglaTitle || serviceItem.title}" সেবাটি গ্রহণ করতে অনুগ্রহ করে প্রথমে রেজিস্ট্রেশন করুন।`
      );
      setIsAuthModalOpen(true);
      return;
    }

    // ২. ব্যালেন্স চেক
    const fee = serviceItem.fee ?? (serviceItem as any).price ?? 18;
    if (balance < fee) {
      triggerToast(
        '⚠️ ব্যালেন্স রিচার্জ প্রয়োজন',
        `"${serviceItem.banglaTitle || serviceItem.title}" সেবার জন্য ৳ ${fee} প্রয়োজন। আপনার বর্তমান ব্যালেন্স ৳ ${balance.toFixed(1)}। অনুগ্রহ করে বিকাশ বা নগদে টাকা অ্যাড করুন।`
      );
      setIsWalletViewActive(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveServiceId(serviceItem.id as ServiceType);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const deductFee = async (amount: number, service?: any): Promise<boolean> => {
    if (balance < amount) {
      triggerToast('অপ্রতুল ব্যালেন্স', `এই সেবার জন্য ${amount} ৳ প্রয়োজন। আপনার বর্তমান ব্যালেন্স: ${balance} ৳।`);
      setIsWalletViewActive(true);
      return false;
    }
    
    try {
      if (currentUser.uid && !currentUser.uid.startsWith('CITIZEN-')) {
        const response = await fetch('/api/services/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: currentUser.uid,
            amount,
            serviceName: service?.banglaTitle || service?.title || 'Citizenship Query',
            info: (service as any)?.placeholder || ''
          })
        });
        if (response.ok) {
          const data = await response.json();
          const updatedBalance = Number(data.balance);
          setBalance(updatedBalance);
          localAuth.updateBalance(currentUser.uid, updatedBalance);
          localStorage.setItem('citizen_wallet_balance', updatedBalance.toString());
          setCurrentUser(prev => ({ ...prev, balance: updatedBalance }));
          const txs = await localAuth.getTransactions(currentUser.uid);
          setTransactions(txs);
          triggerToast('অর্ডার সফল হয়েছে', `${amount} ৳ সফলভাবে কর্তন করা হয়েছে।`);
          return true;
        }
      }

      // গেস্ট মোড / লোকাল স্টেট আপডেট
      const newBal = Math.max(0, balance - amount);
      setBalance(newBal);
      if (currentUser?.uid && !currentUser.isGuest) {
        localAuth.updateBalance(currentUser.uid, newBal);
      }
      localStorage.setItem('citizen_wallet_balance', newBal.toString());
      setCurrentUser(prev => ({ ...prev, balance: newBal }));
      setTransactions(prev => [
        {
          id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
          type: 'service',
          amount,
          serviceName: service?.banglaTitle || 'নাগরিক সেবা',
          timestamp: new Date().toLocaleTimeString('bn-BD'),
          status: 'Completed'
        },
        ...prev
      ]);
      triggerToast('অর্ডার সফল হয়েছে', `${amount} ৳ সফলভাবে কর্তন করা হয়েছে।`);
      return true;
    } catch (error) {
      console.error(error);
      triggerToast('ত্রুটি', 'সার্ভারে যোগাযোগ করা যায়নি।');
      return false;
    }
  };

  const onAddMoney = async (amount: number, method: PaymentMethod, trxId: string, senderNumber?: string) => {
    try {
      if (currentUser.uid && !currentUser.uid.startsWith('CITIZEN-')) {
        const response = await fetch('/api/transactions/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: currentUser.uid,
            amount,
            method,
            trxId,
            senderNumber
          })
        });
        if (response.ok) {
          const data = await response.json();
          const updatedBalance = Number(data.balance);
          setBalance(updatedBalance);
          localAuth.updateBalance(currentUser.uid, updatedBalance);
          localStorage.setItem('citizen_wallet_balance', updatedBalance.toString());
          setCurrentUser(prev => ({ ...prev, balance: updatedBalance }));
          const txs = await localAuth.getTransactions(currentUser.uid);
          setTransactions(txs);
          triggerToast('ডিপোজিট সফল', `৳ ${amount} আপনার ওয়ালেটে সফলভাবে জমা হয়েছে!`);
          return;
        }
      }

      // লোকাল ওয়ালেট আপডেট
      const newBal = balance + amount;
      setBalance(newBal);
      if (currentUser?.uid && !currentUser.isGuest) {
        localAuth.updateBalance(currentUser.uid, newBal);
      }
      localStorage.setItem('citizen_wallet_balance', newBal.toString());
      setCurrentUser(prev => ({ ...prev, balance: newBal }));
      setTransactions(prev => [
        {
          id: trxId || ('TX-' + Math.floor(100000 + Math.random() * 900000)),
          type: 'deposit',
          amount,
          method,
          trxId,
          timestamp: new Date().toLocaleTimeString('bn-BD'),
          status: 'Completed'
        },
        ...prev
      ]);
      triggerToast('ডিপোজিট সফল', `৳ ${amount} আপনার ওয়ালেটে সফলভাবে জমা হয়েছে!`);
    } catch (error) {
      console.error(error);
      triggerToast('ত্রুটি', 'ডিপোজিট প্রসেস সম্পন্ন করা যায়নি।');
    }
  };

  const onWithdraw = async (amount: number, method: PaymentMethod, accountNo: string): Promise<boolean> => {
    if (balance < amount) return false;

    try {
      if (currentUser.uid && !currentUser.uid.startsWith('CITIZEN-')) {
        const response = await fetch('/api/transactions/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: currentUser.uid,
            amount,
            method,
            accountNo
          })
        });
        if (response.ok) {
          const data = await response.json();
          const updatedBalance = Number(data.balance);
          setBalance(updatedBalance);
          localAuth.updateBalance(currentUser.uid, updatedBalance);
          localStorage.setItem('citizen_wallet_balance', updatedBalance.toString());
          setCurrentUser(prev => ({ ...prev, balance: updatedBalance }));
          const txs = await localAuth.getTransactions(currentUser.uid);
          setTransactions(txs);
          triggerToast('উইথড্র রিকোয়েস্ট গৃহীত', `৳ ${amount} এর পে-আউট রিকোয়েস্ট জমা হয়েছে (${accountNo})`);
          return true;
        }
      }
    } catch (error) {
      console.error(error);
    }

    const newBal = balance - amount;
    setBalance(newBal);
    if (currentUser?.uid && !currentUser.isGuest) {
      localAuth.updateBalance(currentUser.uid, newBal);
    }
    localStorage.setItem('citizen_wallet_balance', newBal.toString());
    setCurrentUser(prev => ({ ...prev, balance: newBal }));
    triggerToast('উইথড্র রিকোয়েস্ট গৃহীত', `৳ ${amount} এর পে-আউট রিকোয়েস্ট জমা হয়েছে (${accountNo})`);
    return true;
  };

  // Auth Success Callback
  const handleAuthSuccess = async (user: any) => {
    const userBalance = typeof user.balance === 'number' && !isNaN(user.balance) ? user.balance : balance;
    const activeUser = {
      uid: user.uid || 'USR-' + Math.floor(100000 + Math.random() * 900000),
      email: user.email || user.phone || '',
      phone: user.phone || '',
      displayName: user.displayName || user.name || user.email || user.phone || 'নাগরিক ব্যবহারকারী',
      balance: userBalance,
      role: user.role || 'citizen',
      isGuest: false
    };

    setCurrentUser(activeUser);
    setBalance(userBalance);
    localAuth.updateBalance(activeUser.uid, userBalance);
    localStorage.setItem('citizen_wallet_balance', userBalance.toString());
    setIsAuthModalOpen(false);
    triggerToast('স্বাগতম', `${activeUser.displayName}, আপনার একাউন্ট সফলভাবে সক্রিয় হয়েছে!`);

    try {
      const txs = await localAuth.getTransactions(activeUser.uid);
      setTransactions(txs);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Services Logic (Safely checking title, banglaTitle, titleEn, description)
  const filteredServices = SYSTEM_SERVICES.filter(service => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (service.title || '').toLowerCase().includes(q) || 
      (service.banglaTitle || '').includes(q) ||
      (service.titleEn || '').toLowerCase().includes(q) ||
      (service.description || '').toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || 
      service.category === selectedCategory ||
      (selectedCategory === 'birth' && service.category === 'birth_death') ||
      (selectedCategory === 'tax' && (service.category === 'tax_tin' || service.category === 'tax')) ||
      (selectedCategory === 'mobile' && service.category === 'telecom') ||
      (selectedCategory === 'cert' && service.category === 'certificate') ||
      (selectedCategory === 'other' && service.category === 'others');

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-pink-50 to-purple-50 text-gray-800 font-sans pb-16 antialiased relative">
      {/* Ambient Blur Sprites */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-pink-300/25 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* TOAST OVERLAY */}
      {toast && toast.show && (
        <div id="visual_toast" className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-white border-2 border-amber-400 shadow-2xl flex items-start gap-3 w-84 sm:w-96 animate-fade-in">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0 border border-amber-200">
            <CreditCard size={18} />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-black text-slate-900">{toast.title}</h5>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">{toast.message}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setToast(null);
                  setIsWalletViewActive(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] shadow-sm cursor-pointer"
              >
                এখনই ব্যালেন্স রিচার্জ করুন
              </button>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 AUTH MODAL POPUP (রেজিস্ট্রেশন ও লগইন উইন্ডো) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center shadow-lg cursor-pointer border-2 border-white transition"
              title="বন্ধ করুন"
            >
              <X size={16} />
            </button>
            <AuthScreen
              onSuccess={handleAuthSuccess}
              onAuthSuccess={handleAuthSuccess}
              triggerToast={triggerToast}
              onCancel={() => setIsAuthModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* HEADER DESK NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-3.5">
          
          {/* Logo and National branding */}
          <div className="flex gap-3.5 items-center">
            <div className="p-1 bg-white rounded-xl transition-all hover:scale-105 duration-300">
              <div className="relative">
                <img 
                  src={brandLogo} 
                  alt="নাগরিক সেবা" 
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl border border-emerald-500 bg-white p-1 hover:scale-105 transition-transform duration-300 cursor-pointer object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">National Network</span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Gov Cloud v2.4</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-sans text-slate-900 tracking-tight leading-none mt-1 flex items-center gap-2">
                BD Service Portal 
                <span className="text-xs sm:text-sm font-bold text-slate-400 font-sans">
                  | বিডি সেবা পোর্টাল
                </span>
              </h1>
            </div>
          </div>
 
          {/* Status + Clock + WhatsApp Button + Wallet Desk + Auth Controls */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3">
            {/* Database status pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-[10px] font-bold font-sans text-slate-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Neon Active Database</span>
            </div>
 
            {/* Live Clock */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200/60 text-[10px] text-slate-600 font-bold font-mono">
              <Clock size={11} className="text-slate-400" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* 🟢 HEADER WHATSAPP BUTTON */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00c853] hover:bg-[#00b34a] active:scale-95 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer shrink-0"
              style={{ textDecoration: 'none' }}
              title="WhatsApp এ সরাসরি মেসেজ দিন"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="text-white group-hover:rotate-12 transition-transform duration-300 shrink-0"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp এ মেসেজ দিন</span>
            </a>
 
            {/* 💳 Wallet Desk Button */}
            <div className="flex items-center gap-2">
              <button
                id="wallet_access_btn"
                type="button"
                onClick={() => {
                  if (currentUser.isGuest) {
                    triggerToast(
                      '🔒 একাউন্ট রেজিস্ট্রেশন প্রয়োজন',
                      'ব্যালেন্স রিচার্জ ও নিরাপদ লেনদেনের জন্য অনুগ্রহ করে প্রথমে একাউন্ট রেজিস্ট্রেশন করুন।'
                    );
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setIsWalletViewActive(!isWalletViewActive);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center gap-2.5 bg-[#1e293b] hover:bg-[#0f172a] active:bg-[#020617] text-white border border-[#334155] p-1.5 pr-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-xs font-semibold shadow-sm"
              >
                <div className="p-1 px-2.5 bg-[#334155] group-hover:bg-[#475569] rounded-lg text-amber-400 font-bold font-sans flex items-center gap-1.5 transition-all">
                  <CreditCard size={13} className="text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>৳ {balance.toFixed(1)}</span>
                </div>
                <span className="font-bold text-slate-100 text-[11px] uppercase tracking-wider">
                  {isWalletViewActive ? 'Back To Portal' : 'ব্যালেন্স রিচার্জ'}
                </span>
              </button>
            </div>

            {/* 👤 Registration & Login Controls */}
            {currentUser.isGuest ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <UserCheck size={14} className="text-amber-300" />
                  <span>রেজিস্ট্রেশন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  <LogIn size={13} className="text-purple-600" />
                  <span>লগইন</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-purple-950 truncate max-w-[120px]">
                  {currentUser.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localAuth.logout();
                    setCurrentUser({
                      uid: 'CITIZEN-' + Math.floor(100000 + Math.random() * 900000),
                      email: 'citizen@service.gov.bd',
                      displayName: 'সাধারণ নাগরিক (গেস্ট)',
                      balance: 0,
                      role: 'citizen',
                      isGuest: true
                    });
                    setBalance(0);
                    setTransactions([]);
                    localStorage.removeItem('citizen_wallet_balance');
                    triggerToast('লগআউট সম্পন্ন', 'আপনি সফলভাবে লগআউট হয়েছেন।');
                  }}
                  className="p-1 hover:bg-purple-100 rounded-lg text-slate-400 hover:text-rose-600 transition"
                  title="লগআউট করুন"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>
          
        </div>
      </header>

      {/* CORE FRAMEWORK GRID VIEW */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {isWalletViewActive ? (
          /* STANDALONE DEDICATED WALLET PAGE */
          <div className="max-w-3xl mx-auto">
            <WalletGate 
              balance={balance} 
              transactions={transactions} 
              onAddMoney={onAddMoney} 
              onWithdraw={onWithdraw} 
              onBack={() => {
                setIsWalletViewActive(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ) : (
          /* PORTAL CONTROLS Workspace */
          <div className="w-full">
            {activeServiceId ? (
              /* ACTIVE SERVICE HANDLER VIEW SCREEN */
              <ServiceViews 
                activeServiceId={activeServiceId}
                walletBalance={balance}
                deductFee={deductFee}
                onBack={() => setActiveServiceId(null)}
                triggerToast={triggerToast}
                openWallet={() => {
                  setIsWalletViewActive(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
            /* SERVICE EXPLORER DASHBOARD */
            <div className="space-y-6">
              
              {/* JUMBOTRON GRAPHIC BANNER */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1329] via-[#101b34] to-[#16223f] p-6 sm:p-9 text-white shadow-xl shadow-slate-950/20 border border-slate-800">
                <div 
                  className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" 
                />
                
                <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Side Info Panel */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-sky-200 text-[10px] font-mono leading-none border border-white/10 shadow-sm animate-pulse">
                        <ShieldCheck size={12} className="text-emerald-400" /> SECURE DATALINK ONLINE
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 backdrop-blur-md rounded-full text-slate-200 text-[10px] font-mono leading-none border border-sky-500/20 shadow-sm">
                        <Icons.Compass size={11} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> v2.4.1 LIVE
                      </div>
                    </div>
                    
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight pr-4">
                      Bangladesh <span className="bg-gradient-to-r from-sky-300 via-teal-300 to-amber-300 bg-clip-text text-transparent">Citizenship & Utilities</span> Service Suite
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold max-w-xl">
                      বিল্ড করুন কাস্টম জন্ম নিবন্ধন রেকর্ড ও SMART আইডি যাচাইকরণ স্লিপ, সিম বায়োমেট্রিক ও মালিকানা রেকর্ড ডিটেইলস সহ উন্নত লোকেশন ও ডিভাইস সিকিউরিটি ট্র্যাকিং মডিউল।
                    </p>
                    
                    {/* Dynamic Greeting & Registration Callout */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border border-sky-500/30 py-1.5 px-3.5 rounded-xl text-xs text-sky-200 transition-all duration-300 shadow-sm backdrop-blur-md">
                        <Sparkles size={13} className="text-amber-300" />
                        <span>সেবাগ্রহীতা: <strong className="text-white font-bold">{currentUser.displayName}</strong></span>
                      </div>

                      {currentUser.isGuest && (
                        <button
                          type="button"
                          onClick={() => setIsAuthModalOpen(true)}
                          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition cursor-pointer"
                        >
                          <UserCheck size={13} />
                          <span>একাউন্ট রেজিস্ট্রেশন করুন →</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side Telemetry HUD Widget */}
                  <div className="lg:col-span-5 hidden lg:block">
                    <div className="p-5 rounded-2xl bg-[#090d1a]/85 backdrop-blur-md border border-slate-700/80 shadow-inner space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-sky-400 flex items-center gap-1.5">
                          <Icons.Activity size={12} className="animate-pulse text-sky-400" /> Live Telemetry
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold uppercase tracking-widest leading-none">
                          Sync: green
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300">
                          <p className="text-[10px] text-slate-200 font-bold tracking-wide">মোট ডাটাবেস নোড</p>
                          <p className="text-base font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
                            12 <span className="text-[9px] text-emerald-400 font-bold font-sans">● Active</span>
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300">
                          <p className="text-[10px] text-slate-200 font-bold tracking-wide">সার্ভার লেটেন্সি</p>
                          <p className="text-base font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
                            18ms <span className="text-[9px] text-sky-400 font-bold font-sans">Fast</span>
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300">
                          <p className="text-[10px] text-slate-200 font-bold tracking-wide">সেবা ক্যাটালগ</p>
                          <p className="text-base font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
                            {SYSTEM_SERVICES.length}+ <span className="text-[9px] text-amber-300 font-bold font-sans">Modules</span>
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-center">
                          <p className="text-[10px] text-slate-200 font-bold tracking-wide mb-1">লেজার প্রোটোকল</p>
                          <span className="text-[9px] font-bold text-sky-400 font-mono bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded text-center truncate uppercase">
                            Neon Postgres
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📢 জরুরি নোটিশ / রেজিস্ট্রেশন ও ব্যালেন্স গাইড ব্যানার */}
              {showNoticeBanner && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/15 border-2 border-amber-400 p-4 sm:p-5 shadow-md">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shrink-0 shadow-md">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                            {currentUser.isGuest ? 'রেজিস্ট্রেশন ও ব্যালেন্স গাইড' : 'ব্যালেন্স নির্দেশনা'}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {currentUser.isGuest 
                              ? 'সেবা গ্রহণ করতে প্রথমে বিনামূল্যে রেজিস্ট্রেশন ও ব্যালেন্স রিচার্জ করুন' 
                              : 'যেকোনো সেবা গ্রহণ করতে আপনার ওয়ালেটে ব্যালেন্স রিচার্জ করুন'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-slate-700 mt-1.5 leading-relaxed font-medium max-w-3xl">
                          সার্ভার কপি, জন্ম নিবন্ধন, স্মার্ট আইডি, সিম ভেরিফিকেশন সহ যেকোনো ডিজিটাল সেবা পেতে আপনার একটি সক্রিয় অ্যাকাউন্ট এবং প্রয়োজনীয় ব্যালেন্স থাকতে হবে। আপনার বর্তমান ব্যালেন্স <strong className="text-purple-700 font-bold font-mono">৳ {balance.toFixed(1)}</strong>। বিকাশ বা নগদে টাকা পাঠিয়ে TrxID দিয়ে নিশ্চিত করলেই সেবাটি সাথে সাথে পেয়ে যাবেন।
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-700">
                          <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            ১. বিনামূল্যে রেজিস্ট্রেশন করুন
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            ২. বিকাশ/নগদে টাকা পাঠান
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            ৩. সেবাটি সাথে সাথে তৈরি হবে
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                      {currentUser.isGuest ? (
                        <button
                          type="button"
                          onClick={() => setIsAuthModalOpen(true)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 text-amber-300" />
                          <span>এখনই রেজিস্ট্রেশন করুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsWalletViewActive(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-amber-300" />
                          <span>এখনই ব্যালেন্স অ্যাড করুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowNoticeBanner(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title="হাইড করুন"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLS AREA (SEARCH & CATEGORIES Badges) */}
              <div className="flex flex-col gap-5 bg-white/80 backdrop-blur-md border border-purple-100/70 p-5 sm:p-6 rounded-3xl shadow-[0_12px_40px_-15px_rgba(124,58,237,0.06)]">
                <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center w-full">
                  {/* Search Bar */}
                  <div className="relative flex items-center bg-purple-50/20 hover:bg-purple-50/40 border border-purple-100/80 hover:border-purple-200 rounded-2xl transition-all duration-300 w-full lg:w-96 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-400 focus-within:bg-white">
                    <Search className="absolute left-4 text-purple-500" size={15} />
                    <input
                      id="search_services_input"
                      type="search"
                      placeholder="সার্ভিস খুঁজুন... (e.g. জন্ম নিবন্ধন, স্মার্ট আইডি, সংশোধন)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent rounded-2xl py-3 pl-11 pr-10 text-xs focus:outline-none font-medium placeholder-purple-400 text-purple-950"
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 p-1 rounded-full text-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Clear search"
                      >
                        <Icons.X size={12} />
                      </button>
                    )}
                  </div>
                  
                  {/* Category Status pill */}
                  <div className="inline-flex max-w-max items-center gap-2 text-[10px] font-extrabold text-purple-800 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200/40 uppercase tracking-widest font-mono shadow-sm">
                    <Layers size={11} className="text-purple-600 animate-pulse" />
                    <span>Service Categories / পরিসেবা ক্যাটাগরি</span>
                  </div>
                </div>

                {/* Categories Buttons */}
                <div className="flex flex-wrap gap-2 w-full pt-1.5">
                  {[
                    { id: 'all', title: 'সকল সেবা', icon: <Layers size={12} />, gradient: 'from-purple-600 via-indigo-600 to-pink-500', shadow: 'rgba(124,58,237,0.22)', iconColor: 'text-purple-600' },
                    { id: 'nid', title: 'NID সেবা', icon: <Icons.CreditCard size={12} />, gradient: 'from-emerald-500 to-teal-500', shadow: 'rgba(16,185,129,0.22)', iconColor: 'text-emerald-600' },
                    { id: 'birth', title: 'জন্ম নিবন্ধন', icon: <Icons.UserCheck size={12} />, gradient: 'from-blue-500 to-indigo-500', shadow: 'rgba(59,130,246,0.22)', iconColor: 'text-blue-600' },
                    { id: 'tax', title: 'TIN/ট্যাক্স', icon: <Icons.FileText size={12} />, gradient: 'from-amber-500 to-orange-500', shadow: 'rgba(245,158,11,0.22)', iconColor: 'text-amber-600' },
                    { id: 'mobile', title: 'মোবাইল সেবা', icon: <Icons.Smartphone size={12} />, gradient: 'from-indigo-500 to-purple-500', shadow: 'rgba(99,102,241,0.22)', iconColor: 'text-indigo-600' },
                    { id: 'location', title: 'লোকেশন', icon: <Icons.MapPin size={12} />, gradient: 'from-rose-500 to-pink-500', shadow: 'rgba(244,63,94,0.22)', iconColor: 'text-rose-600' },
                    { id: 'cert', title: 'সনদপত্র', icon: <Icons.ShieldCheck size={12} />, gradient: 'from-teal-500 to-emerald-500', shadow: 'rgba(20,184,166,0.22)', iconColor: 'text-teal-600' },
                    { id: 'land', title: 'ভূমি সেবা', icon: <Icons.Server size={12} />, gradient: 'from-green-500 to-lime-500', shadow: 'rgba(34,197,94,0.22)', iconColor: 'text-green-600' },
                    { id: 'education', title: 'শিক্ষা', icon: <Icons.BookOpen size={12} />, gradient: 'from-cyan-500 to-blue-500', shadow: 'rgba(6,182,212,0.22)', iconColor: 'text-cyan-600' },
                    { id: 'trade', title: 'ট্রেড/ব্যবসা', icon: <Icons.Briefcase size={12} />, gradient: 'from-fuchsia-500 to-pink-500', shadow: 'rgba(217,70,239,0.22)', iconColor: 'text-fuchsia-600' },
                    { id: 'other', title: 'অন্যান্য', icon: <Icons.Settings size={12} />, gradient: 'from-purple-500 to-indigo-500', shadow: 'rgba(168,85,247,0.22)', iconColor: 'text-purple-600' }
                  ].map((category) => {
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        style={isActive ? { boxShadow: `0 4px 14px ${category.shadow}` } : undefined}
                        className={`py-2 px-4 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-2.5 transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] ${
                          isActive
                            ? `bg-gradient-to-r ${category.gradient} text-white border-transparent`
                            : 'bg-white text-purple-900 border border-purple-100/60 hover:border-purple-300 hover:bg-purple-50/20 hover:text-purple-950 hover:shadow-sm'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : category.iconColor}>
                          {category.icon}
                        </span>
                        <span>{category.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MAIN SERVICES BENTO GRID */}
              <div>
                <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500 uppercase">
                  <span>Available Modules</span>
                  <span>Showing {filteredServices.length} entries</span>
                </div>

                {filteredServices.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-dashed rounded-2xl text-gray-400 text-xs">
                    No matching portal service found for your keyword. Try looking in other categories!
                  </div>
                ) : (
                  <div id="services_bento_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredServices.map((serviceItem) => {
                      const currentFee = serviceItem.fee ?? (serviceItem as any).price ?? 18;
                      const needsRecharge = balance < currentFee;

                      const getTheme = (cat: string) => {
                        switch (cat) {
                          case 'nid':
                            return {
                              label: 'NID Desk • ভ্যালিডেশন',
                              badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
                              feeBg: 'bg-emerald-600 text-white border-transparent',
                              iconBg: 'bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
                              cardHover: 'hover:border-emerald-300',
                              accentText: 'group-hover:text-emerald-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-emerald-50/15',
                              topBorder: 'from-emerald-400 via-teal-400 to-emerald-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(16,185,129,0.14)]'
                            };
                          case 'birth':
                          case 'birth_death':
                            return {
                              label: 'BDRIS • জন্মনিবন্ধন',
                              badge: 'bg-blue-50 text-blue-900 border-blue-200/60',
                              feeBg: 'bg-blue-600 text-white border-transparent',
                              iconBg: 'bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
                              cardHover: 'hover:border-blue-300',
                              accentText: 'group-hover:text-blue-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-blue-50/15',
                              topBorder: 'from-blue-400 via-indigo-400 to-sky-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(59,130,246,0.14)]'
                            };
                          case 'tin':
                          case 'tax':
                          case 'tax_tin':
                            return {
                              label: 'Taxation • ই-টিন',
                              badge: 'bg-amber-50 text-amber-900 border-amber-200/60',
                              feeBg: 'bg-amber-600 text-white border-transparent',
                              iconBg: 'bg-amber-50 border border-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
                              cardHover: 'hover:border-amber-300',
                              accentText: 'group-hover:text-amber-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-amber-50/15',
                              topBorder: 'from-amber-400 via-orange-400 to-amber-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(245,158,11,0.14)]'
                            };
                          case 'mobile':
                          case 'telecom':
                            return {
                              label: 'Telecom • কল ট্র্যাক',
                              badge: 'bg-indigo-50 text-indigo-900 border-indigo-200/60',
                              feeBg: 'bg-indigo-600 text-white border-transparent',
                              iconBg: 'bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
                              cardHover: 'hover:border-indigo-300',
                              accentText: 'group-hover:text-indigo-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-indigo-50/15',
                              topBorder: 'from-indigo-400 via-purple-400 to-violet-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(99,102,241,0.14)]'
                            };
                          case 'location':
                            return {
                              label: 'GSM Tracker • লোকেশন',
                              badge: 'bg-rose-50 text-rose-900 border-rose-200/60',
                              feeBg: 'bg-rose-600 text-white border-transparent',
                              iconBg: 'bg-rose-50 border border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
                              cardHover: 'hover:border-rose-300',
                              accentText: 'group-hover:text-rose-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-rose-50/15',
                              topBorder: 'from-rose-500 via-pink-400 to-rose-600',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(244,63,94,0.14)]'
                            };
                          case 'certificate':
                          case 'cert':
                            return {
                              label: 'Academic • বোর্ড সনদ',
                              badge: 'bg-teal-50 text-teal-900 border-teal-200/60',
                              feeBg: 'bg-teal-600 text-white border-transparent',
                              iconBg: 'bg-teal-50 border border-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
                              cardHover: 'hover:border-teal-300',
                              accentText: 'group-hover:text-teal-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-teal-50/15',
                              topBorder: 'from-teal-400 via-cyan-400 to-emerald-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(20,184,166,0.14)]'
                            };
                          case 'land':
                            return {
                              label: 'Land Desk • ভূমি খতিয়ান',
                              badge: 'bg-green-50 text-green-900 border-green-200/60',
                              feeBg: 'bg-green-600 text-white border-transparent',
                              iconBg: 'bg-green-50 border border-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
                              cardHover: 'hover:border-green-300',
                              accentText: 'group-hover:text-green-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-green-50/15',
                              topBorder: 'from-green-400 via-emerald-400 to-lime-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(34,197,94,0.14)]'
                            };
                          case 'education':
                            return {
                              label: 'Education • শিক্ষা বোর্ড',
                              badge: 'bg-cyan-50 text-cyan-900 border-cyan-200/60',
                              feeBg: 'bg-cyan-600 text-white border-transparent',
                              iconBg: 'bg-cyan-50 border border-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
                              cardHover: 'hover:border-cyan-300',
                              accentText: 'group-hover:text-cyan-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-cyan-50/15',
                              topBorder: 'from-cyan-400 via-sky-400 to-blue-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(6,182,212,0.14)]'
                            };
                          case 'trade':
                            return {
                              label: 'RJSC • ট্রেড ও লাইসেন্স',
                              badge: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200/60',
                              feeBg: 'bg-fuchsia-600 text-white border-transparent',
                              iconBg: 'bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white',
                              cardHover: 'hover:border-fuchsia-300',
                              accentText: 'group-hover:text-fuchsia-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-fuchsia-50/15',
                              topBorder: 'from-fuchsia-400 via-pink-400 to-purple-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(217,70,239,0.14)]'
                            };
                          case 'others':
                          case 'other':
                          default:
                            return {
                              label: 'General • সাধারণ সেবা',
                              badge: 'bg-purple-50 text-purple-900 border-purple-200/60',
                              feeBg: 'bg-purple-600 text-white border-transparent',
                              iconBg: 'bg-purple-50 border border-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
                              cardHover: 'hover:border-purple-300',
                              accentText: 'group-hover:text-purple-700',
                              cardBg: 'bg-gradient-to-br from-white via-white to-purple-50/15',
                              topBorder: 'from-purple-400 via-indigo-400 to-pink-500',
                              hoverShadow: 'hover:shadow-[0_20px_35px_-15px_rgba(168,85,247,0.14)]'
                            };
                        }
                      };

                      const theme = getTheme(serviceItem.category);

                      return (
                        <div
                          key={serviceItem.id}
                          id={`service_card_${serviceItem.id}`}
                          onClick={() => handleServiceClick(serviceItem)}
                          title={`${serviceItem.banglaTitle || serviceItem.title} — ${serviceItem.title}`}
                          className={`relative overflow-hidden ${theme.cardBg} border border-purple-100/70 p-5 pt-7 rounded-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:scale-[1.01] hover:-translate-y-1 ${theme.hoverShadow} ${theme.cardHover}`}
                        >
                          <div className={`absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r ${theme.topBorder}`} />

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${theme.badge}`}>
                                {theme.label}
                              </span>
                              
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {serviceItem.deliveryTime && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-100/90 text-purple-800 border border-purple-200">
                                    ⏱️ {serviceItem.deliveryTime}
                                  </span>
                                )}
                                {serviceItem.popular && (
                                  <span className={`text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white bg-gradient-to-r ${theme.topBorder} uppercase tracking-wider shadow-sm`}>
                                    Popular
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold font-mono py-0.5 px-2 rounded-md border bg-purple-50/90 text-purple-700 border-purple-200/60 shadow-sm">
                                  ৳ {currentFee} BDT
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3.5 mb-3.5 mt-2">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${theme.iconBg}`}>
                                {renderServiceIcon((serviceItem as any)?.iconName || (serviceItem as any)?.icon || serviceItem.id, serviceItem.category, serviceItem.id)}
                              </div>
                              <div>
                                <h4 className={`font-black text-sm text-purple-950 font-sans tracking-tight leading-tight transition-colors ${theme.accentText}`}>
                                  {serviceItem.banglaTitle}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider font-semibold">
                                  {serviceItem.title}
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 mt-2.5 leading-relaxed font-semibold line-clamp-2">
                              {serviceItem.description}
                            </p>
                          </div>
                          
                          {/* Card action button with clear status */}
                          <div className="pt-3.5 border-t border-purple-50/75 mt-4 flex items-center justify-between text-[11px] font-extrabold text-purple-700 group-hover:text-purple-950 transition-colors">
                            {currentUser.isGuest ? (
                              <span className="flex items-center gap-1.5 font-bold text-indigo-700">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span>রেজিস্ট্রেশন করুন • সেবা চালু করুন</span>
                              </span>
                            ) : needsRecharge ? (
                              <span className="flex items-center gap-1.5 font-bold text-amber-700">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>ব্যালেন্স লাগবে • চালু করুন (ফি: ৳ {currentFee})</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 font-bold text-purple-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:animate-ping"></span>
                                <span>পরিসেবা শুরু করুন (Run Panel)</span>
                              </span>
                            )}
                            <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform font-mono font-black">&rarr;</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
       )}
      </main>

      {/* FOOTER (With WhatsApp Support Button) */}
      <footer className="mt-28 relative overflow-hidden rounded-t-[3rem] border-t border-purple-100 bg-white shadow-[0_-20px_50px_rgba(124,58,237,0.03)]">
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-purple-200/50">
            
            {/* Brand & Identity */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-5 text-center md:text-left">
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 opacity-25 blur-sm group-hover:opacity-40 transition duration-300" />
                  <img 
                    src={brandLogo} 
                    className="relative w-14 h-14 rounded-xl border border-emerald-500 bg-white p-1 shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer object-contain" 
                    alt="Bangladesh Seal" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-50 text-[9px] font-extrabold tracking-widest text-purple-700 rounded-md uppercase font-mono border border-purple-100">
                    Trusted Gov Portal
                  </div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight text-purple-950 uppercase mt-1">
                    বাংলাদেশ সেবা পোর্টাল
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mt-0.5">
                    BD CITIZENS SERVICE DESK
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm font-semibold">
                জাতীয় সেবা পোর্টালের সম্পূর্ণ সুরক্ষিত ও রিয়েল-টাইম এনভায়রনমেন্ট। ডেডিকেটেড ক্লাউড সিকিউরিটি গেটওয়ে এবং স্বয়ংক্রিয় ডিজিটাল ডাটা ভ্যালিডেশন লেজার প্রোটোকল।
              </p>
            </div>

            {/* Directory Links */}
            <div className="md:col-span-3 flex flex-col items-center md:items-start space-y-4">
              <h4 className="font-extrabold text-[11px] uppercase text-purple-950 tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3 bg-purple-600 rounded-full inline-block" />
                পোর্টাল রিসোর্স ও লিঙ্ক
              </h4>
              <ul className="flex flex-col space-y-3 text-xs font-bold text-purple-900 w-full text-center md:text-left">
                {[
                  { label: 'ব্যবহারের শর্তাবলী (Terms & Space)', href: '#rules' },
                  { label: 'গোপনীয়তা প্রটোকল (Privacy Policy)', href: '#privacy' },
                  { label: 'ডিজিটাল রেকর্ড যাচাই (Verify Status)', href: '#verify' },
                ].map((item, idx) => (
                  <li key={idx}>
                    <a 
                      href={item.href} 
                      className="hover:text-pink-600 hover:translate-x-1.5 transition-all duration-300 inline-block text-purple-950/80 hover:text-purple-950"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security & Contact Panel */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-4">
              <h4 className="font-extrabold text-[11px] uppercase text-purple-950 tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3 bg-indigo-600 rounded-full inline-block" />
                নিরাপত্তা, অডিট ও যোগাযোগ
              </h4>
              
              <div className="flex flex-col gap-2.5 w-full items-center md:items-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-xl shadow-sm text-[10px] font-bold font-mono tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SYSTEM OPERATIONAL (AUTO-SECURE)</span>
                </div>

                {/* 🟢 FOOTER WHATSAPP BUTTON */}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-2.5 w-full max-w-[240px] px-5 py-3 rounded-full bg-[#00c853] hover:bg-[#00b34a] text-white font-extrabold text-xs shadow-md shadow-emerald-500/15 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden mt-1 md:self-start"
                  style={{ textDecoration: "none" }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="text-white group-hover:rotate-12 transition-transform duration-300 shrink-0"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp এ মেসেজ দিন</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-[11px] font-mono font-extrabold text-gray-400 uppercase tracking-wider text-center md:text-left">
            <p className="text-gray-500">
              All Rights Reserved By BD Service Center © {new Date().getFullYear()}
            </p>
            <p className="px-3.5 py-1 rounded-lg bg-gray-50 text-purple-700/80 border border-gray-200">
              Unified Secure Sandbox Secure Portal Ecosystem
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}