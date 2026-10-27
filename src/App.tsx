/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { LessonLearnPage } from './pages/LessonLearnPage';
import { InstructorPage } from './pages/InstructorPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { MyNotesPage } from './pages/MyNotesPage';
import { LearningResourcesPage } from './pages/LearningResourcesPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PolicyPages } from './pages/PolicyPages';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => new URLSearchParams(window.location.search));
  const { isLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithQuery: string) => {
    const [path, query] = pathWithQuery.split('?');
    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(path);
    setSearchParams(new URLSearchParams(query || ''));
    window.scrollTo(0, 0);
  };

  // Route matching
  const renderCurrentPage = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. About
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }

    // 3. Instructor Profile
    if (currentPath === '/instructor') {
      return <InstructorPage navigate={navigate} />;
    }

    // 4. Contact
    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    // 5. All Courses
    if (currentPath === '/courses') {
      const categoryParam = searchParams.get('category') || undefined;
      return <CoursesPage navigate={navigate} initialCategory={categoryParam} />;
    }

    // 6. Course Learning Page: /courses/:id/learn
    const learnMatch = currentPath.match(/^\/courses\/([^/]+)\/learn$/);
    if (learnMatch) {
      const courseId = learnMatch[1];
      const lessonParam = searchParams.get('lesson') || undefined;
      return <LessonLearnPage courseId={courseId} initialLessonId={lessonParam} navigate={navigate} />;
    }

    // 7. Course Details: /courses/:id
    const courseMatch = currentPath.match(/^\/courses\/([^/]+)$/);
    if (courseMatch) {
      const courseId = courseMatch[1];
      return <CourseDetailsPage courseId={courseId} navigate={navigate} />;
    }

    // 8. Auth routes
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }

    // 9. Protected Student routes
    if (currentPath === '/dashboard' || currentPath === '/my-courses') {
      if (!isLoggedIn) {
        return <LoginPage navigate={navigate} />;
      }
      return <StudentDashboardPage navigate={navigate} />;
    }

    if (currentPath === '/my-notes') {
      if (!isLoggedIn) {
        return <LoginPage navigate={navigate} />;
      }
      return <MyNotesPage navigate={navigate} />;
    }

    if (currentPath === '/resources') {
      if (!isLoggedIn) {
        return <LoginPage navigate={navigate} />;
      }
      return <LearningResourcesPage navigate={navigate} />;
    }

    if (currentPath === '/payments') {
      if (!isLoggedIn) {
        return <LoginPage navigate={navigate} />;
      }
      return <PaymentHistoryPage navigate={navigate} />;
    }

    if (currentPath === '/settings') {
      if (!isLoggedIn) {
        return <LoginPage navigate={navigate} />;
      }
      return <AccountSettingsPage />;
    }

    // 10. Admin Dashboard
    if (currentPath === '/admin') {
      if (!isLoggedIn) {
        return <LoginPage navigate={navigate} />;
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    // 11. Legal Policy Pages
    if (currentPath === '/privacy-policy') {
      return <PolicyPages type="privacy" navigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <PolicyPages type="terms" navigate={navigate} />;
    }
    if (currentPath === '/refund-policy') {
      return <PolicyPages type="refund" navigate={navigate} />;
    }

    // Fallback: 404 -> HomePage
    return <HomePage navigate={navigate} />;
  };

  // Dedicated learning page has its own minimal navigation bar inside
  const isDedicatedLearningView = /^\/courses\/[^/]+\/learn$/.test(currentPath);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans selection:bg-cyan-500 selection:text-white">
      {!isDedicatedLearningView && <Navbar currentPath={currentPath} navigate={navigate} />}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      {!isDedicatedLearningView && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
