import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Lesson, CourseModule, StudentNote, LearningResource, LessonComment } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  FileText,
  FolderDown,
  ArrowLeft,
  ArrowRight,
  Lock,
  Download,
  Trash2,
  Edit2,
  Send,
  Flag,
  Share2,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface LessonLearnPageProps {
  courseId: string;
  initialLessonId?: string;
  navigate: (path: string) => void;
}

export const LessonLearnPage: React.FC<LessonLearnPageProps> = ({
  courseId,
  initialLessonId,
  navigate,
}) => {
  const { language, t } = useLanguage();
  const { user, isLoggedIn, fetchWithAuth } = useAuth();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId || null);
  const [courseTitle, setCourseTitle] = useState<{ bn: string; en: string }>({ bn: '', en: '' });
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'notes' | 'resources'>('overview');

  // Video Player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Comments state
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Notes state
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');

  // Resources state
  const [resources, setResources] = useState<LearningResource[]>([]);

  // Initial Course Load
  useEffect(() => {
    fetchWithAuth(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.course) {
          setCourseTitle({ bn: data.course.title_bn, en: data.course.title_en });
          setModules(data.modules || []);
          setLessons(data.lessons || []);

          if (!activeLessonId && data.lessons?.length > 0) {
            setActiveLessonId(data.lessons[0].id);
          }
        }
      })
      .catch(() => {});
  }, [courseId]);

  // Load active lesson details
  useEffect(() => {
    if (!activeLessonId) return;

    setLoading(true);
    setError(null);

    fetchWithAuth(`/api/lessons/${activeLessonId}`)
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load lesson');
        }
        return res.json();
      })
      .then(data => {
        setCurrentLesson(data.lesson);
        setStreamUrl(data.lesson.streamUrl);
        setIsCompleted(data.isCompleted);
        setIsLiked(data.isLikedByMe);
        setLikesCount(data.likesCount);

        // Load associated tabs
        loadComments(activeLessonId);
        loadNotes(activeLessonId);
        loadResources(activeLessonId);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [activeLessonId]);

  const loadComments = (lessonId: string) => {
    fetchWithAuth(`/api/lessons/${lessonId}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(() => {});
  };

  const loadNotes = (lessonId: string) => {
    if (!isLoggedIn) return;
    fetchWithAuth(`/api/student/notes?course_id=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const lessonNotes = data.filter((n: StudentNote) => n.lesson_id === lessonId);
        setNotes(lessonNotes);
      })
      .catch(() => {});
  };

  const loadResources = (lessonId: string) => {
    fetchWithAuth(`/api/courses/${courseId}/resources?lesson_id=${lessonId}`)
      .then(res => res.json())
      .then(data => setResources(data))
      .catch(() => {});
  };

  // Toggle Lesson Complete
  const handleToggleComplete = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    try {
      await fetchWithAuth(`/api/lessons/${activeLessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });
    } catch {
      setIsCompleted(!newStatus);
    }
  };

  // Toggle Like / Unlike (strictly enforcing database uniqueness)
  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await fetchWithAuth(`/api/lessons/${activeLessonId}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      setIsLiked(data.isLikedByMe);
      setLikesCount(data.likesCount);
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  // Comments Actions
  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    try {
      const res = await fetchWithAuth(`/api/lessons/${activeLessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim(), parent_id: parentId }),
      });
      if (res.ok) {
        if (parentId) {
          setReplyText('');
          setReplyingToId(null);
        } else {
          setNewComment('');
        }
        loadComments(activeLessonId!);
      }
    } catch {
      // error
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetchWithAuth(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText.trim() }),
      });
      if (res.ok) {
        setEditingCommentId(null);
        setEditText('');
        loadComments(activeLessonId!);
      }
    } catch {
      // error
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetchWithAuth(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadComments(activeLessonId!);
      }
    } catch {
      // error
    }
  };

  const handleReportComment = async (commentId: string) => {
    try {
      await fetchWithAuth(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Reported by student' }),
      });
      alert(language === 'bn' ? 'মন্তব্যটি অ্যাডমিন পর্যালোচনার জন্য রিপোর্ট করা হয়েছে।' : 'Comment has been reported for admin review.');
    } catch {
      // error
    }
  };

  // Notes Actions
  const handleSaveNewNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    try {
      const res = await fetchWithAuth('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          lesson_id: activeLessonId,
          title: newNoteTitle.trim(),
          content: newNoteContent.trim(),
        }),
      });
      if (res.ok) {
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsCreatingNote(false);
        loadNotes(activeLessonId!);
      }
    } catch {
      // error
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteTitle.trim() || !editNoteContent.trim()) return;
    try {
      const res = await fetchWithAuth(`/api/student/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editNoteTitle.trim(),
          content: editNoteContent.trim(),
        }),
      });
      if (res.ok) {
        setEditingNoteId(null);
        loadNotes(activeLessonId!);
      }
    } catch {
      // error
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetchWithAuth(`/api/student/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadNotes(activeLessonId!);
      }
    } catch {
      // error
    }
  };

  // Secure Resource Download Trigger
  const handleDownloadResource = async (resourceId: string, fileName: string) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/resources/${resourceId}/download`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to download resource');
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
      alert('Error downloading resource');
    }
  };

  // Navigation between lessons
  const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? courseTitle.bn : courseTitle.en}</span>
        </button>

        <div className="flex items-center gap-2">
          {prevLesson && (
            <button
              onClick={() => setActiveLessonId(prevLesson.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('lessonPrev')}</span>
            </button>
          )}
          {nextLesson && (
            <button
              onClick={() => setActiveLessonId(nextLesson.id)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-1"
            >
              <span className="hidden sm:inline">{t('lessonNext')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Player & Tab Content */}
        <div className="lg:col-span-8 xl:col-span-9 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Video Player Container */}
          <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-cyan-400">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400">{language === 'bn' ? 'ক্লাস লোড হচ্ছে...' : 'Loading video...'}</span>
              </div>
            ) : error ? (
              <div className="text-center p-8 max-w-md space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {language === 'bn' ? 'কোর্স অ্যাক্সেস আবশ্যক' : 'Course Access Required'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-lg hover:bg-cyan-400 transition"
                >
                  {language === 'bn' ? 'পেমেন্ট ও ভর্তির বিস্তারিত দেখুন' : 'View Course & Payment Info'}
                </button>
              </div>
            ) : streamUrl ? (
              <div className="relative w-full h-full group">
                <video
                  ref={videoRef}
                  src={streamUrl}
                  controls
                  controlsList="nodownload" // Disables browser download button for protected course video
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />

                {/* Subtle dynamic anti-piracy security watermark of student ID/Email */}
                {user && (
                  <div className="absolute top-4 right-4 pointer-events-none opacity-25 select-none text-[10px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded">
                    ITMahfuzur • {user.email}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Action Row Under Video */}
          {currentLesson && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {language === 'bn' ? currentLesson.title_bn : currentLesson.title_en}
                </h2>
                <span className="text-xs text-slate-400">
                  {currentLesson.durationMinutes} {language === 'bn' ? 'মিনিট' : 'minutes'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Like Button with Real Count and DB Uniqueness */}
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    isLiked
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current text-cyan-400' : ''}`} />
                  <span>{likesCount}</span>
                  <span className="hidden sm:inline">{isLiked ? t('likedButton') : t('likeButton')}</span>
                </button>

                {/* Mark As Complete Button */}
                <button
                  onClick={handleToggleComplete}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{isCompleted ? t('btnCompleted') : t('btnMarkComplete')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs Under Player */}
          <div className="border-b border-slate-800 flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t('lessonTabOverview')}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('lessonTabDiscussion')} ({comments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('lessonTabNotes')} ({notes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                activeTab === 'resources'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FolderDown className="w-4 h-4" />
              <span>{t('lessonTabResources')} ({resources.length})</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && currentLesson && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? currentLesson.title_bn : currentLesson.title_en}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {language === 'bn' ? currentLesson.description_bn : currentLesson.description_en}
              </p>
            </div>
          )}

          {/* Tab 2: Comments & Replies */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Add comment box */}
              <form onSubmit={e => handleAddComment(e, null)} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <textarea
                  rows={2}
                  required
                  placeholder={t('addCommentPlaceholder')}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Post Comment'}</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.filter(c => !c.parent_id).length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-500">{t('noCommentsYet')}</p>
                ) : (
                  comments.filter(c => !c.parent_id).map(comment => {
                    const replies = comments.filter(c => c.parent_id === comment.id);
                    const isMyComment = user?.id === comment.user_id;

                    return (
                      <div key={comment.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                              {comment.user_name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white">{comment.user_name}</span>
                              {comment.user_role === 'admin' && (
                                <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  INSTRUCTOR
                                </span>
                              )}
                              <span className="ml-2 text-[10px] text-slate-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {isMyComment && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="hover:text-red-400 p-1 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleReportComment(comment.id)}
                              className="hover:text-amber-400 p-1 transition"
                              title="Report"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">
                          {comment.content}
                        </p>

                        <div className="pl-9 pt-1 flex items-center gap-4">
                          <button
                            onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                            className="text-xs text-cyan-400 font-semibold hover:underline"
                          >
                            {t('reply')}
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingToId === comment.id && (
                          <form onSubmit={e => handleAddComment(e, comment.id)} className="pl-9 pt-2 space-y-2">
                            <input
                              type="text"
                              required
                              placeholder={language === 'bn' ? 'উত্তর লিখুন...' : 'Write a reply...'}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-500 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                              >
                                {t('btnCancel')}
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
                              >
                                {t('reply')}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Threaded Replies */}
                        {replies.length > 0 && (
                          <div className="pl-9 pt-2 space-y-2.5 border-t border-slate-800/60 mt-2">
                            {replies.map(reply => (
                              <div key={reply.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">{reply.user_name}</span>
                                    {reply.user_role === 'admin' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                                        INSTRUCTOR
                                      </span>
                                    )}
                                  </div>
                                  {user?.id === reply.user_id && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-slate-500 hover:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-300">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 3: My Notes (Strictly Private to Student) */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{t('notesHeading')}</h3>
                  <p className="text-xs text-slate-400">{t('notesSubheading')}</p>
                </div>
                {!isCreatingNote && (
                  <button
                    onClick={() => setIsCreatingNote(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    + {t('createNote')}
                  </button>
                )}
              </div>

              {/* Note Creation Card */}
              {isCreatingNote && (
                <form onSubmit={handleSaveNewNote} className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3">
                  <input
                    type="text"
                    required
                    placeholder={t('noteTitlePlaceholder')}
                    value={newNoteTitle}
                    onChange={e => setNewNoteTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-semibold focus:border-cyan-500 focus:outline-none"
                  />
                  <textarea
                    rows={4}
                    required
                    placeholder={t('noteContentPlaceholder')}
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:border-cyan-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNote(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      {t('btnCancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      {t('saveNote')}
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length === 0 && !isCreatingNote ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                    {t('noNotesFound')}
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{note.title}</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditNoteTitle(note.title);
                              setEditNoteContent(note.content);
                            }}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {editingNoteId === note.id ? (
                        <div className="space-y-2 pt-2">
                          <input
                            type="text"
                            value={editNoteTitle}
                            onChange={e => setEditNoteTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <textarea
                            rows={3}
                            value={editNoteContent}
                            onChange={e => setEditNoteContent(e.target.value)}
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
                              onClick={() => handleUpdateNote(note.id)}
                              className="px-3 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
                            >
                              {t('btnSave')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {note.content}
                        </p>
                      )}

                      <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800">
                        {new Date(note.updated_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Downloadable Learning Resources */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">{t('lessonTabResources')}</h3>
              {resources.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                  {language === 'bn' ? 'এই ক্লাসের জন্য কোনো ডাউনলোডযোগ্য রিসোর্স নেই।' : 'No downloadable resources attached to this lesson.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resources.map(res => (
                    <div key={res.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">
                          {language === 'bn' ? res.title_bn : res.title_en}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {res.file_name} • {res.file_size}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadResource(res.id, res.file_name)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('btnDownload')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Course Curriculum Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 border-l border-slate-800 bg-slate-900/40 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('curriculum')}
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">
              {lessons.length} {t('lessons')}
            </span>
          </div>

          <div className="space-y-3">
            {modules.map(module => {
              const moduleLessons = lessons.filter(l => l.module_id === module.id);
              return (
                <div key={module.id} className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
                  <div className="p-3 bg-slate-800/40 text-xs font-bold text-slate-300">
                    {language === 'bn' ? module.title_bn : module.title_en}
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {moduleLessons.map(lesson => {
                      const isActive = lesson.id === activeLessonId;
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`p-3 text-xs flex items-center justify-between gap-2 cursor-pointer transition ${
                            isActive
                              ? 'bg-cyan-950/80 text-cyan-400 font-bold border-l-2 border-cyan-400'
                              : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <Play className="w-3.5 h-3.5 fill-current text-cyan-400 shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                            )}
                            <span className="line-clamp-1">{language === 'bn' ? lesson.title_bn : lesson.title_en}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {lesson.durationMinutes}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
