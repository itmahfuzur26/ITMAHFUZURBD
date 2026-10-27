import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LearningResource } from '../types';
import { FolderDown, Download, FileText, CheckCircle, Lock, ArrowRight } from 'lucide-react';

interface LearningResourcesPageProps {
  navigate: (path: string) => void;
}

export const LearningResourcesPage: React.FC<LearningResourcesPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { fetchWithAuth } = useAuth();

  const [resources, setResources] = useState<(LearningResource & { course_title_bn?: string; course_title_en?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load student's enrolled courses, then gather all resources
    fetchWithAuth('/api/student/dashboard')
      .then(res => res.json())
      .then(async data => {
        const enrolledCourses = data.myCourses || [];
        const allRes: any[] = [];

        for (const course of enrolledCourses) {
          try {
            const rRes = await fetchWithAuth(`/api/courses/${course.id}/resources`);
            if (rRes.ok) {
              const resList = await rRes.json();
              resList.forEach((r: any) => {
                allRes.push({
                  ...r,
                  course_title_bn: course.title_bn,
                  course_title_en: course.title_en,
                });
              });
            }
          } catch {
            // ignore
          }
        }
        setResources(allRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (resourceId: string, fileName: string) => {
    try {
      const res = await fetchWithAuth(`/api/resources/${resourceId}/download`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to download file');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Network error downloading file');
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-2">
            <FolderDown className="w-3.5 h-3.5" />
            <span>{t('navResources')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {language === 'bn' ? 'ডাউনলোডযোগ্য লার্নিং রিসোর্স ও ফাইলস' : 'Downloadable Educational Resources'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'আপনার এনরোল করা কোর্সের ক্লাস নোট, চিটশিট, অনুশীলন ফাইল এবং হ্যান্ডআউটস'
              : 'Class handouts, prompt templates, practice files, and project assets from your enrolled courses'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <FolderDown className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {language === 'bn' ? 'কোনো রিসোর্স পাওয়া যায়নি' : 'No downloadable resources found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'আপনার এনরোল করা কোর্সগুলোতে যুক্ত রিসোর্সগুলো এখানে দেখা যাবে।'
                : 'Educational files associated with your authorized courses will appear here.'}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              {t('btnExploreCourses')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(res => (
              <div
                key={res.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40">
                      {res.file_type.includes('pdf') ? 'PDF' : 'ARCHIVE / FILE'}
                    </span>
                    <span className="text-xs text-slate-500">{res.file_size}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {language === 'bn' ? res.title_bn : res.title_en}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {language === 'bn' ? res.description_bn : res.description_en}
                  </p>

                  <p className="text-[11px] text-slate-500 font-medium">
                    {language === 'bn' ? res.course_title_bn : res.course_title_en}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                    {res.file_name}
                  </span>
                  <button
                    onClick={() => handleDownload(res.id, res.file_name)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('btnDownload')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
