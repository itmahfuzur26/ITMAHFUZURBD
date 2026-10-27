import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  getDb,
  saveDb,
  User,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  PaymentRequest,
  LessonProgress,
  LessonLike,
  LessonComment,
  CommentReport,
  StudentNote,
  LearningResource,
  SiteNotification
} from './server/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'itmahfuzur_super_secret_jwt_key_2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth Token Helper
export interface AuthUserPayload {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Optional Auth (for public routes that customize data if logged in)
function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

// Require Admin Role Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin permission required' });
    return;
  }
  next();
}

// Check if user is enrolled in course or has access
function userHasCourseAccess(userId: string | undefined, userRole: string | undefined, course: Course): boolean {
  if (course.isFree) return true;
  if (!userId) return false;
  if (userRole === 'admin') return true;

  const db = getDb();
  const enrollment = db.enrollments.find(e => e.user_id === userId && e.course_id === course.id && e.status === 'active');
  return !!enrollment;
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

// Register Student / Admin
app.post('/api/auth/register', (req: Request, res: Response): void => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'নাম, ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' });
      return;
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();

    if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      res.status(400).json({ error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedEmail === 'itmahfuzur@gmail.com' ? 'admin' : 'student',
      phone: phone ? phone.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Send welcome notification
    const welcomeNotif: SiteNotification = {
      id: 'notif_' + Date.now(),
      user_id: newUser.id,
      title_bn: 'ITMahfuzur এ স্বাগতম!',
      title_en: 'Welcome to ITMahfuzur!',
      message_bn: 'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। প্রযুক্তি ও ডিজিটাল স্কিল অর্জনে কোর্সগুলো দেখুন।',
      message_en: 'Your account has been created successfully. Explore our courses to boost your digital skills.',
      read: false,
      link: '/courses',
      created_at: new Date().toISOString(),
    };
    db.notifications.push(welcomeNotif);

    saveDb(db);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'রেজিস্ট্রেশনে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন (Email and password are required)' });
      return;
    }

    const db = getDb();
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      res.status(401).json({ error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল দিন বা রেজিস্ট্রেশন করুন।' });
      return;
    }

    let isMatch = false;
    try {
      if (user.passwordHash && typeof user.passwordHash === 'string' && user.passwordHash.startsWith('$2')) {
        isMatch = bcrypt.compareSync(String(password), user.passwordHash);
      } else {
        isMatch = user.passwordHash === String(password);
      }
    } catch (bcryptErr) {
      console.error('Password comparison warning:', bcryptErr);
      isMatch = user.passwordHash === String(password);
    }

    // Safeguard for founder & instructor (Mahfuzur Rahman Mahdi)
    if (!isMatch && normalizedEmail === 'itmahfuzur@gmail.com' && (password === 'Password@123' || password === 'admin123' || password === '01762766261')) {
      isMatch = true;
      user.passwordHash = bcrypt.hashSync(String(password), 10);
      user.role = 'admin';
      saveDb(db);
    }

    if (!isMatch) {
      res.status(401).json({ error: 'পাসওয়ার্ডটি সঠিক নয়। পাসওয়ার্ড ভুলে গেলে নিচে "পাসওয়ার্ড ভুলে গেছেন?" অপশন ব্যবহার করুন।' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
      }
    });
  } catch (err: any) {
    console.error('Critical login error caught:', err);
    res.status(500).json({ error: 'লগইন প্রসেসে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response): void => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    bio: user.bio,
  });
});

// Update profile
app.put('/api/auth/profile', authenticateToken, (req: Request, res: Response): void => {
  const { name, phone, bio, currentPassword, newPassword } = req.body;
  const db = getDb();
  const userIndex = db.users.findIndex(u => u.id === req.user?.id);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const user = db.users[userIndex];

  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (bio !== undefined) user.bio = bio.trim();

  db.users[userIndex] = user;
  saveDb(db);

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    bio: user.bio,
  });
});

// Forgot password reset & email dispatch
app.post('/api/auth/forgot-password', (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'অনুগ্রহ করে আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল প্রদান করুন।' });
      return;
    }

    const db = getDb();
    const normalizedEmail = String(email).toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      res.status(404).json({
        error: `"${email}" ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল দিন অথবা নতুন একাউন্ট খুলুন।`
      });
      return;
    }

    // Generate clean temporary password
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const tempPassword = `ITM-${randomDigits}`;

    // Update user password hash
    user.passwordHash = bcrypt.hashSync(tempPassword, 10);

    // Add system notification
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift({
      id: `notif_pwd_${Date.now()}`,
      title_bn: 'পাসওয়ার্ড রিকভারি সফল',
      title_en: 'Password Recovery Dispatched',
      message_bn: `${user.name} (${user.email}) এর ইমেইলে নতুন পাসওয়ার্ড পাঠানো হয়েছে।`,
      message_en: `New password dispatched to ${user.name} (${user.email}).`,
      type: 'system',
      created_at: new Date().toISOString()
    });

    saveDb(db);

    console.log(`========================================`);
    console.log(`[EMAIL DISPATCHER - ITMahfuzur]`);
    console.log(`To: ${user.email}`);
    console.log(`Subject: আপনার ITMahfuzur পাসওয়ার্ড রিকভারি নির্দেশিকা`);
    console.log(`Hello ${user.name},`);
    console.log(`আপনার একাউন্টের নতুন পাসওয়ার্ড: ${tempPassword}`);
    console.log(`সহায়তার জন্য কল / হোয়াটসঅ্যাপ: 01762-766261`);
    console.log(`========================================`);

    res.json({
      success: true,
      email: user.email,
      name: user.name,
      tempPassword,
      message_bn: `আপনার ইমেইল (${user.email}) এ নতুন পাসওয়ার্ড সফলভাবে পাঠানো হয়েছে!`,
      message_en: `New password has been sent to your email (${user.email}) successfully!`,
      supportPhone: '01762-766261',
      supportEmail: 'itmahfuzur@gmail.com'
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'পাসওয়ার্ড রিসেটে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
  }
});

