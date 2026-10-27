import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  User,
  Mail,
  Phone,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested preset avatars for quick picking
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  ];

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(language === 'bn' ? 'ছবির সাইজ সর্বোচ্চ ২MB হতে হবে।' : 'Image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const payload: any = {
      name: name.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
    };

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
      setTimeout(() => setSuccess(false), 3500);
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">
              {language === 'bn' ? 'প্রোফাইল ও অ্যাকাউন্ট সেটিংস' : 'Profile & Account Settings'}
            </h1>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
              user?.role === 'admin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {user?.role === 'admin'
                ? (language === 'bn' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'Admin Account')
                : (language === 'bn' ? 'শিক্ষার্থী অ্যাকাউন্ট' : 'Student Account')}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? (user?.role === 'admin' ? 'অ্যাডমিন প্রোফাইল ছবি, নাম এবং তথ্য পরিবর্তন করুন' : 'আপনার শিক্ষার্থী প্রোফাইল ছবি, নাম ও তথ্য পরিবর্তন করুন')
              : 'Customize your profile picture, personal details, and account security'}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'প্রোফাইল ছবি ও তথ্য সফলভাবে আপডেট হয়েছে!'
                  : 'Profile picture and details updated successfully!'}
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'bn' ? 'প্রোফাইল ছবি (Profile Picture)' : 'Profile Picture'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'bn'
                    ? 'আপনার ছবি যুক্ত করুন যা ওয়েবসাইটের হেডার ও ড্যাশবোর্ডে প্রদর্শিত হবে'
                    : 'Upload or set an image to show across the navbar and student dashboard'}
                </p>
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="px-2.5 py-1 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ছবি মুছুন' : 'Remove'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 shadow-xl shadow-cyan-500/20">
                  <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-extrabold text-2xl text-cyan-400 uppercase">
                        {name ? name.charAt(0) : 'U'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড' : 'Upload from Device'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomUrlInput(!customUrlInput)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'bn' ? 'ইমেজ লিঙ্ক দিন' : 'Image URL'}</span>
                  </button>
                </div>

                {customUrlInput && (
                  <div className="pt-1">
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.jpg"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Preset Avatars */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {language === 'bn' ? 'অথবা দ্রুত অ্যাভাটার বেছে নিন:' : 'Or choose a preset avatar:'}
                  </span>
                  <div className="flex items-center gap-2">
                    {presetAvatars.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(presetUrl)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition transform hover:scale-110 ${
                          avatar === presetUrl ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setPhone(e.target.value)}
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
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'নিজের সম্পর্কে সংক্ষেপে লিখুন...'
                    : 'A brief description about yourself...'
                }
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>
                        {showPassword
                          ? language === 'bn'
                            ? 'লুকান'
                            : 'Hide'
                          : language === 'bn'
                          ? 'দেখুন'
                          : 'Show'}
                      </span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>
                        {showPassword
                          ? language === 'bn'
                            ? 'লুকান'
                            : 'Hide'
                          : language === 'bn'
                          ? 'দেখুন'
                          : 'Show'}
                      </span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {saving
                  ? language === 'bn'
                    ? 'সংরক্ষণ করা হচ্ছে...'
                    : 'Saving...'
                  : language === 'bn'
                  ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন'
                  : 'Save Profile Changes'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
