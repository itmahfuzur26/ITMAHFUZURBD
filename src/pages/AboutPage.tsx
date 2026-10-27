import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { Target, Eye, Sparkles, ShieldCheck, Heart, ArrowRight, Phone, Mail } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'আমাদের পরিচিতি ও রূপরেখা' : 'About ITMahfuzur'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            {language === 'bn' ? 'ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা' : 'ITMahfuzur — Technology Education Built on Experience'}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'ITMahfuzur হলো তথ্যপ্রযুক্তি, ব্যবহারিক ডিজিটাল স্কিলস, গ্রাফিক ডিজাইন, আধুনিক আর্টিফিশিয়াল ইন্টেলিজেন্স (AI) এবং প্রম্পট ইঞ্জিনিয়ারিং প্রশিক্ষণের একটি নিবেদিত প্ল্যাটফর্ম। ২০১৮ সাল থেকে বাস্তব কাজের অভিজ্ঞতায় সমৃদ্ধ প্রশিক্ষক মাহফুজুর রহমান মাহদীর তত্ত্বাবধানে পরিচালিত।'
              : 'ITMahfuzur is a dedicated learning platform for practical IT, digital skills, graphic design, and artificial intelligence (AI) education, led by technology practitioner Mahfuzur Rahman Mahdi, working in the IT sector since 2018.'}
          </p>
        </div>

        {/* Brand Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {language === 'bn' ? 'আমাদের মিশন (Our Mission)' : 'Our Mission'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'সহজ ও ব্যবহারিক পদ্ধতিতে আধুনিক তথ্যপ্রযুক্তি শিক্ষাকে প্রতিটি মানুষের কাছে সহজলভ্য করে তোলা। বিশেষ করে যারা আধুনিক ডিজিটাল স্কিল শেখার পর্যাপ্ত সুযোগ পান না, তাদের প্রযুক্তি ও কর্মসংস্থানে আত্মবিশ্বাসী করে গড়ে তোলা এবং তাদের ভবিষ্যৎ ক্যারিয়ার ও আয়ের পথ প্রশস্ত করা।'
                : 'Make practical technology education accessible to more people, especially learners who have limited opportunities to learn modern IT skills. Help students develop useful digital skills, become more confident in technology, and improve their future career and income opportunities.'}
            </p>
          </div>

          {/* Philosophy & Vision */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {language === 'bn' ? 'আমাদের দর্শন (Our Philosophy)' : 'Our Philosophy'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'আমরা বিশ্বাস করি প্রযুক্তি শেখার সবচেয়ে কার্যকর উপায় হলো বাস্তব প্রজেক্ট তৈরির মাধ্যমে শেখা। মুখস্থ তত্ত্ব বা জটিল পরিভাষার বদলে প্রতিটি বিষয়কে সহজ বাংলা ভাষায় ভেঙে প্রতিটি ক্লিকের কারণ ও ফলাফল বুঝিয়ে দেওয়া হয়।'
                : 'We believe the most durable learning occurs through project-driven, practical creation. Rather than complex academic theory, every concept is broken down into intuitive, actionable workflows with direct mentor accessibility.'}
            </p>
          </div>
        </div>

        {/* Tagline Showcase */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
            {language === 'bn' ? 'অফিসিয়াল স্লোগান' : 'Official Brand Tagline'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white max-w-3xl mx-auto leading-relaxed">
            {language === 'bn'
              ? '“ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা, দক্ষতা উন্নয়নে আপনার বিশ্বস্ত সঙ্গী।”'
              : '“ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development.”'}
          </h2>
        </div>

        {/* About Instructor Summary */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              {language === 'bn' ? 'প্রশিক্ষক ও কর্ণধার' : 'Instructor & Founder'}
            </span>
            <h3 className="text-2xl font-bold text-white">
              মাহফুজুর রহমান মাহদী (Mahfuzur Rahman Mahdi)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {language === 'bn'
                ? '২০১৮ সাল থেকে আইটি সেক্টরে সক্রিয় কাজের অভিজ্ঞতা নিয়ে শিক্ষার্থীদের গ্রাফিক ডিজাইন, এআই ও ডিজিটাল মার্কেটিং এর হাতে-কলমে প্রশিক্ষণ দিচ্ছেন।'
                : 'Directing and mentoring learners in graphic design, generative AI workflows, and digital marketing based on solid industry practice since 2018.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => navigate('/instructor')}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              {language === 'bn' ? 'প্রশিক্ষকের বিস্তারিত প্রোফাইল' : 'View Instructor Profile'}
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              {t('btnExploreCourses')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
