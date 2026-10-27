import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { Mail, CheckCircle, ArrowLeft, Phone, MessageSquare } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubmitted(true);
      if (data.recoveryHint) {
        setHint(data.recoveryHint);
      }
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {language === 'bn' ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল অ্যাড্রেসটি লিখুন' : 'Enter your registered email address'}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'bn' ? 'নির্দেশনা পাঠানো হয়েছে' : 'Instructions Sent'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'যদি এই ইমেইলটি নিবন্ধিত থাকে, তবে পাসওয়ার্ড রিসেট করার নিয়ম পাঠানো হয়েছে। তাৎক্ষণিক সাপোর্টের জন্য সরাসরি প্রশিক্ষকের সাথে যোগাযোগ করুন।'
                  : 'If this email is registered, instructions have been dispatched. For prompt support contact the instructor directly.'}
              </p>

              {hint && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs">
                  {hint}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://wa.me/8801762766261"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp: +8801762766261</span>
                </a>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition"
              >
                {language === 'bn' ? 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠান' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Back to Sign In'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
