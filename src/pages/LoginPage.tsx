import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { LogIn, Key, Mail, AlertCircle, ShieldCheck, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।' : 'Login failed. Please check your credentials.'));
    }
  };

  const fillAndLoginAdmin = async () => {
    setEmail('itmahfuzur@gmail.com');
    setPassword('Password@123');
    setError(null);
    setLoading(true);

    const result = await login('itmahfuzur@gmail.com', 'Password@123');
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
    }
  };

  const fillDemo = (demoType: 'student' | 'admin') => {
    if (demoType === 'student') {
      setEmail('student@itmahfuzur.com');
      setPassword('Password@123');
    } else {
      setEmail('itmahfuzur@gmail.com');
      setPassword('Password@123');
    }
    setError(null);
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
            {language === 'bn' ? 'কোর্সে প্রবেশ করতে আপনার ইমেইল ও পাসওয়ার্ড দিন' : 'Enter your credentials to access your courses'}
          </p>
        </div>

        {/* Quick Admin Access Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'অ্যাডমিন দ্রুত প্রবেশ' : 'Admin Quick Access'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
              itmahfuzur@gmail.com
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'ফাউন্ডার ও অ্যাডমিন (মাহফুজুর রহমান মাহদী) নিচের বাটনে ক্লিক করে এক ট্যাপে সরাসরি অ্যাডমিন প্যানেলে প্রবেশ করতে পারেন:'
              : 'Founder & Admin can enter directly with 1-click bypass:'}
          </p>
          <button
            type="button"
            onClick={fillAndLoginAdmin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'bn' ? 'এক ক্লিকে অ্যাডমিন লগইন করুন' : 'One-Click Admin Login'}</span>
          </button>
        </div>

        {/* Demo Fast Fill Buttons for Instant Evaluation */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            {language === 'bn' ? 'টেস্ট তথ্য এক ক্লিকে পূরণ' : 'Quick Form Fill'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('student')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-semibold border border-amber-600/30 flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo Admin</span>
            </button>
          </div>
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition focus:outline-none p-1"
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
