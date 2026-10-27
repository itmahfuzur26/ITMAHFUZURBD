import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Mail, Phone, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const payload: any = { name, phone, bio };
    if (newPassword) {
      if (!currentPassword) {
        setError(language === 'bn' ? 'বর্তমান পাসওয়ার্ড প্রদান করুন।' : 'Please enter current password to set a new password.');
        setSaving(false);
        return;
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const res = await updateProfile(payload);
    setSaving(false);

    if (res.success) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>{t('navSettings')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {language === 'bn' ? 'অ্যাকাউন্ট সেটিংস ও প্রোফাইল' : 'Account Settings'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'bn' ? 'আপনার ব্যক্তিগত তথ্য ও সিকিউরিটি পরিবর্তন করুন' : 'Manage your profile credentials and security'}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!'}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'ইমেইল অ্যাড্রেস (পরিবর্তনযোগ্য নয়)' : 'Email (Read only)'}
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'বায়ো / পরিচয়' : 'Bio / Short Introduction'}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder={language === 'bn' ? 'নিজের সম্পর্কে সংক্ষেপে লিখুন...' : 'A brief description about yourself...'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            {/* Password Change Sub-section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)' : 'Change Password (Optional)'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {saving ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : t('btnSave')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
