import React from 'react';
import {
  Home,
  LayoutDashboard,
  User,
  Users,
  Star,
  Tags,
  MessageSquare,
  Archive,
  Settings,
  ShieldCheck,
  Plus,
  X,
} from 'lucide-react';
import { TabType, DirectoryStats, AppSettings } from '../types';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/i18n';

interface SidebarProps {
  appSettings?: AppSettings;
  activeTab?: TabType;
  activeView?: TabType;
  setActiveTab?: (tab: TabType) => void;
  setActiveView?: (view: TabType) => void;
  stats: DirectoryStats | null;
  onOpenAddPerson?: () => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  onOpenAdminLogin?: () => void;
  onLogout?: () => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appSettings,
  activeTab,
  activeView,
  setActiveTab,
  setActiveView,
  stats,
  onOpenAddPerson,
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
  isAdmin = false,
  onOpenLogin,
  onOpenAdminLogin,
  onLogout,
  lang,
}) => {
  const currentTab = activeTab || activeView || 'home';
  const handleSelectTab = (tab: TabType) => {
    if (setActiveTab) setActiveTab(tab);
    if (setActiveView) setActiveView(tab);
    if (setSidebarOpen) setSidebarOpen(false);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isMobileOpen = sidebarOpen ?? mobileOpen ?? false;
  const handleCloseMobile = () => {
    if (setSidebarOpen) setSidebarOpen(false);
    if (setMobileOpen) setMobileOpen(false);
  };

  const navItems: {
    id: TabType;
    labelKey: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'home',
      labelKey: 'navHome',
      icon: Home,
    },
    {
      id: 'dashboard',
      labelKey: 'navDashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'profile',
      labelKey: 'navProfile',
      icon: User,
    },
    {
      id: 'people',
      labelKey: 'navPeople',
      icon: Users,
      count: stats?.totalPeople,
    },
    {
      id: 'favorites',
      labelKey: 'navFavorites',
      icon: Star,
      count: stats?.favorites,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'tags',
      labelKey: 'navTags',
      icon: Tags,
      count: stats?.totalTags,
    },
    {
      id: 'interactions',
      labelKey: 'navInteractions',
      icon: MessageSquare,
    },
    {
      id: 'archived',
      labelKey: 'navArchived',
      icon: Archive,
      count: stats?.archivedPeople,
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700/60',
    },
    {
      id: 'settings',
      labelKey: 'navSettings',
      icon: Settings,
    },
  ];
  const filteredNavItems = !isAdmin
    ? navItems.filter(item => item.id !== 'profile')
    : navItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 dark:bg-slate-950 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          {appSettings?.logoUrl ? (
            <img src={appSettings.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-md shadow-primary-950/50" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-500 flex items-center justify-center shadow-md shadow-primary-950/50">
              <Users className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 line-clamp-1">
              {appSettings?.appName || 'Social Directory'}
            </h1>
            <div className="flex items-center gap-1 text-xs text-primary-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private CRM</span>
            </div>
          </div>
        </div>
        <button
          id="close-mobile-sidebar-btn"
          onClick={handleCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Add CTA */}
      {isAdmin && onOpenAddPerson && (
        <div className="px-4 pt-4 pb-2">
          <button
            id="sidebar-add-person-btn"
            onClick={onOpenAddPerson}
            className="w-full py-2.5 px-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{getTranslation(lang, 'addPerson')}</span>
          </button>
        </div>
      )}

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {lang === 'bn' ? 'ডিরেক্টরি মেনু' : 'Directory Menu'}
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const labelText = getTranslation(lang, item.labelKey as any);
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-white' : 'text-slate-400'
                  )}
                />
                <span>{labelText}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    item.badgeColor ||
                      (isActive
                        ? 'bg-primary-700 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60')
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Privacy Guarantee & Mode Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
              isAdmin ? "bg-emerald-950/70 border border-emerald-800/50 text-emerald-400" : "bg-amber-950/70 border border-amber-800/50 text-amber-400"
            )}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-200 truncate">
                {isAdmin ? 'Admin Mode' : 'User Mode'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {isAdmin ? 'Full Access' : 'Own Profile Access'}
              </p>
            </div>
          </div>

          {onLogout ? (
            <button
              onClick={onLogout}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold whitespace-nowrap transition-colors"
            >
              {lang === 'bn' ? 'বের হন' : 'Logout'}
            </button>
          ) : onOpenLogin ? (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              {lang === 'bn' ? 'লগইন' : 'Login'}
            </button>
          ) : null}
  
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          onClick={handleCloseMobile}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};

