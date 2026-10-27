import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Course, PaymentRequest, LearningResource, LessonComment, SiteSettings } from '../types';
import {
  ShieldAlert,
  Users,
  BookOpen,
  CreditCard,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FolderDown,
  Settings,
  Plus,
  Trash2,
  Eye,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { isAdmin, fetchWithAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'courses' | 'comments' | 'resources' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);

  // Overview Stats
  const [stats, setStats] = useState<any>(null);

  // Payments
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseOpen, setNewCourseOpen] = useState(false);
  const [cTitleBn, setCTitleBn] = useState('');
  const [cTitleEn, setCTitleEn] = useState('');
  const [cDescBn, setCDescBn] = useState('');
  const [cDescEn, setCDescEn] = useState('');
  const [cCategory, setCCategory] = useState<'graphic-design' | 'ai-training' | 'digital-marketing' | 'tech-skills'>('ai-training');
  const [cPrice, setCPrice] = useState(0);
  const [cIsFree, setCIsFree] = useState(false);
  const [cThumbnail, setCThumbnail] = useState('');
  const [cDuration, setCDuration] = useState(12);

  // Lesson & Module modal
  const [selectedCourseForModule, setSelectedCourseForModule] = useState<string | null>(null);
  const [moduleTitleBn, setModuleTitleBn] = useState('');
  const [moduleTitleEn, setModuleTitleEn] = useState('');
  const [lessonModuleId, setLessonModuleId] = useState('');
  const [lessonTitleBn, setLessonTitleBn] = useState('');
  const [lessonTitleEn, setLessonTitleEn] = useState('');
  const [lessonDuration, setLessonDuration] = useState(20);
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonIsFreePreview, setLessonIsFreePreview] = useState(false);

  // Comments
  const [commentsData, setCommentsData] = useState<{ comments: LessonComment[]; reports: any[] }>({ comments: [], reports: [] });

  // Resources
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [newResourceOpen, setNewResourceOpen] = useState(false);
  const [resCourseId, setResCourseId] = useState('');
  const [resTitleBn, setResTitleBn] = useState('');
  const [resTitleEn, setResTitleEn] = useState('');
  const [resFileName, setResFileName] = useState('');
  const [resFileType, setResFileType] = useState('application/pdf');
  const [resFileSize, setResFileSize] = useState('2.5 MB');

  // Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadAllAdminData();
  }, [isAdmin]);

  const loadAllAdminData = () => {
    setLoading(true);
    Promise.all([
      fetchWithAuth('/api/admin/overview').then(res => res.json()),
      fetchWithAuth('/api/admin/payments').then(res => res.json()),
      fetchWithAuth('/api/courses').then(res => res.json()),
      fetchWithAuth('/api/admin/comments').then(res => res.json()),
      fetchWithAuth('/api/admin/resources').then(res => res.json()),
      fetch('/api/admin/settings').then(res => res.json()),
    ])
      .then(([statsRes, paymentsRes, coursesRes, commentsRes, resourcesRes, settingsRes]) => {
        setStats(statsRes);
        setPayments(paymentsRes);
        setCourses(coursesRes);
        setCommentsData(commentsRes);
        setResources(resourcesRes);
        setSiteSettings(settingsRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Payment Actions
  const handleApprovePayment = async (paymentId: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: 'Verified and approved' }),
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason || 'Transaction ID could not be confirmed' }),
      });
      if (res.ok) {
        setRejectingId(null);
        setRejectReason('');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_bn: cTitleBn,
          title_en: cTitleEn,
          description_bn: cDescBn,
          description_en: cDescEn,
          category: cCategory,
          price: cPrice,
          isFree: cIsFree,
          thumbnail: cThumbnail,
          durationHours: cDuration,
        }),
      });
      if (res.ok) {
        setNewCourseOpen(false);
        setCTitleBn('');
        setCTitleEn('');
        setCDescBn('');
        setCDescEn('');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Create Module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForModule) return;
    try {
      const res = await fetchWithAuth(`/api/admin/courses/${selectedCourseForModule}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_bn: moduleTitleBn,
          title_en: moduleTitleEn,
        }),
      });
      if (res.ok) {
        const mod = await res.json();
        setLessonModuleId(mod.id);
        setModuleTitleBn('');
        setModuleTitleEn('');
        alert('মডিউল যুক্ত হয়েছে। এখন এই মডিউলে ক্লাস যুক্ত করুন।');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Create Lesson
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForModule || !lessonModuleId) return;
    try {
      const res = await fetchWithAuth(`/api/admin/modules/${lessonModuleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourseForModule,
          title_bn: lessonTitleBn,
          title_en: lessonTitleEn,
          durationMinutes: lessonDuration,
          video_url: lessonVideoUrl,
          isFreePreview: lessonIsFreePreview,
        }),
      });
      if (res.ok) {
        setLessonTitleBn('');
        setLessonTitleEn('');
        setLessonVideoUrl('');
        alert('ক্লাস সফলভাবে যুক্ত হয়েছে!');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Moderate Comment
  const handleModerateComment = async (commentId: string, action: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Create Resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: resCourseId,
          title_bn: resTitleBn,
          title_en: resTitleEn,
          file_name: resFileName,
          file_type: resFileType,
          file_size: resFileSize,
          download_enabled: true,
          is_published: true,
        }),
      });
      if (res.ok) {
        setNewResourceOpen(false);
        setResTitleBn('');
        setResTitleEn('');
        setResFileName('');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  const handleDeleteResource = async (resId: string) => {
    try {
      await fetchWithAuth(`/api/admin/resources/${resId}`, { method: 'DELETE' });
      loadAllAdminData();
    } catch {
      // error
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    try {
      const res = await fetchWithAuth('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      }
    } catch {
      // error
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/30 shadow-2xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('adminDashboardTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? 'কোর্স, পেমেন্ট অনুমোদন, মন্তব্য মডারেশন এবং সাইট কনফিগারেশন' : 'Manage courses, approve manual bKash transactions, and website configuration'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              ADMIN: Mahfuzur Rahman Mahdi
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t('adminPendingPayments')} ({payments.filter(p => p.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'courses' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কোর্স ও ক্লাস' : 'Courses & Lessons'}</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'comments' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মন্তব্য মডারেশন' : 'Comments & Reports'}</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'resources' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'লার্নিং রিসোর্স' : 'Learning Resources'}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t('adminSettings')}</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">{language === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Students'}</span>
                <p className="text-2xl font-black text-white">{stats.totalStudents}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">{language === 'bn' ? 'প্রকাশিত কোর্স' : 'Total Courses'}</span>
                <p className="text-2xl font-black text-cyan-400">{stats.totalCourses}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1">
                <span className="text-[11px] text-amber-300 font-semibold">{language === 'bn' ? 'অপেক্ষমাণ পেমেন্ট' : 'Pending Requests'}</span>
                <p className="text-2xl font-black text-amber-400">{stats.pendingPaymentsCount}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
                <span className="text-[11px] text-emerald-300 font-semibold">{language === 'bn' ? 'অনুমোদিত পেমেন্ট' : 'Approved Count'}</span>
                <p className="text-2xl font-black text-emerald-400">{stats.approvedPaymentsCount}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">{language === 'bn' ? 'মোট আয়' : 'Total Revenue'}</span>
                <p className="text-2xl font-black text-cyan-300">৳{stats.totalRevenue?.toLocaleString()} BDT</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold">{language === 'bn' ? 'রিপোর্টকৃত মন্তব্য' : 'Pending Reports'}</span>
                <p className="text-2xl font-black text-rose-400">{stats.reportedCommentsCount}</p>
              </div>
            </div>

            {/* Quick Action: Pending bKash Payments */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-pink-400" />
                  <span>{language === 'bn' ? 'দ্রুত যাচাই: অপেক্ষমাণ bKash পেমেন্ট' : 'Quick Verify: Pending bKash Requests'}</span>
                </h3>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  {language === 'bn' ? 'সকল পেমেন্ট দেখুন' : 'View All'} →
                </button>
              </div>

              {payments.filter(p => p.status === 'pending').length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  {language === 'bn' ? 'বর্তমানে কোনো অপেক্ষমাণ পেমেন্ট রিকোয়েস্ট নেই।' : 'No pending payment requests right now.'}
                </p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {payments.filter(p => p.status === 'pending').map(p => (
                    <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{p.user_name}</span>
                          <span className="text-xs text-slate-400">({p.user_email})</span>
                        </div>
                        <p className="text-xs text-cyan-400 font-medium mt-0.5">
                          {p.course_title_en} • ৳{p.amount.toLocaleString()} BDT
                        </p>
                        <p className="text-xs font-mono text-pink-400 font-bold mt-1">
                          TrxID: {p.transaction_id} | Sender: {p.bkash_sender_number}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprovePayment(p.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('adminApprove')}</span>
                        </button>
                        <button
                          onClick={() => setRejectingId(p.id)}
                          className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-bold border border-red-500/30 transition"
                        >
                          {t('adminReject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manual bKash Payments Verification (CRITICAL FEATURE) */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{t('adminPendingPayments')}</h2>
                <p className="text-xs text-slate-400">
                  {language === 'bn'
                    ? 'শিক্ষার্থীর পাঠানো TrxID যাচাই করুন এবং কোর্স অ্যাক্সেস দিন'
                    : 'Verify student transaction ID and authorize course enrollment'}
                </p>
              </div>

              {/* Status filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    paymentFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Pending ({payments.filter(p => p.status === 'pending').length})
                </button>
                <button
                  onClick={() => setPaymentFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    paymentFilter === 'approved' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Approved ({payments.filter(p => p.status === 'approved').length})
                </button>
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    paymentFilter === 'all' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  All ({payments.length})
                </button>
              </div>
            </div>

            {/* Rejection input box if active */}
            {rejectingId && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3">
                <p className="text-xs font-bold text-red-300">
                  {language === 'bn' ? 'পেমেন্ট বাতিলের কারণ লিখুন:' : 'Enter reason for rejection:'}
                </p>
                <input
                  type="text"
                  placeholder="e.g. TrxID not found in bKash statement"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectingId(null)}
                    className="px-3 py-1.5 text-xs text-slate-400"
                  >
                    {t('btnCancel')}
                  </button>
                  <button
                    onClick={() => handleRejectPayment(rejectingId)}
                    className="px-4 py-1.5 rounded bg-red-600 text-white font-bold text-xs"
                  >
                    {language === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">{language === 'bn' ? 'শিক্ষার্থী' : 'Student'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'কোর্স ও মূল্য' : 'Course & Fee'}</th>
                      <th className="px-6 py-4">TrxID & {language === 'bn' ? 'প্রেরক নম্বর' : 'Sender'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {payments
                      .filter(p => paymentFilter === 'all' || p.status === paymentFilter)
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4">
                            <span className="font-bold text-white block">{p.user_name}</span>
                            <span className="text-xs text-slate-400">{p.user_email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-white block">{p.course_title_en}</span>
                            <span className="text-xs font-bold text-cyan-400">৳{p.amount.toLocaleString()} BDT</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">
                            <span className="text-pink-400 font-bold block">{p.transaction_id}</span>
                            <span className="text-slate-400">{p.bkash_sender_number}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                              p.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : p.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {p.status === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprovePayment(p.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                                >
                                  {t('adminApprove')}
                                </button>
                                <button
                                  onClick={() => setRejectingId(p.id)}
                                  className="px-3 py-1.5 rounded-lg bg-red-950/60 text-red-300 border border-red-500/30 text-xs font-bold"
                                >
                                  {t('adminReject')}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">
                                {p.admin_note || '-'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Courses & Lessons Management */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{language === 'bn' ? 'কোর্স ও ক্লাস পরিচালনা' : 'Course & Lesson Management'}</h2>
                <p className="text-xs text-slate-400">{language === 'bn' ? 'নতুন কোর্স তৈরি, মডিউল ও ক্লাস যুক্ত করুন' : 'Create courses, modules, and lessons'}</p>
              </div>
              <button
                onClick={() => setNewCourseOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t('adminAddCourse')}</span>
              </button>
            </div>

            {/* Course Creation Form Modal */}
            {newCourseOpen && (
              <form onSubmit={handleCreateCourse} className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 space-y-4">
                <h3 className="text-base font-bold text-white">{t('adminAddCourse')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">কোর্স শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={cTitleBn}
                      onChange={e => setCTitleBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={cTitleEn}
                      onChange={e => setCTitleEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">বিবরণ (বাংলা)</label>
                    <textarea
                      rows={2}
                      value={cDescBn}
                      onChange={e => setCDescBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={cDescEn}
                      onChange={e => setCDescEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ক্যাটাগরি</label>
                    <select
                      value={cCategory}
                      onChange={e => setCCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="ai-training">AI & Prompt Eng</option>
                      <option value="graphic-design">Graphic Design</option>
                      <option value="digital-marketing">Digital Marketing</option>
                      <option value="tech-skills">Tech Skills</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">কোর্স ফি (BDT)</label>
                    <input
                      type="number"
                      value={cPrice}
                      onChange={e => setCPrice(Number(e.target.value))}
                      disabled={cIsFree}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white disabled:opacity-40"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="cIsFree"
                      checked={cIsFree}
                      onChange={e => {
                        setCIsFree(e.target.checked);
                        if (e.target.checked) setCPrice(0);
                      }}
                      className="w-4 h-4 rounded text-cyan-500"
                    />
                    <label htmlFor="cIsFree" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      সম্পূর্ণ ফ্রি কোর্স
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">মোট ঘণ্টা</label>
                    <input
                      type="number"
                      value={cDuration}
                      onChange={e => setCDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewCourseOpen(false)}
                    className="px-4 py-2 text-xs text-slate-400"
                  >
                    {t('btnCancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    কোর্স তৈরি করুন
                  </button>
                </div>
              </form>
            )}

            {/* Existing Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => (
                <div key={course.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        course.isFree ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {course.isFree ? 'Free' : `৳${course.price.toLocaleString()} BDT`}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{course.title_bn}</h3>
                      <p className="text-xs text-slate-400">{course.title_en}</p>
                    </div>

                    <button
                      onClick={() => setSelectedCourseForModule(selectedCourseForModule === course.id ? null : course.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition"
                    >
                      {selectedCourseForModule === course.id ? 'মডিউল ফর্ম বন্ধ' : '+ মডিউল / ক্লাস যোগ'}
                    </button>
                  </div>

                  {/* Module & Lesson Form Drawer */}
                  {selectedCourseForModule === course.id && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 mt-4">
                      {/* Add Module */}
                      <form onSubmit={handleCreateModule} className="space-y-2 border-b border-slate-800 pb-3">
                        <span className="text-xs font-bold text-white block">১. নতুন মডিউল তৈরি করুন:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="মডিউল শিরোনাম (বাংলা)"
                            value={moduleTitleBn}
                            onChange={e => setModuleTitleBn(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Module Title (English)"
                            value={moduleTitleEn}
                            onChange={e => setModuleTitleEn(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <button type="submit" className="px-4 py-1.5 rounded bg-cyan-600 text-slate-950 font-bold text-xs">
                          মডিউল সংরক্ষণ
                        </button>
                      </form>

                      {/* Add Lesson */}
                      <form onSubmit={handleCreateLesson} className="space-y-2">
                        <span className="text-xs font-bold text-white block">২. ক্লাসের বিস্তারিত ও ভিডিও লিঙ্ক:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="ক্লাস শিরোনাম (বাংলা)"
                            value={lessonTitleBn}
                            onChange={e => setLessonTitleBn(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Lesson Title (English)"
                            value={lessonTitleEn}
                            onChange={e => setLessonTitleEn(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="ভিডিও URL (HLS / MP4 Stream)"
                            value={lessonVideoUrl}
                            onChange={e => setLessonVideoUrl(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="number"
                            placeholder="সময় (মিনিট)"
                            value={lessonDuration}
                            onChange={e => setLessonDuration(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              id="freePrev"
                              checked={lessonIsFreePreview}
                              onChange={e => setLessonIsFreePreview(e.target.checked)}
                              className="w-4 h-4 rounded text-cyan-500"
                            />
                            <label htmlFor="freePrev" className="text-[11px] text-slate-300 cursor-pointer">
                              ফ্রি প্রিভিউ ক্লাস
                            </label>
                          </div>
                        </div>
                        <button type="submit" className="px-4 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold text-xs">
                          ক্লাস যুক্ত করুন
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Comment Moderation */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">{language === 'bn' ? 'মন্তব্য মডারেশন ও রিপোর্ট' : 'Comment Moderation'}</h2>
            <div className="divide-y divide-slate-800 rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              {commentsData.comments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">{language === 'bn' ? 'কোনো মন্তব্য নেই।' : 'No comments.'}</p>
              ) : (
                commentsData.comments.map(c => (
                  <div key={c.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.user_name}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                        {c.is_reported && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            REPORTED
                          </span>
                        )}
                        {c.is_hidden && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{c.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.is_hidden ? (
                        <button
                          onClick={() => handleModerateComment(c.id, 'show')}
                          className="px-3 py-1 rounded bg-slate-800 text-cyan-300 text-xs font-bold"
                        >
                          Show
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateComment(c.id, 'hide')}
                          className="px-3 py-1 rounded bg-slate-800 text-amber-300 text-xs font-bold"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleModerateComment(c.id, 'delete')}
                        className="px-3 py-1 rounded bg-red-950/60 text-red-300 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Learning Resources */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{language === 'bn' ? 'লার্নিং রিসোর্স আপলোড ও পরিচালনা' : 'Learning Resources Management'}</h2>
                <p className="text-xs text-slate-400">{language === 'bn' ? 'শিক্ষার্থীদের জন্য অনুমোদিত ডাউনলোডযোগ্য ফাইল' : 'Downloadable learning materials for students'}</p>
              </div>
              <button
                onClick={() => setNewResourceOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t('adminAddResource')}</span>
              </button>
            </div>

            {newResourceOpen && (
              <form onSubmit={handleCreateResource} className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 space-y-4">
                <h3 className="text-base font-bold text-white">{t('adminAddResource')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">কোর্স নির্বাচন করুন *</label>
                    <select
                      required
                      value={resCourseId}
                      onChange={e => setResCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="">-- কোর্স সিলেক্ট করুন --</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title_bn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ফাইলের নাম (File Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ITMahfuzur_Prompt_Cheatsheet.pdf"
                      value={resFileName}
                      onChange={e => setResFileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">রিসোর্স শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={resTitleBn}
                      onChange={e => setResTitleBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={resTitleEn}
                      onChange={e => setResTitleEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setNewResourceOpen(false)} className="px-4 py-2 text-xs text-slate-400">
                    {t('btnCancel')}
                  </button>
                  <button type="submit" className="px-6 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
                    রিসোর্স যুক্ত করুন
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.title_bn}</h4>
                    <p className="text-[11px] text-slate-400">{r.file_name} • {r.file_size}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(r.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: bKash Configuration & Settings */}
        {activeTab === 'settings' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 max-w-3xl">
            <h2 className="text-xl font-bold text-white">{t('adminSettings')}</h2>

            {settingsSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>কনফিগারেশন সফলভাবে আপডেট হয়েছে!</span>
              </div>
            )}

            {/* Brand Logo & Media */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400">লোগো এবং সোশ্যাল মিডিয়া লিংক (Branding & Links)</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  লোগো ইমেজ লিঙ্ক (Logo Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/..."
                  value={siteSettings.logo_url || ''}
                  onChange={e => setSiteSettings({ ...siteSettings, logo_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  হেডার এবং ফোটারে প্রদর্শিত অরিজিনাল লোগোর ইমেজ ইউআরএল (Cloudinary / Image host)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ফেসবুক পেইজ লিংক (Facebook Page URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/..."
                    value={siteSettings.facebook_page || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, facebook_page: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ফেসবুক গ্রুপ লিংক (Facebook Group URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/groups/..."
                    value={siteSettings.facebook_group || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, facebook_group: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Brand Taglines */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400">ব্র্যান্ড স্লোগান (Footer Slogan & Taglines)</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  বাংলা স্লোগান (ফোটারে প্রদর্শিত)
                </label>
                <input
                  type="text"
                  value={siteSettings.tagline_bn || ''}
                  onChange={e => setSiteSettings({ ...siteSettings, tagline_bn: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  English Slogan (Shown in Footer)
                </label>
                <input
                  type="text"
                  value={siteSettings.tagline_en || ''}
                  onChange={e => setSiteSettings({ ...siteSettings, tagline_en: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* bKash & Contact */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400">বিকাশ ও যোগাযোগ নম্বর (bKash & Contact Information)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    পার্সোনাল bKash নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.bkash_number}
                    onChange={e => setSiteSettings({ ...siteSettings, bkash_number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    শিক্ষার্থীরা এই নম্বরে সরাসরি Send Money করবেন
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    bKash অ্যাকাউন্টের ধরন
                  </label>
                  <input
                    type="text"
                    value={siteSettings.bkash_type}
                    onChange={e => setSiteSettings({ ...siteSettings, bkash_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ফোন ও হোয়াটসঅ্যাপ নম্বর (Phone & WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.phone || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, phone: e.target.value, whatsapp_number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ইমেইল (Support Email)
                  </label>
                  <input
                    type="email"
                    value={siteSettings.email || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                bKash পেমেন্ট নির্দেশিকা (বাংলা)
              </label>
              <textarea
                rows={4}
                value={siteSettings.payment_instructions_bn}
                onChange={e => setSiteSettings({ ...siteSettings, payment_instructions_bn: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed resize-none focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                bKash Payment Instructions (English)
              </label>
              <textarea
                rows={4}
                value={siteSettings.payment_instructions_en}
                onChange={e => setSiteSettings({ ...siteSettings, payment_instructions_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed resize-none focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition cursor-pointer"
            >
              {t('btnSave')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
