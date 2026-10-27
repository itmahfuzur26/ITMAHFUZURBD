import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title_bn: string;
  title_en: string;
  description_bn: string;
  description_en: string;
  category: 'graphic-design' | 'ai-training' | 'digital-marketing' | 'tech-skills';
  price: number;
  isFree: boolean;
  thumbnail: string;
  instructor: string;
  published: boolean;
  featured: boolean;
  level_bn: string;
  level_en: string;
  durationHours: number;
  prerequisites_bn: string[];
  prerequisites_en: string[];
  learningObjectives_bn: string[];
  learningObjectives_en: string[];
  createdAt: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title_bn: string;
  title_en: string;
  order: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  module_id: string;
  title_bn: string;
  title_en: string;
  description_bn: string;
  description_en: string;
  video_url: string;
  durationMinutes: number;
  order: number;
  isFreePreview: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'revoked';
  payment_id?: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  course_id: string;
  course_title_bn: string;
  course_title_en: string;
  amount: number;
  bkash_sender_number: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string;
}

export interface LessonLike {
  id: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
}

export interface LessonComment {
  id: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  user_role: 'student' | 'admin';
  content: string;
  parent_id?: string | null;
  is_reported: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CommentReport {
  id: string;
  comment_id: string;
  reported_by_user_id: string;
  reported_by_user_name: string;
  reason: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface StudentNote {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string | null;
  lesson_title?: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LearningResource {
  id: string;
  course_id: string;
  module_id?: string | null;
  lesson_id?: string | null;
  title_bn: string;
  title_en: string;
  description_bn: string;
  description_en: string;
  file_name: string;
  file_type: string;
  file_size: string;
  file_content_data?: string; // Stored payload / downloadable stream content
  download_enabled: boolean;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SiteNotification {
  id: string;
  user_id: string;
  title_bn: string;
  title_en: string;
  message_bn: string;
  message_en: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  brand_name: string;
  brand_name_bn: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  instructor_name: string;
  experience_since: string;
  bkash_number: string;
  bkash_type: string;
  payment_instructions_bn: string;
  payment_instructions_en: string;
  logo_url: string;
  instructor_photo_url?: string;
  facebook_page: string;
  facebook_group: string;
  tagline_bn: string;
  tagline_en: string;
}

export interface DatabaseSchema {
  users: User[];
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  enrollments: Enrollment[];
  payments: PaymentRequest[];
  lesson_progress: LessonProgress[];
  lesson_likes: LessonLike[];
  lesson_comments: LessonComment[];
  comment_reports: CommentReport[];
  student_notes: StudentNote[];
  learning_resources: LearningResource[];
  notifications: SiteNotification[];
  settings: SiteSettings;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'itmahfuzur_db.json');

let inMemoryDb: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (inMemoryDb) return inMemoryDb;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(data);
      if (inMemoryDb && inMemoryDb.settings) {
        if (!inMemoryDb.settings.logo_url) {
          inMemoryDb.settings.logo_url = 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793023123/FB_IMG_1792469317535.jpg';
        }
        if (!inMemoryDb.settings.facebook_page) {
          inMemoryDb.settings.facebook_page = 'https://www.facebook.com/share/1G1riLzDqa/';
        }
        if (!inMemoryDb.settings.facebook_group) {
          inMemoryDb.settings.facebook_group = 'https://www.facebook.com/groups/518193848887774/?ref=share&mibextid=NSMWBT';
        }
        if (!inMemoryDb.settings.instructor_photo_url) {
          inMemoryDb.settings.instructor_photo_url = 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793028848/1000030687-removebg-preview.png';
        }
        if (!inMemoryDb.settings.tagline_bn) {
          inMemoryDb.settings.tagline_bn = 'ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা, দক্ষতা উন্নয়নে আপনার বিশ্বস্ত সঙ্গী।';
        }
        if (!inMemoryDb.settings.tagline_en) {
          inMemoryDb.settings.tagline_en = 'ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development.';
        }
      }

      // Guarantee admin user itmahfuzur@gmail.com exists with admin role
      if (inMemoryDb) {
        if (!Array.isArray(inMemoryDb.users)) {
          inMemoryDb.users = [];
        }
        let admin = inMemoryDb.users.find(u => u.email.toLowerCase() === 'itmahfuzur@gmail.com');
        if (!admin) {
          admin = {
            id: 'user_admin_mahdi',
            name: 'Mahfuzur Rahman Mahdi',
            email: 'itmahfuzur@gmail.com',
            passwordHash: bcrypt.hashSync('Password@123', 10),
            role: 'admin',
            phone: '01762-766261',
            bio: 'আইটি ট্রেইনার ও ফাউন্ডার - ITMahfuzur। গ্রাফিক ডিজাইন, এআই ও ডিজিটাল স্কিলস বিশেষজ্ঞ (২০১৮ থেকে)।',
            createdAt: new Date().toISOString(),
          };
          inMemoryDb.users.unshift(admin);
        } else {
          admin.role = 'admin';
          if (!admin.passwordHash || !admin.passwordHash.startsWith('$2')) {
            admin.passwordHash = bcrypt.hashSync('Password@123', 10);
          }
        }
      }

      return inMemoryDb!;
    } catch (err) {
      console.error('Error reading DB, re-initializing seeds', err);
    }
  }

  const initialData = getSeedData();
  saveDb(initialData);
  inMemoryDb = initialData;
  return inMemoryDb;
}

export function getDb(): DatabaseSchema {
  return ensureDbFile();
}

export function saveDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const tempFile = DB_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

function getSeedData(): DatabaseSchema {
  const passwordHash = bcrypt.hashSync('Password@123', 10);
  const now = new Date().toISOString();

  const adminUser: User = {
    id: 'user_admin_mahdi',
    name: 'Mahfuzur Rahman Mahdi',
    email: 'itmahfuzur@gmail.com',
    passwordHash,
    role: 'admin',
    phone: '01762-766261',
    bio: 'আইটি ট্রেইনার ও ফাউন্ডার - ITMahfuzur। গ্রাফিক ডিজাইন, এআই ও ডিজিটাল স্কিলস বিশেষজ্ঞ (২০১৮ থেকে)।',
    createdAt: now,
  };

  const studentUser: User = {
    id: 'user_student_tanvir',
    name: 'Tanvir Ahmed',
    email: 'student@itmahfuzur.com',
    passwordHash,
    role: 'student',
    phone: '01812-345678',
    bio: 'প্রযুক্তিপ্রেমী শিক্ষার্থী ও ডিজিটাল স্কিল লার্নার।',
    createdAt: now,
  };

  const courses: Course[] = [
    {
      id: 'course-ai-mastery',
      title_bn: 'প্রফেশনালদের জন্য আধুনিক AI টুলস ও প্রম্পট ইঞ্জিনিয়ারিং',
      title_en: 'Modern AI Tools & Prompt Engineering for Professionals',
      description_bn: 'ChatGPT, Claude, Gemini, Midjourney সহ আধুনিক এআই টুলস ব্যবহার করে কর্মক্ষেত্রে প্রোডাক্টিভিটি বৃদ্ধি, কনটেন্ট তৈরি, রিসার্চ এবং ফ্রিল্যান্সিং এর সম্পূর্ণ ব্যবহারিক গাইডলাইন।',
      description_en: 'A comprehensive, practical guide to supercharging productivity, content creation, research, and freelancing workflows using ChatGPT, Claude, Gemini, Midjourney, and top AI platforms.',
      category: 'ai-training',
      price: 0,
      isFree: true,
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
      instructor: 'Mahfuzur Rahman Mahdi',
      published: true,
      featured: true,
      level_bn: 'সকল স্তরের জন্য (বিগিনার টু অ্যাডভান্সড)',
      level_en: 'All Levels (Beginner to Advanced)',
      durationHours: 14,
      prerequisites_bn: ['কম্পিউটার ও বেসিক ইন্টারনেট ব্যবহারের জ্ঞান', 'শেখার আগ্রহ ও অধ্যবসায়'],
      prerequisites_en: ['Basic computer and internet knowledge', 'Enthusiasm and dedication to learn'],
      learningObjectives_bn: [
        'AI লার্জ ল্যাঙ্গুয়েজ মডেলের কাজের মূলনীতি ও সঠিক ফ্রেমওয়ার্ক',
        'উন্নত প্রম্পট ইঞ্জিনিয়ারিং টেকনিক্স (Role, Context, Constraint, Few-shot)',
        'কাজের সময় ও শ্রম বাঁচাতে বিভিন্ন AI টুলসের ইন্টিগ্রেশন',
        'সোশ্যাল মিডিয়া, ব্লগ ও ব্যবসায়িক কনটেন্ট জেনারেশন পদ্ধতি'
      ],
      learningObjectives_en: [
        'Core fundamentals and mental models of AI large language models',
        'Advanced prompt engineering techniques (Role, Context, Constraints, Few-shot)',
        'Integrating AI tools into daily workflows to save hours of work',
        'Creating high-converting social media, copywriting, and research content'
      ],
      createdAt: now,
    },
    {
      id: 'course-graphic-design',
      title_bn: 'ব্যবহারিক গ্রাফিক ডিজাইন ও ফ্রিল্যান্সিং ক্যারিয়ার (ফটোশপ ও ইলাস্ট্রেটর)',
      title_en: 'Practical Graphic Design & Freelance Career (Photoshop & Illustrator)',
      description_bn: 'অ্যাডোবি ফটোশপ ও ইলাস্ট্রেটর দিয়ে লোগো, ব্র্যান্ড আইডেন্টিটি, সোশ্যাল মিডিয়া পোস্ট, ব্যানার এবং প্রিন্ট ম্যাটেরিয়াল তৈরির হাতে-কলমে প্র্যাকটিক্যাল ট্রেনিং।',
      description_en: 'Hands-on practical training on Adobe Photoshop and Illustrator for creating professional logos, brand identities, social media creatives, flyers, and client-ready print designs.',
      category: 'graphic-design',
      price: 2500,
      isFree: false,
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
      instructor: 'Mahfuzur Rahman Mahdi',
      published: true,
      featured: true,
      level_bn: 'বিগিনার থেকে প্রফেশনাল',
      level_en: 'Beginner to Professional',
      durationHours: 28,
      prerequisites_bn: ['কম্পিউটার বা ল্যাপটপ', 'গ্রাফিক ডিজাইনের প্রতি গভীর আগ্রহ'],
      prerequisites_en: ['A computer or laptop', 'Passion for creative visual design'],
      learningObjectives_bn: [
        'ডিজাইন থিওরি, কালার সাইকোলজি ও টাইপোগ্রাফির বাস্তব প্রয়োগ',
        'ফটোশপে ফটো ম্যানিপুলেশন, ব্যাকগ্রাউন্ড রিমুভাল ও রিটার্চিং',
        'ইলাস্ট্রেটরে ভেক্টর আর্টওয়ার্ক, ব্র্যান্ড লোগো ও আইকন ডিজাইন',
        'ক্লায়েন্ট প্রজেক্ট হ্যান্ডলিং ও লোকাল-গ্লোবাল মার্কেটপ্লেস গাইডলাইন'
      ],
      learningObjectives_en: [
        'Design fundamentals, color theory, and typography hierarchy',
        'Photo retouching, complex manipulation, and background removal in Photoshop',
        'Vector illustration, custom logo marks, and icon design in Illustrator',
        'Client project presentation and portfolio preparation'
      ],
      createdAt: now,
    },
    {
      id: 'course-digital-marketing',
      title_bn: 'ডিজিটাল মার্কেটিং ফান্ডামেন্টাল ও সোশ্যাল মিডিয়া গ্রোথ স্ট্র্যাটেজি',
      title_en: 'Digital Marketing Fundamentals & Social Media Growth Strategy',
      description_bn: 'ফেসবুক, ইনস্টাগ্রাম, ইউটিউব এবং গুগলে সঠিক টার্গেটিং, পেইড অ্যাড ক্যাম্পেইন সেটআপ ও অর্গানিক ব্র্যান্ড গ্রোথের প্রমাণিত স্ট্র্যাটেজি।',
      description_en: 'Proven strategies for Facebook, Instagram, YouTube, and Google ads campaign setup, audience targeting, analytics, and organic brand authority building.',
      category: 'digital-marketing',
      price: 1800,
      isFree: false,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      instructor: 'Mahfuzur Rahman Mahdi',
      published: true,
      featured: false,
      level_bn: 'বিগিনার থেকে ইন্টারমিডিয়েট',
      level_en: 'Beginner to Intermediate',
      durationHours: 18,
      prerequisites_bn: ['একটি স্মার্টফোন বা কম্পিউটার', 'সোশ্যাল মিডিয়া ব্যবহারের সাধারণ অভিজ্ঞতা'],
      prerequisites_en: ['A smartphone or computer', 'Familiarity with social media platforms'],
      learningObjectives_bn: [
        'টার্গেটেড অডিয়েন্স রিসার্চ ও বায়ার পারসোনা নির্ধারণ',
        'মেটা অ্যাডস ম্যানেজার সেটআপ এবং বাজেট অপ্টিমাইজেশন',
        'অর্গানিক কনটেন্ট প্ল্যানিং ও ক্যালেন্ডার এক্সিকিউশন',
        'ক্যাম্পেইনের রেজাল্ট ও ROI পরিমাপের সঠিক টেকনিক'
      ],
      learningObjectives_en: [
        'Target audience research and buyer persona identification',
        'Meta Ads Manager setup, pixel tracking, and budget scaling',
        'Organic content planning and multi-channel calendar execution',
        'Measuring ROAS and campaign optimization techniques'
      ],
      createdAt: now,
    },
    {
      id: 'course-canva-mastery',
      title_bn: 'ক্যানভা প্রো দিয়ে প্রফেশনাল কনটেন্ট ও দ্রুত ডিজাইন তৈরির কৌশল',
      title_en: 'Professional Content & Rapid Design Creation with Canva Pro',
      description_bn: 'কোনো পূর্ব কোডিং বা জটিল সফটওয়্যার ছাড়াই সহজে সোশ্যাল মিডিয়া পোস্ট, প্রেজেন্টেশন, রিজিউমি, থাম্বনেইল ও ব্র্যান্ড কিট তৈরির সম্পূর্ণ গাইড।',
      description_en: 'Create stunning social media posts, presentations, pitch decks, resumes, YouTube thumbnails, and brand kits quickly with Canva Pro.',
      category: 'tech-skills',
      price: 0,
      isFree: true,
      thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
      instructor: 'Mahfuzur Rahman Mahdi',
      published: true,
      featured: false,
      level_bn: 'একেবারে নতুনদের জন্য',
      level_en: 'Absolute Beginners',
      durationHours: 8,
      prerequisites_bn: ['ইন্টারনেট কানেকশনসহ মোবাইল বা পিসি'],
      prerequisites_en: ['Mobile or PC with internet connection'],
      learningObjectives_bn: [
        'ক্যানভা ইন্টারফেস ও টুলস পরিচিতি',
        'ব্র্যান্ড কিট, ফন্ট ও কালার প্যালেট নির্বাচন',
        'ভিডিও ও মোশন কনটেন্ট তৈরি',
        'প্রিন্ট ও ডিজিটাল ফরম্যাটে ডিজাইন এক্সপোর্ট'
      ],
      learningObjectives_en: [
        'Canva interface layout and key productivity shortcuts',
        'Setting up brand kits, custom fonts, and consistent palettes',
        'Creating engaging video reels and animated posts',
        'Exporting optimal resolutions for web, print, and social'
      ],
      createdAt: now,
    }
  ];

  const modules: CourseModule[] = [
    // Course 1 (AI)
    { id: 'mod-ai-1', course_id: 'course-ai-mastery', title_bn: 'মডিউল ১: আর্টিফিশিয়াল ইন্টেলিজেন্স ও আধুনিক দৃষ্টিভঙ্গি', title_en: 'Module 1: AI Essentials & Mindset', order: 1 },
    { id: 'mod-ai-2', course_id: 'course-ai-mastery', title_bn: 'মডিউল ২: প্রম্পট ইঞ্জিনিয়ারিং এর মূল চাবিকাঠি', title_en: 'Module 2: Core Prompt Engineering Formulas', order: 2 },
    { id: 'mod-ai-3', course_id: 'course-ai-mastery', title_bn: 'মডিউল ৩: বাস্তব প্রজেক্ট ও উৎপাদনশীলতা বৃদ্ধি', title_en: 'Module 3: Real Projects & Productivity', order: 3 },

    // Course 2 (Graphic Design)
    { id: 'mod-gd-1', course_id: 'course-graphic-design', title_bn: 'মডিউল ১: ডিজাইন থিওরি ও সফটওয়্যার সেটআপ', title_en: 'Module 1: Design Theory & Software Setup', order: 1 },
    { id: 'mod-gd-2', course_id: 'course-graphic-design', title_bn: 'মডিউল ২: অ্যাডোবি ফটোশপ মাস্টারক্লাস', title_en: 'Module 2: Adobe Photoshop Masterclass', order: 2 },
    { id: 'mod-gd-3', course_id: 'course-graphic-design', title_bn: 'মডিউল ৩: অ্যাডোবি ইলাস্ট্রেটর ও ভেক্টর ডিজাইন', title_en: 'Module 3: Adobe Illustrator & Vector Design', order: 3 },
    { id: 'mod-gd-4', course_id: 'course-graphic-design', title_bn: 'মডিউল ৪: মার্কেটপ্লেস ও প্রজেক্ট ডেলিভারি', title_en: 'Module 4: Marketplace & Client Delivery', order: 4 },

    // Course 3 (Digital Marketing)
    { id: 'mod-dm-1', course_id: 'course-digital-marketing', title_bn: 'মডিউল ১: ডিজিটাল মার্কেটিং পরিচিতি ও মার্কেট রিসার্চ', title_en: 'Module 1: Digital Marketing Intro & Research', order: 1 },
    { id: 'mod-dm-2', course_id: 'course-digital-marketing', title_bn: 'মডিউল ২: মেটা (ফেসবুক-ইনস্টাগ্রাম) অ্যাডস সেটআপ', title_en: 'Module 2: Meta Ads Setup & Management', order: 2 },

    // Course 4 (Canva)
    { id: 'mod-cn-1', course_id: 'course-canva-mastery', title_bn: 'মডিউল ১: ক্যানভা প্ল্যাটফর্ম পরিচিতি ও বেসিক ডিজাইন', title_en: 'Module 1: Canva Platform & Basic Design', order: 1 },
    { id: 'mod-cn-2', course_id: 'course-canva-mastery', title_bn: 'মডিউল ২: প্রফেশনাল প্রেজেন্টেশন ও সোশ্যাল কনটেন্ট', title_en: 'Module 2: Professional Presentation & Content', order: 2 },
  ];

  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const sampleVideoUrl2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

  const lessons: Lesson[] = [
    // Course 1 (AI)
    {
      id: 'les-ai-101',
      course_id: 'course-ai-mastery',
      module_id: 'mod-ai-1',
      title_bn: 'ক্লাস ০১: AI এর বর্তমান বিপ্লব ও আমাদের ক্যারিয়ার প্রস্তুতি',
      title_en: 'Lesson 01: The AI Revolution and Career Readiness',
      description_bn: 'আর্টিফিশিয়াল ইন্টেলিজেন্স কীভাবে আমাদের দৈনন্দিন কাজ এবং প্রফেশনাল ক্ষেত্রকে বদলে দিচ্ছে এবং কীভাবে আমরা একে ইতিবাচকভাবে কাজে লাগাতে পারি।',
      description_en: 'How AI is fundamentally transforming workplaces and how learners can position themselves with modern skills for high leverage.',
      video_url: sampleVideoUrl,
      durationMinutes: 22,
      order: 1,
      isFreePreview: true,
    },
    {
      id: 'les-ai-102',
      course_id: 'course-ai-mastery',
      module_id: 'mod-ai-1',
      title_bn: 'ক্লাস ০২: শীর্ষ AI টুলস পরিচিতি ও অ্যাকাউন্ট কনফিগারেশন',
      title_en: 'Lesson 02: Overview of Leading AI Tools & Setup',
      description_bn: 'ChatGPT, Claude, Google Gemini এবং Microsoft Copilot এর পার্থক্য ও সঠিক ব্যবহার নির্বাচন।',
      description_en: 'Comparing key features between ChatGPT, Claude, Google Gemini, and choosing the optimal tool for specific jobs.',
      video_url: sampleVideoUrl2,
      durationMinutes: 28,
      order: 2,
      isFreePreview: true,
    },
    {
      id: 'les-ai-201',
      course_id: 'course-ai-mastery',
      module_id: 'mod-ai-2',
      title_bn: 'ক্লাস ০৩: প্রম্পট ইঞ্জিনিয়ারিং এর ৪-ধাপের ফ্রেমওয়ার্ক',
      title_en: 'Lesson 03: The 4-Step Prompt Engineering Framework',
      description_bn: 'ভূমিকা (Persona), প্রেক্ষাপট (Context), নির্দেশনা (Instructions), এবং ফলাফল ফরম্যাট (Output Constraints) দিয়ে নিখুঁত প্রম্পট তৈরি।',
      description_en: 'Crafting bulletproof prompts using Role, Context, Step-by-step Instructions, and Output Formatting constraints.',
      video_url: sampleVideoUrl,
      durationMinutes: 35,
      order: 1,
      isFreePreview: true,
    },
    {
      id: 'les-ai-301',
      course_id: 'course-ai-mastery',
      module_id: 'mod-ai-3',
      title_bn: 'ক্লাস ০৪: প্রজেক্ট ওয়ার্ক - ১ ঘন্টায় পূর্ণাঙ্গ বিজনেস প্রেজেন্টেশন ও কনটেন্ট প্ল্যান',
      title_en: 'Lesson 04: Project Work - 1-Hour Full Business Content Strategy',
      description_bn: 'বাস্তব উদাহরণ সহ এআই ব্যবহার করে একটি নতুন ব্যবসায়িক উদ্যোগের ব্র্যান্ড কনসেপ্ট, মার্কেটিং কপি ও প্রেজেন্টেশন তৈরি।',
      description_en: 'Real hands-on case study: constructing a brand strategy, copy assets, and deck outline within an hour using AI.',
      video_url: sampleVideoUrl2,
      durationMinutes: 42,
      order: 1,
      isFreePreview: true,
    },

    // Course 2 (Graphic Design)
    {
      id: 'les-gd-101',
      course_id: 'course-graphic-design',
      module_id: 'mod-gd-1',
      title_bn: 'ক্লাস ০১: গ্রাফিক ডিজাইনের মৌলিক নীতিমালা ও দৃষ্টি আকর্ষণের রহস্য',
      title_en: 'Lesson 01: Core Principles of Graphic Design & Visual Balance',
      description_bn: 'ব্যালান্স, কন্ট্রাস্ট, অ্যালাইনমেন্ট, প্রোক্সিমিটি এবং স্পেসের সঠিক ব্যবহারের মাধ্যমে চমৎকার ডিজাইন তৈরির গোপন সূত্র।',
      description_en: 'Understanding balance, visual contrast, grid alignment, hierarchy, and white space to build eye-catching graphics.',
      video_url: sampleVideoUrl,
      durationMinutes: 25,
      order: 1,
      isFreePreview: true, // Free preview
    },
    {
      id: 'les-gd-201',
      course_id: 'course-graphic-design',
      module_id: 'mod-gd-2',
      title_bn: 'ক্লাস ০২: ফটোশপ সিলেকশন ও প্রফেশনাল কাটআউট টেকনিক',
      title_en: 'Lesson 02: Photoshop Selection & Precision Cutout Techniques',
      description_bn: 'পেন টুল ও অবজেক্ট সিলেকশন দিয়ে জটিল প্রোডাক্ট ও চুলের নিখুঁত ব্যাকগ্রাউন্ড পরিবর্তন।',
      description_en: 'Mastering the Pen Tool and refinement masks for clean cutouts and background removal.',
      video_url: sampleVideoUrl2,
      durationMinutes: 40,
      order: 1,
      isFreePreview: false, // Paid protected
    },
    {
      id: 'les-gd-202',
      course_id: 'course-graphic-design',
      module_id: 'mod-gd-2',
      title_bn: 'ক্লাস ০৩: সোশ্যাল মিডিয়া পোস্ট ও বিজ্ঞাপন ডিজাইন প্রজেক্ট',
      title_en: 'Lesson 03: High-Converting Social Media Post Design',
      description_bn: 'ফেসবুক ও ইনস্টাগ্রামের জন্য আকর্ষক ই-কমার্স বিজ্ঞাপন তৈরি ও ফটো ম্যানিপুলেশন।',
      description_en: 'Designing high-converting e-commerce product promotion banners with shadows and lighting.',
      video_url: sampleVideoUrl,
      durationMinutes: 45,
      order: 2,
      isFreePreview: false,
    },
    {
      id: 'les-gd-301',
      course_id: 'course-graphic-design',
      module_id: 'mod-gd-3',
      title_bn: 'ক্লাস ০৪: ইলাস্ট্রেটরে মডার্ন ভেক্টর লোগো ডিজাইন',
      title_en: 'Lesson 04: Vector Logo Design in Adobe Illustrator',
      description_bn: 'শেপ বিল্ডার টুল ও গোল্ডেন রেশিও গ্রিড ব্যবহার করে প্রফেশনাল ব্র্যান্ড লোগো ডিজাইন।',
      description_en: 'Using the Shape Builder tool, geometric guides, and typography to build scalable brand logos.',
      video_url: sampleVideoUrl2,
      durationMinutes: 50,
      order: 1,
      isFreePreview: false,
    },

    // Course 3 (Digital Marketing)
    {
      id: 'les-dm-101',
      course_id: 'course-digital-marketing',
      module_id: 'mod-dm-1',
      title_bn: 'ক্লাস ০১: ডিজিটাল মার্কেটিং ইকোসিস্টেম ও মার্কেটিং ফানেল',
      title_en: 'Lesson 01: The Digital Marketing Ecosystem & Sales Funnels',
      description_bn: 'TOFU, MOFU এবং BOFU ফানেল বুঝে সঠিক গ্রাহকের কাছে সঠিক মেসেজ পৌঁছানোর কৌশল।',
      description_en: 'Mapping out customer journeys across awareness, consideration, and conversion phases.',
      video_url: sampleVideoUrl,
      durationMinutes: 30,
      order: 1,
      isFreePreview: true,
    },
    {
      id: 'les-dm-201',
      course_id: 'course-digital-marketing',
      module_id: 'mod-dm-2',
      title_bn: 'ক্লাস ০২: মেটা অ্যাডস ম্যানেজার ও টার্গেটিং স্ট্র্যাটেজি',
      title_en: 'Lesson 02: Meta Ads Manager Setup & Detailed Audience Targeting',
      description_bn: 'কম খরচে বেশি রেজাল্ট পেতে ক্যাম্পেইন অবজেক্টিভ নির্বাচন এবং ডেমোগ্রাফিক টার্গেটিং।',
      description_en: 'Navigating campaign objectives, custom audiences, and budget allocation for optimal ROAS.',
      video_url: sampleVideoUrl2,
      durationMinutes: 48,
      order: 1,
      isFreePreview: false,
    },

    // Course 4 (Canva)
    {
      id: 'les-cn-101',
      course_id: 'course-canva-mastery',
      module_id: 'mod-cn-1',
      title_bn: 'ক্লাস ০১: ক্যানভা ইন্টারফেস ও প্র্যাকটিক্যাল ডিজাইন পরিচিতি',
      title_en: 'Lesson 01: Canva Interface & Practical Design Workflow',
      description_bn: 'ক্যানভার ক্যানভাস সাইজ নির্বাচন, এলিমেন্ট, টেক্সট এবং কালার ব্যবহারের সহজ টেকনিক।',
      description_en: 'Canvas sizing, typography pairings, element alignment, and layer management in Canva.',
      video_url: sampleVideoUrl,
      durationMinutes: 20,
      order: 1,
      isFreePreview: true,
    }
  ];

  // Demo enrollment: Tanvir is enrolled in free AI course
  const enrollments: Enrollment[] = [
    {
      id: 'enr-demo-1',
      user_id: 'user_student_tanvir',
      course_id: 'course-ai-mastery',
      enrolled_at: now,
      status: 'active',
    }
  ];

  const lesson_progress: LessonProgress[] = [
    {
      id: 'prog-1',
      user_id: 'user_student_tanvir',
      course_id: 'course-ai-mastery',
      lesson_id: 'les-ai-101',
      completed: true,
      completed_at: now,
    }
  ];

  const lesson_likes: LessonLike[] = [
    {
      id: 'like-1',
      user_id: 'user_student_tanvir',
      lesson_id: 'les-ai-101',
      created_at: now,
    }
  ];

  const lesson_comments: LessonComment[] = [
    {
      id: 'com-1',
      lesson_id: 'les-ai-101',
      course_id: 'course-ai-mastery',
      user_id: 'user_student_tanvir',
      user_name: 'Tanvir Ahmed',
      user_role: 'student',
      content: 'স্যার, প্রম্পট ইঞ্জিনিয়ারিং এর এই ইন্ট্রোডাকশন ক্লাসটি খুবই স্পষ্ট ও সহজবোধ্য ছিল। ধন্যবাদ!',
      parent_id: null,
      is_reported: false,
      is_hidden: false,
      created_at: now,
    },
    {
      id: 'com-2',
      lesson_id: 'les-ai-101',
      course_id: 'course-ai-mastery',
      user_id: 'user_admin_mahdi',
      user_name: 'Mahfuzur Rahman Mahdi',
      user_role: 'admin',
      content: 'অনেক ধন্যবাদ তানভীর! পরবর্তী ক্লাসগুলোতে আমরা প্র্যাকটিক্যাল হ্যান্ডস-অন প্রম্পট প্রজেক্ট নিয়ে কাজ করব।',
      parent_id: 'com-1',
      is_reported: false,
      is_hidden: false,
      created_at: now,
    }
  ];

  const student_notes: StudentNote[] = [
    {
      id: 'note-1',
      user_id: 'user_student_tanvir',
      course_id: 'course-ai-mastery',
      lesson_id: 'les-ai-101',
      lesson_title: 'ক্লাস ০১: AI এর বর্তমান বিপ্লব ও আমাদের ক্যারিয়ার প্রস্তুতি',
      title: 'প্রম্পট ইঞ্জিনিয়ারিং এর মূল চাবিকাঠি নোট',
      content: '১. প্রম্পট লেখার সময় রোল বা ভূমিকা নির্দিষ্ট করা জরুরি।\n২. কনটেক্সট বা ব্যাকগ্রাউন্ড ইনফরমেশন দিতে হবে।\n৩. কী করা যাবে এবং কী করা যাবে না (Constraints) স্পষ্টভাবে লিখতে হবে।',
      created_at: now,
      updated_at: now,
    }
  ];

  const learning_resources: LearningResource[] = [
    {
      id: 'res-1',
      course_id: 'course-ai-mastery',
      module_id: 'mod-ai-1',
      lesson_id: 'les-ai-101',
      title_bn: 'এআই প্রম্পট ফ্রেমওয়ার্ক চিটশিট (PDF)',
      title_en: 'AI Prompt Framework Cheat Sheet (PDF)',
      description_bn: 'দৈনন্দিন কাজের জন্য প্রম্পট স্ট্রাকচার এবং উদাহরণ সমৃদ্ধ অফিসিয়াল হ্যান্ডআউট।',
      description_en: 'Official printable cheat sheet with step-by-step prompt templates and real-world examples.',
      file_name: 'ITMahfuzur_Prompt_Engineering_Cheatsheet.pdf',
      file_type: 'application/pdf',
      file_size: '2.4 MB',
      file_content_data: 'ITMahfuzur Official Learning Resource: Prompt Engineering Best Practices & Formula Guide by Mahfuzur Rahman Mahdi.',
      download_enabled: true,
      is_published: true,
      created_by: 'Mahfuzur Rahman Mahdi',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'res-2',
      course_id: 'course-graphic-design',
      module_id: 'mod-gd-1',
      lesson_id: 'les-gd-101',
      title_bn: 'ডিজাইন থিওরি ও কালার প্যালেট গাইডলাইন (PDF)',
      title_en: 'Design Theory & Color Palette Guide (PDF)',
      description_bn: 'প্রফেশনাল গ্রাফিক ডিজাইনের জন্য কালার কম্বিনেশন এবং গোল্ডেন রেশিও নিয়ম।',
      description_en: 'Comprehensive visual reference for color harmonies, contrast ratios, and grid alignments.',
      file_name: 'ITMahfuzur_Design_Theory_Guide.pdf',
      file_type: 'application/pdf',
      file_size: '4.1 MB',
      file_content_data: 'ITMahfuzur Official Learning Resource: Graphic Design Foundations and Color Harmony Manual.',
      download_enabled: true,
      is_published: true,
      created_by: 'Mahfuzur Rahman Mahdi',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'res-3',
      course_id: 'course-graphic-design',
      module_id: 'mod-gd-2',
      lesson_id: 'les-gd-202',
      title_bn: 'সোশ্যাল মিডিয়া বিজ্ঞাপন প্র্যাকটিস পিএসডি ফাইল (ZIP)',
      title_en: 'Social Media Ad Practice PSD Assets (ZIP)',
      description_bn: 'ক্লাসে ব্যবহৃত ব্যাকগ্রাউন্ড, পিএনজি এলিমেন্ট এবং ফন্ট লিঙ্ক সমৃদ্ধ প্র্যাকটিস কিট।',
      description_en: 'Complete practice project kit containing layered PSD templates, textures, and assets.',
      file_name: 'ITMahfuzur_Ad_Practice_Kit.zip',
      file_type: 'application/zip',
      file_size: '18.5 MB',
      file_content_data: 'ITMahfuzur Resource Archive: Raw editable assets for practicing social media advertising creatives.',
      download_enabled: true,
      is_published: true,
      created_by: 'Mahfuzur Rahman Mahdi',
      created_at: now,
      updated_at: now,
    }
  ];

  const payments: PaymentRequest[] = [
    {
      id: 'pay-demo-1',
      user_id: 'user_student_tanvir',
      user_email: 'student@itmahfuzur.com',
      user_name: 'Tanvir Ahmed',
      course_id: 'course-graphic-design',
      course_title_bn: 'ব্যবহারিক গ্রাফিক ডিজাইন ও ফ্রিল্যান্সিং ক্যারিয়ার (ফটোশপ ও ইলাস্ট্রেটর)',
      course_title_en: 'Practical Graphic Design & Freelance Career (Photoshop & Illustrator)',
      amount: 2500,
      bkash_sender_number: '01812-345678',
      transaction_id: 'BK9A72L0X1',
      status: 'pending',
      admin_note: '',
      created_at: now,
    }
  ];

  const notifications: SiteNotification[] = [
    {
      id: 'notif-1',
      user_id: 'user_student_tanvir',
      title_bn: 'স্বাগতম ITMahfuzur এ!',
      title_en: 'Welcome to ITMahfuzur!',
      message_bn: 'আপনার অ্যাকাউন্টটি সফলভাবে সক্রিয় হয়েছে। যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।',
      message_en: 'Your account is ready. Explore our practical courses to start learning modern IT skills.',
      read: false,
      link: '/dashboard',
      created_at: now,
    }
  ];

  const settings: SiteSettings = {
    id: 'main',
    brand_name: 'ITMahfuzur',
    brand_name_bn: 'আইটি মাহফুজুর',
    phone: '01762-766261',
    email: 'itmahfuzur@gmail.com',
    whatsapp_number: '+8801762766261',
    instructor_name: 'Mahfuzur Rahman Mahdi',
    experience_since: '2018',
    bkash_number: '01762-766261',
    bkash_type: 'Personal / পার্সোনাল',
    payment_instructions_bn: '১. আপনার bKash অ্যাপ ওপেন করুন অথবা *247# ডায়াল করুন।\n২. Send Money (পার্সোনাল) অপশন বেছে নিন।\n৩. প্রাপক নম্বর হিসেবে লিখুন: 01762-766261\n৪. কোর্সের জন্য উল্লেখিত সঠিক টাকার পরিমাণ লিখুন।\n৫. রেফারেন্সে আপনার নাম বা কোর্সের নাম লিখতে পারেন।\n৬. সেন্ড মানি সফল হলে প্রাপ্ত Transaction ID (TrxID) এবং যে bKash নম্বর থেকে পাঠিয়েছেন তা সংরক্ষণ করুন।\n৭. নিচের ফর্মে TrxID ও নম্বর সঠিকভাবে পূরণ করে সাবমিট করুন।\n৮. অ্যাডমিন কর্তৃক যাচাই করার পর আপনার কোর্সে অ্যাক্সেস দেওয়া হবে।',
    payment_instructions_en: '1. Open your bKash app or dial *247#.\n2. Select "Send Money" (Personal).\n3. Enter recipient number: 01762-766261.\n4. Enter the exact course fee amount.\n5. You may write your name as reference.\n6. Keep note of the Transaction ID (TrxID) and the sender bKash number.\n7. Fill in the transaction ID and sender number in the payment form below and submit.\n8. Once the admin manually verifies your transaction, access will be granted immediately.',
    logo_url: 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793023123/FB_IMG_1792469317535.jpg',
    facebook_page: 'https://www.facebook.com/share/1G1riLzDqa/',
    facebook_group: 'https://www.facebook.com/groups/518193848887774/?ref=share&mibextid=NSMWBT',
    tagline_bn: 'ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা, দক্ষতা উন্নয়নে আপনার বিশ্বস্ত সঙ্গী।',
    tagline_en: 'ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development.'
  };

  return {
    users: [adminUser, studentUser],
    courses,
    modules,
    lessons,
    enrollments,
    payments,
    lesson_progress,
    lesson_likes,
    lesson_comments,
    comment_reports: [],
    student_notes,
    learning_resources,
    notifications,
    settings,
  };
}
