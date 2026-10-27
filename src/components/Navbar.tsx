import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  Menu,
  X,
  Globe,
  User as UserIcon,
  BookOpen,
  FileText,
  FolderDown,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navCourses'), path: '/courses' },
    { name: t('navAbout'), path: '/about' },
    { name: t('navInstructor'), path: '/instructor' },
    { name: t('navContact'), path: '/contact' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNav('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => handleNav('/')}
            className="cursor-pointer transition hover:opacity-95"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Language Switcher + User Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Auth Controls */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-sm font-medium text-white transition"
                >
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-fade-in text-sm text-slate-200">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">{user?.email}</p>
                      <p className="font-semibold text-cyan-400 capitalize">{user?.role}</p>
                    </div>

                    <button
                      onClick={() => handleNav('/dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 text-left transition"
                    >
                      <UserIcon className="w-4 h-4 text-cyan-400" />
                      <span>{t('navDashboard')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('/my-courses')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 text-left transition"
                    >
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span>{t('navMyCourses')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('/my-notes')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 text-left transition"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>{t('navMyNotes')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('/resources')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 text-left transition"
                    >
                      <FolderDown className="w-4 h-4 text-amber-400" />
                      <span>{t('navResources')}</span>
                    </button>

                    <button
                      onClick={() => handleNav('/payments')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 text-left transition"
                    >
                      <CreditCard className="w-4 h-4 text-pink-400" />
                      <span>{t('navPaymentHistory')}</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNav('/admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-amber-950/40 text-amber-300 font-semibold text-left transition border-t border-slate-800 mt-1"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>{t('navAdmin')}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNav('/settings')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 text-left transition border-t border-slate-800 mt-1"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>{t('navSettings')}</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-950/30 text-red-400 text-left transition border-t border-slate-800"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-900 transition"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition"
                >
                  {t('navRegister')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                currentPath === link.path
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {link.name}
            </button>
          ))}

          {isLoggedIn ? (
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <div className="px-4 py-2 text-xs text-slate-400">
                {user?.name} ({user?.email})
              </div>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900"
              >
                {t('navDashboard')}
              </button>
              <button
                onClick={() => handleNav('/my-courses')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900"
              >
                {t('navMyCourses')}
              </button>
              <button
                onClick={() => handleNav('/my-notes')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900"
              >
                {t('navMyNotes')}
              </button>
              <button
                onClick={() => handleNav('/resources')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900"
              >
                {t('navResources')}
              </button>
              <button
                onClick={() => handleNav('/payments')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900"
              >
                {t('navPaymentHistory')}
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-300 bg-amber-950/30 border border-amber-500/30"
                >
                  {t('navAdmin')}
                </button>
              )}
              <button
                onClick={() => handleNav('/settings')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-slate-900"
              >
                {t('navSettings')}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/20"
              >
                {t('navLogout')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-slate-900 border border-slate-700 text-slate-200"
              >
                {t('navLogin')}
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-cyan-500 text-slate-950 font-bold"
              >
                {t('navRegister')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