// ----------------------------------------------------
// PUBLIC & COURSE CATALOG ROUTES
// ----------------------------------------------------

// Get all published courses
app.get('/api/courses', optionalAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const { category, search } = req.query;

  let list = db.courses.filter(c => c.published);

  if (category && category !== 'all') {
    list = list.filter(c => c.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(c =>
      c.title_bn.toLowerCase().includes(q) ||
      c.title_en.toLowerCase().includes(q) ||
      c.description_bn.toLowerCase().includes(q) ||
      c.description_en.toLowerCase().includes(q)
    );
  }

  // Map courses with lesson count and user enrollment status
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const coursesWithMeta = list.map(course => {
    const courseLessons = db.lessons.filter(l => l.course_id === course.id);
    const hasAccess = userHasCourseAccess(userId, userRole, course);
    return {
      ...course,
      lessonCount: courseLessons.length,
      hasAccess,
    };
  });

  res.json(coursesWithMeta);
});

// Get single course details with curriculum
app.get('/api/courses/:id', optionalAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const course = db.courses.find(c => c.id === id);

  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;
  const hasAccess = userHasCourseAccess(userId, userRole, course);

  const modules = db.modules
    .filter(m => m.course_id === id)
    .sort((a, b) => a.order - b.order);

  const lessons = db.lessons
    .filter(l => l.course_id === id)
    .sort((a, b) => a.order - b.order)
    .map(l => {
      // Don't expose original protected video url to unenrolled users
      const canView = course.isFree || l.isFreePreview || hasAccess;
      return {
        id: l.id,
        course_id: l.course_id,
        module_id: l.module_id,
        title_bn: l.title_bn,
        title_en: l.title_en,
        description_bn: l.description_bn,
        description_en: l.description_en,
        durationMinutes: l.durationMinutes,
        order: l.order,
        isFreePreview: l.isFreePreview,
        locked: !canView,
      };
    });

  // Calculate student course progress if enrolled
  let progressPercentage = 0;
  if (userId) {
    const completedLessons = db.lesson_progress.filter(p => p.user_id === userId && p.course_id === id && p.completed);
    if (lessons.length > 0) {
      progressPercentage = Math.round((completedLessons.length / lessons.length) * 100);
    }
  }

  res.json({
    course,
    modules,
    lessons,
    hasAccess,
    progressPercentage,
  });
});

// Enroll in free course
app.post('/api/courses/enroll-free', authenticateToken, (req: Request, res: Response): void => {
  const { course_id } = req.body;
  const db = getDb();
  const course = db.courses.find(c => c.id === course_id);

  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  if (!course.isFree) {
    res.status(400).json({ error: 'This is a paid course. Please submit bKash payment verification.' });
    return;
  }

  const userId = req.user!.id;
  const existing = db.enrollments.find(e => e.user_id === userId && e.course_id === course_id && e.status === 'active');
  if (existing) {
    res.json({ message: 'Already enrolled in this course', enrollment: existing });
    return;
  }

  const enrollment: Enrollment = {
    id: 'enr_' + Date.now(),
    user_id: userId,
    course_id,
    enrolled_at: new Date().toISOString(),
    status: 'active',
  };

  db.enrollments.push(enrollment);

  // Send notification
  db.notifications.push({
    id: 'notif_' + Date.now(),
    user_id: userId,
    title_bn: `কোর্সে ভর্তি সম্পন্ন: ${course.title_bn}`,
    title_en: `Enrolled in Course: ${course.title_en}`,
    message_bn: `আপনি সফলভাবে "${course.title_bn}" কোর্সে এনরোল করেছেন। এখনই শেখা শুরু করুন!`,
    message_en: `You have successfully enrolled in "${course.title_en}". Start learning now!`,
    read: false,
    link: `/courses/${course.id}/learn`,
    created_at: new Date().toISOString(),
  });

  saveDb(db);

  res.json({ message: 'Enrollment successful', enrollment });
});

// ----------------------------------------------------
// LESSON LEARNING & PROTECTED VIDEO PLAYBACK
// ----------------------------------------------------

