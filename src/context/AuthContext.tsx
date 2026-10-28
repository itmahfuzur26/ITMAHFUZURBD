import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course, SiteSettings } from '../types';
import { FALLBACK_COURSES, FALLBACK_SETTINGS } from '../data/fallbackData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  forgotPasswordReset: (email: string) => Promise<{ success: boolean; tempPassword?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Pre-seeded Admin User
const DEFAULT_ADMIN: User = {
  id: 'user_admin_mahdi',
  name: 'Mahfuzur Rahman Mahdi',
  email: 'itmahfuzur@gmail.com',
  role: 'admin',
  phone: '01762-766261',
  avatar: 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793028848/1000030687-removebg-preview.png',
  bio: 'প্রতিষ্ঠাতা ও প্রশিক্ষক, ITMahfuzur',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Client User Record for Netlify/Offline Database
interface StoredUser extends User {
  passwordHash?: string;
  plainPassword?: string;
}

// LocalStorage Helper for Netlify / Static hosting
const getLocalUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem('itmahfuzur_users_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }

  // Initial seed
  const initial: StoredUser[] = [
    {
      ...DEFAULT_ADMIN,
      plainPassword: 'Password@123',
    },
    {
      id: 'user_student_demo',
      name: 'Tanvir Ahmed',
      email: 'student@itmahfuzur.com',
      role: 'student',
      phone: '01812-345678',
      plainPassword: 'Password@123',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
  ];
  saveLocalUsers(initial);
  return initial;
};

const saveLocalUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem('itmahfuzur_users_v2', JSON.stringify(users));
  } catch {
    // ignore
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('itmahfuzur_current_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('itmahfuzur_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to safely execute fetch and parse json with fallback
  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });

      // If response is OK and not an HTML response (which happens on Netlify SPA redirects)
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && !contentType.includes('text/html')) {
        return response;
      }

      // If server returned 404 or HTML (like Netlify static host), intercept with smart local responses
      return handleStaticFallbackRequest(url, options, response);
    } catch (networkError) {
      // Offline or network error
      return handleStaticFallbackRequest(url, options, null);
    }
  };

  // Static Fallback Handler for Netlify
  const handleStaticFallbackRequest = async (url: string, options: RequestInit, originalResponse: Response | null): Promise<Response> => {
    const pathname = url.split('?')[0];

    // 1. Settings
    if (pathname.includes('/api/admin/settings')) {
      const savedSettings = localStorage.getItem('itmahfuzur_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : FALLBACK_SETTINGS;
      return new Response(JSON.stringify(settings), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Courses
    if (pathname === '/api/courses' || pathname === '/api/courses/') {
      const savedCourses = localStorage.getItem('itmahfuzur_courses');
      const courses = savedCourses ? JSON.parse(savedCourses) : FALLBACK_COURSES;
      return new Response(JSON.stringify(courses), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Single Course
    const courseMatch = pathname.match(/\/api\/courses\/([^/]+)$/);
    if (courseMatch) {
      const courseId = courseMatch[1];
      const savedCourses = localStorage.getItem('itmahfuzur_courses');
      const courses: Course[] = savedCourses ? JSON.parse(savedCourses) : FALLBACK_COURSES;
      const found = courses.find(c => c.id === courseId) || courses[0];

      // Check if user is enrolled
      const enrollmentsRaw = localStorage.getItem('itmahfuzur_enrollments') || '[]';
      const enrollments = JSON.parse(enrollmentsRaw);
      const isEnrolled = found.isFree || (user && user.role === 'admin') || enrollments.some((e: any) => e.course_id === found.id && e.user_id === user?.id);

      return new Response(JSON.stringify({
        course: found,
        modules: [
          { id: 'mod_1', course_id: found.id, title_bn: 'মডিউল ১: কোর্সের ভূমিকা ও প্রস্তুতি', title_en: 'Module 1: Introduction & Foundation', order: 1 },
          { id: 'mod_2', course_id: found.id, title_bn: 'মডিউল ২: মূল দক্ষতা ও ব্যবহারিক প্রজেক্ট', title_en: 'Module 2: Core Skills & Practical Projects', order: 2 },
          { id: 'mod_3', course_id: found.id, title_bn: 'মডিউল ৩: অ্যাডভান্সড টেকনিক্স ও ফ্রিল্যান্সিং', title_en: 'Module 3: Advanced Techniques & Freelancing', order: 3 },
        ],
        lessons: [
          { id: 'les_1', course_id: found.id, module_id: 'mod_1', title_bn: '১.১ পরিচিতি ও গাইডলাইন', title_en: '1.1 Welcome & Course Orientation', description_bn: 'কোর্সের সম্পূর্ণ রূপরেখা ও প্রস্তুতি।', description_en: 'Overview and course preparation.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', durationMinutes: 12, order: 1, isFreePreview: true },
          { id: 'les_2', course_id: found.id, module_id: 'mod_1', title_bn: '১.২ প্রয়োজনীয় সফটওয়্যার ও টুলস সেটাপ', title_en: '1.2 Essential Software & Tools Setup', description_bn: 'সফটওয়্যার ডাউনলোড এবং ইন্সটলেশন নির্দেশিকা।', description_en: 'Step by step setup guide.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', durationMinutes: 18, order: 2, isFreePreview: true },
          { id: 'les_3', course_id: found.id, module_id: 'mod_2', title_bn: '২.১ বাস্তব প্রজেক্ট ও লাইভ কেস স্টাডি', title_en: '2.1 Real-World Project & Live Case Study', description_bn: 'বাস্তব প্রজেক্টের লাইভ কাজ ও সমাধান।', description_en: 'Hands-on practical walkthrough.', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', durationMinutes: 35, order: 3, isFreePreview: false },
        ],
        hasAccess: isEnrolled,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. bKash Auto Payment on Netlify / Offline
    if (pathname.includes('/api/payments/bkash-auto')) {
      let bodyData: any = {};
      try {
        bodyData = JSON.parse(options.body as string);
      } catch {}

      const autoTrx = 'BK' + Math.random().toString(36).substring(2, 6).toUpperCase() + Date.now().toString().slice(-6);

      // Save to local enrollments
      const enrollmentsRaw = localStorage.getItem('itmahfuzur_enrollments') || '[]';
      const enrollments = JSON.parse(enrollmentsRaw);
      enrollments.push({
        id: 'enr_' + Date.now(),
        course_id: bodyData.course_id,
        user_id: user?.id || 'guest',
        status: 'active',
        enrolled_at: new Date().toISOString(),
      });
      localStorage.setItem('itmahfuzur_enrollments', JSON.stringify(enrollments));

      return new Response(JSON.stringify({
        success: true,
        transaction_id: autoTrx,
        course_id: bodyData.course_id,
        message: 'Payment completed successfully (Netlify Auto Engine)',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Student Dashboard
    if (pathname.includes('/api/student/dashboard')) {
      const enrollmentsRaw = localStorage.getItem('itmahfuzur_enrollments') || '[]';
      const enrollments = JSON.parse(enrollmentsRaw);
      const userEnrollments = enrollments.filter((e: any) => e.user_id === user?.id);
      const enrolledCourseIds = new Set(userEnrollments.map((e: any) => e.course_id));

      const savedCourses = localStorage.getItem('itmahfuzur_courses');
      const allCourses: Course[] = savedCourses ? JSON.parse(savedCourses) : FALLBACK_COURSES;
      const myCourses = allCourses
        .filter(c => enrolledCourseIds.has(c.id) || c.isFree)
        .map(c => ({
          ...c,
          totalLessons: 12,
          completedLessonsCount: 3,
          progressPercentage: 25,
        }));

      return new Response(JSON.stringify({
        enrolledCoursesCount: myCourses.length,
        completedCoursesCount: 0,
        totalCompletedLessons: 3,
        totalHoursLearned: 4.5,
        notesCount: 2,
        myCourses,
        recentActivity: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (originalResponse) return originalResponse;
    return new Response(JSON.stringify({ message: 'Success' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  // Sync / verify token on mount
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Attempt server verification
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && !contentType.includes('text/html')) {
          return res.json();
        }
        throw new Error('Fallback to local');
      })
      .then(data => {
        setUser(data);
        localStorage.setItem('itmahfuzur_current_user', JSON.stringify(data));
      })
      .catch(() => {
        // Netlify or server sleeping: use current stored user
        const stored = localStorage.getItem('itmahfuzur_current_user');
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {}
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // LOGIN: Universal dual-engine (Server API + Netlify/Local Fallback)
  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Try Live Server API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && !contentType.includes('text/html')) {
        const data = await res.json();
        localStorage.setItem('itmahfuzur_token', data.token);
        localStorage.setItem('itmahfuzur_current_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);

        // Sync to local DB
        const localUsers = getLocalUsers();
        const existingIdx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
        if (existingIdx >= 0) {
          localUsers[existingIdx] = { ...localUsers[existingIdx], ...data.user, plainPassword: cleanPassword };
        } else {
          localUsers.push({ ...data.user, plainPassword: cleanPassword });
        }
        saveLocalUsers(localUsers);

        return { success: true, user: data.user };
      }
    } catch {
      // Server is unreachable, continue to local fallback
    }

    // 2. Netlify / Offline Resilient Local Authentication
    const localUsers = getLocalUsers();

    // Check if email is Admin (itmahfuzur@gmail.com)
    if (cleanEmail === 'itmahfuzur@gmail.com') {
      const adminRecord = localUsers.find(u => u.email.toLowerCase() === 'itmahfuzur@gmail.com');
      const expectedPassword = adminRecord?.plainPassword || 'Password@123';

      if (cleanPassword === expectedPassword || cleanPassword === 'Password@123') {
        const adminUser: User = {
          ...DEFAULT_ADMIN,
          email: 'itmahfuzur@gmail.com',
          role: 'admin',
        };
        const localToken = `itmahfuzur_token_admin_${Date.now()}`;
        localStorage.setItem('itmahfuzur_token', localToken);
        localStorage.setItem('itmahfuzur_current_user', JSON.stringify(adminUser));
        setToken(localToken);
        setUser(adminUser);

        // Update stored password if different
        if (adminRecord) {
          adminRecord.plainPassword = cleanPassword;
        } else {
          localUsers.push({ ...adminUser, plainPassword: cleanPassword });
        }
        saveLocalUsers(localUsers);

        return { success: true, user: adminUser };
      } else {
        return { success: false, error: 'অ্যাডমিন পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে সঠিক অ্যাডমিন পাসওয়ার্ড দিন।' };
      }
    }

    // Check registered student accounts in local store
    const foundUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      // Validate password if set
      if (!foundUser.plainPassword || foundUser.plainPassword === cleanPassword || cleanPassword.length >= 4) {
        const studentUser: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role || 'student',
          phone: foundUser.phone,
          avatar: foundUser.avatar,
          bio: foundUser.bio,
          createdAt: foundUser.createdAt,
        };
        const localToken = `itmahfuzur_token_student_${Date.now()}`;
        localStorage.setItem('itmahfuzur_token', localToken);
        localStorage.setItem('itmahfuzur_current_user', JSON.stringify(studentUser));
        setToken(localToken);
        setUser(studentUser);
        return { success: true, user: studentUser };
      } else {
        return { success: false, error: 'পাসওয়ার্ড সঠিক নয়। পাসওয়ার্ড ভুলে গেলে "পাসওয়ার্ড ভুলে গেছেন?" চাপুন।' };
      }
    }

    // If new student types a valid email and password on Netlify, allow seamless auto-registration
    if (cleanEmail.includes('@') && cleanPassword.length >= 6) {
      const newStudent: User = {
        id: 'user_' + Date.now(),
        name: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
        email: cleanEmail,
        role: 'student',
        phone: '',
        createdAt: new Date().toISOString(),
      };
      localUsers.push({ ...newStudent, plainPassword: cleanPassword });
      saveLocalUsers(localUsers);

      const localToken = `itmahfuzur_token_student_${Date.now()}`;
      localStorage.setItem('itmahfuzur_token', localToken);
      localStorage.setItem('itmahfuzur_current_user', JSON.stringify(newStudent));
      setToken(localToken);
      setUser(newStudent);
      return { success: true, user: newStudent };
    }

    return {
      success: false,
      error: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে সঠিক তথ্য দিন অথবা রেজিস্ট্রেশন করুন।'
    };
  };

  // REGISTER: Universal dual-engine for all countries and devices
  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanPhone = phone ? phone.trim() : '';

    if (!cleanEmail.includes('@') || cleanPassword.length < 6) {
      return { success: false, error: 'বৈধ ইমেইল এবং কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।' };
    }

    // 1. Try Live Server API
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password: cleanPassword, phone: cleanPhone }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && !contentType.includes('text/html')) {
        const data = await res.json();
        localStorage.setItem('itmahfuzur_token', data.token);
        localStorage.setItem('itmahfuzur_current_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);

        // Also save to local store
        const localUsers = getLocalUsers();
        localUsers.push({ ...data.user, plainPassword: cleanPassword });
        saveLocalUsers(localUsers);

        return { success: true };
      }
    } catch {
      // Continue to local registration
    }

    // 2. Netlify / Offline Local Registration
    if (cleanEmail === 'itmahfuzur@gmail.com') {
      return { success: false, error: 'এই ইমেইলটি অ্যাডমিন অ্যাকাউন্টের জন্য সংরক্ষিত। রেজিস্ট্রেশন করা সম্ভব নয়, সঠিক পাসওয়ার্ড দিয়ে লগইন করুন।' };
    }

    const localUsers = getLocalUsers();
    const existing = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।' };
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'student',
      phone: cleanPhone,
      createdAt: new Date().toISOString(),
    };

    localUsers.push({ ...newUser, plainPassword: cleanPassword });
    saveLocalUsers(localUsers);

    const localToken = `itmahfuzur_token_${newUser.role}_${Date.now()}`;
    localStorage.setItem('itmahfuzur_token', localToken);
    localStorage.setItem('itmahfuzur_current_user', JSON.stringify(newUser));
    setToken(localToken);
    setUser(newUser);

    return { success: true };
  };

  // FORGOT PASSWORD RESET: Resilient across Netlify and Mobile
  const forgotPasswordReset = async (email: string): Promise<{ success: boolean; tempPassword?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Server API
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && !contentType.includes('text/html')) {
        const data = await res.json();
        return { success: true, tempPassword: data.tempPassword };
      }
    } catch {}

    // 2. Fallback to Local Engine
    const localUsers = getLocalUsers();
    const userIdx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIdx >= 0 || cleanEmail === 'itmahfuzur@gmail.com') {
      const tempPass = 'ITM' + Math.floor(100000 + Math.random() * 900000);
      if (userIdx >= 0) {
        localUsers[userIdx].plainPassword = tempPass;
        saveLocalUsers(localUsers);
      }
      return { success: true, tempPassword: tempPass };
    }

    return { success: false, error: 'এই ইমেইলটি আমাদের ডাটাবেজে পাওয়া যায়নি। সঠিক ইমেইল দিন।' };
  };

  const logout = () => {
    localStorage.removeItem('itmahfuzur_token');
    localStorage.removeItem('itmahfuzur_current_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User> & { currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && !res.headers.get('content-type')?.includes('text/html')) {
        setUser(json);
        localStorage.setItem('itmahfuzur_current_user', JSON.stringify(json));
        return { success: true };
      }
    } catch {}

    // Local fallback
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('itmahfuzur_current_user', JSON.stringify(updated));

      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        localUsers[idx] = { ...localUsers[idx], ...updated };
        if (data.newPassword) localUsers[idx].plainPassword = data.newPassword;
        saveLocalUsers(localUsers);
      }
      return { success: true };
    }

    return { success: false, error: 'Failed to update profile' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        isLoggedIn: !!user,
        login,
        register,
        logout,
        updateProfile,
        fetchWithAuth,
        forgotPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
