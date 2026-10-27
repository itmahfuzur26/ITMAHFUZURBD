import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { SiteSettings } from '../types';
import { Phone, Mail, MessageSquare, ShieldCheck, Heart, Sparkles, CheckCircle, ExternalLink, Users } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const phone = settings?.phone || '01762-766261';
  const email = settings?.email || 'itmahfuzur@gmail.com';
  const whatsapp = settings?.whatsapp_number || '+8801762766261';
  const facebookPage = settings?.facebook_page || 'https://www.facebook.com/share/1G1riLzDqa/';
  const facebookGroup = settings?.facebook_group || 'https://www.facebook.com/groups/518193848887774/?ref=share&mibextid=NSMWBT';
  const tagline = language === 'bn'
    ? (settings?.tagline_bn || 'ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা, দক্ষতা উন্নয়নে আপনার বিশ্বস্ত সঙ্গী।')
    : (settings?.tagline_en || 'ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development.');

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div
              onClick={() => navigate('/')}
              className="cursor-pointer"
            >
              <Logo size="md" logoUrl={settings?.logo_url} />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'আইটি মাহফুজুর — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা ও ডিজিটাল স্কিল অর্জনে আপনার বিশ্বস্ত সহযোগী। ২০১৮ সাল থেকে ব্যবহারিক আইটি প্রশিক্ষণ।'
                : 'ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development. Practical IT training since 2018.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'bn' ? 'মাহফুজুর রহমান মাহদী কর্তৃক পরিচালিত' : 'Instructed by Mahfuzur Rahman Mahdi'}</span>
            </div>

            {/* Social Media Links (Facebook Page & Community Group) */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                {language === 'bn' ? 'কমিউনিটি ও সোশ্যাল মিডিয়া:' : 'Community & Social:'}
              </span>
              <div className="flex flex-col gap-2">
                <a
                  href={facebookPage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>{language === 'bn' ? 'ফেসবুক পেজ (Facebook Page)' : 'Facebook Page'}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>

                <a
                  href={facebookGroup}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition"
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লার্নিং গ্রুপ (Facebook Group)' : 'Facebook Learning Group'}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
              {language === 'bn' ? 'প্রধান লিঙ্কসমূহ' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/courses')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navCourses')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navAbout')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/instructor')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navInstructor')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navContact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Student Area */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
              {language === 'bn' ? 'শিক্ষার্থীদের কর্নার' : 'Student Corner'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navDashboard')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/my-courses')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navMyCourses')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/my-notes')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navMyNotes')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/resources')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navResources')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/payments')}
                  className="hover:text-cyan-400 transition"
                >
                  {t('navPaymentHistory')}
                </button>
              </li>
            </ul>
          </div>

          {/* Verified Contact & bKash Info */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
              {language === 'bn' ? 'সরাসরি যোগাযোগ ও বিকাশ' : 'Contact & bKash'}
            </h4>
            <div className="space-y-2.5 text-sm">
              <a
                href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2.5 text-slate-300 hover:text-cyan-400 transition"
              >
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{phone} (কল ও পার্সোনাল বিকাশ)</span>
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: {whatsapp}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 text-slate-300 hover:text-cyan-400 transition"
              >
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{email}</span>
              </a>
              <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'bn' ? 'সরাসরি শিক্ষক ও মেন্টর সাপোর্ট' : 'Direct Instructor & Mentor Support'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal and MANDATED Slogan Banner in Footer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center md:text-left space-y-1">
            <p className="font-semibold text-cyan-300 text-sm">
              “{tagline}”
            </p>
            <p className="mt-1 text-slate-400">
              © {new Date().getFullYear()} ITMahfuzur (আইটি মাহফুজুর). {t('allRightsReserved')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button
              onClick={() => navigate('/privacy-policy')}
              className="hover:text-cyan-400 transition"
            >
              {t('privacyTitle')}
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/terms')}
              className="hover:text-cyan-400 transition"
            >
              {t('termsTitle')}
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/refund-policy')}
              className="hover:text-cyan-400 transition"
            >
              {t('refundTitle')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