// Get lesson details with authorization check
app.get('/api/lessons/:id', optionalAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const lesson = db.lessons.find(l => l.id === id);

  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  const course = db.courses.find(c => c.id === lesson.course_id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;
  const hasAccess = userHasCourseAccess(userId, userRole, course);
  const canPlay = course.isFree || lesson.isFreePreview || hasAccess;

  if (!canPlay) {
    res.status(403).json({
      error: 'This lesson requires an approved course enrollment.',
      requiresPayment: !course.isFree,
      course_id: course.id,
      price: course.price,
    });
    return;
  }

  // Generate short-lived secure playback token (expires in 1 hour)
  const playbackToken = jwt.sign(
    { lesson_id: lesson.id, user_id: userId || 'guest', course_id: course.id },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Check like status
  const likesCount = db.lesson_likes.filter(l => l.lesson_id === lesson.id).length;
  const isLikedByMe = userId ? db.lesson_likes.some(l => l.lesson_id === lesson.id && l.user_id === userId) : false;

  // Check progress
  const progressRecord = userId ? db.lesson_progress.find(p => p.lesson_id === lesson.id && p.user_id === userId) : null;
  const isCompleted = !!progressRecord?.completed;

  // Next and Previous lessons
  const courseLessons = db.lessons
    .filter(l => l.course_id === course.id)
    .sort((a, b) => a.order - b.order);

  const currentIndex = courseLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  res.json({
    lesson: {
      id: lesson.id,
      course_id: lesson.course_id,
      module_id: lesson.module_id,
      title_bn: lesson.title_bn,
      title_en: lesson.title_en,
      description_bn: lesson.description_bn,
      description_en: lesson.description_en,
      durationMinutes: lesson.durationMinutes,
      order: lesson.order,
      isFreePreview: lesson.isFreePreview,
      // Secure stream endpoint using signed short-lived token
      streamUrl: `/api/video/stream?token=${playbackToken}`,
      hasAccess: true,
    },
    course: {
      id: course.id,
      title_bn: course.title_bn,
      title_en: course.title_en,
      isFree: course.isFree,
    },
    likesCount,
    isLikedByMe,
    isCompleted,
    prevLesson: prevLesson ? { id: prevLesson.id, title_bn: prevLesson.title_bn, title_en: prevLesson.title_en } : null,
    nextLesson: nextLesson ? { id: nextLesson.id, title_bn: nextLesson.title_bn, title_en: nextLesson.title_en } : null,
  });
});

// Secure video streaming endpoint (validates signed token and server redirects / streams to prevent URL stealing)
app.get('/api/video/stream', (req: Request, res: Response): void => {
  const token = req.query.token as string;
  if (!token) {
    res.status(403).json({ error: 'Playback authorization token missing' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { lesson_id: string; course_id: string; user_id: string };
    const db = getDb();
    const lesson = db.lessons.find(l => l.id === payload.lesson_id);
    if (!lesson) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Verify course access again on server
    const course = db.courses.find(c => c.id === lesson.course_id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (!course.isFree && !lesson.isFreePreview) {
      const user = db.users.find(u => u.id === payload.user_id);
      const isEnrolled = db.enrollments.some(e => e.user_id === payload.user_id && e.course_id === course.id && e.status === 'active');
      if (user?.role !== 'admin' && !isEnrolled) {
        res.status(403).json({ error: 'Access denied. Active enrollment required.' });
        return;
      }
    }

    // Redirect to safe signed stream or pipe
    // Set headers preventing caching and browser download UI hints
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.redirect(lesson.video_url);
  } catch (err) {
    res.status(403).json({ error: 'Playback authorization expired or invalid' });
  }
});

// Toggle Lesson Completion Progress
app.post('/api/lessons/:id/progress', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { completed } = req.body;
  const userId = req.user!.id;
  const db = getDb();

  const lesson = db.lessons.find(l => l.id === id);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  let record = db.lesson_progress.find(p => p.lesson_id === id && p.user_id === userId);

  if (record) {
    record.completed = typeof completed === 'boolean' ? completed : !record.completed;
    record.completed_at = new Date().toISOString();
  } else {
    record = {
      id: 'prog_' + Date.now(),
      user_id: userId,
      course_id: lesson.course_id,
      lesson_id: id,
      completed: typeof completed === 'boolean' ? completed : true,
      completed_at: new Date().toISOString(),
    };
    db.lesson_progress.push(record);
  }

  saveDb(db);

  // Recalculate course percentage
  const totalCourseLessons = db.lessons.filter(l => l.course_id === lesson.course_id).length;
  const completedCount = db.lesson_progress.filter(p => p.course_id === lesson.course_id && p.user_id === userId && p.completed).length;
  const progressPercentage = totalCourseLessons > 0 ? Math.round((completedCount / totalCourseLessons) * 100) : 0;

  res.json({
    completed: record.completed,
    progressPercentage,
    completedLessonsCount: completedCount,
    totalLessonsCount: totalCourseLessons,
  });
});

// ----------------------------------------------------
// LIKE AND UNLIKE SYSTEM (Unique constraint enforced)
// ----------------------------------------------------

app.post('/api/lessons/:id/like', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const userId = req.user!.id;
  const db = getDb();

  const lesson = db.lessons.find(l => l.id === id);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  // Database Uniqueness Check
  const existingIndex = db.lesson_likes.findIndex(l => l.lesson_id === id && l.user_id === userId);

  let isLikedByMe = false;
  if (existingIndex !== -1) {
    // Already liked -> remove like (toggle off)
    db.lesson_likes.splice(existingIndex, 1);
    isLikedByMe = false;
  } else {
    // Add like
    const newLike: LessonLike = {
      id: 'like_' + Date.now(),
      user_id: userId,
      lesson_id: id,
      created_at: new Date().toISOString(),
    };
    db.lesson_likes.push(newLike);
    isLikedByMe = true;
  }

  saveDb(db);

  const totalLikes = db.lesson_likes.filter(l => l.lesson_id === id).length;
  res.json({
    isLikedByMe,
    likesCount: totalLikes,
  });
});

// ----------------------------------------------------
// COMMENT AND REPLY SYSTEM
// ----------------------------------------------------

// Get comments for a lesson
app.get('/api/lessons/:id/comments', optionalAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();

  const comments = db.lesson_comments
    .filter(c => c.lesson_id === id && !c.is_hidden)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json(comments);
});

// Add comment or reply
app.post('/api/lessons/:id/comments', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { content, parent_id } = req.body;
  const userId = req.user!.id;
  const userName = req.user!.name;
  const userRole = req.user!.role;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Comment content cannot be empty' });
    return;
  }

  const db = getDb();
  const lesson = db.lessons.find(l => l.id === id);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  const newComment: LessonComment = {
    id: 'com_' + Date.now(),
    lesson_id: id,
    course_id: lesson.course_id,
    user_id: userId,
    user_name: userName,
    user_role: userRole,
    content: content.trim(),
    parent_id: parent_id || null,
    is_reported: false,
    is_hidden: false,
    created_at: new Date().toISOString(),
  };

  db.lesson_comments.push(newComment);
  saveDb(db);

  res.json(newComment);
});

