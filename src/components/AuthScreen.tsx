import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  RotateCw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  AtSign,
  Phone,
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
  onSuccess: (user: {
    email: string;
    name: string;
    displayName?: string;
    balance: number;
    uid?: string;
    role?: string;
    phone?: string;
  }) => void;
  onAuthSuccess?: (user: LocalUser | AuthUserPayload | any) => void;
  triggerToast?: (title: string, message: string) => void;
  onCancel?: () => void;
}

// -------------------- Helpers --------------------

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const isValidPhone = (value: string) => /^01[3-9]\d{8}$/.test(value);

function detectInputType(value: string): 'email' | 'phone' | 'unknown' {
  const input = value.trim();

  if (!input) return 'unknown';
  if (input.includes('@')) return 'email';
  if (/^\d+$/.test(input)) return 'phone';

  return 'unknown';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onAuthSuccess,
  triggerToast,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const inputType = detectInputType(email);

  const getEmailFieldError = (): string => {
    const value = email.trim();

    if (!value) return '';

    if (inputType === 'email' && !isValidEmail(value)) {
      return 'সঠিক ইমেইল অ্যাড্রেস লিখুন — যেমন: name@gmail.com';
    }

    if (inputType === 'phone' && value.length > 3 && !isValidPhone(value)) {
      return 'সচল বাংলাদেশি মোবাইল নম্বর লিখুন — যেমন: 01XXXXXXXXX (১১ সংখ্যা)';
    }

    return '';
  };

  const switchTab = (tab: 'login' | 'register' | 'forgot') => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // -------------------- Login --------------------

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = email.trim();

    if (!identifier) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল অথবা মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    if (!password) {
      setErrorMessage('অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);

    try {
      const user = await localAuth.login(identifier, password);

      setSuccessMessage('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');

      triggerToast?.(
        'স্বাগতম',
        `${user.displayName || user.email} হিসেবে সফলভাবে লগইন হয়েছেন।`,
      );

      onSuccess({
        email: user.email,
        name: user.displayName,
        balance: user.balance,
        uid: user.uid,
        role: user.role,
      });

      onAuthSuccess?.(user);
    } catch (error: any) {
      setErrorMessage(error?.message || 'ভুল ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড।');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Register --------------------

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = email.trim();
    const isEmailValue = identifier.includes('@');
    const isPhoneValue = isValidPhone(identifier);

    if (!name.trim()) {
      setErrorMessage('আপনার পূর্ণ নাম লিখুন।');
      return;
    }

    if (!identifier) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল অথবা সচল মোবাইল নম্বর দিন।');
      return;
    }

    if (isEmailValue && !isValidEmail(identifier)) {
      setErrorMessage('সঠিক ইমেইল অ্যাড্রেস লিখুন — যেমন: name@gmail.com');
      return;
    }

    if (!isEmailValue && !isPhoneValue) {
      setErrorMessage(
        'সঠিক ইমেইল অ্যাড্রেস (যেমন: name@gmail.com) অথবা ১১-সংখ্যার মোবাইল নম্বর (যেমন: 01XXXXXXXXX) লিখুন।',
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।');
      return;
    }

    setIsLoading(true);

    try {
      // ফোন নম্বর দিয়ে রেজিস্ট্রেশন করলে localAuth-এর বর্তমান নিয়ম বজায় রাখা হয়েছে।
      const emailToPass = isEmailValue
        ? identifier
        : `${identifier}@citizen.gov.bd`;
      const phoneToPass = isPhoneValue ? identifier : '';

      const user = await localAuth.register(
        emailToPass,
        phoneToPass,
        name.trim(),
        password,
      );

      setSuccessMessage('রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম।');

      triggerToast?.(
        'রেজিস্ট্রেশন সম্পন্ন',
        `স্বাগতম ${user.displayName}! আপনার অ্যাকাউন্ট তৈরি হয়েছে।`,
      );

      onSuccess({
        email: user.email,
        name: user.displayName,
        balance: user.balance,
        uid: user.uid,
        role: user.role,
      });

      onAuthSuccess?.(user);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। অন্য ইমেইল বা ফোন দিয়ে চেষ্টা করুন।',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Reset password --------------------

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = email.trim();

    if (!identifier) {
      setErrorMessage(
        'যে অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে চান তার ইমেইল বা মোবাইল নম্বর দিন।',
      );
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);

    try {
      await localAuth.resetPassword(identifier, password);
      setSuccessMessage(
        'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
      );

      window.setTimeout(() => switchTab('login'), 2000);
    } catch (error: any) {
      setErrorMessage(error?.message || 'পাসওয়ার্ড রিসেট করা যায়নি। তথ্য যাচাই করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- Shared styles --------------------

  const inputBase =
    'w-full bg-slate-50 border hover:border-purple-300 focus:border-purple-600 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-sans';

  const emailFieldError =
    activeTab === 'register' ? getEmailFieldError() : '';

  const renderIdentifierAdornment = () => {
    if (inputType === 'email') {
      return <AtSign size={16} className="text-blue-500" />;
    }

    if (inputType === 'phone') {
      return <Phone size={16} className="text-emerald-500" />;
    }

    return <Mail size={16} className="text-slate-400" />;
  };

  const renderIdentifierBadge = () => {
    const value = email.trim();

    if (!value) return null;

    if (inputType === 'email') {
      const valid = isValidEmail(value);

      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium mt-1.5 ml-1 ${
            valid ? 'text-blue-600' : 'text-rose-500'
          }`}
        >
          <AtSign size={10} />
          {valid ? 'ইমেইল অ্যাড্রেস শনাক্ত হয়েছে ✓' : 'ইমেইল ফরম্যাট সঠিক নয়'}
        </span>
      );
    }

    if (inputType === 'phone') {
      const valid = isValidPhone(value);

      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium mt-1.5 ml-1 ${
            valid ? 'text-emerald-600' : 'text-rose-500'
          }`}
        >
          <Phone size={10} />
          {valid ? 'মোবাইল নম্বর শনাক্ত হয়েছে ✓' : '১১ সংখ্যার বাংলাদেশি নম্বর দিন'}
        </span>
      );
    }

    return null;
  };

  // একই input behaviour সব email/phone field-এ ব্যবহার করা হচ্ছে।
  const identifierInputProps = {
    type: 'text' as const,
    autoComplete: 'username',
    autoCorrect: 'off' as const,
    autoCapitalize: 'none' as const,
    spellCheck: false,
    'data-gramm': 'false',
    'data-gramm_editor': 'false',
    'data-enable-grammarly': 'false',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(event.currentTarget.value);
      setErrorMessage('');
    },
  };

  return (
    <div className="w-[calc(100%-1rem)] sm:w-full max-w-md max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-purple-100 shadow-[0_25px_60px_-15px_rgba(124,58,237,0.15)] font-sans relative overflow-x-hidden overflow-y-auto overscroll-contain transition-all duration-300 [scrollbar-width:thin]">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500" />

      {/* Header */}
      <div className="text-center mb-6 pt-1">
        <div className="inline-block relative mb-3">
          <img
            src={
              OFFICIAL_GOVT_SEAL ||
              'https://upload.wikimedia.org/wikipedia/commons/8/84/Government_Seal_of_Bangladesh.svg'
            }
            alt="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
            className="w-16 h-16 mx-auto object-contain p-1 bg-white rounded-2xl border border-emerald-500/80 shadow-md hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-medium text-emerald-800 uppercase tracking-widest font-mono mb-1.5">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>Government Cloud Portal</span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
          বাংলাদেশ নাগরিক সেবা পোর্টাল
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
          National Digital Identity &amp; Citizen Utilities Network
        </p>
      </div>

      {/* Tabs */}
      {activeTab !== 'forgot' && (
        <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-5 border border-slate-200/60 shadow-inner">
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            লগইন (Sign In)
          </button>

          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            নতুন একাউন্ট (Register)
          </button>
        </div>
      )}

      {/* Alert banners */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* -------------------- Login form -------------------- */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1.5 pl-1">
              ইমেইল বা মোবাইল নম্বর
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </span>

              <input
                {...identifierInputProps}
                required
                value={email}
                placeholder="example@gmail.com অথবা 01XXXXXXXXX"
                className={`${inputBase} border-slate-200`}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 pl-1">
              <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block">
                পাসওয়ার্ড
              </label>

              <button
                type="button"
                onClick={() => switchTab('forgot')}
                className="text-[11px] font-medium text-purple-700 hover:text-purple-900 hover:underline cursor-pointer"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={`${inputBase} border-slate-200 pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg hover:shadow-purple-200 flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
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

      {/* -------------------- Register form -------------------- */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1 pl-1">
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
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className={`${inputBase} border-slate-200`}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1 pl-1">
              ইমেইল অথবা মোবাইল নম্বর
            </label>

            <div className="flex flex-wrap gap-2 mb-1.5 pl-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                <AtSign size={9} /> ইমেইল: name@gmail.com
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <Phone size={9} /> ফোন: 01XXXXXXXXX
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors">
                {renderIdentifierAdornment()}
              </span>

              <input
                {...identifierInputProps}
                required
                value={email}
                placeholder="name@gmail.com অথবা 01XXXXXXXXX"
                className={`${inputBase} ${
                  emailFieldError
                    ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                    : inputType === 'email' && isValidEmail(email.trim())
                      ? 'border-blue-400 focus:ring-blue-100'
                      : inputType === 'phone' && isValidPhone(email.trim())
                        ? 'border-emerald-400 focus:ring-emerald-100'
                        : 'border-slate-200'
                }`}
              />
            </div>

            {renderIdentifierBadge()}

            {emailFieldError && (
              <p className="text-[10px] text-rose-500 font-medium mt-1 pl-1 flex items-center gap-1">
                <AlertCircle size={10} /> {emailFieldError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1 pl-1">
                পাসওয়ার্ড
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={15} />
                </span>

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className={`${inputBase} border-slate-200 py-2.5 pl-9 pr-9 ${
                    password && password.length < 6
                      ? 'border-rose-300'
                      : password.length >= 6
                        ? 'border-emerald-300'
                        : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {password && password.length < 6 && (
                <p className="text-[10px] text-rose-500 font-medium mt-1 pl-1">
                  কমপক্ষে ৬ অক্ষর দিন
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1 pl-1">
                নিশ্চিত করুন
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <KeyRound size={15} />
                </span>

                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড"
                  className={`${inputBase} border-slate-200 py-2.5 pl-9 pr-9 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-rose-300'
                      : confirmPassword && password === confirmPassword
                        ? 'border-emerald-300'
                        : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  aria-label={
                    showConfirmPassword ? 'কনফার্ম পাসওয়ার্ড লুকান' : 'কনফার্ম পাসওয়ার্ড দেখুন'
                  }
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-rose-500 font-medium mt-1 pl-1">
                  পাসওয়ার্ড মেলেনি
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg hover:shadow-emerald-200 flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-3"
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

      {/* -------------------- Forgot password -------------------- */}
      {activeTab === 'forgot' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center py-2">
            <h3 className="text-sm font-semibold text-slate-900">পাসওয়ার্ড রিসেট করুন</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বর দিন এবং নতুন পাসওয়ার্ড সেট করুন।
            </p>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1.5 pl-1">
              ইমেইল বা মোবাইল নম্বর
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={16} />
              </span>

              <input
                {...identifierInputProps}
                required
                value={email}
                placeholder="example@gmail.com অথবা 01XXXXXXXXX"
                className={`${inputBase} border-slate-200`}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-700 uppercase tracking-wider block mb-1.5 pl-1">
              নতুন পাসওয়ার্ড
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={16} />
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                className={`${inputBase} border-slate-200 pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw className="animate-spin" size={15} />
                <span>পাসওয়ার্ড আপডেট হচ্ছে...</span>
              </>
            ) : (
              <span>পাসওয়ার্ড সংরক্ষণ করুন</span>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className="text-xs text-purple-700 hover:underline font-medium cursor-pointer"
            >
              ← লগইন পেজে ফিরে যান
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
        <ShieldCheck size={13} className="text-emerald-500" />
        <span>256-BIT ENCRYPTED CITIZEN DATA VAULT</span>
      </div>
    </div>
  );
};

export default AuthScreen;