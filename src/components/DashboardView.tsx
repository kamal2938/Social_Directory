import React from 'react';
import {
  Users,
  Star,
  Tags,
  Building2,
  Archive,
  UserPlus,
  MessageSquarePlus,
  FilePlus2,
  ArrowRight,
  Sparkles,
  Clock,
  Briefcase,
  MapPin,
  Calendar,
  Cake,
  BellRing,
  Send,
  MessageSquare,
  Network,
  CreditCard,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { DirectoryStats, Person, TabType } from '../types';
import { cn, formatDate, getInitials, getRelationshipColor, getInteractionIconInfo } from '../lib/utils';
import { Language, getTranslation } from '../lib/i18n';

interface DashboardViewProps {
  stats: DirectoryStats | null;
  onNavigate: (view: TabType, filter?: { relationship?: string; tag?: string; circle?: string }) => void;
  onOpenAddPerson: () => void;
  onOpenAddInteraction: (personId?: string) => void;
  onOpenAddNote?: (personId?: string) => void;
  onSelectPerson: (personId: string) => void;
  onToggleFavorite?: (personId: string, e: React.MouseEvent) => void;
  onOpenOutreach?: (person: Person, defaultTopic?: 'birthday' | 'catchup' | 'meeting' | 'general') => void;
  onOpenNetworkGraph?: () => void;
  onOpenCardScanner?: () => void;
  isAdmin?: boolean;
  lang?: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigate,
  onOpenAddPerson,
  onOpenAddInteraction,
  onOpenAddNote,
  onSelectPerson,
  onToggleFavorite,
  onOpenOutreach,
  onOpenNetworkGraph,
  onOpenCardScanner,
  isAdmin = true,
  lang = 'en' as Language,
}) => {
  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">{getTranslation(lang, 'loading')}</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      id: 'total-people',
      label: getTranslation(lang, 'activeContacts'),
      value: stats.totalPeople,
      icon: Users,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50/80 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800/50',
      action: () => onNavigate('people'),
    },
    {
      id: 'favorites',
      label: getTranslation(lang, 'starredContacts'),
      value: stats.favorites,
      icon: Star,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
      action: () => onNavigate('favorites'),
    },
    {
      id: 'tags',
      label: getTranslation(lang, 'categorizedTags'),
      value: stats.totalTags,
      icon: Tags,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50',
      action: () => onNavigate('tags'),
    },
    {
      id: 'organizations',
      label: getTranslation(lang, 'organizations'),
      value: stats.totalOrganizations,
      icon: Building2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
      action: () => onNavigate('people'),
    },
    {
      id: 'archived',
      label: getTranslation(lang, 'archived'),
      value: stats.archivedPeople,
      icon: Archive,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50',
      action: () => onNavigate('archived'),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span>{getTranslation(lang, 'personalCrmBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {getTranslation(lang, 'relationshipsTitle')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {getTranslation(lang, 'relationshipsSubtitle')}
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            {onOpenNetworkGraph && (
              <button
                onClick={onOpenNetworkGraph}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Network className="w-4 h-4" />
                <span>{getTranslation(lang, 'openNetworkGraph')}</span>
              </button>
            )}
            {onOpenCardScanner && (
              <button
                onClick={onOpenCardScanner}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs border border-white/20 transition-all"
              >
                <CreditCard className="w-4 h-4 text-purple-300" />
                <span>{getTranslation(lang, 'scanBusinessCard')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              id={`stat-card-${card.id}`}
              onClick={card.action}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer',
                card.bgColor
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs', card.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {card.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* CRM REMINDERS & ALERTS ROW: Birthdays & Overdue Cadence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Birthdays Alert Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40">
                <Cake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {getTranslation(lang, 'upcomingBirthdays')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {getTranslation(lang, 'birthdaysIn30')}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
              {stats.upcomingBirthdays?.length || 0}
            </span>
          </div>

          <div className="space-y-2.5">
            {(!stats.upcomingBirthdays || stats.upcomingBirthdays.length === 0) ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500">{getTranslation(lang, 'noBirthdays')}</p>
              </div>
            ) : (
              (stats.upcomingBirthdays || []).slice(0, 4).map((person) => {
                const isToday = (person as any).daysUntilBirthday === 0;
                const isTomorrow = (person as any).daysUntilBirthday === 1;

                return (
                  <div
                    key={person.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => onSelectPerson(person.id)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden border border-pink-200">
                        {person.photo ? (
                          <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(person.name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-primary-600">
                          {person.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {person.relationshipType} • {person.dateOfBirth}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                          isToday
                            ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                            : isTomorrow
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                        )}
                      >
                        {isToday ? 'Today! 🎉' : isTomorrow ? 'Tomorrow' : `In ${(person as any).daysUntilBirthday} days`}
                      </span>

                      {onOpenOutreach && (
                        <button
                          onClick={() => onOpenOutreach(person, 'birthday')}
                          className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/80 hover:bg-pink-100 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Wish Birthday on WhatsApp / Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Wish</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Overdue Follow-ups (Stay in Touch) Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Follow-Up Reminders
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Overdue touchpoints based on your cadence
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {stats.overdueFollowUps?.length || 0} Overdue
            </span>
          </div>

          <div className="space-y-2.5">
            {(!stats.overdueFollowUps || stats.overdueFollowUps.length === 0) ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Great job! All contact follow-ups are up to date.
                </p>
              </div>
            ) : (
              (stats.overdueFollowUps || []).slice(0, 4).map((person) => {
                return (
                  <div
                    key={person.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => onSelectPerson(person.id)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden border border-amber-200">
                        {person.photo ? (
                          <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(person.name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-primary-600">
                            {person.name}
                          </h4>
                          {person.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Cadence: {person.followUpCadenceDays || (person.isFavorite ? 14 : 30)}d • Last: {(person as any).daysSinceLastInteraction ? `${(person as any).daysSinceLastInteraction}d ago` : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {(person as any).daysOverdue}d overdue
                      </span>

                      {onOpenOutreach && (
                        <button
                          onClick={() => onOpenOutreach(person, 'catchup')}
                          className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/80 hover:bg-primary-100 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Reach out on WhatsApp / Email"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reach Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          {isAdmin ? 'Quick Actions & CRM Tools' : 'Directory Navigation & Shortcuts'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isAdmin ? (
            <>
              <button
                id="quick-action-add-person"
                onClick={onOpenAddPerson}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900/60 font-semibold text-xs transition-colors"
              >
                <UserPlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Add New Person</span>
              </button>
              <button
                id="quick-action-log-interaction"
                onClick={() => onOpenAddInteraction()}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Log Touchpoint</span>
              </button>
              <button
                id="quick-action-add-note"
                onClick={() => {
                  if (onOpenAddNote) onOpenAddNote();
                  else onOpenAddInteraction();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-semibold text-xs transition-colors"
              >
                <FilePlus2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Add Quick Note</span>
              </button>
              <button
                id="quick-action-view-favorites"
                onClick={() => onNavigate('favorites')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>Browse Starred</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="quick-action-browse-all"
                onClick={() => onNavigate('people')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-900/60 font-semibold text-xs transition-colors"
              >
                <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Browse Contacts</span>
              </button>
              <button
                id="quick-action-view-favorites"
                onClick={() => onNavigate('favorites')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 font-semibold text-xs transition-colors"
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>Starred VIPs</span>
              </button>
              <button
                id="quick-action-browse-tags"
                onClick={() => onNavigate('tags')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs transition-colors"
              >
                <Tags className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Explore Tags</span>
              </button>
              <button
                id="quick-action-browse-interactions"
                onClick={() => onNavigate('interactions')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Touchpoint Logs</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Contacts & Categories (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Contacts Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Recent Contacts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick access to recently added people
                </p>
              </div>
              <button
                id="view-all-people-link"
                onClick={() => onNavigate('people')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(stats.recentContacts || []).map((person: Person) => {
                const relColor = getRelationshipColor(person.relationshipType);
                return (
                  <div
                    key={person.id}
                    id={`recent-person-${person.id}`}
                    onClick={() => onSelectPerson(person.id)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-primary-400 dark:hover:border-primary-500 transition-all cursor-pointer group relative"
                  >
                    <div className="flex items-start gap-3">
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {getInitials(person.name)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                            {person.name}
                          </h4>
                          {onToggleFavorite && (
                            <button
                              id={`fav-toggle-${person.id}`}
                              onClick={(e) => onToggleFavorite(person.id, e)}
                              className="text-slate-300 hover:text-amber-500 p-0.5"
                            >
                              <Star
                                className={cn(
                                  'w-3.5 h-3.5',
                                  person.isFavorite
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                )}
                              />
                            </button>
                          )}
                        </div>

                        {person.occupation && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <span>{person.occupation}</span>
                          </p>
                        )}

                        {person.organization && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {person.organization}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                              relColor.bg,
                              relColor.text,
                              relColor.border
                            )}
                          >
                            {person.relationshipType}
                          </span>
                          {person.location && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5" />
                              {person.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relationship Distribution Filter Pills */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              Relationship Breakdown
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.relationshipCounts || {}).map(([type, count]) => {
                const colors = getRelationshipColor(type);
                return (
                  <button
                    key={type}
                    id={`rel-filter-btn-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onNavigate('people', { relationship: type })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105',
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    <span>{type}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/80 dark:bg-slate-900/80 text-[10px] font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Interactions & Activity Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Interactions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Recent Touchpoints
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Meetings, calls, and logged discussions
                </p>
              </div>
              <button
                id="view-all-interactions-link"
                onClick={() => onNavigate('interactions')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {(!stats.recentInteractions || stats.recentInteractions.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No touchpoints logged yet.
                </div>
              ) : (
                (stats.recentInteractions || []).map((item) => {
                  const iconInfo = getInteractionIconInfo(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectPerson(item.personId)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
                          <span className={cn('text-xs font-medium', iconInfo.color)}>
                            ● {item.type}
                          </span>
                          <span className="text-slate-400">with</span>
                          <span className="text-primary-600 dark:text-primary-400 hover:underline">
                            {item.personName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Audit & Activity Feed</span>
              </h3>
            </div>

            <div className="space-y-3">
              {(stats.recentActivity || []).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {log.details || log.action}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