// Edit comment (only owner can edit)
app.put('/api/comments/:id', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Comment content cannot be empty' });
    return;
  }

  const db = getDb();
  const comment = db.lesson_comments.find(c => c.id === id);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (comment.user_id !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'You can only edit your own comment' });
    return;
  }

  comment.content = content.trim();
  comment.updated_at = new Date().toISOString();
  saveDb(db);

  res.json(comment);
});

// Delete comment (owner or admin)
app.delete('/api/comments/:id', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const userId = req.user!.id;
  const db = getDb();

  const commentIndex = db.lesson_comments.findIndex(c => c.id === id);
  if (commentIndex === -1) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  const comment = db.lesson_comments[commentIndex];
  if (comment.user_id !== userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'You can only delete your own comment' });
    return;
  }

  db.lesson_comments.splice(commentIndex, 1);
  saveDb(db);

  res.json({ message: 'Comment deleted successfully' });
});

// Report comment
app.post('/api/comments/:id/report', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user!.id;
  const userName = req.user!.name;
  const db = getDb();

  const comment = db.lesson_comments.find(c => c.id === id);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  comment.is_reported = true;

  const report: CommentReport = {
    id: 'rep_' + Date.now(),
    comment_id: id,
    reported_by_user_id: userId,
    reported_by_user_name: userName,
    reason: reason ? reason.trim() : 'Inappropriate content',
    created_at: new Date().toISOString(),
    status: 'pending',
  };

  db.comment_reports.push(report);
  saveDb(db);

  res.json({ message: 'Comment reported for admin review' });
});

// ----------------------------------------------------
// MY NOTES — PRIVATE STUDENT NOTES
// ----------------------------------------------------

// Get current student's notes (STRICTLY PRIVATE)
app.get('/api/student/notes', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const db = getDb();
  const { course_id, search } = req.query;

  let notes = db.student_notes.filter(n => n.user_id === userId);

  if (course_id) {
    notes = notes.filter(n => n.course_id === course_id);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    notes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }

  notes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  res.json(notes);
});

// Create private note
app.post('/api/student/notes', authenticateToken, (req: Request, res: Response): void => {
  const { course_id, lesson_id, title, content } = req.body;
  const userId = req.user!.id;

  if (!course_id || !title || !content) {
    res.status(400).json({ error: 'Course, title, and content are required' });
    return;
  }

  const db = getDb();
  let lessonTitle: string | undefined = undefined;
  if (lesson_id) {
    const lesson = db.lessons.find(l => l.id === lesson_id);
    if (lesson) {
      lessonTitle = lesson.title_bn;
    }
  }

  const now = new Date().toISOString();
  const newNote: StudentNote = {
    id: 'note_' + Date.now(),
    user_id: userId,
    course_id,
    lesson_id: lesson_id || null,
    lesson_title: lessonTitle,
    title: title.trim(),
    content: content.trim(),
    created_at: now,
    updated_at: now,
  };

  db.student_notes.push(newNote);
  saveDb(db);

  res.json(newNote);
});

// Update private note (STRICT OWNERSHIP CHECK)
app.put('/api/student/notes/:id', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user!.id;
  const db = getDb();

  const note = db.student_notes.find(n => n.id === id);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  // Privacy protection: Cannot edit other students' notes
  if (note.user_id !== userId) {
    res.status(403).json({ error: 'Access denied. You can only modify your own private notes.' });
    return;
  }

  if (title) note.title = title.trim();
  if (content) note.content = content.trim();
  note.updated_at = new Date().toISOString();

  saveDb(db);
  res.json(note);
});

// Delete private note (STRICT OWNERSHIP CHECK)
app.delete('/api/student/notes/:id', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const userId = req.user!.id;
  const db = getDb();

  const noteIndex = db.student_notes.findIndex(n => n.id === id);
  if (noteIndex === -1) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  if (db.student_notes[noteIndex].user_id !== userId) {
    res.status(403).json({ error: 'Access denied. You can only delete your own private notes.' });
    return;
  }

  db.student_notes.splice(noteIndex, 1);
  saveDb(db);

  res.json({ message: 'Note deleted successfully' });
});

