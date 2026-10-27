import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { UserPlus, User, Mail, Key, Phone, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
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
            {language === 'bn' ? 'নতুন শিক্ষার্থী রেজিস্ট্রেশন' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'ITMahfuzur এ আপনার ডিজিটাল স্কিল জার্নি শুরু করুন' : 'Start your digital skill journey with ITMahfuzur'}
          </p>
        </div>

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
                {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)' : 'Password * (min 6 characters)'}
              </label>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? (language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating...') : t('navRegister')}</span>
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>{language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-400 font-bold hover:underline"
            >
              {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
