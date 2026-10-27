import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, CheckCircle2, ArrowLeft, MessageSquare, Copy, Check, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    email: string;
    tempPassword?: string;
    message_bn?: string;
    message_en?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [directLoggingIn, setDirectLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || (language === 'bn' ? 'পাসওয়ার্ড পাঠাতে সমস্যা হয়েছে। সঠিক ইমেইল দিন।' : 'Failed to reset password. Please check your email.'));
      }
    } catch {
      setLoading(false);
      setError(language === 'bn' ? 'সার্ভারের সাথে সংযোগ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' : 'Network error. Please try again.');
    }
  };

  const handleCopy = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectLogin = async () => {
    if (!result?.email || !result?.tempPassword) return;
    setDirectLoggingIn(true);
    const res = await login(result.email, result.tempPassword);
    setDirectLoggingIn(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {language === 'bn' ? 'পাসওয়ার্ড উদ্ধার ও রিসেট' : 'Password Recovery'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'যে Gmail বা ইমেইল দিয়ে অ্যাকাউন্ট খুলেছেন তা প্রদান করুন, সাথে সাথে নতুন পাসওয়ার্ড পেয়ে যাবেন।'
              : 'Enter your registered Gmail/email to receive a secure recovery password immediately.'}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  {language === 'bn' ? 'ইমেইলে পাসওয়ার্ড পাঠানো হয়েছে!' : 'Password Sent to Your Email!'}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {language === 'bn' ? (
                    <>
                      আপনার নিবন্ধিত ইমেইল <span className="text-cyan-400 font-semibold">{result.email}</span> এ পাসওয়ার্ড এবং লগইন তথ্য পাঠানো হয়েছে।
                    </>
                  ) : (
                    <>Password and login credentials have been dispatched to <span className="text-cyan-400 font-semibold">{result.email}</span>.</>
                  )}
                </p>
              </div>

              {/* Password Display Box */}
              {result.tempPassword && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'আপনার নতুন পাসওয়ার্ড' : 'Your New Password'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xl font-extrabold text-cyan-300 tracking-wider py-1 bg-cyan-950/40 px-3 rounded-lg border border-cyan-800/50 flex items-center justify-between">
                    <span>{result.tempPassword}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn'
                      ? 'লগইন করার পর অ্যাকাউন্ট সেটিংস থেকে আপনি যেকোনো সময় পাসওয়ার্ড পরিবর্তন করতে পারবেন।'
                      : 'You can change this password anytime from your account settings after logging in.'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleDirectLogin}
                  disabled={directLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {directLoggingIn
                      ? (language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing In...')
                      : (language === 'bn' ? 'এই পাসওয়ার্ড দিয়ে সরাসরি লগইন করুন' : 'Login Directly With This Password')}
                  </span>
                </button>

                <a
                  href="https://wa.me/8801762766261"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ সাপোর্ট: ০১৭৬২-৭৬৬২৬১' : 'WhatsApp Support: +8801762766261'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  {language === 'bn' ? 'অন্য কোনো ইমেইল দিয়ে চেষ্টা করুন' : 'Try another email address'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'আপনার নিবন্ধিত Gmail / ইমেইল অ্যাড্রেস' : 'Registered Gmail / Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="itmahfuzur@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {language === 'bn'
                    ? 'আপনার অ্যাকাউন্টের জিমেইল দিলে তাৎক্ষণিকভাবে পাসওয়ার্ড পাঠানো হবে।'
                    : 'A new recovery password will be dispatched to your registered email address.'}
                </p>
              </div>

              {/* Quick Fill Suggestion for Admin */}
              <button
                type="button"
                onClick={() => setEmail('itmahfuzur@gmail.com')}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-amber-300 text-[11px] text-left transition flex items-center justify-between"
              >
                <span>{language === 'bn' ? 'অ্যাডমিন ইমেইল পূরণ করুন:' : 'Fill Admin Email:'}</span>
                <span className="font-mono font-semibold">itmahfuzur@gmail.com</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>
                  {loading
                    ? (language === 'bn' ? 'পাসওয়ার্ড পাঠানো হচ্ছে...' : 'Sending Password...')
                    : (language === 'bn' ? 'আমার ইমেইলে পাসওয়ার্ড পাঠিয়ে দিন' : 'Send Password to My Email')}
                </span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Back to Login'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
