import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course, SiteSettings } from '../types';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Check, ArrowRight } from 'lucide-react';

interface BkashPaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export const BkashPaymentModal: React.FC<BkashPaymentModalProps> = ({
  course,
  isOpen,
  onClose,
  onPaymentSubmitted,
}) => {
  const { language, t } = useLanguage();
  const { fetchWithAuth } = useAuth();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/settings')
        .then(res => res.json())
        .then(data => setSettings(data))
        .catch(() => {});
      setError(null);
      setSuccess(false);
      setSenderNumber('');
      setTransactionId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const bkashNumber = settings?.bkash_number || '01762-766261';
  const bkashType = settings?.bkash_type || (language === 'bn' ? 'Personal (পার্সোনাল)' : 'Personal');
  const instructions = language === 'bn'
    ? (settings?.payment_instructions_bn || '')
    : (settings?.payment_instructions_en || '');

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(bkashNumber.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!senderNumber.trim() || !transactionId.trim()) {
      setError(language === 'bn' ? 'দয়া করে প্রেরক bKash নম্বর ও TrxID সঠিকভাবে লিখুন।' : 'Please enter both sender bKash number and Transaction ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/payments/submit-bkash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: course.id,
          bkash_sender_number: senderNumber.trim(),
          transaction_id: transactionId.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit payment details');
      } else {
        setSuccess(true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xl">
            ৳
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {t('bkashModalTitle')}
            </h3>
            <p className="text-sm text-slate-400">
              {language === 'bn' ? course.title_bn : course.title_en}
            </p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-white">
              {language === 'bn' ? 'পেমেন্ট সাবমিট সফল হয়েছে!' : 'Payment Submitted Successfully!'}
            </h4>
            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
              {language === 'bn'
                ? `আপনার TrxID (${transactionId.toUpperCase()}) সংরক্ষণ করা হয়েছে। অ্যাডমিন যাচাই করার পর আপনার কোর্সটি স্বয়ংক্রিয়ভাবে চালু হয়ে যাবে। ড্যাশবোর্ডে আপনি স্ট্যাটাস দেখতে পারবেন।`
                : `Your transaction ID (${transactionId.toUpperCase()}) has been received. Access will be unlocked as soon as the administrator approves it.`}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/8801762766261?text=${encodeURIComponent(`আসসালামু আলাইকুম স্যার, আমি "${language === 'bn' ? course.title_bn : course.title_en}" কোর্সের জন্য bKash Send Money করেছি।\n\nপ্রেরক নম্বর: ${senderNumber}\nTrxID: ${transactionId.toUpperCase()}\n\nঅনুগ্রহ করে আমার কোর্সটি অ্যাক্টিভ করে দিন।`)}`}
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
          <div>
            {/* Price Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 mb-6">
              <span className="text-slate-300 font-medium text-sm">
                {language === 'bn' ? 'কোর্সের নির্ধারিত ফি:' : 'Course Fee:'}
              </span>
              <span className="text-2xl font-extrabold text-cyan-400">
                ৳{course.price.toLocaleString()} BDT
              </span>
            </div>

            {/* bKash Account Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-pink-950/40 border border-pink-500/40 mb-5 shadow-lg">
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
                    {bkashNumber}
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
            <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{language === 'bn' ? 'পেমেন্ট করার নিয়মাবলী:' : 'Payment Instructions:'}</span>
              </div>
              {instructions.split('\n').map((line, idx) => (
                <p key={idx} className="leading-relaxed text-slate-300">{line}</p>
              ))}
            </div>

            {/* Security Warning */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-6">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? 'সতর্কতা: ITMahfuzur কখনো আপনার bKash পিন (PIN) বা ওটিপি (OTP) চাইবে না। শুধুমাত্র TrxID ও প্রেরক নম্বর লিখুন।'
                  : 'Important: ITMahfuzur will NEVER ask for your bKash PIN or OTP. Only submit your TrxID and phone number.'}
              </span>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('bkashSenderLabel')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 018XXXXXXXX"
                  value={senderNumber}
                  onChange={e => setSenderNumber(e.target.value)}
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
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value.toUpperCase())}
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
    </div>
  );
};