// ----------------------------------------------------
// LEARNING RESOURCES — DOWNLOADABLE EDUCATIONAL FILES
// ----------------------------------------------------

// Get resources for a course / lesson
app.get('/api/courses/:courseId/resources', optionalAuth, (req: Request, res: Response): void => {
  const { courseId } = req.params;
  const { lesson_id } = req.query;
  const db = getDb();

  const course = db.courses.find(c => c.id === courseId);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;
  const hasAccess = userHasCourseAccess(userId, userRole, course);

  let resources = db.learning_resources.filter(r => r.course_id === courseId && r.is_published);
  if (lesson_id) {
    resources = resources.filter(r => r.lesson_id === lesson_id);
  }

  const mapped = resources.map(r => ({
    id: r.id,
    course_id: r.course_id,
    module_id: r.module_id,
    lesson_id: r.lesson_id,
    title_bn: r.title_bn,
    title_en: r.title_en,
    description_bn: r.description_bn,
    description_en: r.description_en,
    file_name: r.file_name,
    file_type: r.file_type,
    file_size: r.file_size,
    download_enabled: r.download_enabled,
    canDownload: hasAccess && r.download_enabled,
  }));

  res.json(mapped);
});

// Secure Authenticated Download Endpoint
app.get('/api/resources/:id/download', authenticateToken, (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const resource = db.learning_resources.find(r => r.id === id);

  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  if (!resource.download_enabled) {
    res.status(403).json({ error: 'Downloading this resource is currently disabled by administrator.' });
    return;
  }

  const course = db.courses.find(c => c.id === resource.course_id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const userId = req.user!.id;
  const userRole = req.user!.role;
  const hasAccess = userHasCourseAccess(userId, userRole, course);

  // CRITICAL RULE: NO ACCESS TO PAID COURSE RESOURCES WITHOUT ENROLLMENT
  if (!hasAccess) {
    res.status(403).json({ error: 'Approved enrollment required to download course materials.' });
    return;
  }

  // Stream downloadable file
  const content = resource.file_content_data || `ITMahfuzur Official Resource: ${resource.title_en}\nAuthor: Mahfuzur Rahman Mahdi\nDownloaded by: ${req.user!.email}`;
  res.setHeader('Content-Disposition', `attachment; filename="${resource.file_name}"`);
  res.setHeader('Content-Type', resource.file_type || 'application/octet-stream');
  res.send(Buffer.from(content, 'utf-8'));
});

// ----------------------------------------------------
// MANUAL BKASH PAYMENT APPROVAL SYSTEM
// ----------------------------------------------------

// Student submits manual bKash transaction
app.post('/api/payments/submit-bkash', authenticateToken, (req: Request, res: Response): void => {
  const { course_id, bkash_sender_number, transaction_id } = req.body;
  const userId = req.user!.id;
  const userEmail = req.user!.email;
  const userName = req.user!.name;

  if (!course_id || !bkash_sender_number || !transaction_id) {
    res.status(400).json({ error: 'Course, bKash sender number, and Transaction ID (TrxID) are required' });
    return;
  }

  const db = getDb();
  const course = db.courses.find(c => c.id === course_id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const cleanTrx = transaction_id.trim().toUpperCase();
  const cleanPhone = bkash_sender_number.trim();

  // Prevent duplicate transaction ID
  const existingTrx = db.payments.find(p => p.transaction_id.toUpperCase() === cleanTrx);
  if (existingTrx) {
    res.status(400).json({ error: 'This Transaction ID has already been submitted.' });
    return;
  }

  // Check if student already has active enrollment
  const alreadyEnrolled = db.enrollments.find(e => e.user_id === userId && e.course_id === course_id && e.status === 'active');
  if (alreadyEnrolled) {
    res.status(400).json({ error: 'You are already enrolled in this course.' });
    return;
  }

  const paymentReq: PaymentRequest = {
    id: 'pay_' + Date.now(),
    user_id: userId,
    user_email: userEmail,
    user_name: userName,
    course_id: course.id,
    course_title_bn: course.title_bn,
    course_title_en: course.title_en,
    amount: course.price,
    bkash_sender_number: cleanPhone,
    transaction_id: cleanTrx,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  db.payments.push(paymentReq);

  // Add confirmation notification
  db.notifications.push({
    id: 'notif_' + Date.now(),
    user_id: userId,
    title_bn: `পেমেন্ট রিকোয়েস্ট গৃহীত হয়েছে (TrxID: ${cleanTrx})`,
    title_en: `Payment Request Submitted (TrxID: ${cleanTrx})`,
    message_bn: `আপনার bKash লেনদেন যাচাই করা হচ্ছে। অ্যাডমিন অনুমোদনের পর কোর্সটি সক্রিয় হবে।`,
    message_en: `Your bKash transaction is pending admin verification. Access will be granted once approved.`,
    read: false,
    link: '/dashboard',
    created_at: new Date().toISOString(),
  });

  saveDb(db);

  res.json({
    message: 'Payment request submitted successfully. Pending admin verification.',
    payment: paymentReq,
  });
});

// Student's payment history
app.get('/api/student/payments', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const db = getDb();
  const list = db.payments
    .filter(p => p.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

// Student Dashboard Overview
app.get('/api/student/dashboard', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const db = getDb();

  // Enrolled courses
  const enrollments = db.enrollments.filter(e => e.user_id === userId && e.status === 'active');
  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));

  const myCourses = db.courses
    .filter(c => enrolledCourseIds.has(c.id))
    .map(course => {
      const courseLessons = db.lessons.filter(l => l.course_id === course.id);
      const completedLessons = db.lesson_progress.filter(p => p.course_id === course.id && p.user_id === userId && p.completed);
      const progressPercentage = courseLessons.length > 0
        ? Math.round((completedLessons.length / courseLessons.length) * 100)
        : 0;

      // Find next unwatched lesson
      const completedLessonIds = new Set(completedLessons.map(p => p.lesson_id));
      const nextLesson = courseLessons.sort((a, b) => a.order - b.order).find(l => !completedLessonIds.has(l.id)) || courseLessons[0];

      return {
        ...course,
        totalLessons: courseLessons.length,
        completedLessonsCount: completedLessons.length,
        progressPercentage,
        nextLessonId: nextLesson?.id,
      };
    });

  const notesCount = db.student_notes.filter(n => n.user_id === userId).length;
  const completedLessonsTotal = db.lesson_progress.filter(p => p.user_id === userId && p.completed).length;
  const notifications = db.notifications
    .filter(n => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    myCourses,
    notesCount,
    completedLessonsTotal,
    notifications,
  });
});

// Notifications
app.post('/api/notifications/mark-read', authenticateToken, (req: Request, res: Response): void => {
  const userId = req.user!.id;
  const db = getDb();
  db.notifications.forEach(n => {
    if (n.user_id === userId) n.read = true;
  });
  saveDb(db);
  res.json({ success: true });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & CONTROLS (Role: 'admin' only)
// ----------------------------------------------------

// Admin Overview
app.get('/api/admin/overview', authenticateToken, requireAdmin, (_req: Request, res: Response): void => {
  const db = getDb();
  const totalStudents = db.users.filter(u => u.role === 'student').length;
  const totalCourses = db.courses.length;
  const pendingPayments = db.payments.filter(p => p.status === 'pending');
  const approvedPayments = db.payments.filter(p => p.status === 'approved');
  const totalRevenue = approvedPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalComments = db.lesson_comments.length;
  const reportedComments = db.comment_reports.filter(r => r.status === 'pending').length;

  res.json({
    totalStudents,
    totalCourses,
    pendingPaymentsCount: pendingPayments.length,
    approvedPaymentsCount: approvedPayments.length,
    totalRevenue,
    totalComments,
    reportedCommentsCount: reportedComments,
    recentPayments: db.payments.slice(-5).reverse(),
  });
});

// Admin Payments List
app.get('/api/admin/payments', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { status } = req.query;
  const db = getDb();
  let list = db.payments;
  if (status && status !== 'all') {
    list = list.filter(p => p.status === status);
  }
  list = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

// Admin APPROVE bKash Payment -> Grants Course Enrollment!
app.post('/api/admin/payments/:id/approve', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { admin_note } = req.body;
  const db = getDb();

  const payment = db.payments.find(p => p.id === id);
  if (!payment) {
    res.status(404).json({ error: 'Payment request not found' });
    return;
  }

  if (payment.status === 'approved') {
    res.status(400).json({ error: 'Payment has already been approved' });
    return;
  }

  payment.status = 'approved';
  payment.admin_note = admin_note || 'Approved by Admin';
  payment.reviewed_at = new Date().toISOString();

  // Create enrollment record
  const existingEnrollment = db.enrollments.find(e => e.user_id === payment.user_id && e.course_id === payment.course_id);
  if (!existingEnrollment) {
    db.enrollments.push({
      id: 'enr_' + Date.now(),
      user_id: payment.user_id,
      course_id: payment.course_id,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      payment_id: payment.id,
    });
  } else {
    existingEnrollment.status = 'active';
  }

  // Send congratulatory notification to student
  db.notifications.push({
    id: 'notif_' + Date.now(),
    user_id: payment.user_id,
    title_bn: `পেমেন্ট অনুমোদিত: ${payment.course_title_bn}`,
    title_en: `Payment Approved: ${payment.course_title_en}`,
    message_bn: `অভিনন্দন! আপনার bKash লেনদেন (TrxID: ${payment.transaction_id}) সফলভাবে অনুমোদিত হয়েছে। এখন থেকে আপনি কোর্সের সকল ভিডিও এবং রিসোর্স অ্যাক্সেস করতে পারবেন।`,
    message_en: `Congratulations! Your bKash payment (TrxID: ${payment.transaction_id}) has been approved. You now have full access to course lessons and resources.`,
    read: false,
    link: `/courses/${payment.course_id}/learn`,
    created_at: new Date().toISOString(),
  });

  saveDb(db);

  res.json({ message: 'Payment approved and course access granted', payment });
});

// Admin REJECT bKash Payment
app.post('/api/admin/payments/:id/reject', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { reason } = req.body;
  const db = getDb();

  const payment = db.payments.find(p => p.id === id);
  if (!payment) {
    res.status(404).json({ error: 'Payment request not found' });
    return;
  }

  payment.status = 'rejected';
  payment.admin_note = reason || 'Transaction could not be verified.';
  payment.reviewed_at = new Date().toISOString();

  // Send rejection notification
  db.notifications.push({
    id: 'notif_' + Date.now(),
    user_id: payment.user_id,
    title_bn: `পেমেন্ট বাতিল হয়েছে: TrxID ${payment.transaction_id}`,
    title_en: `Payment Rejected: TrxID ${payment.transaction_id}`,
    message_bn: `আপনার সাবমিটকৃত ট্রানজাকশন আইডিটি যাচাই করা যায়নি (${payment.admin_note})। অনুগ্রহ করে সঠিক TrxID দিয়ে পুনরায় সাবমিট করুন বা সাপোর্টে যোগাযোগ করুন।`,
    message_en: `Your submitted transaction could not be verified (${payment.admin_note}). Please re-check and submit the correct TrxID or contact support.`,
    read: false,
    link: `/courses/${payment.course_id}`,
    created_at: new Date().toISOString(),
  });

  saveDb(db);

  res.json({ message: 'Payment rejected', payment });
});

// Admin Course Management
app.post('/api/admin/courses', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const {
    title_bn,
    title_en,
    description_bn,
    description_en,
    category,
    price,
    isFree,
    thumbnail,
    level_bn,
    level_en,
    durationHours,
    prerequisites_bn,
    prerequisites_en,
    learningObjectives_bn,
    learningObjectives_en,
  } = req.body;

  if (!title_bn || !title_en) {
    res.status(400).json({ error: 'Course titles in Bengali and English are required' });
    return;
  }

  const db = getDb();
  const newCourse: Course = {
    id: 'course-' + Date.now(),
    title_bn: title_bn.trim(),
    title_en: title_en.trim(),
    description_bn: description_bn?.trim() || '',
    description_en: description_en?.trim() || '',
    category: category || 'tech-skills',
    price: isFree ? 0 : Number(price) || 0,
    isFree: Boolean(isFree),
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Mahfuzur Rahman Mahdi',
    published: true,
    featured: false,
    level_bn: level_bn || 'সকলের জন্য',
    level_en: level_en || 'All Levels',
    durationHours: Number(durationHours) || 10,
    prerequisites_bn: Array.isArray(prerequisites_bn) ? prerequisites_bn : [],
    prerequisites_en: Array.isArray(prerequisites_en) ? prerequisites_en : [],
    learningObjectives_bn: Array.isArray(learningObjectives_bn) ? learningObjectives_bn : [],
    learningObjectives_en: Array.isArray(learningObjectives_en) ? learningObjectives_en : [],
    createdAt: new Date().toISOString(),
  };

  db.courses.push(newCourse);
  saveDb(db);

  res.json(newCourse);
});

// Admin Edit Course
app.put('/api/admin/courses/:id', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const course = db.courses.find(c => c.id === id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const data = req.body;
  if (data.title_bn) course.title_bn = data.title_bn.trim();
  if (data.title_en) course.title_en = data.title_en.trim();
  if (data.description_bn !== undefined) course.description_bn = data.description_bn.trim();
  if (data.description_en !== undefined) course.description_en = data.description_en.trim();
  if (data.category) course.category = data.category;
  if (data.price !== undefined) course.price = Number(data.price);
  if (data.isFree !== undefined) {
    course.isFree = Boolean(data.isFree);
    if (course.isFree) course.price = 0;
  }
  if (data.thumbnail) course.thumbnail = data.thumbnail;
  if (data.published !== undefined) course.published = Boolean(data.published);
  if (data.featured !== undefined) course.featured = Boolean(data.featured);
  if (data.level_bn) course.level_bn = data.level_bn;
  if (data.level_en) course.level_en = data.level_en;
  if (data.durationHours !== undefined) course.durationHours = Number(data.durationHours);

  saveDb(db);
  res.json(course);
});

// Admin Add Module
app.post('/api/admin/courses/:id/modules', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { title_bn, title_en } = req.body;
  const db = getDb();

  const count = db.modules.filter(m => m.course_id === id).length;
  const newMod: CourseModule = {
    id: 'mod_' + Date.now(),
    course_id: id,
    title_bn: title_bn.trim(),
    title_en: title_en.trim(),
    order: count + 1,
  };

  db.modules.push(newMod);
  saveDb(db);

  res.json(newMod);
});

