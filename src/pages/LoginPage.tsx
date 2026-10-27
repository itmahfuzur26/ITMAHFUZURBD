import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { LogIn, Key, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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

    if (!email.trim() || !password) {
      setError(language === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' : 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
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
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {language === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Sign in to ITMahfuzur'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'কোর্সে বা ড্যাশবোর্ডে প্রবেশ করতে আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিন' : 'Enter your registered credentials to access your account'}
          </p>
        </div>

        {/* Security / Server Connection Badge */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium text-[11px]">
              {language === 'bn' ? 'সার্ভার সিকিউরিটি সক্রিয়' : 'Server Security Active'}
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            SSL 256-bit Encrypted
          </span>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-cyan-400 hover:underline font-medium"
                >
                  {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition focus:outline-none p-1 cursor-pointer"
                  title={showPassword ? (language === 'bn' ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (language === 'bn' ? 'পাসওয়ার্ড দেখুন' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{language === 'bn' ? 'পাসওয়ার্ড দেখতে চোখের আইকন ক্লিক করুন' : 'Click the eye icon to view password'}</span>
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
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? (language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : t('navLogin')}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>{language === 'bn' ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}</span>
            <button
              onClick={() => navigate('/register')}
              className="text-cyan-400 font-bold hover:underline"
            >
              {language === 'bn' ? 'এখানে ফ্রি রেজিস্ট্রেশন করুন' : 'Register for free'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
