import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PaymentRequest } from '../types';
import { CreditCard, Clock, CheckCircle2, XCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface PaymentHistoryPageProps {
  navigate: (path: string) => void;
}

export const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { fetchWithAuth } = useAuth();

  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/student/payments')
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-950/60 border border-pink-800/40 text-pink-400 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t('navPaymentHistory')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {language === 'bn' ? 'bKash পেমেন্ট হিস্ট্রি ও অনুমোদন স্ট্যাটাস' : 'bKash Payment Submissions & Status'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'আপনার সাবমিটকৃত ট্রানজাকশন আইডি এবং অ্যাডমিন যাচাইকরণের বর্তমান অবস্থা'
              : 'Track the status of your submitted manual bKash transactions and admin approvals'}
          </p>
        </div>

        {loading ? (
          <div className="h-48 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
        ) : payments.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {language === 'bn' ? 'কোনো পেমেন্ট হিস্ট্রি নেই' : 'No payment records found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'পেইড কোর্সে ভর্তি হওয়ার জন্য bKash এ ফি পাঠিয়ে ট্রানজাকশন আইডি সাবমিট করুন।'
                : 'When you submit a bKash payment for a paid course, your verification status will show here.'}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              {t('btnExploreCourses')}
            </button>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">{language === 'bn' ? 'কোর্সের নাম' : 'Course'}</th>
                    <th className="px-6 py-4">{language === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</th>
                    <th className="px-6 py-4">TrxID / {language === 'bn' ? 'প্রেরক নম্বর' : 'Sender'}</th>
                    <th className="px-6 py-4">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="px-6 py-4">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-6 py-4">{language === 'bn' ? 'অ্যাকশন / মন্তব্য' : 'Action / Note'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {payments.map(p => {
                    const isApproved = p.status === 'approved';
                    const isPending = p.status === 'pending';
                    const isRejected = p.status === 'rejected';

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 font-semibold text-white">
                          {language === 'bn' ? p.course_title_bn : p.course_title_en}
                        </td>
                        <td className="px-6 py-4 font-bold text-cyan-400">
                          ৳{p.amount.toLocaleString()} BDT
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          <span className="text-pink-400 font-bold">{p.transaction_id}</span>
                          <span className="block text-[11px] text-slate-400">{p.bkash_sender_number}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'অপেক্ষমাণ' : 'Pending Verification'}</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'বাতিল' : 'Rejected'}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {isApproved ? (
                            <button
                              onClick={() => navigate(`/courses/${p.course_id}/learn`)}
                              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center gap-1"
                            >
                              <span>{language === 'bn' ? 'ক্লাস শুরু করুন' : 'Start Learning'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">
                              {p.admin_note || (isPending ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : '-')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