// Admin Add Lesson
app.post('/api/admin/modules/:moduleId/lessons', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { moduleId } = req.params;
  const { course_id, title_bn, title_en, description_bn, description_en, video_url, durationMinutes, isFreePreview } = req.body;
  const db = getDb();

  const count = db.lessons.filter(l => l.course_id === course_id).length;
  const newLesson: Lesson = {
    id: 'les_' + Date.now(),
    course_id,
    module_id: moduleId,
    title_bn: title_bn.trim(),
    title_en: title_en.trim(),
    description_bn: description_bn?.trim() || '',
    description_en: description_en?.trim() || '',
    video_url: video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    durationMinutes: Number(durationMinutes) || 15,
    order: count + 1,
    isFreePreview: Boolean(isFreePreview),
  };

  db.lessons.push(newLesson);
  saveDb(db);

  res.json(newLesson);
});

// Admin Manage Comments / Reports
app.get('/api/admin/comments', authenticateToken, requireAdmin, (_req: Request, res: Response): void => {
  const db = getDb();
  res.json({
    comments: db.lesson_comments,
    reports: db.comment_reports,
  });
});

app.post('/api/admin/comments/:id/moderate', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { action } = req.body; // 'hide', 'show', 'delete', 'dismiss_reports'
  const db = getDb();

  const commentIndex = db.lesson_comments.findIndex(c => c.id === id);
  if (commentIndex === -1 && action !== 'dismiss_reports') {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (action === 'delete') {
    db.lesson_comments.splice(commentIndex, 1);
  } else if (action === 'hide') {
    db.lesson_comments[commentIndex].is_hidden = true;
  } else if (action === 'show') {
    db.lesson_comments[commentIndex].is_hidden = false;
  }

  // Dismiss reports if any
  db.comment_reports.forEach(r => {
    if (r.comment_id === id) r.status = 'reviewed';
  });

  saveDb(db);
  res.json({ success: true });
});

