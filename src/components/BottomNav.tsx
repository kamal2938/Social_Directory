import React from 'react';
import { Home, Users, Settings, UserCircle, LayoutDashboard } from 'lucide-react';
import { TabType } from '../types';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/i18n';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: Language;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  lang,
  isAdmin
}) => {
  const tabs = [
    { id: 'home', icon: Home, label: getTranslation(lang, 'navHome') },
    ...(isAdmin ? [{ id: 'dashboard', icon: LayoutDashboard, label: getTranslation(lang, 'navDashboard') }] : []),
    { id: 'people', icon: Users, label: getTranslation(lang, 'navPeople') },
    { id: 'profile', icon: UserCircle, label: getTranslation(lang, 'navProfile') || 'Profile' },
    { id: 'settings', icon: Settings, label: getTranslation(lang, 'navSettings') }
  ] as { id: TabType; icon: any; label: string }[];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-full transition-all",
                isActive ? "bg-primary-100 dark:bg-primary-900/30" : "bg-transparent"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              </div>
              
            </button>
          );
        })}
      </div>
    </div>
  );
};
