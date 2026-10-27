import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Brand
    brandName: 'আইটি মাহফুজুর',
    brandNameEn: 'ITMahfuzur',
    brandTagline: 'ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা, দক্ষতা উন্নয়নে আপনার বিশ্বস্ত সঙ্গী।',
    instructorName: 'মাহফুজুর রহমান মাহদী',
    sinceExperience: '২০১৮ সাল থেকে আইটি সেক্টরে অভিজ্ঞতা',

    // Navigation
    navHome: 'হোম',
    navAbout: 'সম্পর্কে',
    navCourses: 'সকল কোর্স',
    navInstructor: 'প্রশিক্ষক পরিচিতি',
    navContact: 'যোগাযোগ',
    navDashboard: 'ড্যাশবোর্ড',
    navMyCourses: 'আমার কোর্সসমূহ',
    navMyNotes: 'আমার নোটস',
    navResources: 'লার্নিং রিসোর্স',
    navPaymentHistory: 'পেমেন্ট হিস্ট্রি',
    navAdmin: 'অ্যাডমিন প্যানেল',
    navSettings: 'অ্যাকাউন্ট সেটিংস',
    navLogin: 'লগইন',
    navRegister: 'রেজিস্ট্রেশন',
    navLogout: 'লগআউট',

    // Hero & Common CTA
    heroBadge: 'প্র্যাকটিক্যাল প্রযুক্তি ও দক্ষতা প্রশিক্ষণ',
    heroTitle: 'আধুনিক আইটি স্কিল অর্জন করুন বাস্তব অভিজ্ঞতার সাথে',
    heroSubtitle: 'গ্রাফিক ডিজাইন, কৃত্রিম বুদ্ধিমত্তা (AI), আধুনিক AI টুলস, ডিজিটাল মার্কেটিং এবং প্রযুক্তির বাস্তব প্রয়োগ শিখুন সহজ ও কার্যকর পদ্ধতিতে।',
    btnExploreCourses: 'কোর্সসমূহ দেখুন',
    btnContactUs: 'সরাসরি যোগাযোগ',
    btnEnrollNow: 'এনরোল করুন',
    btnStartLearning: 'শেখা শুরু করুন',
    btnContinueLearning: 'শেখা চালিয়ে যান',
    btnWatchPreview: 'ফ্রি প্রিভিউ দেখুন',
    btnPayWithBkash: 'bKash এ পেমেন্ট করুন',
    btnSubmit: 'সাবমিট করুন',
    btnSave: 'সংরক্ষণ করুন',
    btnCancel: 'বাতিল',
    btnEdit: 'এডিট',
    btnDelete: 'মুছে ফেলুন',
    btnDownload: 'ডাউনলোড করুন',
    btnMarkComplete: 'সম্পন্ন হিসেবে চিহ্নিত করুন',
    btnCompleted: 'সম্পন্ন হয়েছে ✓',
    btnSearch: 'অনুসন্ধান করুন',
    btnFilter: 'ফিল্টার',

    // Course Categories
    catAll: 'সকল কোর্স',
    catAi: 'AI ও প্রম্পট ইঞ্জিনিয়ারিং',
    catDesign: 'গ্রাফিক ডিজাইন',
    catMarketing: 'ডিজিটাল মার্কেটিং',
    catTech: 'ডিজিটাল ও আইটি স্কিলস',

    // Course Info
    courseFree: 'সম্পূর্ণ ফ্রি',
    coursePaid: 'পেইড কোর্স',
    currency: '৳',
    duration: 'সময়কাল',
    hours: 'ঘণ্টা',
    lessons: 'টি ক্লাস',
    modules: 'টি মডিউল',
    curriculum: 'কোর্স কারিকুলাম ও ক্লাসের তালিকা',
    learningObjectives: 'কোর্সটিতে যা যা শিখবেন',
    prerequisites: 'কোর্সটি করার পূর্বশর্ত',
    instructorTitle: 'কোর্স প্রশিক্ষক',
    alreadyEnrolled: 'আপনি ইতিমধ্যে এই কোর্সে যুক্ত আছেন',
    accessPending: 'পেমেন্ট যাচাইকরণ প্রক্রিয়াধীন রয়েছে',

    // Learning Player
    lessonTabOverview: 'ক্লাসের বিবরণ',
    lessonTabDiscussion: 'প্রশ্নোত্তর ও আলোচনা',
    lessonTabNotes: 'আমার প্রাইভেট নোট',
    lessonTabResources: 'ডাউনলোডযোগ্য ফাইল',
    lessonPrev: 'পূর্ববর্তী ক্লাস',
    lessonNext: 'পরবর্তী ক্লাস',
    likesCount: 'পছন্দ',
    likeButton: 'লাইক দিন',
    likedButton: 'পছন্দ করেছেন',
    addCommentPlaceholder: 'এই ক্লাস সম্পর্কে আপনার মতামত বা প্রশ্ন লিখুন...',
    reply: 'উত্তর দিন',
    report: 'রিপোর্ট করুন',
    noCommentsYet: 'এখনও কোনো মন্তব্য করা হয়নি। আপনার প্রশ্ন বা মতামত শেয়ার করুন!',

    // Notes
    notesHeading: 'আমার ব্যক্তিগত নোটস',
    notesSubheading: 'পড়াশোনার সময় নেওয়া আপনার নিজস্ব নোটসমূহ সম্পূর্ণ নিরাপদ ও গোপনীয়।',
    createNote: 'নতুন নোট তৈরি করুন',
    noteTitlePlaceholder: 'নোটের শিরোনাম...',
    noteContentPlaceholder: 'আপনার গুরুত্বপূর্ণ তথ্য বা পয়েন্ট এখানে লিখুন...',
    saveNote: 'নোট সংরক্ষণ করুন',
    noNotesFound: 'আপনার কোনো সংরক্ষিত নোট পাওয়া যায়নি। ক্লাস চলাকালীন যেকোনো প্রয়োজনীয় তথ্য লিখে রাখুন।',

    // bKash Payment
    bkashModalTitle: 'ম্যানুয়াল bKash পেমেন্ট নির্দেশিকা',
    bkashInstructionIntro: 'নির্ধারিত bKash নম্বরে সেন্ড মানি করে প্রাপ্ত TrxID এবং প্রেরক নম্বর সাবমিট করুন:',
    bkashNumberLabel: 'bKash নম্বর',
    bkashTypeLabel: 'অ্যাকাউন্টের ধরন',
    bkashSenderLabel: 'যে bKash নম্বর থেকে টাকা পাঠিয়েছেন',
    bkashTrxIdLabel: 'bKash Transaction ID (TrxID)',
    bkashSubmitButton: 'পেমেন্ট তথ্য সাবমিট করুন',
    bkashNotice: 'অ্যাডমিন কর্তৃক ট্রানজাকশন আইডি যাচাই করার পরই কোর্সের সম্পূর্ণ অ্যাক্সেস পাওয়া যাবে।',

    // Dashboard
    dashboardWelcome: 'স্বাগতম',
    dashboardOverview: 'লার্নিং ওভারভিউ',
    enrolledCoursesCount: 'অ্যাক্টিভ কোর্সসমূহ',
    completedLessonsBadge: 'সম্পন্ন করা ক্লাস',
    savedNotesBadge: 'সংরক্ষিত নোটস',
    recentNotifications: 'সর্বশেষ নোটিফিকেশন',
    resumeCourse: 'চলমান কোর্স',

    // Admin
    adminDashboardTitle: 'ITMahfuzur অ্যাডমিন কন্ট্রোল সেন্টার',
    adminPendingPayments: 'অপেক্ষমাণ পেমেন্টসমূহ',
    adminApprove: 'অনুমোদন করুন',
    adminReject: 'বাতিল করুন',
    adminApprovedSuccess: 'পেমেন্ট অনুমোদিত এবং শিক্ষার্থীর কোর্স অ্যাক্সেস সক্রিয় করা হয়েছে।',
    adminAddCourse: 'নতুন কোর্স যুক্ত করুন',
    adminAddResource: 'রিসোর্স আপলোড করুন',
    adminSettings: 'ওয়েবসাইট ও bKash কনফিগারেশন',

    // Policy & Legal
    privacyTitle: 'গোপনীয়তা নীতিমালা (Privacy Policy)',
    termsTitle: 'শর্তাবলী (Terms & Conditions)',
    refundTitle: 'পেমেন্ট ও রিফান্ড নীতিমালা (Payment & Refund Policy)',
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত।',
  },
  en: {
    // Brand
    brandName: 'ITMahfuzur',
    brandNameEn: 'ITMahfuzur',
    brandTagline: 'ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development.',
    instructorName: 'Mahfuzur Rahman Mahdi',
    sinceExperience: 'IT Sector Experience Since 2018',

    // Navigation
    navHome: 'Home',
    navAbout: 'About ITMahfuzur',
    navCourses: 'All Courses',
    navInstructor: 'Instructor Profile',
    navContact: 'Contact',
    navDashboard: 'Dashboard',
    navMyCourses: 'My Courses',
    navMyNotes: 'My Notes',
    navResources: 'Learning Resources',
    navPaymentHistory: 'Payment History',
    navAdmin: 'Admin Dashboard',
    navSettings: 'Account Settings',
    navLogin: 'Login',
    navRegister: 'Register',
    navLogout: 'Logout',

    // Hero & Common CTA
    heroBadge: 'Practical IT & Digital Skills Training',
    heroTitle: 'Master High-Demand IT Skills Through Practical Experience',
    heroSubtitle: 'Learn Graphic Design, Artificial Intelligence (AI), modern AI tools, digital marketing, and real-world technology workflows in an accessible, structured manner.',
    btnExploreCourses: 'Explore Courses',
    btnContactUs: 'Contact Directly',
    btnEnrollNow: 'Enroll Now',
    btnStartLearning: 'Start Learning',
    btnContinueLearning: 'Continue Learning',
    btnWatchPreview: 'Watch Free Preview',
    btnPayWithBkash: 'Pay with bKash',
    btnSubmit: 'Submit',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    btnDownload: 'Download',
    btnMarkComplete: 'Mark as Complete',
    btnCompleted: 'Completed ✓',
    btnSearch: 'Search',
    btnFilter: 'Filter',

    // Course Categories
    catAll: 'All Courses',
    catAi: 'AI & Prompt Engineering',
    catDesign: 'Graphic Design',
    catMarketing: 'Digital Marketing',
    catTech: 'Tech & Digital Skills',

    // Course Info
    courseFree: '100% Free',
    coursePaid: 'Paid Course',
    currency: '৳',
    duration: 'Duration',
    hours: 'Hours',
    lessons: 'Lessons',
    modules: 'Modules',
    curriculum: 'Curriculum & Lesson Outline',
    learningObjectives: 'What You Will Learn',
    prerequisites: 'Prerequisites',
    instructorTitle: 'Course Instructor',
    alreadyEnrolled: 'You are currently enrolled in this course',
    accessPending: 'Payment verification is pending admin approval',

    // Learning Player
    lessonTabOverview: 'Lesson Overview',
    lessonTabDiscussion: 'Discussions & Q&A',
    lessonTabNotes: 'My Private Notes',
    lessonTabResources: 'Downloadable Materials',
    lessonPrev: 'Previous Lesson',
    lessonNext: 'Next Lesson',
    likesCount: 'Likes',
    likeButton: 'Like',
    likedButton: 'Liked',
    addCommentPlaceholder: 'Write a comment or ask a question regarding this lesson...',
    reply: 'Reply',
    report: 'Report',
    noCommentsYet: 'No comments yet. Start the conversation by sharing your thoughts or questions!',

    // Notes
    notesHeading: 'My Personal Notes',
    notesSubheading: 'Your personal notes taken while studying are strictly private and accessible only by you.',
    createNote: 'Create New Note',
    noteTitlePlaceholder: 'Note title...',
    noteContentPlaceholder: 'Write key insights, formulas, or reminders here...',
    saveNote: 'Save Note',
    noNotesFound: 'No notes found. Keep track of important takeaways while watching lessons.',

    // bKash Payment
    bkashModalTitle: 'Manual bKash Payment Instructions',
    bkashInstructionIntro: 'Send Money to the designated bKash account and submit your Transaction ID (TrxID) and sender number below:',
    bkashNumberLabel: 'bKash Number',
    bkashTypeLabel: 'Account Type',
    bkashSenderLabel: 'Sender bKash Mobile Number',
    bkashTrxIdLabel: 'bKash Transaction ID (TrxID)',
    bkashSubmitButton: 'Submit Payment Details',
    bkashNotice: 'Course access is granted immediately after the administrator manually verifies your transaction.',

    // Dashboard
    dashboardWelcome: 'Welcome',
    dashboardOverview: 'Learning Overview',
    enrolledCoursesCount: 'Enrolled Courses',
    completedLessonsBadge: 'Completed Lessons',
    savedNotesBadge: 'Saved Notes',
    recentNotifications: 'Recent Notifications',
    resumeCourse: 'Resume Course',

    // Admin
    adminDashboardTitle: 'ITMahfuzur Admin Control Center',
    adminPendingPayments: 'Pending Payment Requests',
    adminApprove: 'Approve Payment',
    adminReject: 'Reject',
    adminApprovedSuccess: 'Payment approved and student course access has been activated.',
    adminAddCourse: 'Add New Course',
    adminAddResource: 'Upload Resource',
    adminSettings: 'Website & bKash Settings',

    // Policy & Legal
    privacyTitle: 'Privacy Policy',
    termsTitle: 'Terms & Conditions',
    refundTitle: 'Payment & Refund Policy',
    allRightsReserved: 'All rights reserved.',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Bengali is the default language as required
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('itmahfuzur_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('itmahfuzur_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
