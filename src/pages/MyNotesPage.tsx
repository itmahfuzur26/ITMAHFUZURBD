import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StudentNote } from '../types';
import { Search, FileText, Trash2, Edit2, Plus, ArrowRight, ExternalLink } from 'lucide-react';

interface MyNotesPageProps {
  navigate: (path: string) => void;
}

export const MyNotesPage: React.FC<MyNotesPageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { fetchWithAuth } = useAuth();

  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, [searchQuery]);

  const loadNotes = () => {
    setLoading(true);
    const url = searchQuery.trim()
      ? `/api/student/notes?search=${encodeURIComponent(searchQuery.trim())}`
      : '/api/student/notes';

    fetchWithAuth(url)
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpdate = async (noteId: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      const res = await fetchWithAuth(`/api/student/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        loadNotes();
      }
    } catch {
      // error
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই নোটটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this note?')) return;
    try {
      const res = await fetchWithAuth(`/api/student/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadNotes();
      }
    } catch {
      // error
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>{t('navMyNotes')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {t('notesHeading')}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('notesSubheading')}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'নোট অনুসন্ধান করুন...' : 'Search notes...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">{t('noNotesFound')}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'ক্লাস দেখার সময় যেকোনো তথ্য সহজে লিখে রাখুন, এটি সম্পূর্ণ আপনার ব্যক্তিগত।'
                : 'Write notes while watching course lessons; they remain completely private to you.'}
            </p>
            <button
              onClick={() => navigate('/my-courses')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              {language === 'bn' ? 'কোর্সে প্রবেশ করুন' : 'Go to My Courses'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <div
                key={note.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-white line-clamp-1">{note.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditTitle(note.title);
                          setEditContent(note.content);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-400 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <textarea
                        rows={4}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-xs text-slate-400"
                        >
                          {t('btnCancel')}
                        </button>
                        <button
                          onClick={() => handleUpdate(note.id)}
                          className="px-3 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
                        >
                          {t('btnSave')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-6">
                      {note.content}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                  {note.lesson_id ? (
                    <button
                      onClick={() => navigate(`/courses/${note.course_id}/learn?lesson=${note.lesson_id}`)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{language === 'bn' ? 'ক্লাসে যান' : 'Go to Lesson'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/courses/${note.course_id}`)}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{language === 'bn' ? 'কোর্সে যান' : 'Go to Course'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
