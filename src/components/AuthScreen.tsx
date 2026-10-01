import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Smartphone, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  RotateCw, 
  KeyRound, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { localAuth, LocalUser } from '../lib/localAuth';
import { OFFICIAL_GOVT_SEAL } from '../data';

export interface AuthUserPayload {
  email: string;
  name?: string;
  displayName?: string;
  balance?: number;
  uid?: string;
  role?: string;
  phone?: string;
}

export interface AuthScreenProps {
  onSuccess: (user: { email: string; name: string; displayName?: string; balance: number; uid?: string; role?: string; phone?: string }) => void;
  onAuthSuccess?: (user: LocalUser | AuthUserPayload | any) => void;
  triggerToast?: (title: string, message: string) => void;
  onCancel?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onAuthSuccess, triggerToast, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Form fields (email state holds either Email OR Mobile Number in single box)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login handler (Email OR Mobile Number)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = email.trim();
    if (!identifier) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!password) {
      setErrorMessage('অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    try {
      const user = await localAuth.login(identifier, password);
      setSuccessMessage('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
      if (triggerToast) {
        triggerToast('স্বাগতম', `${user.displayName || user.email} হিসেবে সফলভাবে লগইন হয়েছেন।`);
      }
      onSuccess({
        email: user.email,
        name: user.displayName,
        balance: user.balance,
        uid: user.uid,
        role: user.role
      });
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।');
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler (Single field for Email OR Mobile Number)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = email.trim();

    if (!name.trim()) {
      setErrorMessage('আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!identifier) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল অথবা সচল মোবাইল নম্বর দিন।');
      return;
    }

    const isEmail = identifier.includes('@');
    const isPhone = /^01[3-9]\d{8}$/.test(identifier);

    if (!isEmail && !isPhone) {
      setErrorMessage('সঠিক ইমেইল অ্যাড্রেস (যেমন: name@mail.com) অথবা ১১-সংখ্যার মোবাইল নম্বর (যেমন: 01712345678) লিখুন।');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।');
      return;
    }

    setIsLoading(true);
    try {
      const emailToPass = isEmail ? identifier : `${identifier}@citizen.gov.bd`;
      const phoneToPass = isPhone ? identifier : '';

      const user = await localAuth.register(emailToPass, phoneToPass, name.trim(), password);
      setSuccessMessage('রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম।');
      if (triggerToast) {
        triggerToast('রেজিস্ট্রেশন সম্পন্ন', `স্বাগতম ${user.displayName}! আপনার অ্যাকাউন্ট তৈরি হয়েছে।`);
      }
      onSuccess({
        email: user.email,
        name: user.displayName,
        balance: user.balance,
        uid: user.uid,
        role: user.role
      });
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। অন্য ইমেইল বা ফোন দিয়ে চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = email.trim();
    if (!identifier) {
      setErrorMessage('যে অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে চান তার ইমেইল বা মোবাইল নম্বর দিন।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);
    try {
      await localAuth.resetPassword(identifier, password);
      setSuccessMessage('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
      setTimeout(() => {
        setActiveTab('login');
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'পাসওয়ার্ড রিসেট করা যায়নি। তথ্য যাচাই করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-[0_25px_60px_-15px_rgba(124,58,237,0.15)] font-sans relative overflow-hidden transition-all duration-300">
      
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500" />
      
      {/* Header with National branding */}
      <div className="text-center mb-6 pt-1">
        <div className="inline-block relative mb-3">
          <img 
            src={OFFICIAL_GOVT_SEAL || "https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg"} 
            alt="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" 
            className="w-16 h-16 mx-auto object-contain p-1 bg-white rounded-2xl border border-emerald-500/80 shadow-md hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          </span>
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest font-mono mb-1.5">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>Government Cloud Portal</span>
        </div>
        
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          বাংলাদেশ নাগরিক সেবা পোর্টাল
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
          National Digital Identity & Citizen Utilities Network
        </p>
      </div>

      {/* Tabs for Login / Register */}
      {activeTab !== 'forgot' && (
        <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-5 border border-slate-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            লগইন (Sign In)
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            নতুন একাউন্ট (Register)
          </button>
        </div>
      )}

      {/* Alert Banners */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ================= LOGIN FORM ================= */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-1">
              ইমেইল বা মোবাইল নম্বর
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                id="login_email_input"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com অথবা 01XXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 pl-1">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                পাসওয়ার্ড
              </label>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('forgot');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                id="login_password_input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="btn_submit_login"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-purple-200 flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <RotateCw className="animate-spin" size={15} />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}

      {/* ================= REGISTER FORM (একটি ইনপুট ফিল্ডেই ইমেইল বা মোবাইল নম্বর) ================= */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1 pl-1">
              আপনার পূর্ণ নাম
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1 pl-1">
              ইমেইল অথবা মোবাইল নম্বর
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com অথবা 01XXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1 pl-1">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                />

                 <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>

              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1 pl-1">
                নিশ্চিত করুন
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all "
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>

              </div>
            </div>
          </div>

          <button
            id="btn_submit_register"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-emerald-200 flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-3"
          >
            {isLoading ? (
              <>
                <RotateCw className="animate-spin" size={15} />
                <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>নিবন্ধন সম্পন্ন করুন (Create Account)</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}

      {/* ================= FORGOT PASSWORD ================= */}
      {activeTab === 'forgot' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center py-2">
            <h3 className="text-sm font-black text-slate-900">পাসওয়ার্ড রিসেট করুন</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বর দিন এবং নতুন পাসওয়ার্ড সেট করুন।
            </p>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-1">
              ইমেইল বা মোবাইল নম্বর
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com অথবা 01XXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5 pl-1">
              নতুন পাসওয়ার্ড
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                className="w-full bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-600 rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw className="animate-spin" size={15} />
                <span>পাসওয়ার্ড আপডেট হচ্ছে...</span>
              </>
            ) : (
              <span>পাসওয়ার্ড সংরক্ষণ করুন</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-purple-700 hover:underline font-bold cursor-pointer"
            >
              &larr; লগইন পেজে ফিরে যান
            </button>
          </div>
        </form>
      )}

      {/* Security note footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
        <ShieldCheck size={13} className="text-emerald-500" />
        <span>256-BIT ENCRYPTED CITIZEN DATA VAULT</span>
      </div>
    </div>
  );
};

export default AuthScreen;