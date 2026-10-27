import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { BkashPaymentModal } from '../components/BkashPaymentModal';
import { Search, Filter, Clock, Video, BookOpen, ArrowRight, CreditCard } from 'lucide-react';

interface CoursesPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ navigate, initialCategory }) => {
  const { language, t } = useLanguage();
  const { isLoggedIn, fetchWithAuth } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedPriceType, setSelectedPriceType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseForBkash, setSelectedCourseForBkash] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, searchQuery]);

  const fetchCourses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    fetch(`/api/courses?${params.toString()}`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const categories = [
    { id: 'all', label_bn: 'সকল ক্যাটাগরি', label_en: 'All Categories' },
    { id: 'ai-training', label_bn: 'AI ও প্রম্পট ইঞ্জিনিয়ারিং', label_en: 'AI & Prompt Eng' },
    { id: 'graphic-design', label_bn: 'গ্রাফিক ডিজাইন', label_en: 'Graphic Design' },
    { id: 'digital-marketing', label_bn: 'ডিজিটাল মার্কেটিং', label_en: 'Digital Marketing' },
    { id: 'tech-skills', label_bn: 'আইটি স্কিলস', label_en: 'Tech Skills' },
  ];

  const filteredCourses = courses.filter(course => {
    if (selectedPriceType === 'free') return course.isFree;
    if (selectedPriceType === 'paid') return !course.isFree;
    return true;
  });

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('navCourses')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {language === 'bn' ? 'ব্যবহারিক তথ্যপ্রযুক্তি ও ডিজিটাল স্কিল কোর্সসমূহ' : 'Practical IT & Digital Skill Courses'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {language === 'bn'
              ? 'বাস্তব প্রজেক্টের মাধ্যমে শিখুন এবং আধুনিক মার্কেটপ্লেস ও কর্মক্ষেত্রে এগিয়ে থাকুন।'
              : 'Learn with step-by-step practical workflows, project files, and direct instructor guidance.'}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'bn' ? 'কোর্স খুঁজুন...' : 'Search courses...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Price Type Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-400 font-semibold">{t('btnFilter')}:</span>
              <button
                onClick={() => setSelectedPriceType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPriceType === 'all'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'bn' ? 'সব' : 'All'}
              </button>
              <button
                onClick={() => setSelectedPriceType('free')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPriceType === 'free'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'bn' ? 'ফ্রি' : 'Free'}
              </button>
              <button
                onClick={() => setSelectedPriceType('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPriceType === 'paid'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'bn' ? 'পেইড' : 'Paid'}
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {language === 'bn' ? cat.label_bn : cat.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">
              {language === 'bn' ? 'কোনো কোর্স পাওয়া যায়নি' : 'No courses found'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'অনুগ্রহ করে ভিন্ন কিওয়ার্ড বা ফিল্টার চেষ্টা করুন।' : 'Please try a different keyword or category filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 overflow-hidden shadow-xl transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div 
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="relative aspect-video overflow-hidden bg-slate-950 cursor-pointer"
                  >
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

                    {course.hasAccess && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/90 text-slate-950 shadow-md">
                          {language === 'bn' ? 'এনরোল্ড ✓' : 'Enrolled ✓'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
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

                    <h3 
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="text-lg font-bold text-white group-hover:text-cyan-400 transition line-clamp-2 mb-2 cursor-pointer"
                    >
                      {language === 'bn' ? course.title_bn : course.title_en}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {language === 'bn' ? course.description_bn : course.description_en}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>{course.instructor}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="inline-flex items-center gap-1 font-bold text-slate-300 hover:text-cyan-400 transition"
                    >
                      <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Main Action Button */}
                  {course.hasAccess ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <span>{language === 'bn' ? 'ক্লাস শুরু করুন' : 'Start Learning'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : course.isFree ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <span>{language === 'bn' ? 'ফ্রি এনরোল করুন' : 'Free Enroll'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition text-center"
                      >
                        {language === 'bn' ? 'কোর্স সিলেবাস' : 'Curriculum'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoggedIn) {
                            navigate('/login');
                          } else {
                            setSelectedCourseForBkash(course);
                          }
                        }}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/30 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'bKash এ পেমেন্ট' : 'Pay bKash'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct bKash Payment Modal */}
      {selectedCourseForBkash && (
        <BkashPaymentModal
          course={selectedCourseForBkash}
          isOpen={!!selectedCourseForBkash}
          onClose={() => setSelectedCourseForBkash(null)}
          onPaymentSubmitted={() => {
            setSelectedCourseForBkash(null);
            fetchCourses();
          }}
        />
      )}
    </div>
  );
};
