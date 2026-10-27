import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, FileText, RefreshCw, Mail, Phone } from 'lucide-react';

interface PolicyPageProps {
  type: 'privacy' | 'terms' | 'refund';
  navigate: (path: string) => void;
}

export const PolicyPages: React.FC<PolicyPageProps> = ({ type, navigate }) => {
  const { language, t } = useLanguage();

  if (type === 'privacy') {
    return (
      <div className="min-h-screen text-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security & Privacy</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {language === 'bn' ? 'গোপনীয়তা নীতিমালা (Privacy Policy)' : 'Privacy Policy'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">ITMahfuzur • Last updated: 2026</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? '১. সংগৃহীত তথ্যাবলী' : '1. Information We Collect'}
              </h2>
              <p>
                {language === 'bn'
                  ? 'ITMahfuzur প্ল্যাটফর্মে অ্যাকাউন্ট তৈরির সময় আপনার নাম, ইমেইল এবং মোবাইল নম্বর সংগ্রহ করা হয়। পেইড কোর্সের ক্ষেত্রে প্রেরক নম্বর এবং bKash Transaction ID সংগ্রহ করা হয় শুধুমাত্র ভেরিফিকেশনের জন্য।'
                  : 'We collect your name, email address, and optional phone number during registration. For paid courses, sender mobile numbers and bKash Transaction IDs are collected solely for authorization and accounting verification.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? '২. ব্যক্তিগত নোটের সম্পূর্ণ গোপনীয়তা' : '2. Complete Privacy of Student Notes'}
              </h2>
              <p>
                {language === 'bn'
                  ? 'শিক্ষার্থীরা ক্লাস করার সময় যে সকল ব্যক্তিগত নোট লিখেন তা সম্পূর্ণ এনক্রিপ্টেড এবং কেবল সেই শিক্ষার্থীর নিজস্ব অ্যাকাউন্টে সুরক্ষিত থাকে। কোনো সাধারণ শিক্ষার্থী বা অননুমোদিত ব্যক্তি অন্য কারও নোট দেখতে পারেন না।'
                  : 'Student notes taken during courses are strictly private to the student account. No other learner or third party has access to your private study notes.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? '৩. তথ্যের নিরাপত্তা ও সুরক্ষানীতি' : '3. Security of Data'}
              </h2>
              <p>
                {language === 'bn'
                  ? 'আমরা কখনোই কোনো তৃতীয় পক্ষের কাছে শিক্ষার্থীদের ব্যক্তিগত তথ্য বা ফোন নম্বর বিক্রি বা অপব্যবহার করি না। পাসওয়ার্ড শক্তিশালী অ্যালগরিদমের মাধ্যমে হ্যাশ করে সংরক্ষিত হয়।'
                  : 'We never sell, trade, or distribute student data or mobile numbers to third parties. Passwords are securely hashed with industry-standard cryptographic algorithms.'}
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-slate-800">
              <h2 className="text-base font-bold text-white">
                {language === 'bn' ? 'যোগাযোগ' : 'Contact Support'}
              </h2>
              <p>Email: itmahfuzur@gmail.com | Phone: 01762-766261</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'terms') {
    return (
      <div className="min-h-screen text-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {language === 'bn' ? 'শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">ITMahfuzur • Last updated: 2026</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? '১. কোর্স কনটেন্টের মালিকানা ও কপিরাইট' : '1. Intellectual Property & Copyright'}
              </h2>
              <p>
                {language === 'bn'
                  ? 'ITMahfuzur প্ল্যাটফর্মের সকল কোর্স ভিডিও, লেকচার, চিত্র এবং শিখন উপাদান মাহফুজুর রহমান মাহদীর মেধা সম্পত্তি। কোনো অননুমোদিত ডাউনলোড, পুনঃবিক্রয় বা পাইরেসি কঠোরভাবে নিষিদ্ধ।'
                  : 'All video lectures, graphics, prompts, and instructional materials on ITMahfuzur are the proprietary intellectual property of Mahfuzur Rahman Mahdi. Unauthorized redistribution, copying, or public reproduction is strictly prohibited.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? '২. অ্যাকাউন্ট ব্যবহার নীতি' : '2. Account Usage'}
              </h2>
              <p>
                {language === 'bn'
                  ? 'প্রতিটি অ্যাকাউন্ট একক শিক্ষার্থীর ব্যক্তিগত ব্যবহারের জন্য। অন্য কারও সাথে অ্যাকাউন্ট বা লগইন তথ্য শেয়ার করা নিষিদ্ধ।'
                  : 'Each student account is for individual personal use. Sharing credentials or facilitating multi-user access on a single license violates our terms.'}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">
                {language === 'bn' ? '৩. আলোচনা ও ফোরাম আচরণবিধি' : '3. Forum & Discussion Code of Conduct'}
              </h2>
              <p>
                {language === 'bn'
                  ? 'ক্লাসের আলোচনা ও কমেন্ট সেকশনে শালীনতা বজায় রাখতে হবে। কোনো ধরনের স্প্যামিং, অশালীন মন্তব্য বা অপ্রাসঙ্গিক প্রচারণা সরাসরি মুছে দেওয়া হবে এবং প্রয়োজনে অ্যাকাউন্ট স্থগিত করা হবে।'
                  : 'Students must maintain professional and respectful communication in all discussion and comment threads. Abusive or promotional comments will be moderated immediately.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Refund Policy
  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-950/60 border border-pink-800/40 text-pink-400 text-xs font-semibold mb-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Payments & Refunds</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {language === 'bn' ? 'পেমেন্ট ও রিফান্ড নীতিমালা' : 'Payment and Refund Policy'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">ITMahfuzur • Last updated: 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              {language === 'bn' ? '১. ম্যানুয়াল bKash পেমেন্ট পদ্ধতি' : '1. Manual bKash Payment Process'}
            </h2>
            <p>
              {language === 'bn'
                ? 'ITMahfuzur এ পেইড কোর্সে ভর্তির জন্য ম্যানুয়াল bKash Send Money পদ্ধতি কার্যকর। শিক্ষার্থী সঠিক bKash নম্বরে ফি প্রদান করে TrxID সাবমিট করবেন। অ্যাডমিন কর্তৃক যাচাই সম্পন্ন হওয়ার পরই কোর্সে সম্পূর্ণ অ্যাক্সেস কার্যকর হবে।'
                : 'Enrollment in paid courses operates via manual bKash Send Money. Learners send the exact course fee and submit their Transaction ID and sender number. Course access is released upon verified administrator review.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              {language === 'bn' ? '২. রিফান্ড নীতিমালা' : '2. Refund Policy'}
            </h2>
            <p>
              {language === 'bn'
                ? 'যেহেতু কোর্সগুলো তাৎক্ষণিক ডিজিটাল অ্যাক্সেস এবং ডাউনলোডযোগ্য রিসোর্স প্রদান করে, তাই কোর্স অ্যাক্সেস সক্রিয় হওয়ার পর সাধারণত রিফান্ড প্রযোজ্য নয়। তবে কোনো প্রযুক্তিগত জটিলতা বা ভুল লেনদেনের ক্ষেত্রে ২৪ ঘণ্টার মধ্যে সাপোর্টে যোগাযোগ করলে বিষয়টি বিবেচনা করা হবে।'
                : 'Because digital courses provide immediate access and downloadable learning materials, payments are generally non-refundable once approved. If duplicate payments occur, please contact support within 24 hours for prompt resolution.'}
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">
              {language === 'bn' ? 'পেমেন্ট সহায়তা' : 'Payment Support'}
            </h2>
            <p>bKash Support: 01762-766261 | WhatsApp: +8801762766261</p>
          </section>
        </div>
      </div>
    </div>
  );
};
