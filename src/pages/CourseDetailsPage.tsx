import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course, CourseModule, Lesson } from '../types';
import { BkashPaymentModal } from '../components/BkashPaymentModal';
import {
  Clock,
  Video,
  CheckCircle,
  Lock,
  Play,
  ArrowRight,
  ShieldCheck,
  Award,
  CreditCard,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface CourseDetailsPageProps {
  courseId: string;
  navigate: (path: string) => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({ courseId, navigate }) => {
  const { language, t } = useLanguage();
  const { isLoggedIn, user, fetchWithAuth } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollingFree, setEnrollingFree] = useState(false);
  const [bkashModalOpen, setBkashModalOpen] = useState(false);
  const [freeEnrollSuccess, setFreeEnrollSuccess] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId, isLoggedIn]);

  const loadCourseDetails = () => {
    setLoading(true);
    fetchWithAuth(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.course) {
          setCourse(data.course);
          setModules(data.modules || []);
          setLessons(data.lessons || []);
          setHasAccess(data.hasAccess || false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleEnrollFree = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setEnrollingFree(true);
    try {
      const res = await fetchWithAuth('/api/courses/enroll-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
        setHasAccess(true);
        setFreeEnrollSuccess(true);
        setTimeout(() => {
          navigate(`/courses/${courseId}/learn`);
        }, 1200);
      }
    } catch {
      // error
    } finally {
      setEnrollingFree(false);
    }
  };

  const handleStartLearning = () => {
    const firstLesson = lessons[0];
    if (firstLesson) {
      navigate(`/courses/${courseId}/learn?lesson=${firstLesson.id}`);
    } else {
      navigate(`/courses/${courseId}/learn`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen max-w-xl mx-auto text-center py-24 px-4 text-slate-300">
        <h2 className="text-2xl font-bold mb-4">{language === 'bn' ? 'কোর্সটি খুঁজে পাওয়া যায়নি' : 'Course Not Found'}</h2>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm"
        >
          {language === 'bn' ? 'সকল কোর্সে ফিরে যান' : 'Back to All Courses'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 py-12">
      {/* Course Breadcrumb & Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                course.isFree
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-cyan-500 text-slate-950'
              }`}>
                {course.isFree ? t('courseFree') : `৳${course.price.toLocaleString()} BDT`}
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {language === 'bn' ? course.level_bn : course.level_en}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              {language === 'bn' ? course.title_bn : course.title_en}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {language === 'bn' ? course.description_bn : course.description_en}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{course.durationHours} {t('hours')} {language === 'bn' ? 'মোট সময়কাল' : 'Total Duration'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                <span>{lessons.length} {t('lessons')}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>{course.instructor}</span>
              </div>
            </div>

            {/* What you will learn */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 mt-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>{t('learningObjectives')}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(language === 'bn' ? course.learningObjectives_bn : course.learningObjectives_en).map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                {t('prerequisites')}
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-400">
                {(language === 'bn' ? course.prerequisites_bn : course.prerequisites_en).map((pre, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>{pre}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum Breakdown */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-bold text-white">
                {t('curriculum')}
              </h3>

              <div className="space-y-4">
                {modules.map(module => {
                  const moduleLessons = lessons.filter(l => l.module_id === module.id);
                  return (
                    <div key={module.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                      <div className="p-4 bg-slate-800/50 border-b border-slate-800 font-bold text-white text-sm flex items-center justify-between">
                        <span>{language === 'bn' ? module.title_bn : module.title_en}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          {moduleLessons.length} {t('lessons')}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-800/60">
                        {moduleLessons.map(lesson => {
                          const canAccess = course.isFree || lesson.isFreePreview || hasAccess;
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (canAccess) {
                                  navigate(`/courses/${course.id}/learn?lesson=${lesson.id}`);
                                } else if (!isLoggedIn) {
                                  navigate('/login');
                                } else {
                                  setBkashModalOpen(true);
                                }
                              }}
                              className={`p-4 flex items-center justify-between transition cursor-pointer ${
                                canAccess
                                  ? 'hover:bg-slate-800/60 text-slate-200'
                                  : 'text-slate-500 hover:bg-slate-950'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {canAccess ? (
                                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                                    <Play className="w-4 h-4 fill-current" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                                    <Lock className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">
                                    {language === 'bn' ? lesson.title_bn : lesson.title_en}
                                  </p>
                                  <span className="text-xs text-slate-400">
                                    {lesson.durationMinutes} {language === 'bn' ? 'মিনিট' : 'min'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                {lesson.isFreePreview && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {t('btnWatchPreview')}
                                  </span>
                                )}
                                {!canAccess && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>{language === 'bn' ? 'লকড' : 'Locked'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar CTA Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-950">
                <img
                  src={course.thumbnail}
                  alt={course.title_en}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Box */}
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-xs text-slate-400 mb-1">
                    {course.isFree ? (language === 'bn' ? 'ফি' : 'Price') : (language === 'bn' ? 'কোর্স ফি' : 'Course Fee')}
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {course.isFree ? (
                      <span className="text-emerald-400">{t('courseFree')}</span>
                    ) : (
                      <span className="text-cyan-400">৳{course.price.toLocaleString()} BDT</span>
                    )}
                  </div>
                </div>

                {hasAccess ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{t('alreadyEnrolled')}</span>
                    </div>
                    <button
                      onClick={handleStartLearning}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{t('btnStartLearning')}</span>
                    </button>
                  </div>
                ) : course.isFree ? (
                  <button
                    onClick={handleEnrollFree}
                    disabled={enrollingFree}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <span>{enrollingFree ? (language === 'bn' ? 'যুক্ত করা হচ্ছে...' : 'Enrolling...') : t('btnEnrollNow')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          navigate('/login');
                        } else {
                          setBkashModalOpen(true);
                        }
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-pink-600/25 flex items-center justify-center gap-2 transition"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{t('btnPayWithBkash')}</span>
                    </button>

                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      {language === 'bn'
                        ? 'bKash Send Money এর মাধ্যমে পেমেন্ট সম্পন্ন করে TrxID সাবমিট করুন। অ্যাডমিন অনুমোদনের পর সম্পূর্ণ অ্যাক্সেস পাওয়া যাবে।'
                        : 'Submit your bKash TrxID after sending fee. Access will be granted after manual admin verification.'}
                    </p>
                  </div>
                )}

                {/* Features Checklist */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>{lessons.length} {t('lessons')} + প্র্যাকটিক্যাল প্রজেক্ট</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>ডাউনলোডযোগ্য লার্নিং রিসোর্স ও ফাইল</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>ক্লাস চলাকালীন নিজস্ব প্রাইভেট নোট নেওয়ার সুবিধা</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>লাইফটাইম এক্সেস ও সরাসরি মেন্টর সাপোর্ট</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bKash Payment Modal */}
      {course && (
        <BkashPaymentModal
          course={course}
          isOpen={bkashModalOpen}
          onClose={() => setBkashModalOpen(false)}
          navigate={navigate}
          onPaymentSubmitted={() => {
            setBkashModalOpen(false);
            loadCourseDetails();
          }}
        />
      )}
    </div>
  );
};