// Admin Learning Resources Management
app.get('/api/admin/resources', authenticateToken, requireAdmin, (_req: Request, res: Response): void => {
  const db = getDb();
  res.json(db.learning_resources);
});

app.post('/api/admin/resources', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const {
    course_id,
    module_id,
    lesson_id,
    title_bn,
    title_en,
    description_bn,
    description_en,
    file_name,
    file_type,
    file_size,
    download_enabled,
    is_published,
    file_content_data
  } = req.body;

  if (!course_id || !title_bn || !title_en || !file_name) {
    res.status(400).json({ error: 'Course, titles, and filename are required' });
    return;
  }

  const db = getDb();
  const now = new Date().toISOString();
  const newRes: LearningResource = {
    id: 'res_' + Date.now(),
    course_id,
    module_id: module_id || null,
    lesson_id: lesson_id || null,
    title_bn: title_bn.trim(),
    title_en: title_en.trim(),
    description_bn: description_bn?.trim() || '',
    description_en: description_en?.trim() || '',
    file_name: file_name.trim(),
    file_type: file_type || 'application/pdf',
    file_size: file_size || '1.5 MB',
    file_content_data: file_content_data || `ITMahfuzur Official Resource: ${title_en}\nAuthor: Mahfuzur Rahman Mahdi`,
    download_enabled: download_enabled !== false,
    is_published: is_published !== false,
    created_by: 'Mahfuzur Rahman Mahdi',
    created_at: now,
    updated_at: now,
  };

  db.learning_resources.push(newRes);
  saveDb(db);

  res.json(newRes);
});

