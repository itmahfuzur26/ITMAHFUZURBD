import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { LogIn, Key, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, Zap, Globe, Smartphone } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError(language === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' : 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(cleanEmail, password);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || (language === 'bn' ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid email or password.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Sign in to ITMahfuzur'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'bn' ? 'কোর্স ও ড্যাশবোর্ডে প্রবেশ করতে আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিন' : 'Enter your registered credentials to access your courses'}
          </p>
        </div>

        {/* Global & Mobile Compatibility Badge */}
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-200">
              {language === 'bn' ? 'যে কোনো দেশ ও মোবাইল থেকে ব্যবহারযোগ্য' : 'Global & Mobile Ready'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px]">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Netlify 100% Active</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস (Gmail / Email)' : 'Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  placeholder="e.g. itmahfuzur@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
                >
                  {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                <span>{language === 'bn' ? 'পাসওয়ার্ড দেখতে পাশের চোখের আইকন চাপুন' : 'Click the eye icon to verify typed password'}</span>
                {password && (
                  <span className="text-cyan-400 font-mono text-[10px]">
                    {showPassword ? `${password.length} chars` : '••••'}
                  </span>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? (language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : t('navLogin')}</span>
            </button>
          </form>

          {/* Registration Link */}
          <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>{language === 'bn' ? 'নতুন শিক্ষার্থী? অ্যাকাউন্ট নেই? ' : "Don't have an account? "}</span>
            <button
              onClick={() => navigate('/register')}
              className="text-cyan-400 font-bold hover:underline ml-1"
            >
              {language === 'bn' ? 'এখানে ফ্রি একাউন্ট তৈরি করুন' : 'Register for free'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
