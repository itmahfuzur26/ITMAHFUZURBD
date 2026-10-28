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
  ArrowRight,
  Sparkles,
  Camera,
  Edit,
  UserCheck,
  UserX,
  ExternalLink,
  Phone,
  Mail,
  Video
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  enrolledCourses: {
    id: string;
    title_bn: string;
    title_en: string;
    enrolled_at: string;
  }[];
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { isAdmin, user, fetchWithAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'courses' | 'payments' | 'students' | 'resources' | 'comments'>('overview');
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
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Course Form State
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

  // Students
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedCourseToGrant, setSelectedCourseToGrant] = useState<Record<string, string>>({});

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

  // Course Price Quick Edit & Bundle Price State
  const [quickPrices, setQuickPrices] = useState<Record<string, number>>({});
  const [quickFree, setQuickFree] = useState<Record<string, boolean>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [savedPriceId, setSavedPriceId] = useState<string | null>(null);
  const [bundleSaving, setBundleSaving] = useState(false);
  const [bundleSaved, setBundleSaved] = useState(false);

  // Admin Password Change State
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminPasswordSaving, setAdminPasswordSaving] = useState(false);
  const [adminPasswordMessage, setAdminPasswordMessage] = useState<string | null>(null);
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordError(null);
    setAdminPasswordMessage(null);

    if (adminNewPassword !== adminConfirmPassword) {
      setAdminPasswordError('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    if (adminNewPassword.length < 6) {
      setAdminPasswordError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setAdminPasswordSaving(true);
    try {
      const res = await fetchWithAuth('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdminPasswordMessage(data.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setAdminCurrentPassword('');
        setAdminNewPassword('');
        setAdminConfirmPassword('');
      } else {
        setAdminPasswordError(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch {
      setAdminPasswordError('পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।');
    } finally {
      setAdminPasswordSaving(false);
    }
  };

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
      fetchWithAuth('/api/admin/overview').then(res => res.json()).catch(() => null),
      fetchWithAuth('/api/admin/payments').then(res => res.json()).catch(() => []),
      fetchWithAuth('/api/courses').then(res => res.json()).catch(() => []),
      fetchWithAuth('/api/admin/students').then(res => res.json()).catch(() => []),
      fetchWithAuth('/api/admin/comments').then(res => res.json()).catch(() => ({ comments: [], reports: [] })),
      fetchWithAuth('/api/admin/resources').then(res => res.json()).catch(() => []),
      fetch('/api/admin/settings').then(res => res.json()).catch(() => null),
    ])
      .then(([statsRes, paymentsRes, coursesRes, studentsRes, commentsRes, resourcesRes, settingsRes]) => {
        if (statsRes) setStats(statsRes);
        if (paymentsRes) setPayments(paymentsRes);
        if (coursesRes) setCourses(coursesRes);
        if (studentsRes) setStudents(studentsRes);
        if (commentsRes) setCommentsData(commentsRes);
        if (resourcesRes) setResources(resourcesRes);
        if (settingsRes) setSiteSettings(settingsRes);
      })
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

  // Course Actions
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

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const res = await fetchWithAuth(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse),
      });
      if (res.ok) {
        setEditingCourse(null);
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই কোর্সটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this course?')) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Quick Inline Course Price Update
  const handleQuickPriceUpdate = async (courseId: string) => {
    setSavingPriceId(courseId);
    try {
      const course = courses.find(c => c.id === courseId);
      const newPrice = quickPrices[courseId] !== undefined ? quickPrices[courseId] : (course?.price || 0);
      const newIsFree = quickFree[courseId] !== undefined ? quickFree[courseId] : (course?.isFree || false);

      const res = await fetchWithAuth(`/api/admin/courses/${courseId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice, isFree: newIsFree }),
      });

      if (res.ok) {
        setSavedPriceId(courseId);
        setTimeout(() => setSavedPriceId(null), 3000);
        loadAllAdminData();
      }
    } catch (err) {
      console.error('Failed to update course price', err);
    } finally {
      setSavingPriceId(null);
    }
  };

  // Full Course Bundle Price Update
  const handleSaveBundlePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    setBundleSaving(true);
    try {
      const res = await fetchWithAuth('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_course_price: siteSettings.full_course_price,
          full_course_discount_price: siteSettings.full_course_discount_price,
          bundle_offer_enabled: siteSettings.bundle_offer_enabled,
          bundle_title_bn: siteSettings.bundle_title_bn,
          bundle_title_en: siteSettings.bundle_title_en,
        }),
      });
      if (res.ok) {
        setBundleSaved(true);
        setTimeout(() => setBundleSaved(false), 3000);
        loadAllAdminData();
      }
    } catch (err) {
      console.error('Failed to save bundle price', err);
    } finally {
      setBundleSaving(false);
    }
  };

  // Module & Lesson Actions
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
        alert(language === 'bn' ? 'মডিউল যুক্ত হয়েছে। এখন ক্লাস যুক্ত করুন।' : 'Module added! Now add lessons to this module.');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

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
        alert(language === 'bn' ? 'ক্লাস সফলভাবে যুক্ত হয়েছে!' : 'Lesson added successfully!');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  // Student Access Controls
  const handleGrantAccess = async (userId: string) => {
    const courseId = selectedCourseToGrant[userId];
    if (!courseId) {
      alert(language === 'bn' ? 'অনুগ্রহ করে কোর্স বেছে নিন।' : 'Please select a course.');
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/admin/students/${userId}/grant-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
        alert(language === 'bn' ? 'শিক্ষার্থীকে কোর্সে অ্যাক্সেস দেওয়া হয়েছে!' : 'Access granted successfully!');
        loadAllAdminData();
      }
    } catch {
      // error
    }
  };

  const handleRevokeAccess = async (userId: string, courseId: string) => {
    if (!window.confirm(language === 'bn' ? 'এই কোর্সের এক্সেস বাতিল করতে চান?' : 'Revoke access for this course?')) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/admin/students/${userId}/revoke-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
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

  // Save Site Settings
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
        setTimeout(() => setSettingsSaved(false), 3000);
      }
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
    <div className="min-h-screen text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-xl text-amber-400 uppercase">
                      {user?.name?.charAt(0) || 'M'}
                    </span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase shadow">
                ADMIN
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'অ্যাডমিন অ্যাকাউন্ট (প্রধান পরিচালক)' : 'Restricted Admin Authority'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {user?.name || 'Mahfuzur Rahman Mahdi'} — {language === 'bn' ? 'সেন্ট্রাল অ্যাডমিন কন্ট্রোল' : 'Central Admin Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {language === 'bn'
                  ? 'কোর্স মূল্য পরিবর্তন, বিকাশ পেমেন্ট অনুমোদন ও ওয়েবসাইট সেটিংস সম্পূর্ণ নিয়ন্ত্রণ করুন'
                  : 'Comprehensive control to edit courses, pricing, student enrollments, and payment approvals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'bn' ? 'শিক্ষার্থী ভিউ' : 'Student View'}</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ওয়েবসাইট দেখুন' : 'View Site'}</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t('adminOverview')}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'settings'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ওয়েবসাইট CMS এডিটর' : 'Website CMS'}</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'courses'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কোর্স ও ক্লাস' : 'Courses'}</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'payments'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বিকাশ পেমেন্ট' : 'bKash Payments'}</span>
            {payments.filter(p => p.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'students'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শিক্ষার্থী তালিকা' : 'Students'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'resources'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'স্টাডি ফাইলস' : 'Resources'}</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'comments'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কমেন্ট মডারেশন' : 'Comments'}</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{t('adminTotalStudents')}</span>
                <p className="text-3xl font-extrabold text-white">{stats?.totalStudents || students.length}</p>
                <span className="text-xs text-cyan-400 font-medium">নিবন্ধিত শিক্ষার্থী</span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{t('adminTotalCourses')}</span>
                <p className="text-3xl font-extrabold text-white">{courses.length}</p>
                <span className="text-xs text-sky-400 font-medium">সক্রিয় কোর্স</span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{t('adminPendingPayments')}</span>
                <p className="text-3xl font-extrabold text-amber-400">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
                <span className="text-xs text-slate-400">অনুমোদনের অপেক্ষায়</span>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{t('adminTotalRevenue')}</span>
                <p className="text-3xl font-extrabold text-emerald-400">
                  ৳{(stats?.totalRevenue || 0).toLocaleString()} BDT
                </p>
                <span className="text-xs text-emerald-400 font-medium">অনুমোদিত bKash পেমেন্ট</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{language === 'bn' ? 'দ্রুত অ্যাকশন' : 'Quick Actions'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition"
                >
                  <Settings className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="font-bold text-xs text-white">ওয়েবসাইট CMS এডিট করুন</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">বিকাশ নম্বর, স্লোগান, নোটিস বার ও টেক্সট পরিবর্তন</div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('courses');
                    setNewCourseOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition"
                >
                  <Plus className="w-5 h-5 text-emerald-400 mb-2" />
                  <div className="font-bold text-xs text-white">নতুন কোর্স যুক্ত করুন</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">নতুন আইটি কোর্স ও ক্লাস ভিডিও আপলোড</div>
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition"
                >
                  <Users className="w-5 h-5 text-pink-400 mb-2" />
                  <div className="font-bold text-xs text-white">শিক্ষার্থীদের এক্সেস দিন</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">যে কোনো শিক্ষার্থীকে সরাসরি কোর্স এক্সেস দিন</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: WEBSITE CMS & SETTINGS (EDIT EVERYTHING) */}
        {/* ==================================================== */}
        {activeTab === 'settings' && siteSettings && (
          <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {language === 'bn' ? 'ওয়েবসাইট CMS এডিটর (Site Content & Settings)' : 'Website CMS Editor'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'bn'
                    ? 'ওয়েবসাইটের লোগো, বিকাশ নম্বর, শিক্ষক পরিচিতি, স্লোগান ও নোটিস বার পরিবর্তন করুন'
                    : 'Edit logo, bKash account numbers, slogans, instructor profile, and announcement banners'}
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                {t('btnSave')}
              </button>
            </div>

            {settingsSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{language === 'bn' ? 'সমস্ত পরিবর্তন সফলভাবে সংরক্ষিত হয়েছে!' : 'All website changes saved successfully!'}</span>
              </div>
            )}

            {/* Section A: Brand & Logo */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>১. ব্র্যান্ড লোগো ও সোশ্যাল মিডিয়া (Logo & Social Links)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    লোগো ইমেজ লিঙ্ক (Logo Image URL)
                  </label>
                  <input
                    type="url"
                    value={siteSettings.logo_url || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, logo_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    হেডার এবং ফোটারে প্রদর্শিত অরিজিনাল লোগোর ইমেজ ইউআরএল
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 mb-1">লোগো প্রিভিউ</span>
                  {siteSettings.logo_url ? (
                    <img src={siteSettings.logo_url} alt="Logo" className="h-10 object-contain rounded" />
                  ) : (
                    <span className="text-xs text-slate-500">No logo</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ফেসবুক পেইজ লিংক (Facebook Page URL)
                  </label>
                  <input
                    type="url"
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
                    value={siteSettings.facebook_group || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, facebook_group: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Instructor & Founder Profile (with MRM Circle Preview) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>২. প্রশিক্ষক ও প্রতিষ্ঠাতা পরিচিতি (Instructor Profile & MRM Circle Photo)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      প্রশিক্ষকের ছবির URL (MRM Circular Photo URL)
                    </label>
                    <input
                      type="url"
                      value={siteSettings.instructor_photo_url || ''}
                      onChange={e => setSiteSettings({ ...siteSettings, instructor_photo_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      হোমপেজের হিরো সেকশনে ও শিক্ষক পেজে প্রদর্শিত বৃত্তাকার (MRM) ছবির লিঙ্ক
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">প্রশিক্ষকের নাম</label>
                      <input
                        type="text"
                        value={siteSettings.instructor_name || ''}
                        onChange={e => setSiteSettings({ ...siteSettings, instructor_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">অভিজ্ঞতা সাল</label>
                      <input
                        type="text"
                        value={siteSettings.experience_since || '2018'}
                        onChange={e => setSiteSettings({ ...siteSettings, experience_since: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Live MRM Circular Photo Preview */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-cyan-400 font-bold mb-2">MRM সার্কেল প্রিভিউ</span>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-0.5 shadow-lg shadow-cyan-400/20">
                      <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                        <img
                          src={siteSettings.instructor_photo_url || "https://res.cloudinary.com/ru3hghyn/image/upload/v1793028848/1000030687-removebg-preview.png"}
                          alt="MRM"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-cyan-950 border border-cyan-400 text-[7px] font-black text-cyan-300">
                      MRM
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  প্রশিক্ষকের বায়ো / পরিচয় (বাংলা)
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.instructor_bio_bn || ''}
                  onChange={e => setSiteSettings({ ...siteSettings, instructor_bio_bn: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Section C: Notice Bar & Announcement */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>৩. নোটিস বার ও জরুরি ঘোষণা (Notice Bar Announcement)</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={siteSettings.notice_enabled !== false}
                    onChange={e => setSiteSettings({ ...siteSettings, notice_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <span>নোটিস বার সক্রিয় রাখুন</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    নোটিস টেক্সট (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.notice_text_bn || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, notice_text_bn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Notice Text (English)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.notice_text_en || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, notice_text_en: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section D: Hero Headlines & Taglines */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>৪. হোমপেজ হিরো শিরোনাম ও স্লোগান (Hero Headlines & Slogans)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    হিরো প্রধান শিরোনাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.hero_headline_bn || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, hero_headline_bn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hero Headline (English)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.hero_headline_en || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, hero_headline_en: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  হিরো সাব-শিরোনাম / বিবরণ (বাংলা)
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.hero_subheadline_bn || ''}
                  onChange={e => setSiteSettings({ ...siteSettings, hero_subheadline_bn: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ব্র্যান্ড স্লোগান (ফোটারে প্রদর্শিত - বাংলা)
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
                    Brand Slogan (Footer - English)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.tagline_en || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, tagline_en: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section E: bKash & Contact */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>৫. বিকাশ নম্বর ও যোগাযোগ তথ্য (bKash & Contact Details)</span>
              </h3>

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
                    শিক্ষার্থীরা কোর্সে ভর্তি হওয়ার সময় এই নম্বরে Send Money করবেন
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
                    ইমেইল (Official Email)
                  </label>
                  <input
                    type="email"
                    value={siteSettings.email || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                  />
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
            </div>

            {/* Section F: Full Course Bundle Package */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>৬. ফুল কোর্স প্যাকেজ মূল্য (Full Course & Bundle Price)</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={siteSettings.bundle_offer_enabled ?? true}
                    onChange={e => setSiteSettings({ ...siteSettings, bundle_offer_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-500"
                  />
                  <span>বান্ডেল অফার সক্রিয়</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    নিয়মিত ফুল কোর্স ফি (BDT) *
                  </label>
                  <input
                    type="number"
                    value={siteSettings.full_course_price ?? 5000}
                    onChange={e => setSiteSettings({ ...siteSettings, full_course_price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ডিসকাউন্টেড / স্পেশাল অফার ফি (BDT)
                  </label>
                  <input
                    type="number"
                    value={siteSettings.full_course_discount_price ?? 3500}
                    onChange={e => setSiteSettings({ ...siteSettings, full_course_discount_price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    প্যাকেজ শিরোনাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.bundle_title_bn || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, bundle_title_bn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Package Title (English)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.bundle_title_en || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, bundle_title_en: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section G: Admin Security & Password Change */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>৭. অ্যাডমিন পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা (Admin Account & Security)</span>
              </h3>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 leading-relaxed">
                <p className="font-bold text-amber-300">
                  নিরাপদভাবে পাসওয়ার্ড সেট করার গোপনীয় নির্দেশিকা:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>অ্যাডমিন ইমেইল: <code className="text-amber-300 font-mono">itmahfuzur@gmail.com</code> (শুধুমাত্র আপনার একাউন্টের জন্য সংরক্ষিত)।</li>
                  <li>নতুন পাসওয়ার্ডটিতে অন্তত ৬-১২ টি অক্ষর, বড় হাত/ছোট হাতের বর্ণ এবং সংখ্যা ব্যবহার করুন।</li>
                  <li>পাসওয়ার্ডটি কাউকে শেয়ার করবেন না এবং কোনো কোডে সরাসরি রাখবেন না।</li>
                </ul>
              </div>

              {adminPasswordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{adminPasswordError}</span>
                </div>
              )}

              {adminPasswordMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adminPasswordMessage}</span>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      বর্তমান পাসওয়ার্ড
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={adminCurrentPassword}
                      onChange={e => setAdminCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      নতুন গোপনীয় পাসওয়ার্ড *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      value={adminNewPassword}
                      onChange={e => setAdminNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      নতুন পাসওয়ার্ড নিশ্চিতকরণ *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                      value={adminConfirmPassword}
                      onChange={e => setAdminConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAdminPasswordChange}
                    disabled={adminPasswordSaving || !adminNewPassword}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {adminPasswordSaving ? 'পাসওয়ার্ড সেভ হচ্ছে...' : '🔒 পাসওয়ার্ড আপডেট ও সেভ করুন'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition cursor-pointer"
            >
              {language === 'bn' ? 'সমস্ত পরিবর্তন সংরক্ষণ করুন' : 'Save All Settings Changes'}
            </button>
          </form>
        )}

        {/* ==================================================== */}
        {/* TAB 3: COURSES & CURRICULUM MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {language === 'bn' ? 'কোর্স ও ক্লাস কারিকুলাম পরিচালনা' : 'Course & Curriculum Management'}
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'নতুন কোর্স তৈরি করুন, মডিউল ও ক্লাস ভিডিও যুক্ত বা মুছুন' : 'Create courses, modules, and lessons'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setNewCourseOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t('adminAddCourse')}</span>
              </button>
            </div>

            {/* Course Creation Modal */}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">থাম্বনেইল ইমেজ URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={cThumbnail}
                    onChange={e => setCThumbnail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
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

            {/* Edit Course Modal */}
            {editingCourse && (
              <form onSubmit={handleUpdateCourse} className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-amber-300">কোর্স সম্পাদনা (Edit Course)</h3>
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    বন্ধ করুন ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">কোর্স শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={editingCourse.title_bn}
                      onChange={e => setEditingCourse({ ...editingCourse, title_bn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingCourse.title_en}
                      onChange={e => setEditingCourse({ ...editingCourse, title_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ফি (BDT)</label>
                    <input
                      type="number"
                      value={editingCourse.price}
                      onChange={e => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ক্যাটাগরি</label>
                    <select
                      value={editingCourse.category}
                      onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="ai-training">AI & Prompt Eng</option>
                      <option value="graphic-design">Graphic Design</option>
                      <option value="digital-marketing">Digital Marketing</option>
                      <option value="tech-skills">Tech Skills</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">মোট ঘণ্টা</label>
                    <input
                      type="number"
                      value={editingCourse.durationHours}
                      onChange={e => setEditingCourse({ ...editingCourse, durationHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">থাম্বনেইল ইমেজ URL</label>
                  <input
                    type="url"
                    value={editingCourse.thumbnail}
                    onChange={e => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 text-xs text-slate-400"
                  >
                    {t('btnCancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    আপডেট সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            )}

            {/* Full Course / Bundle Price Settings Card */}
            {siteSettings && (
              <form onSubmit={handleSaveBundlePrice} className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ফুল কোর্স / অল-ইন-ওয়ান প্যাকেজ মূল্য (Full Course & Bundle Price)</span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {language === 'bn' ? 'সকল কোর্স একসাথে ক্রয়ের অফার ও মূল্য নির্ধারণ' : 'Full Course Bundle Offer & Pricing'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'bn'
                        ? 'অ্যাডমিন হিসেবে প্রতিটি পৃথক কোর্সের পাশাপাশি সম্পূর্ণ কোর্সের স্পেশাল প্যাকেজ মূল্য এখান থেকে আপডেট করুন'
                        : 'Set the regular and discounted price for purchasing all courses together in a single package'}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition">
                    <input
                      type="checkbox"
                      checked={siteSettings.bundle_offer_enabled ?? true}
                      onChange={e => setSiteSettings({ ...siteSettings, bundle_offer_enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {language === 'bn' ? 'ফুল কোর্স অফার সক্রিয়' : 'Bundle Offer Active'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      নিয়মিত ফুল কোর্স ফি (BDT) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        required
                        value={siteSettings.full_course_price ?? 5000}
                        onChange={e => setSiteSettings({ ...siteSettings, full_course_price: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      অফার / ডিসকাউন্ট মূল্য (BDT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        value={siteSettings.full_course_discount_price ?? 3500}
                        onChange={e => setSiteSettings({ ...siteSettings, full_course_discount_price: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      প্যাকেজ নাম (বাংলা)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.bundle_title_bn || 'ফুল কোর্স অল-ইন-ওয়ান স্পেশাল প্যাক'}
                      onChange={e => setSiteSettings({ ...siteSettings, bundle_title_bn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={bundleSaving}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {bundleSaved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>ফুল কোর্স মূল্য সেভ হয়েছে!</span>
                        </>
                      ) : bundleSaving ? (
                        <span>সংরক্ষণ হচ্ছে...</span>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>ফুল কোর্স মূল্য সংরক্ষণ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Existing Courses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => {
                const currentPriceVal = quickPrices[course.id] !== undefined ? quickPrices[course.id] : course.price;
                const currentIsFreeVal = quickFree[course.id] !== undefined ? quickFree[course.id] : course.isFree;

                return (
                  <div key={course.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          course.isFree ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {course.isFree ? 'Free' : `৳${course.price.toLocaleString()} BDT`}
                        </span>
                        <h3 className="text-base font-bold text-white">{course.title_bn}</h3>
                        <p className="text-xs text-slate-400">{course.title_en}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCourse(course)}
                          title="কোর্স এডিট করুন"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          title="কোর্স মুছুন"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Inline Price Editor */}
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                          <span>কোর্স মূল্য পরিবর্তন (Editable Course Price):</span>
                        </span>
                        <span className="text-[11px] text-cyan-400 font-mono">
                          বর্তমান: {course.isFree ? 'ফ্রি (Free)' : `৳${course.price}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                          <input
                            type="number"
                            min="0"
                            value={currentPriceVal}
                            onChange={e => setQuickPrices({ ...quickPrices, [course.id]: Number(e.target.value) })}
                            disabled={currentIsFreeVal}
                            placeholder="মূল্য লিখুন"
                            className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:border-cyan-500 focus:outline-none disabled:opacity-40"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={currentIsFreeVal}
                            onChange={e => setQuickFree({ ...quickFree, [course.id]: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-cyan-500"
                          />
                          <span className="text-[11px] font-semibold">ফ্রি</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleQuickPriceUpdate(course.id)}
                          disabled={savingPriceId === course.id}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition whitespace-nowrap flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {savedPriceId === course.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>আপডেট হয়েছে ✓</span>
                            </>
                          ) : savingPriceId === course.id ? (
                            <span>আপডেট হচ্ছে...</span>
                          ) : (
                            <>
                              <Edit className="w-3 h-3" />
                              <span>মূল্য সেভ করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                      <span>{course.category} • {course.durationHours} ঘণ্টা</span>
                      <button
                        onClick={() => setSelectedCourseForModule(selectedCourseForModule === course.id ? null : course.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-xs font-semibold text-cyan-300 border border-cyan-800/40 transition"
                      >
                        {selectedCourseForModule === course.id ? 'কারিকুলাম ফর্ম বন্ধ' : '+ মডিউল ও ক্লাস যুক্ত করুন'}
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
                            placeholder="ভিডিও URL (YouTube, Vimeo, MP4)"
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
              );
            })}
          </div>
        </div>
      )}

        {/* ==================================================== */}
        {/* TAB 4: PAYMENTS & BKASH VERIFICATION */}
        {/* ==================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{t('adminPayments')}</h2>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'শিক্ষার্থীদের bKash লেনদেন যাচাই ও কোর্স অনুমোদন' : 'Verify bKash transactions and grant enrollments'}
                </p>
              </div>

              <div className="flex items-center gap-2">
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

        {/* ==================================================== */}
        {/* TAB 5: STUDENTS & DIRECT ACCESS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'bn' ? 'নিবন্ধিত শিক্ষার্থী ও সরাসরি এক্সেস কন্ট্রোল' : 'Registered Students & Direct Course Access'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'সমস্ত শিক্ষার্থীর তালিকা দেখুন এবং প্রয়োজন অনুযায়ী সরাসরি যে কোনো কোর্সে ভর্তি নিশ্চিত বা বাতিল করুন'
                  : 'View all student accounts and manually grant or revoke enrollments'}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">{language === 'bn' ? 'শিক্ষার্থী' : 'Student'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'মোবাইল / বায়ো' : 'Phone / Bio'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'ভর্তি কোর্সসমূহ' : 'Active Courses'}</th>
                      <th className="px-6 py-4">{language === 'bn' ? 'সরাসরি কোর্স যুক্ত করুন' : 'Grant Course Access'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {s.avatar ? (
                              <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-cyan-500/40" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm">
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{s.name}</span>
                                {s.role === 'admin' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{s.email}</div>
                              <div className="text-[10px] text-slate-500">
                                যুক্ত: {new Date(s.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-300">
                          <div>{s.phone || 'মোবাইল নেই'}</div>
                          {s.bio && <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">{s.bio}</div>}
                        </td>

                        <td className="px-6 py-4">
                          {s.enrolledCourses.length === 0 ? (
                            <span className="text-xs text-slate-500 italic">কোনো কোর্সে ভর্তি নেই</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {s.enrolledCourses.map(c => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-[11px]"
                                >
                                  <span>{c.title_bn}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeAccess(s.id, c.id)}
                                    title="এক্সেস বাতিল করুন"
                                    className="text-slate-400 hover:text-red-400"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedCourseToGrant[s.id] || ''}
                              onChange={e => setSelectedCourseToGrant({ ...selectedCourseToGrant, [s.id]: e.target.value })}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white max-w-[160px]"
                            >
                              <option value="">কোর্স নির্বাচন...</option>
                              {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title_bn}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleGrantAccess(s.id)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs whitespace-nowrap transition"
                            >
                              এক্সেস দিন
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: RESOURCES */}
        {/* ==================================================== */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{t('adminResources')}</h2>
                <p className="text-xs text-slate-400">পিডিএফ গাইড, চিটশিট ও স্টাডি ফাইল ম্যানেজ করুন</p>
              </div>
              <button
                onClick={() => setNewResourceOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ফাইল আপলোড</span>
              </button>
            </div>

            {newResourceOpen && (
              <form onSubmit={handleCreateResource} className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 space-y-4">
                <h3 className="text-base font-bold text-white">নতুন রিসোর্স যোগ করুন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">কোর্স নির্বাচন *</label>
                    <select
                      required
                      value={resCourseId}
                      onChange={e => setResCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="">কোর্স বাছুন...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title_bn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ফাইলের নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="Prompt_Engineering_Cheatsheet.pdf"
                      value={resFileName}
                      onChange={e => setResFileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={resTitleBn}
                      onChange={e => setResTitleBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Title (English) *</label>
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

        {/* ==================================================== */}
        {/* TAB 7: COMMENTS MODERATION */}
        {/* ==================================================== */}
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

                    <div className="flex items-center gap-2 shrink-0">
                      {c.is_hidden ? (
                        <button
                          onClick={() => handleModerateComment(c.id, 'show')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-xs text-cyan-300 hover:bg-slate-700"
                        >
                          Show
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateComment(c.id, 'hide')}
                          className="px-2.5 py-1 rounded bg-slate-800 text-xs text-amber-300 hover:bg-slate-700"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleModerateComment(c.id, 'delete')}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
