import { Course, SiteSettings } from '../types';

export const FALLBACK_SETTINGS: SiteSettings = {
  id: 'site_settings_main',
  brand_name: 'ITMahfuzur',
  brand_name_bn: 'আইটি মাহফুজুর',
  phone: '01762-766261',
  email: 'itmahfuzur@gmail.com',
  whatsapp_number: '01762-766261',
  instructor_name: 'Mahfuzur Rahman Mahdi',
  experience_since: '2018',
  instructor_photo_url: 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793028848/1000030687-removebg-preview.png',
  logo_url: 'https://res.cloudinary.com/ru3hghyn/image/upload/v1793023123/FB_IMG_1792469317535.jpg',
  bkash_number: '01762-766261',
  bkash_type: 'Personal (পার্সোনাল)',
  facebook_page: 'https://www.facebook.com/share/1G1riLzDqa/',
  facebook_group: 'https://www.facebook.com/groups/518193848887774/?ref=share&mibextid=NSMWBT',
  tagline_bn: 'ITMahfuzur — অভিজ্ঞতার আলোকে প্রযুক্তি শিক্ষা, দক্ষতা উন্নয়নে আপনার বিশ্বস্ত সঙ্গী।',
  tagline_en: 'ITMahfuzur — Technology Education Built on Experience, Your Partner in Skill Development.',
  full_course_price: 5000,
  full_course_discount_price: 3500,
  bundle_offer_enabled: true,
  bundle_title_bn: 'ফুল কোর্স অল-ইন-ওয়ান স্পেশাল প্যাক (সব কোর্স একসাথে)',
  bundle_title_en: 'All-in-One Full Course Master Bundle (All Courses Included)',
  payment_instructions_bn: '১. আপনার বিকাশ অ্যাপ অথবা *২৪৭# ডায়াল করে Send Money অপশনে যান।\n২. উপরের পার্সোনাল বিকাশ নম্বরে নির্ধারিত কোর্স ফি পাঠান।\n৩. সফলভাবে টাকা পাঠানোর পর প্রাপ্ত ১০ সংখ্যার Transaction ID (TrxID) এবং প্রেরক নম্বর নিচে লিখে সাবমিট করুন।\n৪. দ্রুত যাচাই করতে সরাসরি আমাদের হোয়াটসঅ্যাপ নম্বরে TrxID মেসেজ দিন।',
  payment_instructions_en: '1. Open your bKash App or dial *247# and choose Send Money.\n2. Send the exact course fee to the personal bKash number.\n3. Enter your sender phone number and TrxID in the form.\n4. For express activation, share your TrxID on WhatsApp.'
};

