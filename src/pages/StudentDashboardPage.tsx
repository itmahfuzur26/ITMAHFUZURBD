import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course, SiteNotification } from '../types';
import {
  BookOpen,
  CheckCircle,
  FileText,
  FolderDown,
  CreditCard,
  Bell,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { user, fetchWithAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [notesCount, setNotesCount] = useState(0);
  const [completedLessonsTotal, setCompletedLessonsTotal] = useState(0);
  const [notifications, setNotifications] = useState<SiteNotification[]>([]);

  useEffect(() => {
    fetchWithAuth('/api/student/dashboard')
      .then(res => res.json())
      .then(data => {
        setMyCourses(data.myCourses || []);
        setNotesCount(data.notesCount || 0);
        setCompletedLessonsTotal(data.completedLessonsTotal || 0);
        setNotifications(data.notifications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkNotificationsRead = async () => {
    try {
      await fetchWithAuth('/api/notifications/mark-read', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch {
      // error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 text-cyan-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin notice banner if logged in as Admin */}
        {user?.role === 'admin' && (
          <div className="p-5 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-amber-300">অ্যাডমিন অ্যাকাউন্ট (প্রধান পরিচালক)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-black uppercase">Admin Control</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  আপনি ITMahfuzur এর মূল অ্যাডমিন। কোর্স প্রাইস পরিবর্তন, বিকাশ পেমেন্ট অনুমোদন এবং ওয়েবসাইট সেটিংস পরিবর্তন করতে অ্যাডমিন প্যানেল ব্যবহার করুন।
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition whitespace-nowrap cursor-pointer shrink-0"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>গোপন অ্যাডমিন প্যানেলে যান</span>
            </button>
          </div>
        )}

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-0.5 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-xl text-cyan-400 uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  {t('dashboardWelcome')}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {user?.role === 'admin'
                    ? (language === 'bn' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'Admin Account')
                    : (language === 'bn' ? 'শিক্ষার্থী অ্যাকাউন্ট' : 'Student Account')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {user?.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {user?.email} • {user?.role === 'admin' ? (language === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Authority') : (language === 'bn' ? 'শিক্ষার্থী ড্যাশবোর্ড' : 'Student Dashboard')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/my-notes')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('navMyNotes')}</span>
            </button>
            <button
              onClick={() => navigate('/resources')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <FolderDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('navResources')}</span>
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '+ নতুন কোর্স যোগ করুন' : '+ Explore More'}</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">{t('enrolledCoursesCount')}</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{myCourses.length}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">{t('completedLessonsBadge')}</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{completedLessonsTotal}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">{t('savedNotesBadge')}</span>
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-400">{notesCount}</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">{t('recentNotifications')}</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {notifications.filter(n => !n.read).length}
            </p>
          </div>
        </div>

        {/* Continue Learning / My Enrolled Courses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {t('navMyCourses')}
            </h2>
            <button
              onClick={() => navigate('/courses')}
              className="text-xs text-cyan-400 font-semibold hover:underline"
            >
              {language === 'bn' ? 'সকল কোর্স ক্যাটালগ' : 'Browse All Courses'} →
            </button>
          </div>

          {myCourses.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                {language === 'bn' ? 'আপনি এখনো কোনো কোর্সে এনরোল করেননি' : 'You have not enrolled in any course yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {language === 'bn'
                  ? 'আমাদের ফ্রি ও পেইড প্র্যাকটিক্যাল কোর্সগুলো দেখুন এবং এখনই দক্ষতা উন্নয়ন শুরু করুন।'
                  : 'Explore our practical AI, graphic design, and digital marketing courses to get started.'}
              </p>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition"
              >
                {t('btnExploreCourses')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div
                  key={course.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video bg-slate-950">
                      <img
                        src={course.thumbnail}
                        alt={course.title_en}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500 text-slate-950">
                          {course.progressPercentage || 0}% {language === 'bn' ? 'সম্পন্ন' : 'Complete'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-base font-bold text-white line-clamp-2">
                        {language === 'bn' ? course.title_bn : course.title_en}
                      </h3>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${course.progressPercentage || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>{course.completedLessonsCount || 0} / {course.totalLessons || 0} {t('lessons')}</span>
                          <span>{course.progressPercentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => {
                        const targetLesson = course.nextLessonId ? `?lesson=${course.nextLessonId}` : '';
                        navigate(`/courses/${course.id}/learn${targetLesson}`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('btnContinueLearning')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications & Announcements */}
        {notifications.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>{t('recentNotifications')}</span>
              </h3>
              <button
                onClick={handleMarkNotificationsRead}
                className="text-xs text-slate-400 hover:text-white"
              >
                {language === 'bn' ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {notifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => notif.link && navigate(notif.link)}
                  className={`py-3 text-xs flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-800/40 px-2 rounded-lg transition ${
                    !notif.read ? 'text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-bold text-slate-200">
                      {language === 'bn' ? notif.title_bn : notif.title_en}
                    </p>
                    <p className="text-slate-400">
                      {language === 'bn' ? notif.message_bn : notif.message_en}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
