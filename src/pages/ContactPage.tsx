import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Clock, MapPin, Users, ExternalLink } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<{
    phone?: string;
    email?: string;
    facebook_page?: string;
    facebook_group?: string;
    bkash_number?: string;
  } | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const phoneNum = settings?.phone || '01762-766261';
  const emailAddr = settings?.email || 'itmahfuzur@gmail.com';
  const fbPageUrl = settings?.facebook_page || 'https://www.facebook.com/share/1G1riLzDqa/';
  const fbGroupUrl = settings?.facebook_group || 'https://www.facebook.com/groups/518193848887774/?ref=share&mibextid=NSMWBT';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit form');
      } else {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setError(language === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
            <Phone className="w-3.5 h-3.5" />
            <span>{t('navContact')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {language === 'bn' ? 'সরাসরি যোগাযোগ করুন' : 'Get In Touch'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {language === 'bn'
              ? 'কোর্স সংক্রান্ত যেকোনো জিজ্ঞাসা, ভর্তি বা পরামর্শের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।'
              : 'For course inquiries, enrollment support, or general consultations, reach out directly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Direct Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Phone */}
            <a
              href={`tel:${phoneNum.replace(/[^0-9]/g, '')}`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-start gap-4 transition group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {language === 'bn' ? 'সরাসরি কল করুন' : 'Phone Call'}
                </span>
                <p className="text-xl font-bold text-white group-hover:text-cyan-400 transition font-mono">
                  {phoneNum}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'সরাসরি কথা বলতে ক্লিক করুন' : 'Click to call directly'}
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/88${phoneNum.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex items-start gap-4 transition group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  WhatsApp
                </span>
                <p className="text-xl font-bold text-white group-hover:text-emerald-400 transition font-mono">
                  +88{phoneNum.replace(/[^0-9]/g, '')}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'হোয়াটসঅ্যাপে তাৎক্ষণিক চ্যাট করুন' : 'Instant WhatsApp messaging'}
                </p>
              </div>
            </a>

            {/* Facebook Page */}
            <a
              href={fbPageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-start gap-4 transition group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition shrink-0 font-bold text-lg">
                f
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    {language === 'bn' ? 'অফিসিয়াল ফেসবুক পেইজ' : 'Official Facebook Page'}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400" />
                </div>
                <p className="text-base font-bold text-white group-hover:text-blue-400 transition">
                  facebook.com/ITMahfuzur
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'নিয়মিত আপডেট ও নোটিশ পেতে ফলো করুন' : 'Follow for latest updates & notices'}
                </p>
              </div>
            </a>

            {/* Facebook Community Group */}
            <a
              href={fbGroupUrl}
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 flex items-start gap-4 transition group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    {language === 'bn' ? 'শিক্ষার্থী কমিউনিটি গ্রুপ' : 'Student Community Group'}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                  Facebook Community Group
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? '৫,০০০+ শিক্ষার্থীর সাথে আলোচনা ও মতামত' : 'Join group for peer learning & doubts'}
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${emailAddr}`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 flex items-start gap-4 transition group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {language === 'bn' ? 'ইমেইল যোগাযোগ' : 'Email Address'}
                </span>
                <p className="text-base font-bold text-white group-hover:text-sky-400 transition">
                  {emailAddr}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'যে কোনো পরামর্শ বা প্রশ্ন পাঠান' : 'Send detailed inquiries'}
                </p>
              </div>
            </a>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-white">
                {language === 'bn' ? 'বার্তা পাঠান' : 'Send a Message'}
              </h3>

              {success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমরা দ্রুত আপনার সাথে যোগাযোগ করব।'
                      : 'Thank you! Your message has been sent. We will respond promptly.'}
                  </span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Mahfuzur Rahman"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {language === 'bn' ? 'বিষয়' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: গ্রাফিক ডিজাইন কোর্স' : 'e.g. Course Consultation'}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'bn' ? 'আপনার বার্তা *' : 'Your Message *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার বক্তব্য বিস্তারিত লিখুন...' : 'Write your inquiry details...'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...') : (language === 'bn' ? 'বার্তা পাঠান' : 'Send Message')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
