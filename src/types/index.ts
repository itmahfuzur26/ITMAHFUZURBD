export type Language = 'bn' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  phone?: string;
  bio?: string;
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
  lessonCount?: number;
  hasAccess?: boolean;
  progressPercentage?: number;
  totalLessons?: number;
  completedLessonsCount?: number;
  nextLessonId?: string;
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
  durationMinutes: number;
  order: number;
  isFreePreview: boolean;
  locked?: boolean;
  streamUrl?: string;
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
  download_enabled: boolean;
  is_published?: boolean;
  canDownload?: boolean;
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
  instructor_bio_bn?: string;
  instructor_bio_en?: string;
}