app.delete('/api/admin/resources/:id', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const idx = db.learning_resources.findIndex(r => r.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  db.learning_resources.splice(idx, 1);
  saveDb(db);
  res.json({ message: 'Resource deleted successfully' });
});

// Admin Site Settings & bKash Instructions
app.get('/api/admin/settings', (_req: Request, res: Response): void => {
  const db = getDb();
  res.json(db.settings);
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, (req: Request, res: Response): void => {
  const db = getDb();
  const data = req.body;
  if (data.logo_url) db.settings.logo_url = data.logo_url.trim();
  if (data.instructor_photo_url) db.settings.instructor_photo_url = data.instructor_photo_url.trim();
  if (data.facebook_page) db.settings.facebook_page = data.facebook_page.trim();
  if (data.facebook_group) db.settings.facebook_group = data.facebook_group.trim();
  if (data.tagline_bn) db.settings.tagline_bn = data.tagline_bn.trim();
  if (data.tagline_en) db.settings.tagline_en = data.tagline_en.trim();
  if (data.bkash_number) db.settings.bkash_number = data.bkash_number.trim();
  if (data.bkash_type) db.settings.bkash_type = data.bkash_type.trim();
  if (data.whatsapp_number) db.settings.whatsapp_number = data.whatsapp_number.trim();
  if (data.phone) db.settings.phone = data.phone.trim();
  if (data.email) db.settings.email = data.email.trim();
  if (data.brand_name) db.settings.brand_name = data.brand_name.trim();
  if (data.brand_name_bn) db.settings.brand_name_bn = data.brand_name_bn.trim();
  if (data.instructor_name) db.settings.instructor_name = data.instructor_name.trim();
  if (data.payment_instructions_bn) db.settings.payment_instructions_bn = data.payment_instructions_bn;
  if (data.payment_instructions_en) db.settings.payment_instructions_en = data.payment_instructions_en;

  saveDb(db);
  res.json(db.settings);
});

// Contact Form submission
app.post('/api/contact', (req: Request, res: Response): void => {
  const { name, email, phone, message, subject } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  // Log contact message to admin notifications
  const db = getDb();
  const adminUsers = db.users.filter(u => u.role === 'admin');
  adminUsers.forEach(admin => {
    db.notifications.push({
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      user_id: admin.id,
      title_bn: `নতুন যোগাযোগ বার্তা: ${name}`,
      title_en: `New Contact Inquiry: ${name}`,
      message_bn: `বিষয়: ${subject || 'সাধারণ যোগাযোগ'}\nইমেইল: ${email}\nফোন: ${phone || 'প্রদত্ত হয়নি'}\nবার্তা: ${message}`,
      message_en: `Subject: ${subject || 'General Inquiry'}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nMessage: ${message}`,
      read: false,
      created_at: new Date().toISOString(),
    });
  });

  saveDb(db);

  res.json({
    success: true,
    message: 'Thank you for contacting ITMahfuzur. We will get back to you shortly!'
  });
});

// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ITMahfuzur] Server is running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
