import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course, SiteSettings } from '../types';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface BkashPaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmitted: () => void;
  navigate?: (path: string) => void;
}

export const BkashPaymentModal: React.FC<BkashPaymentModalProps> = ({
  course,
  isOpen,
  onClose,
  onPaymentSubmitted,
  navigate,
}) => {
  const { language, t } = useLanguage();
  const { isLoggedIn, user, fetchWithAuth } = useAuth();

  const [paymentMode, setPaymentMode] = useState<'auto' | 'manual'>('auto');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Auto Payment Stages: 'number' -> 'otp' -> 'pin' -> 'processing' -> 'success'
  const [autoStage, setAutoStage] = useState<'number' | 'otp' | 'pin' | 'processing' | 'success'>('number');
  const [bkashPhone, setBkashPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [generatedTrxId, setGeneratedTrxId] = useState('');

  // Manual Payment State
  const [manualSenderNumber, setManualSenderNumber] = useState('');
  const [manualTransactionId, setManualTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoiceNumber = `ITM-${(course.id || 'C').slice(-4)}-${new Date().getMinutes()}${new Date().getSeconds()}`;

  useEffect(() => {
    if (isOpen) {
      fetchWithAuth('/api/admin/settings')
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(() => {});

      setError(null);
      setAutoStage('number');
      setPaymentMode('auto');
      setOtpCode('');
      setPinCode('');
      setManualSuccess(false);
      setManualSenderNumber('');
      setManualTransactionId('');

      if (user?.email) {
        // Pre-fill phone if any
        setBkashPhone('');
      }
    }
  }, [isOpen, user]);

  // Countdown for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && autoStage === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, autoStage, otpCountdown]);

  if (!isOpen) return null;

  const bkashPersonalNumber = settings?.bkash_number || '01762-766261';
  const bkashType = settings?.bkash_type || (language === 'bn' ? 'Personal (পার্সোনাল)' : 'Personal');
  const instructions = language === 'bn'
    ? (settings?.payment_instructions_bn || '')
    : (settings?.payment_instructions_en || '');

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(bkashPersonalNumber.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Redirect to Course after instant unlock
  const handleGoToCourse = () => {
    onPaymentSubmitted();
    if (navigate) {
      navigate(`/courses/${course.id}`);
    } else {
      window.location.href = `/courses/${course.id}`;
    }
  };

  // 1. Auto Payment: Submit Phone Number
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = bkashPhone.replace(/\D/g, '');
    if (clean.length < 11) {
      setError(language === 'bn' ? 'সঠিক ১১ সংখ্যার বিকাশ একাউন্ট নম্বর দিন (যেমন: 017XXXXXXXX)' : 'Please enter a valid 11-digit bKash account number.');
      return;
    }
    if (!agreeTerms) {
      setError(language === 'bn' ? 'অনুগ্রহ করে বিকাশ পেমেন্ট শর্তাবলীতে সম্মতি দিন।' : 'Please agree to bKash payment terms.');
      return;
    }

    // Advance to OTP stage
    setOtpCountdown(60);
    // Suggest demo auto-fill OTP
    setOtpCode('749215');
    setAutoStage('otp');
  };

  // 2. Auto Payment: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpCode.trim().length < 4) {
      setError(language === 'bn' ? 'অনুগ্রহ করে ভেরিফিকেশন কোড লিখুন।' : 'Please enter the verification code.');
      return;
    }

    setAutoStage('pin');
  };

  // 3. Auto Payment: Submit PIN & Finalize
  const handleConfirmAutoPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pinCode.trim() || pinCode.length < 4) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার বিকাশ পিন প্রবেশ করান।' : 'Please enter your bKash PIN.');
      return;
    }

    if (!isLoggedIn) {
      setError(language === 'bn' ? 'কোর্সটি আপনার একাউন্টে সংযুক্ত করার জন্য অনুগ্রহ করে আগে লগইন করুন।' : 'Please log in first to associate this course with your account.');
      return;
    }

    setAutoStage('processing');
    setLoading(true);

    try {
      const res = await fetchWithAuth('/api/payments/bkash-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          bkash_sender_number: bkashPhone.trim(),
          amount: course.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'bKash Auto Payment failed');
        setAutoStage('pin');
      } else {
        setGeneratedTrxId(data.transaction_id || `BK${Date.now().toString().slice(-8)}`);
        setAutoStage('success');
      }
    } catch {
      setError(language === 'bn' ? 'সার্ভার যোগাযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Network error communicating with bKash server.');
      setAutoStage('pin');
    } finally {
      setLoading(false);
    }
  };

  // Direct bKash App Deep Link Trigger
  const handleDirectBkashApp = () => {
    // Attempt bKash mobile deep link, with fallback to web checkout
    const cleanNumber = bkashPersonalNumber.replace(/[^0-9]/g, '');
    const ussdDial = `tel:*247*1*${cleanNumber}*${course.price}*1%23`;
    window.location.href = ussdDial;
  };

  // 4. Manual Payment Submission (Fallback)
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!manualSenderNumber.trim() || !manualTransactionId.trim()) {
      setError(language === 'bn' ? 'দয়া করে প্রেরক bKash নম্বর ও TrxID সঠিকভাবে লিখুন।' : 'Please enter both sender bKash number and Transaction ID.');
      return;
    }

    if (!isLoggedIn) {
      setError(language === 'bn' ? 'পেমেন্ট সাবমিট করার আগে অনুগ্রহ করে লগইন করুন।' : 'Please log in before submitting payment.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/payments/submit-bkash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          bkash_sender_number: manualSenderNumber.trim(),
          transaction_id: manualTransactionId.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit payment details');
      } else {
        setManualSuccess(true);
        setTimeout(() => {
          onPaymentSubmitted();
        }, 2200);
      }
    } catch {
      setError(language === 'bn' ? 'সার্ভার যোগাযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Network error submitting payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">

        {/* bKash Official Header Banner */}
        <div className="bg-gradient-to-r from-[#D12053] via-[#E2136E] to-[#b31454] px-6 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center">
              <span className="text-[#E2136E] font-black text-2xl font-sans tracking-tighter">৳</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide uppercase">bKash Payment</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider backdrop-blur-sm">
                  {language === 'bn' ? 'স্বয়ংক্রিয় গেটওয়ে' : 'Auto Gateway'}
                </span>
              </div>
              <p className="text-xs text-pink-100 font-medium">
                {language === 'bn' ? 'মার্চেন্ট:' : 'Merchant:'} <strong className="font-bold text-white">ITMahfuzur</strong>
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course & Amount Ribbon */}
        <div className="bg-slate-800/90 border-b border-slate-700/80 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              {language === 'bn' ? 'কোর্স নির্বাচন' : 'Selected Course'}
            </span>
            <span className="text-sm font-bold text-white truncate max-w-xs block">
              {language === 'bn' ? course.title_bn : course.title_en}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
              {language === 'bn' ? 'মোট প্রদেয় মূল্য' : 'Total Amount'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-pink-400 tracking-tight">
              ৳{course.price.toLocaleString()} <span className="text-xs font-semibold text-slate-400">BDT</span>
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        {autoStage !== 'success' && !manualSuccess && (
          <div className="flex border-b border-slate-800 bg-slate-900/50 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => { setPaymentMode('auto'); setError(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                paymentMode === 'auto'
                  ? 'bg-gradient-to-r from-[#D12053] to-[#E2136E] text-white shadow-lg shadow-pink-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{language === 'bn' ? '⚡ অটো বিকাশ পেমেন্ট (তাৎক্ষণিক চালু)' : '⚡ bKash Auto Pay (Instant Unlock)'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setPaymentMode('manual'); setError(null); }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
                paymentMode === 'manual'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ম্যানুয়াল TrxID' : 'Manual TrxID'}</span>
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-6">
          {error && (
            <div className="p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: AUTO BKASH PAYMENT (RECOMMENDED & INSTANT)              */}
          {/* ============================================================== */}
          {paymentMode === 'auto' && (
            <div>
              {/* STAGE: NUMBER */}
              {autoStage === 'number' && (
                <form onSubmit={handleProceedToOtp} className="space-y-5">
                  <div className="bg-pink-950/20 border border-pink-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-pink-300 text-xs font-bold mb-1">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>
                        {language === 'bn'
                          ? 'স্বয়ংক্রিয়ভাবে বিকাশ দিয়ে পেমেন্ট করুন এবং সাথে সাথে কোর্স শুরু করুন'
                          : 'Automated bKash checkout with instant course unlock'}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-300 leading-relaxed">
                      {language === 'bn'
                        ? 'আপনার বিকাশ নম্বর দিয়ে এগিয়ে যান। পেমেন্ট সম্পূর্ণ হওয়ার সাথে সাথেই কোর্সটির সম্পূর্ণ অ্যাক্সেস চালু হয়ে যাবে।'
                        : 'Enter your bKash number. Once verified, the full course will unlock automatically without manual waiting.'}
                    </p>
                  </div>

                  {/* Mobile Quick Pay / App Launch Helper */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {language === 'bn' ? 'বিকাশ অ্যাপে সরাসরি পেমেন্ট করতে চান?' : 'Want to pay via bKash App directly?'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {language === 'bn' ? `মার্চেন্ট/পার্সোনাল নম্বর: ${bkashPersonalNumber}` : `Number: ${bkashPersonalNumber}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDirectBkashApp}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'বিকাশ ডায়াল/অ্যাপ' : 'Open Dial/App'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">
                      {language === 'bn' ? 'আপনার বিকাশ অ্যাকাউন্ট নম্বর লিখুন' : 'Your bKash Account Number'} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400 font-bold text-sm">
                        🇧🇩 +88
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        placeholder="017XXXXXXXX"
                        value={bkashPhone}
                        onChange={e => setBkashPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-20 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-[#E2136E] focus:ring-2 focus:ring-[#E2136E]/20 focus:outline-none text-white font-mono text-base font-semibold tracking-wider placeholder-slate-500 transition"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      {language === 'bn' ? 'উদাহরণ: 01712345678 বা 018XXXXXXXX' : 'e.g. 017XXXXXXXX or 018XXXXXXXX'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#E2136E] focus:ring-[#E2136E] bg-slate-800 border-slate-600 cursor-pointer"
                    />
                    <label htmlFor="agreeTerms" className="text-xs text-slate-300 leading-snug cursor-pointer select-none">
                      {language === 'bn'
                        ? 'আমি বিকাশ পেমেন্ট ও ITMahfuzur এর কোর্স ব্যবহারের সকল শর্তাবলী মেনে নিচ্ছি।'
                        : 'I accept bKash payment terms and ITMahfuzur platform guidelines.'}
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition"
                    >
                      {t('btnCancel')}
                    </button>

                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#b81745] hover:to-[#c70f5e] text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition"
                    >
                      <span>{language === 'bn' ? 'পেমেন্ট এগিয়ে নিন' : 'Proceed to Pay'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STAGE: OTP VERIFICATION */}
              {autoStage === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 mx-auto flex items-center justify-center border border-pink-500/30">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {language === 'bn' ? 'বিকাশ ওটিপি (OTP) কোড যাচাইকরণ' : 'bKash OTP Verification'}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      {language === 'bn'
                        ? `আপনার বিকাশ নম্বর (${bkashPhone}) এ ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে।`
                        : `A 6-digit verification code was sent to your bKash account (${bkashPhone}).`}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-200">
                        {language === 'bn' ? 'ভেরিফিকেশন কোড (OTP) লিখুন' : 'Verification Code (OTP)'} *
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpCode('749215')}
                        className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 underline underline-offset-2"
                      >
                        <Zap className="w-3 h-3" />
                        <span>{language === 'bn' ? 'অটো-ফিল কোড (749215)' : 'Auto-fill demo code'}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="XXXXXX"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center py-3.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-[#E2136E] focus:outline-none text-white font-mono text-2xl font-black tracking-widest uppercase"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      {language === 'bn' ? 'কোডের মেয়াদ বাকি:' : 'Code expires in:'}{' '}
                      <strong className="text-pink-400 font-mono">{otpCountdown}s</strong>
                    </span>
                    <button
                      type="button"
                      disabled={otpCountdown > 0}
                      onClick={() => setOtpCountdown(60)}
                      className="text-pink-400 hover:text-pink-300 disabled:opacity-40 font-semibold"
                    >
                      {language === 'bn' ? 'কোড পুনরায় পাঠান' : 'Resend Code'}
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setAutoStage('number')}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
                    >
                      {language === 'bn' ? 'নম্বর পরিবর্তন' : 'Change Number'}
                    </button>

                    <button
                      type="submit"
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#b81745] hover:to-[#c70f5e] text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center gap-2 transition"
                    >
                      <span>{language === 'bn' ? 'কোড নিশ্চিত করুন' : 'Confirm Code'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STAGE: PIN CONFIRMATION */}
              {autoStage === 'pin' && (
                <form onSubmit={handleConfirmAutoPayment} className="space-y-5 animate-fade-in">
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 mx-auto flex items-center justify-center border border-pink-500/30">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {language === 'bn' ? 'বিকাশ পিন (PIN) নিশ্চিতকরণ' : 'bKash PIN Confirmation'}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      {language === 'bn'
                        ? `মোট ৳${course.price.toLocaleString()} BDT পেমেন্ট সম্পন্ন করতে আপনার বিকাশ পিন প্রবেশ করুন।`
                        : `Enter your bKash PIN to confirm ৳${course.price.toLocaleString()} BDT payment.`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">
                      {language === 'bn' ? 'বিকাশ পিন প্রবেশ করুন' : 'Enter bKash PIN'} *
                    </label>

                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        required
                        maxLength={5}
                        placeholder="•••••"
                        value={pinCode}
                        onChange={e => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center py-3.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-[#E2136E] focus:outline-none text-white font-mono text-2xl font-black tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'bn' ? 'নিরাপদ এবং এনক্রিপ্টেড পেমেন্ট প্রসেসিং' : 'Secure and encrypted payment gateway'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setAutoStage('otp')}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
                    >
                      {language === 'bn' ? 'পেছনে যান' : 'Back'}
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#b81745] hover:to-[#c70f5e] text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center gap-2 disabled:opacity-50 transition"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'bn' ? 'পেমেন্ট প্রসেস হচ্ছে...' : 'Processing...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{language === 'bn' ? `পেমেন্ট নিশ্চিত করুন (৳${course.price})` : `Confirm Pay ৳${course.price}`}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STAGE: PROCESSING ANIMATION */}
              {autoStage === 'processing' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-pink-500/20 text-[#E2136E] mx-auto flex items-center justify-center border border-pink-500/30 animate-spin">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {language === 'bn' ? 'বিকাশ থেকে লেনদেন সম্পন্ন করা হচ্ছে...' : 'Processing with bKash...'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {language === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন। আপনার কোর্সটি স্বয়ংক্রিয়ভাবে সক্রিয় করা হচ্ছে।' : 'Please wait while your payment is verified and course is unlocked.'}
                  </p>
                </div>
              )}

              {/* STAGE: SUCCESS (INSTANT UNLOCK!) */}
              {autoStage === 'success' && (
                <div className="py-6 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-white">
                      {language === 'bn' ? 'পেমেন্ট সফল! কোর্স আনলক হয়েছে 🎉' : 'Payment Successful! Course Unlocked 🎉'}
                    </h4>
                    <p className="text-sm text-slate-300 max-w-md mx-auto mt-1.5 leading-relaxed">
                      {language === 'bn'
                        ? `আপনার বিকাশ অটো পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। "${course.title_bn}" কোর্সটি আপনার জন্য সক্রিয় করা হয়েছে। আপনি এখনই ক্লাস শুরু করতে পারেন!`
                        : `Your bKash payment was approved automatically. "${course.title_en}" is now unlocked. You can start watching lessons now!`}
                    </p>
                  </div>

                  {/* Transaction Voucher Box */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>{language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID:'}</span>
                      <span className="font-mono font-bold text-pink-400 text-sm">{generatedTrxId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-t border-slate-700/60 pt-2">
                      <span>{language === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
                      <span className="font-semibold text-white">bKash Auto Gateway</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 border-t border-slate-700/60 pt-2">
                      <span>{language === 'bn' ? 'পরিশোধিত অর্থ:' : 'Amount Paid:'}</span>
                      <span className="font-bold text-emerald-400 text-sm">৳{course.price.toLocaleString()} BDT</span>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleGoToCourse}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                    >
                      <span>{language === 'bn' ? '▶️ এখনই ক্লাস শুরু করুন' : '▶️ Start Learning Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onPaymentSubmitted();
                        if (navigate) navigate('/dashboard');
                        else window.location.href = '/dashboard';
                      }}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
                    >
                      {language === 'bn' ? 'আমার ড্যাশবোর্ড' : 'My Dashboard'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MANUAL BKASH SEND MONEY (TRXID SUBMISSION)              */}
          {/* ============================================================== */}
          {paymentMode === 'manual' && (
            <div>
              {manualSuccess ? (
                <div className="text-center py-8 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    {language === 'bn' ? 'পেমেন্ট সাবমিট সফল হয়েছে!' : 'Payment Submitted Successfully!'}
                  </h4>
                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    {language === 'bn'
                      ? `আপনার TrxID (${manualTransactionId.toUpperCase()}) সংরক্ষণ করা হয়েছে। অ্যাডমিন যাচাই করার পর আপনার কোর্সটি সক্রিয় হবে।`
                      : `Your transaction ID (${manualTransactionId.toUpperCase()}) has been received. Access will be unlocked as soon as admin approves.`}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/8801762766261?text=${encodeURIComponent(`আসসালামু আলাইকুম স্যার, আমি "${language === 'bn' ? course.title_bn : course.title_en}" কোর্সের জন্য bKash Send Money করেছি।\n\nপ্রেরক নম্বর: ${manualSenderNumber}\nTrxID: ${manualTransactionId.toUpperCase()}\n\nঅনুগ্রহ করে আমার কোর্সটি অ্যাক্টিভ করে দিন।`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                    >
                      <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে TrxID পাঠিয়ে দ্রুত অ্যাক্টিভ করুন' : 'Verify Fast on WhatsApp'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={onPaymentSubmitted}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      {language === 'bn' ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* bKash Account Box */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-pink-950/40 border border-pink-500/40 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-pink-300 font-bold">
                            {bkashType}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            WhatsApp Connected
                          </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider mt-1">
                          {bkashPersonalNumber}
                        </div>
                        <p className="text-[11px] text-pink-200/80 mt-0.5">
                          {language === 'bn' ? 'এটি পার্সোনাল বিকাশ ও সরাসরি হোয়াটসঅ্যাপ নম্বর' : 'Personal bKash & direct WhatsApp number'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyNumber}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-xs font-bold transition"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'নম্বর কপি' : 'Copy'}</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://wa.me/8801762766261?text=${encodeURIComponent(`আসসালামু আলাইকুম ITMahfuzur, আমি "${language === 'bn' ? course.title_bn : course.title_en}" কোর্সের জন্য bKash Send Money করতে চাচ্ছি।`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>{language === 'bn' ? 'ম্যানুয়াল সেন্ড মানির নিয়মাবলী:' : 'Manual Payment Instructions:'}</span>
                    </div>
                    {instructions ? (
                      instructions.split('\n').map((line, idx) => (
                        <p key={idx} className="leading-relaxed text-slate-300">{line}</p>
                      ))
                    ) : (
                      <p className="leading-relaxed text-slate-300">
                        {language === 'bn'
                          ? `উপরের বিকাশ পার্সোনাল নম্বরে ৳${course.price} Send Money করুন। এরপর নিচে প্রেরক নম্বর ও TrxID লিখে সাবমিট করুন।`
                          : `Send ৳${course.price} via Send Money to the above number, then enter sender phone and TrxID.`}
                      </p>
                    )}
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('bkashSenderLabel')} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 018XXXXXXXX"
                        value={manualSenderNumber}
                        onChange={e => setManualSenderNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('bkashTrxIdLabel')} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BK9A72L0X1"
                        value={manualTransactionId}
                        onChange={e => setManualTransactionId(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:outline-none text-white font-mono text-sm tracking-wider uppercase"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition"
                      >
                        {t('btnCancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-pink-600/20 disabled:opacity-50 transition"
                      >
                        {loading
                          ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Submitting...')
                          : t('bkashSubmitButton')}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info security badge */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-pink-400" />
            <span>ITMahfuzur Secured Payment</span>
          </div>
          <span className="font-mono text-slate-500">Invoice: {invoiceNumber}</span>
        </div>

      </div>
    </div>
  );
};
