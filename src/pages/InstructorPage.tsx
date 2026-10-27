import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  Mail,
  MessageSquare,
  Award,
  CheckCircle,
  Sparkles,
  Bot,
  Palette,
  TrendingUp,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { InstructorAvatar } from '../components/InstructorAvatar';

interface InstructorPageProps {
  navigate: (path: string) => void;
}

export const InstructorPage: React.FC<InstructorPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const [settings, setSettings] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const expertiseList = [
    { title_bn: 'গ্রাফিক ডিজাইন (Graphic Design)', title_en: 'Graphic Design', desc_bn: 'ফটোশপ ও ইলাস্ট্রেটরে ব্র্যান্ড আইডেন্টিটি, প্রিন্ট ও ডিজিটাল মিডিয়া', desc_en: 'Brand identity, print design, and social media artwork with Photoshop & Illustrator' },
    { title_bn: 'আর্টিফিশিয়াল ইন্টেলিজেন্স (AI)', title_en: 'Artificial Intelligence (AI)', desc_bn: 'এলএলএম মডেল, অটোমেশন এবং বাস্তব কর্মক্ষেত্রে এআই এর ব্যবহার', desc_en: 'LLM mental models, automation pipelines, and enterprise AI workflows' },
    { title_bn: 'মডার্ন AI টুলস ও প্রম্পট ইঞ্জিনিয়ারিং', title_en: 'AI Tools & Prompt Engineering', desc_bn: 'ChatGPT, Claude, Gemini ও মিডজার্নির উচ্চমানের ফ্রেমওয়ার্ক', desc_en: 'Structured prompt design formulas for ChatGPT, Claude, Gemini, and Midjourney' },
    { title_bn: 'ডিজিটাল মার্কেটিং (Digital Marketing)', title_en: 'Digital Marketing', desc_bn: 'মেটা অ্যাডস ম্যানেজার, টার্গেটেড ক্যাম্পেইন এবং সোশ্যাল মিডিয়া গ্রোথ', desc_en: 'Meta Ads Manager campaigns, strategic targeting, and multi-channel marketing' },
    { title_bn: 'প্রযুক্তিভিত্তিক শিক্ষা (Technology Education)', title_en: 'Technology Education', desc_bn: 'সহজ ও বোধগম্য বাংলায় প্রযুক্তিগত জটিল বিষয় উপস্থাপন', desc_en: 'Breaking down complex technical systems into actionable, accessible lessons' },
    { title_bn: 'ব্যবহারিক প্রযুক্তি প্রশিক্ষণ (Practical IT Training)', title_en: 'Practical Technology Training', desc_bn: 'বাস্তব প্রজেক্টের মাধ্যমে সরাসরি সমস্যা সমাধান শেখানো', desc_en: 'Hands-on project mentoring and real-world troubleshooting' },
  ];

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-700/80 p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Avatar Monogram */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <InstructorAvatar
                size="xl"
                showExperienceBadge={true}
                showMrmBadge={true}
                photoUrl={settings?.instructor_photo_url}
              />
            </div>

            {/* Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>প্রতিষ্ঠাতা ও প্রশিক্ষক — ITMahfuzur</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                মাহফুজুর রহমান মাহদী
              </h1>
              <p className="text-cyan-400 font-medium text-base">
                Mahfuzur Rahman Mahdi • IT Sector Experience Since 2018
              </p>

              {/* Exact Mandated Statement */}
              <blockquote className="p-5 rounded-2xl bg-slate-950/80 border-l-4 border-cyan-400 text-slate-200 text-base sm:text-lg leading-relaxed italic my-4">
                {language === 'bn' ? (
                  '“আমি মাহফুজুর রহমান মাহদী। ২০১৮ সাল থেকে আইটি সেক্টরে কাজ করছি। গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং, আর্টিফিশিয়াল ইন্টেলিজেন্স (AI), আধুনিক AI টুলস এবং প্রযুক্তিভিত্তিক শিক্ষার সঙ্গে যুক্ত আছি। আমার লক্ষ্য হলো সহজ ও ব্যবহারিক পদ্ধতিতে প্রযুক্তি শেখানো, যাতে আরও বেশি মানুষ ডিজিটাল দক্ষতা অর্জন করতে পারেন এবং নিজেদের ভবিষ্যৎ গড়তে পারেন।”'
                ) : (
                  '“I am Mahfuzur Rahman Mahdi. Working in the IT sector since 2018. Actively involved in Graphic Design, Digital Marketing, Artificial Intelligence (AI), modern AI tools, and technology education. My goal is to teach practical technology in an accessible manner so more individuals can build digital skills and elevate their future.”'
                )}
              </blockquote>

              {/* Direct Verified Contacts */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm">
                <a
                  href="tel:01762766261"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>01762-766261</span>
                </a>
                <a
                  href="https://wa.me/8801762766261"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-semibold border border-emerald-500/40 transition"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp: +8801762766261</span>
                </a>
                <a
                  href="mailto:itmahfuzur@gmail.com"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>itmahfuzur@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Grid */}
        <div className="space-y-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              {language === 'bn' ? 'পেশাদার দক্ষতা ও অভিজ্ঞতার ক্ষেত্র' : 'Professional Areas of Expertise'}
            </h2>
            <p className="text-sm text-slate-400">
              {language === 'bn'
                ? 'দীর্ঘ বাস্তব অভিজ্ঞতা থেকে অর্জিত কার্যকরী আইটি ও ডিজিটাল দক্ষতা'
                : 'Core areas of hands-on technical practice since 2018'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertiseList.map((exp, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-sm mb-3">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-white">
                  {language === 'bn' ? exp.title_bn : exp.title_en}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'bn' ? exp.desc_bn : exp.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to Courses */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">
            {language === 'bn' ? 'মাহফুজুর রহমান মাহদী পরিচালিত কোর্সসমূহ দেখুন' : 'Explore Courses by Mahfuzur Rahman Mahdi'}
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {language === 'bn'
              ? 'গ্রাফিক ডিজাইন, এআই টুলস ও ডিজিটাল মার্কেটিং এর সহজ ও প্র্যাকটিক্যাল কোর্সগুলোতে এখনই যুক্ত হোন।'
              : 'Enroll in structured, practical courses designed for immediate real-world utility.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/courses')}
              className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 inline-flex items-center gap-2 transition"
            >
              <span>{t('btnExploreCourses')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
