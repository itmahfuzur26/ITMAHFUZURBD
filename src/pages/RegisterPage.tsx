import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  UserPlus,
  User,
  Mail,
  Key,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

const COUNTRY_CODES = [
  { code: '+880', label: '🇧🇩 Bangladesh (+880)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+966', label: '🇸🇦 Saudi Arabia (+966)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+60', label: '🇲🇾 Malaysia (+60)' },
  { code: '+1', label: '🇺🇸 USA / Canada (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+965', label: '🇰🇼 Kuwait (+965)' },
  { code: '+974', label: '🇶🇦 Qatar (+974)' },
  { code: '+968', label: '🇴🇲 Oman (+968)' },
  { code: '+65', label: '🇸🇬 Singapore (+65)' },
  { code: '+39', label: '🇮🇹 Italy (+39)' },
  { code: '+', label: '🌐 Other (অন্যান্য)' },
];

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+880');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setError(language === 'bn' ? 'সঠিক ইমেইল অ্যাড্রেস প্রদান করুন।' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.');
      return;
    }

    const fullPhone = phone.trim() ? `${selectedCountryCode} ${phone.trim()}` : '';

    setLoading(true);
    const result = await register(cleanName, cleanEmail, password, fullPhone);
    setLoading(false);

    if (result.success) {
      setRegisteredSuccess(true);
      setTimeout(() => {
        navigate('/courses');
      }, 1500);
    } else {
      setError(result.error || (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।' : 'Registration failed.'));
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
            {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {language === 'bn' ? 'যেকোনো দেশ ও মোবাইল থেকে সহজেই যুক্ত হয়ে কোর্স করুন' : 'Join from any country or mobile device and start learning'}
          </p>
        </div>

        {/* Global Access Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 flex items-center gap-3 text-xs text-slate-200 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div className="leading-snug">
            <span className="font-bold text-white block">
              {language === 'bn' ? 'আন্তর্জাতিক ও মোবাইল ফ্রেন্ডলি' : 'Global & Mobile Ready'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'bn' ? 'বাংলাদেশ সহ বিশ্বের যে কোনো দেশ থেকে রেজিস্ট্রেশন উন্মুক্ত।' : 'Registration open from Bangladesh and all countries worldwide.'}
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
          {registeredSuccess ? (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-white">
                {language === 'bn' ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে! 🎉' : 'Account Created Successfully! 🎉'}
              </h4>
              <p className="text-xs text-slate-300">
                {language === 'bn' ? 'আপনাকে স্বয়ংক্রিয়ভাবে কোর্স পেজে নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to courses...'}
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="name"
                      autoCapitalize="words"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'ইমেইল অ্যাড্রেস (Gmail বা যে কোনো ইমেইল)' : 'Email Address'} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      required
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Mobile Number with Country Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      ({language === 'bn' ? 'ঐচ্ছিক / যেকোনো দেশ' : 'Optional / Any Country'})
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={e => setSelectedCountryCode(e.target.value)}
                      className="col-span-5 sm:col-span-5 px-2.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none cursor-pointer truncate"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <div className="col-span-7 sm:col-span-7 relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="017XXXXXXXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)' : 'Password * (min 6 characters)'}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? (language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating...') : t('navRegister')}</span>
                </button>
              </form>

              <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
                <span>{language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
                <button
                  onClick={() => navigate('/login')}
                  className="text-cyan-400 font-bold hover:underline ml-1"
                >
                  {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
