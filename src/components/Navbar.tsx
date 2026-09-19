import React from 'react';
import { Menu, Plus, Search, Sun, Moon, MessageSquarePlus, Shield, ShieldCheck, LogOut, LogIn, Languages } from 'lucide-react';
import { TabType, User, AppSettings } from '../types';
import { Language, getTranslation } from '../lib/i18n';

interface NavbarProps {
  appSettings?: AppSettings;
  activeTab?: TabType;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  setSearchQuery?: (q: string) => void;
  onSearchSubmit?: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  theme?: 'light' | 'dark';
  setTheme?: (t: 'light' | 'dark') => void;
  user?: User | null;
  onOpenMobileMenu?: () => void;
  setSidebarOpen?: (open: boolean) => void;
  onOpenAddPerson?: () => void;
  onOpenQuickLog?: () => void;
  onOpenAddNote?: () => void;
  onNavigateSettings?: () => void;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  onOpenAdminLogin?: () => void;
  onLogout?: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appSettings,
  searchQuery = '',
  onSearchChange,
  setSearchQuery,
  onSearchSubmit,
  darkMode,
  toggleDarkMode,
  theme,
  setTheme,
  user,
  onOpenMobileMenu,
  setSidebarOpen,
  onOpenAddPerson,
  onOpenQuickLog,
  onOpenAddNote,
  onNavigateSettings,
  isAdmin = false,
  onOpenLogin,
  onOpenAdminLogin,
  onLogout,
  lang,
  setLang,
}) => {
  const isDark = darkMode ?? (theme === 'dark');

  const handleToggle = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
    } else if (setTheme) {
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  const handleOpenSidebar = () => {
    if (onOpenMobileMenu) onOpenMobileMenu();
    if (setSidebarOpen) setSidebarOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) onSearchChange(e.target.value);
    if (setSearchQuery) setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 max-w-xl">
          {/* Mobile Logo */}
          <div className="flex items-center md:hidden shrink-0">
            {appSettings?.logoUrl ? (
              <img src={appSettings.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">SD</span>
              </div>
            )}
          </div>

          {/* Mobile menu trigger + search bar */}
          <button
            id="mobile-menu-trigger"
            onClick={handleOpenSidebar}
            className="hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Omnibar Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              placeholder={lang === 'en' ? 'Search contacts...' : 'কন্টাক্ট খুঁজুন...'}
              value={searchQuery}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-8 pr-10 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  if (onSearchChange) onSearchChange('');
                  if (setSearchQuery) setSearchQuery('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {getTranslation(lang, 'clear')}
              </button>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* EN / BN Language Toggle Button */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            title="Switch Language (EN / BN)"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <Languages className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
            <span className="hidden sm:inline">{lang === 'en' ? 'বাংলা (BN)' : 'English (EN)'}</span>
            <span className="sm:hidden">{lang === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Quick Touchpoint Log (Admin only) */}
          {isAdmin && onOpenQuickLog && (
            <button
              id="navbar-quick-log-btn"
              onClick={onOpenQuickLog}
              title="Quick Log Touchpoint"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span>{getTranslation(lang, 'logTouchpoint')}</span>
            </button>
          )}

          {/* Quick theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={handleToggle}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User/Admin Login/Logout status */}
          {user ? (
            isAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{getTranslation(lang, 'adminActive')}</span>
                </span>
                {onLogout && (
                  <button
                    id="navbar-logout-btn"
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">{getTranslation(lang, 'logout')}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/60 text-primary-700 dark:text-primary-300 text-xs font-bold shadow-2xs">
                  <span>{user.fullName || (lang === 'en' ? 'User Mode' : 'ইউজার মোড')}</span>
                </span>
                {onLogout && (
                  <button
                    id="navbar-logout-btn"
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">{getTranslation(lang, 'logout')}</span>
                  </button>
                )}
              </div>
            )
          ) : onOpenLogin ? (
            <button
              id="navbar-user-login-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
              title="Login"
            >
              <LogIn className="w-4 h-4 text-white shrink-0" />
              <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          ) : null}

          {/* Add Person Primary CTA (Admin only) */}
          {isAdmin && onOpenAddPerson && (
            <button
              id="navbar-add-person-btn"
              onClick={onOpenAddPerson}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{getTranslation(lang, 'addPerson')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

