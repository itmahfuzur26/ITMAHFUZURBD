import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course, SiteSettings } from '../types';
import { BkashPaymentModal } from '../components/BkashPaymentModal';
import { InstructorAvatar } from '../components/InstructorAvatar';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Palette,
  Bot,
  TrendingUp,
  Cpu,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  Video,
  ChevronDown,
  CreditCard,
  Users,
  ExternalLink
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { isLoggedIn, fetchWithAuth } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedCourseForBkash, setSelectedCourseForBkash] = useState<Course | null>(null);

  useEffect(() => {
    fetchWithAuth('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, [isLoggedIn]);

  const categories = [
    {
      id: 'ai-training',
      icon: <Bot className="w-7 h-7 text-cyan-400" />,
      title_bn: 'আর্টিফিশিয়াল ইন্টেলিজেন্স ও AI টুলস',
      title_en: 'AI Tools & Prompt Engineering',
      desc_bn: 'ChatGPT, Gemini, Claude ও মিডজার্নি দিয়ে দ্রুত কনটেন্ট তৈরি ও কর্মদক্ষতা বৃদ্ধি।',
      desc_en: 'Supercharge workflows, content creation, and analysis with cutting-edge LLMs and AI platforms.',
      tag: 'AI Specialist',
      gradient: 'from-cyan-950/40 to-blue-950/40 border-cyan-800/40',
    },
    {
      id: 'graphic-design',
      icon: <Palette className="w-7 h-7 text-pink-400" />,
      title_bn: 'ব্যবহারিক গ্রাফিক ডিজাইন',
      title_en: 'Practical Graphic Design',
      desc_bn: 'ফটোশপ ও ইলাস্ট্রেটর দিয়ে লোগো, ব্র্যান্ডিং, সোশ্যাল ব্যানার ও প্রিন্ট মিডিয়ার কাজ।',
      desc_en: 'Master Adobe Photoshop and Illustrator for high-impact branding, social media, and client projects.',
      tag: 'Creative Design',
      gradient: 'from-pink-950/40 to-rose-950/40 border-pink-800/40',
    },
    {
      id: 'digital-marketing',
      icon: <TrendingUp className="w-7 h-7 text-emerald-400" />,
      title_bn: 'ডিজিটাল মার্কেটিং ও স্ট্র্যাটেজি',
      title_en: 'Digital Marketing & Growth',
      desc_bn: 'ফেসবুক, ইনস্টাগ্রাম ও গুগলে সফল পেইড অ্যাড ক্যাম্পেইন এবং ব্র্যান্ডিং কৌশল।',
      desc_en: 'Targeted advertising, audience building, and strategic conversion funnels.',
      tag: 'Marketing Growth',
      gradient: 'from-emerald-950/40 to-teal-950/40 border-emerald-800/40',
    },
    {
      id: 'tech-skills',
      icon: <Cpu className="w-7 h-7 text-amber-400" />,
      title_bn: 'আধুনিক ডিজিটাল ও প্রযুক্তি স্কিলস',
      title_en: 'Digital & IT Skills Development',
      desc_bn: 'ক্যানভা, কম্পিউটার ফান্ডামেন্টাল এবং বাস্তবভিত্তিক ডিজিটাল স্কিল প্রশিক্ষণ।',
      desc_en: 'Hands-on practical training designed for modern digital work and freelance readiness.',
      tag: 'Essential Skills',
      gradient: 'from-amber-950/40 to-orange-950/40 border-amber-800/40',
    },
  ];

  const faqs = [
    {
      q_bn: 'ITMahfuzur এ শেখানোর পদ্ধতি কেমন?',
      q_en: 'What is the teaching methodology at ITMahfuzur?',
      a_bn: 'আমাদের সকল কোর্স সম্পূর্ণ ব্যবহারিক ও হাতে-কলমে প্র্যাকটিক্যাল ভিত্তিক। কোনো অপ্রয়োজনীয় তাত্ত্বিক মুখস্থ করার বদলে বাস্তব প্রজেক্টের মাধ্যমে প্রতিটি টুলস ও স্কিল শেখানো হয়।',
      a_en: 'All courses are 100% practical and project-oriented. Instead of rote theory, you learn through real client workflows, step-by-step demonstrations, and hands-on exercises.'
    },
    {
      q_bn: 'কোর্সের ভিডিওগুলো কি যে কোনো সময় দেখা যাবে?',
      q_en: 'Can I watch course lessons anytime?',
      a_bn: 'হ্যাঁ! কোর্সটিতে ভর্তি হওয়ার পর আপনি আপনার সুবিধাজনক সময়ে কম্পিউটার বা স্মার্টফোনে যেকোনো সময় লগইন করে ক্লাসগুলো দেখতে পারবেন এবং অগ্রগতি ট্র্যাক করতে পারবেন।',
      a_en: 'Yes! Once enrolled, lessons are accessible 24/7 at your own pace from your student dashboard on desktop or mobile.'
    },
    {
      q_bn: 'পেইড কোর্সে কীভাবে bKash এর মাধ্যমে পেমেন্ট করব?',
      q_en: 'How do I pay with bKash for paid courses?',
      a_bn: 'কোর্স পেজে গিয়ে "bKash এ পেমেন্ট করুন" ক্লিক করলে নির্দিষ্ট bKash নম্বর ও নির্দেশিকা দেখতে পাবেন। সেন্ড মানি করার পর প্রেরক নম্বর ও TrxID সাবমিট করলে অ্যাডমিন দ্রুত যাচাই করে আপনার কোর্সে অ্যাক্সেস দিয়ে দেবেন।',
      a_en: 'Click "Pay with bKash" on any paid course to view the verified number and instructions. After sending the course fee, submit your sender number and TrxID for swift admin approval.'
    },
    {
      q_bn: 'শেখার সময় কোনো প্রশ্ন বা সমস্যা হলে কীভাবে সমাধান পাব?',
      q_en: 'How can I get help if I get stuck while learning?',
      a_bn: 'প্রতিটি ক্লাসের নিচে ডেডিকেটেড কমেন্ট ও প্রশ্নোত্তরের সুযোগ রয়েছে যেখানে প্রশিক্ষক সরাসরি রিপ্লাই দেন। এছাড়া সরাসরি ফোন এবং হোয়াটসঅ্যাপে যোগাযোগের সুবিধা রয়েছে।',
      a_en: 'Every lesson features a discussion section where the instructor responds directly. You can also contact us directly via phone or WhatsApp.'
    },
  ];

  const featuredCourses = courses.filter(c => c.featured);
  const displayCourses = featuredCourses.length > 0 ? featuredCourses : courses.slice(0, 3);

  return (
    <div className="min-h-screen text-slate-100 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Top Pill Badge & Smart Instructor Spotlight */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/10">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{t('heroBadge')}</span>
              </div>

              {/* Smart Circular Avatar Card */}
              <div 
                onClick={() => navigate('/instructor')}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-cyan-500/10 cursor-pointer transition transform hover:scale-105 group"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-0.5 shadow-md shadow-cyan-400/30">
                    <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://res.cloudinary.com/ru3hghyn/image/upload/v1793028848/1000030687-removebg-preview.png"
                        alt="Mahfuzur Rahman Mahdi (MRM)"
                        className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition duration-300"
                      />
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-cyan-950 border border-cyan-400 text-[8px] font-black text-cyan-300">
                    MRM
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                      {language === 'bn' ? 'মাহফুজুর রহমান মাহদী' : 'Mahfuzur Rahman Mahdi'}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
                  </div>
                  <span className="text-[10px] text-cyan-400 font-medium">
                    {language === 'bn' ? 'প্রতিষ্ঠাতা ও প্রশিক্ষক • ২০১৮ থেকে' : 'Founder & Mentor • Since 2018'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {language === 'bn' ? (
                <>
                  অভিজ্ঞতার আলোকে <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">প্রযুক্তি শিক্ষা</span> ও দক্ষতা উন্নয়ন
                </>
              ) : (
                <>
                  Practical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">Technology Education</span> Built on Real Experience
                </>
              )}
            </h1>

            {/* Tagline & Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {language === 'bn'
                ? 'আইটি মাহফুজুর (ITMahfuzur) এ গ্রাফিক ডিজাইন, আধুনিক AI টুলস, প্রম্পট ইঞ্জিনিয়ারিং এবং ডিজিটাল মার্কেটিং শিখুন সরাসরি ২০১৮ সাল থেকে বাস্তব ক্ষেত্রে কর্মরত প্রফেশনালের তত্ত্বাবধানে।'
                : 'Learn Graphic Design, Modern AI Tools, Prompt Engineering, and Digital Marketing guided directly by Mahfuzur Rahman Mahdi, in the IT industry since 2018.'}
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <span>{t('btnExploreCourses')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>{t('btnContactUs')}</span>
              </button>

              <a
                href="https://wa.me/8801762766261"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-semibold text-base flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Key Trust Highlights (Genuine, no fabricated statistics) */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-800/80">
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-xl font-bold text-cyan-400">২০১৮ সাল থেকে</p>
                <p className="text-xs text-slate-400 mt-0.5">আইটি সেক্টরে বাস্তব অভিজ্ঞতা</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-xl font-bold text-sky-400">ব্যবহারিক প্রজেক্ট</p>
                <p className="text-xs text-slate-400 mt-0.5">মুখস্থ নয়, হাতে-কলমে শেখা</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-xl font-bold text-emerald-400">সরাসরি মেন্টর</p>
                <p className="text-xs text-slate-400 mt-0.5">মাহফুজুর রহমান মাহদী</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-xl font-bold text-amber-400">লাইফটাইম সাপোর্ট</p>
                <p className="text-xs text-slate-400 mt-0.5">রিসোর্স ও ডিসকাশন প্যানেল</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Mission & Introduction */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {language === 'bn' ? 'ITMahfuzur এর মূল লক্ষ্য' : 'Our Educational Mission'}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {language === 'bn'
                ? 'সহজ ও ব্যবহারিক পদ্ধতিতে আধুনিক তথ্যপ্রযুক্তি শিক্ষাকে প্রতিটি মানুষের কাছে পৌঁছে দেওয়া। বিশেষ করে যারা আধুনিক ডিজিটাল স্কিল শেখার সুযোগ থেকে বঞ্চিত, তাদের প্রযুক্তি ও কর্মসংস্থানে আত্মবিশ্বাসী করে গড়ে তোলাই আমাদের লক্ষ্য।'
                : 'To make practical technology education accessible to everyone, especially learners with limited opportunities to acquire modern IT skills. Helping students gain real digital competence and improve future opportunities.'}
            </p>
          </div>
        </div>
      </section>

      {/* Four Core Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রশিক্ষণ ক্ষেত্রসমূহ' : 'Specialized Domains'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {language === 'bn' ? 'যেসব বিষয়ে আমরা ব্যবহারিক প্রশিক্ষণ প্রদান করি' : 'Practical Areas of Instruction'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => navigate(`/courses?category=${cat.id}`)}
                className={`group cursor-pointer p-6 rounded-2xl bg-gradient-to-b ${cat.gradient} border hover:border-cyan-500/60 transition duration-300 transform hover:-translate-y-1 shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 group-hover:scale-110 transition">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition">
                  {language === 'bn' ? cat.title_bn : cat.title_en}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'bn' ? cat.desc_bn : cat.desc_en}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-400">
                  <span>{language === 'bn' ? 'কোর্সগুলো দেখুন' : 'Explore Courses'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'জনপ্রিয় কোর্সসমূহ' : 'Popular Courses'}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                {language === 'bn' ? 'হাতে-কলমে আধুনিক কোর্সগুলো' : 'Hands-On Practical Courses'}
              </h2>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition"
            >
              <span>{language === 'bn' ? 'সকল কোর্স দেখুন' : 'View All Courses'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 overflow-hidden shadow-xl transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      <img
                        src={course.thumbnail}
                        alt={course.title_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md ${
                          course.isFree
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-cyan-500 text-slate-950'
                        }`}>
                          {course.isFree ? t('courseFree') : `৳${course.price.toLocaleString()} BDT`}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{course.durationHours} {t('hours')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-sky-400" />
                          <span>{course.lessonCount || 4} {t('lessons')}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition line-clamp-2 mb-2">
                        {language === 'bn' ? course.title_bn : course.title_en}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {language === 'bn' ? course.description_bn : course.description_en}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>{course.instructor}</span>
                      <span className="font-bold text-cyan-400">
                        {course.isFree ? t('courseFree') : `৳${course.price.toLocaleString()} BDT`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {course.hasAccess ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${course.id}/learn`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'শেখা শুরু করুন' : 'Continue Learning'}</span>
                        </button>
                      ) : !course.isFree ? (
                        <div className="w-full grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLoggedIn) {
                                navigate('/login');
                              } else {
                                setSelectedCourseForBkash(course);
                              }
                            }}
                            className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-pink-600/20 transition"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'bKash এ পেমেন্ট' : 'bKash Pay'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${course.id}`);
                            }}
                            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                          >
                            <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${course.id}`);
                          }}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <span>{language === 'bn' ? 'ফ্রি এনরোল করুন' : 'Free Enroll'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instructor Introduction Feature */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-700/80 p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Photo & Badge */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                <InstructorAvatar size="xl" showExperienceBadge={true} showMrmBadge={true} />
                <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">Graphic Design</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">AI & Prompt Eng</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">Digital Marketing</span>
                </div>
              </div>

              {/* Bio & Official Quote */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
                  <span>প্রশিক্ষক পরিচিতি ও দর্শন</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {language === 'bn' ? 'মাহফুজুর রহমান মাহদী' : 'Mahfuzur Rahman Mahdi'}
                </h3>

                {/* EXACT MANDATED QUOTE */}
                <blockquote className="p-5 rounded-2xl bg-slate-950/80 border-l-4 border-cyan-400 text-slate-200 text-base sm:text-lg leading-relaxed italic">
                  {language === 'bn' ? (
                    '“আমি মাহফুজুর রহমান মাহদী। ২০১৮ সাল থেকে আইটি সেক্টরে কাজ করছি। গ্রাফিক ডিজাইন, ডিজিটাল মার্কেটিং, আর্টিফিশিয়াল ইন্টেলিজেন্স (AI), আধুনিক AI টুলস এবং প্রযুক্তিভিত্তিক শিক্ষার সঙ্গে যুক্ত আছি। আমার লক্ষ্য হলো সহজ ও ব্যবহারিক পদ্ধতিতে প্রযুক্তি শেখানো, যাতে আরও বেশি মানুষ ডিজিটাল দক্ষতা অর্জন করতে পারেন এবং নিজেদের ভবিষ্যৎ গড়তে পারেন।”'
                  ) : (
                    '“I am Mahfuzur Rahman Mahdi. Working in the IT sector since 2018. Actively involved in Graphic Design, Digital Marketing, Artificial Intelligence (AI), modern AI tools, and technology education. My goal is to teach practical technology in an accessible manner so more individuals can build digital skills and elevate their future.”'
                  )}
                </blockquote>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => navigate('/instructor')}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition"
                  >
                    {language === 'bn' ? 'সম্পূর্ণ প্রোফাইল দেখুন' : 'View Full Profile'}
                  </button>

                  <a
                    href="tel:01762766261"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
                  >
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <span>01762-766261</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Learn With ITMahfuzur */}
      <section className="py-20 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl font-extrabold text-white">
              {language === 'bn' ? 'কেন ITMahfuzur এর সাথে শিখবেন?' : 'Why Learn with ITMahfuzur?'}
            </h2>
            <p className="text-slate-400 text-sm">
              {language === 'bn'
                ? 'বাস্তবমুখী জ্ঞান ও সরাসরি মেন্টরশিপের মাধ্যমে প্রযুক্তি শিক্ষায় আমাদের বিশেষত্ব'
                : 'Key distinctions in our practical methodology and direct instructor guidance'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'bn' ? '১০০% প্র্যাকটিক্যাল ফোকাস' : '100% Practical Focus'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'থিওরি নয়, প্রতিটি ক্লাসেই শেখানো হয় বাস্তব কাজের প্রয়োজনীয় টেকনিক যাতে আপনি নিজেই প্রজেক্ট তৈরি করতে পারেন।'
                  : 'Real workflows, project files, and step-by-step demonstrations so you can build your own deliverables immediately.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'bn' ? 'সরাসরি প্রশিক্ষক সাপোর্ট' : 'Direct Mentor Guidance'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'কোনো থার্ড পার্টি প্রতিনিধি নয়, ক্লাসের প্রতিটি প্রশ্নের উত্তর ও সহায়তা সরাসরি মাহফুজুর রহমান মাহদী নিজে প্রদান করেন।'
                  : 'Get answers to your learning questions directly from the primary instructor with no intermediary delays.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'bn' ? 'রিসোর্স ও প্রাইভেট নোটস' : 'Resources & Private Notes'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'ক্লাসের সাথে প্রয়োজনীয় প্র্যাকটিস ফাইল, পিডিএফ ও চিটশিট ডাউনলোডের সুবিধা এবং ক্লাস চলাকালীন নিজস্ব নিরাপদ নোট লেখার সিস্টেম।'
                  : 'Downloadable practice assets, templates, and high-security private note-taking built right beside the video player.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              {language === 'bn' ? 'সাধারণ জিজ্ঞাসাসমূহ' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white font-semibold text-base transition"
                  >
                    <span>{language === 'bn' ? faq.q_bn : faq.q_en}</span>
                    <ChevronDown className={`w-5 h-5 text-cyan-400 transition transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
                      {language === 'bn' ? faq.a_bn : faq.a_en}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Contact Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {language === 'bn'
                ? 'কোর্স সম্পর্কে কোনো প্রশ্ন আছে? সরাসরি কথা বলুন'
                : 'Have questions about a course? Reach out directly'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              {language === 'bn'
                ? 'যেকোনো কোর্স নির্বাচন ও ভর্তি সংক্রান্ত পরামর্শের জন্য সরাসরি ফোন অথবা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।'
                : 'For consultation regarding course selection and enrollments, feel free to call or WhatsApp us directly.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:01762766261"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg transition"
              >
                <Phone className="w-4 h-4" />
                <span>01762-766261</span>
              </a>
              <a
                href="https://wa.me/8801762766261"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: +8801762766261</span>
              </a>
              <a
                href={settings?.facebook_page || "https://www.facebook.com/share/1G1riLzDqa/"}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook Page</span>
              </a>
              <a
                href={settings?.facebook_group || "https://www.facebook.com/groups/518193848887774/?ref=share&mibextid=NSMWBT"}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-bold text-sm flex items-center gap-2 shadow-lg transition"
              >
                <Users className="w-4 h-4" />
                <span>Facebook Group</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Direct bKash Modal when clicked on any paid course */}
      {selectedCourseForBkash && (
        <BkashPaymentModal
          course={selectedCourseForBkash}
          isOpen={!!selectedCourseForBkash}
          onClose={() => setSelectedCourseForBkash(null)}
          onPaymentSubmitted={() => {
            setSelectedCourseForBkash(null);
            navigate('/payments');
          }}
        />
      )}
    </div>
  );
};