export const FALLBACK_COURSES: Course[] = [
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
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'course-graphic-design',
    title_bn: 'প্রফেশনাল গ্রাফিক ডিজাইন ও ব্র্যান্ডিং মাস্টারক্লাস',
    title_en: 'Professional Graphic Design & Visual Identity Masterclass',
    description_bn: 'Adobe Photoshop, Illustrator ও আধুনিক ভেক্টর ডিজাইন টেকনিক্স শিখে আন্তর্জাতিক মানসম্পন্ন লোগো, সোশ্যাল মিডিয়া ব্যানার, ব্রোশার এবং পূর্ণাঙ্গ ভিজ্যুয়াল ব্র্যান্ড আইডেন্টিটি তৈরির প্রশিক্ষণ।',
    description_en: 'Comprehensive design training covering Photoshop, Illustrator, vector design principles, typography, brand identity, and high-impact commercial marketing graphics.',
    category: 'graphic-design',
    price: 1500,
    isFree: false,
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Mahfuzur Rahman Mahdi',
    published: true,
    featured: true,
    level_bn: 'বিগিনার টু ইন্টারমিডিয়েট',
    level_en: 'Beginner to Intermediate',
    durationHours: 28,
    prerequisites_bn: ['গ্রাফিক ডিজাইনের প্রতি গভীর আগ্রহ', 'বেসিক কম্পিউটার ব্যবহারের দক্ষতা'],
    prerequisites_en: ['Passion for visual creativity', 'Basic computer literacy'],
    learningObjectives_bn: [
      'ডিজাইন থিওরি, কালার সাইকোলজি ও টাইপোগ্রাফির সঠিক প্রয়োগ',
      'Adobe Photoshop দিয়ে ইমেজ রিটাচিং ও ফটো ম্যানিপুলেশন',
      'Adobe Illustrator দিয়ে স্কেলেবল লোগো ও ভেক্টর ইলাস্ট্রেশন',
      'সোশ্যাল মিডিয়া ব্যানার ও কমার্শিয়াল প্রিন্ট ডিজাইন তৈরি'
    ],
    learningObjectives_en: [
      'Design fundamentals, color theory, grid systems, and typography',
      'Advanced photo manipulation and retouching in Adobe Photoshop',
      'Logo design, vector art, and brand identity in Adobe Illustrator',
      'Preparing print-ready and social media-optimized commercial creatives'
    ],
    createdAt: '2026-01-20T00:00:00.000Z'
  },
  {
    id: 'course-digital-marketing',
    title_bn: 'ডিজিটাল মার্কেটিং ও ফেসবুক পেইড ক্যাম্পেইন স্ট্র্যাটেজি',
    title_en: 'Digital Marketing & Facebook Paid Ads Strategy',
    description_bn: 'সোশ্যাল মিডিয়া মার্কেটিং, মেটা বিজনেস স্যুট, টার্গেটেড ফেসবুক অ্যাডস সেটআপ, ফানেল স্ট্র্যাটেজি ও রিমার্কেটিংয়ের মাধ্যমে ব্যবসা ও পণ্যের বিক্রি বহুগুণ বাড়ানোর প্রমাণিত কৌশল।',
    description_en: 'Learn actionable performance marketing, Meta Business Suite, high-ROI Facebook ad campaigns, audience targeting, funnels, and conversion optimization.',
    category: 'digital-marketing',
    price: 1200,
    isFree: false,
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Mahfuzur Rahman Mahdi',
    published: true,
    featured: false,
    level_bn: 'সকল স্তরের শিক্ষার্থীদের জন্য',
    level_en: 'All Levels',
    durationHours: 20,
    prerequisites_bn: ['একটি সক্রিয় ফেসবুক একাউন্ট', 'ইন্টারনেট ব্রাউজিং ও বেসিক ব্যবসা ধারণা'],
    prerequisites_en: ['Active Facebook account', 'Basic internet literacy'],
    learningObjectives_bn: [
      'সঠিক অডিয়েন্স রিসার্চ ও বায়ার পারসোনা তৈরির পদ্ধতি',
      'হাই কনভার্টিং অ্যাড কপিরাইটিং ও ক্রিয়েটিভ নির্বাচন',
      'মেটা অ্যাডস ম্যানেজার ও পিক্সেল/CAPI সেটআপ',
      'বাজেট অপ্টিমাইজেশন ও আরওআই (ROI) অ্যানালাইসিস'
    ],
    learningObjectives_en: [
      'Audience research and buyer persona segmentation',
      'Writing compelling direct-response ad copy',
      'Setting up Meta Pixel, custom conversions, and Ads Manager campaigns',
      'Scaling winning ad sets and maximizing Return on Ad Spend (ROAS)'
    ],
    createdAt: '2026-02-01T00:00:00.000Z'
  },
  {
    id: 'course-canva-mastery',
    title_bn: 'ক্যানভা দিয়ে কুইক কন্টেন্ট ডিজাইন ও ফ্রিল্যান্সিং',
    title_en: 'Canva Quick Content Design & Freelancing Fast-Track',
    description_bn: 'সহজে এবং দ্রুত প্রফেশনাল সোশ্যাল মিডিয়া পোস্ট, থাম্বনেইল, প্রেজেন্টেশন ও ডিজিটাল প্রোডাক্ট তৈরি করে ফাইভার ও লোকাল মার্কেটে উপার্জনের সহজতম উপায়।',
    description_en: 'Master Canva Pro to create stunning social media posts, YouTube thumbnails, client presentations, and marketable digital templates efficiently.',
    category: 'tech-skills',
    price: 800,
    isFree: false,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Mahfuzur Rahman Mahdi',
    published: true,
    featured: false,
    level_bn: 'একদম নতুনদের জন্য (Zero to Hero)',
    level_en: 'Absolute Beginners (Zero to Hero)',
    durationHours: 10,
    prerequisites_bn: ['একটি স্মার্টফোন অথবা কম্পিউটার', 'ইন্টারনেট কানেকশন'],
    prerequisites_en: ['Smartphone or computer with internet access', 'No prior experience needed'],
    learningObjectives_bn: [
      'ক্যানভার সমস্ত প্রো টুলস ও ফিচারের সহজ ব্যবহার',
      'আকর্ষণীয় ইউটিউব থাম্বনেইল ও ফেসবুক পোস্ট তৈরি',
      'ডিজিটাল ই-বুক, কারোসেল এবং প্রেজেন্টেশন ডিজাইন',
      'ডিজাইন সার্ভিস দিয়ে ক্লায়েন্ট হ্যান্ডলিং ও ফ্রিল্যান্সিং কৌশল'
    ],
    learningObjectives_en: [
      'Full mastery of Canva tools, grids, and brand kits',
      'Creating high-CTR YouTube thumbnails and viral social creatives',
      'Designing client presentations, digital planners, and lead magnets',
      'Monetizing Canva design skills for domestic and global clients'
    ],
    createdAt: '2026-02-10T00:00:00.000Z'
  }
];
