import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { toast as hotToast } from 'react-hot-toast';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Star,
  Plus,
  Briefcase,
  MapPin,
  Clock,
  Trash2,
  Edit,
  Eye,
  MessageSquarePlus,
  FilePlus2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Building2,
  Layers,
  QrCode,
  Send,
  Camera,
  Network,
  Users,
  AlertTriangle,
  Cake,
  Activity,
} from 'lucide-react';
import { Person, Tag, FilterState } from '../types';
import {
  cn,
  formatDate,
  getInitials,
  getRelationshipColor,
  getRelationshipHealth,
} from '../lib/utils';
import { Language, getTranslation } from '../lib/i18n';

interface PeopleViewProps {
  people: Person[];
  total: number;
  totalPages: number;
  loading: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  tags: Tag[];
  onOpenAddPerson: () => void;
  onSelectPerson: (personId: string) => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (person: Person) => void;
  onToggleFavorite: (personId: string, e: React.MouseEvent) => void;
  onToggleArchive: (personId: string, e: React.MouseEvent) => void;
  onOpenAddInteraction: (personId: string) => void;
  onOpenAddNote: (personId: string) => void;
  onOpenQRCode?: (person: Person) => void;
  onOpenOutreach?: (person: Person, defaultTopic?: 'birthday' | 'catchup' | 'meeting' | 'general') => void;
  onOpenCardScanner?: () => void;
  onOpenNetworkGraph?: () => void;
  title?: string;
  subtitle?: string;
  isAdmin?: boolean;
  currentUserId?: string;
  lang?: Language;
}


const SwipeableCard = ({ person, children }: any) => {
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (person.phone) {
        hotToast.success('Calling ' + person.name + '...');
        window.location.href = 'tel:' + person.phone;
      } else {
        hotToast.error('No phone number saved for ' + person.name);
      }
    },
    onSwipedLeft: () => {
      if (person.phone) {
        hotToast.success('Opening WhatsApp for ' + person.name + '...');
        window.open('https://wa.me/' + person.phone.replace(/[^0-9]/g, ''), '_blank');
      } else {
        hotToast.error('No phone number saved for ' + person.name);
      }
    },
    trackMouse: false
  });

  return (
    <div {...handlers} className="relative group">
      {children}
    </div>
  );
};

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  total,
  totalPages,
  loading,
  filters,
  setFilters,
  tags,
  onOpenAddPerson,
  onSelectPerson,
  onEditPerson,
  onDeletePerson,
  onToggleFavorite,
  onToggleArchive,
  onOpenAddInteraction,
  onOpenAddNote,
  onOpenQRCode,
  onOpenOutreach,
  onOpenCardScanner,
  onOpenNetworkGraph,
  title = 'People Directory',
  subtitle = 'Manage your private contacts, professional network, and personal connections.',
  isAdmin = true,
  currentUserId,
  lang = 'en' as Language,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const actualTitle = title === 'Starred Contacts' 
    ? getTranslation(lang, 'starredContactsTitle') 
    : title === 'Archived Contacts' 
    ? getTranslation(lang, 'archivedContactsTitle') 
    : getTranslation(lang, 'peopleDirectoryTitle');

  const actualSubtitle = title === 'Starred Contacts' 
    ? getTranslation(lang, 'starredContactsSubtitle') 
    : title === 'Archived Contacts' 
    ? getTranslation(lang, 'archivedContactsSubtitle') 
    : getTranslation(lang, 'peopleDirectorySubtitle');

  const relationshipOptions = [
    'all',
    'Colleague',
    'Friend',
    'Client',
    'Mentor',
    'Teacher',
    'Classmate',
    'Professional Contact',
    'Family Contact',
    'Online Contact',
    'Other',
  ];

  const circleOptions = [
    'all',
    'Inner Circle',
    'Close Friends',
    'VIP Clients',
    'Key Mentors',
    'Tech & Engineering',
    'Investors & VCs',
    'Industry Peers',
    'School Alumni',
  ];

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleRelationshipChange = (rel: string) => {
    setFilters((prev) => ({ ...prev, relationship: rel, page: 1 }));
  };

  const handleCircleChange = (circle: string) => {
    setFilters((prev) => ({ ...prev, circle: circle === 'all' ? undefined : circle, page: 1 }));
  };

  const handleTagChange = (tagName: string) => {
    setFilters((prev) => ({
      ...prev,
      tag: prev.tag === tagName ? 'all' : tagName,
      page: 1,
    }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      query: '',
      tag: 'all',
      relationship: 'all',
      organization: 'all',
      location: 'all',
      circle: undefined,
      needsFollowUp: false,
      upcomingBirthday: false,
      favoriteOnly: false,
      archivedOnly: false,
      page: 1,
    }));
  };

  const hasActiveFilters =
    Boolean(filters.query) ||
    filters.tag !== 'all' ||
    filters.relationship !== 'all' ||
    filters.organization !== 'all' ||
    filters.location !== 'all' ||
    Boolean(filters.circle) ||
    Boolean(filters.needsFollowUp) ||
    Boolean(filters.upcomingBirthday) ||
    Boolean(filters.favoriteOnly);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{actualTitle}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {total} {total === 1 ? 'contact' : 'contacts'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {actualSubtitle}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Smart Tool Shortcuts */}
          {onOpenNetworkGraph && (
            <button
              onClick={onOpenNetworkGraph}
              title="Open Interactive Visual Network Graph"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold transition-colors"
            >
              <Network className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">{getTranslation(lang, 'networkGraph')}</span>
            </button>
          )}

          {onOpenCardScanner && (
            <button
              onClick={onOpenCardScanner}
              title="Scan / Upload Business Card (OCR)"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{getTranslation(lang, 'cardScanner')}</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              title="Grid Cards view"
              className={cn(
                'p-1.5 rounded-lg text-xs font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-table-btn"
              onClick={() => setViewMode('table')}
              title="Dense Table view"
              className={cn(
                'p-1.5 rounded-lg text-xs font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && (
            <button
              id="people-add-btn"
              onClick={onOpenAddPerson}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{getTranslation(lang, 'addPersonBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="sticky top-16 sm:top-2 z-30 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="people-search-input"
              type="text"
              placeholder={getTranslation(lang, 'searchPeoplePlaceholder')}
              value={filters.query}
              onChange={handleQueryChange}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
            {filters.query && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, query: '', page: 1 }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {/* Relationship select */}
            <div className="w-40 sm:w-44 shrink-0">
              <select
                id="relationship-filter-select"
                value={filters.relationship}
                onChange={(e) => handleRelationshipChange(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              >
                <option value="all">{getTranslation(lang, 'allRelationships')}</option>
                {relationshipOptions
                  .filter((r) => r !== 'all')
                  .map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
              </select>
            </div>
            
            {/* Circle / Group select */}
            <div className="w-40 sm:w-44 shrink-0">
              <select
                id="circle-filter-select"
                value={filters.circle || 'all'}
                onChange={(e) => handleCircleChange(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              >
                <option value="all">{getTranslation(lang, 'allCircles')}</option>
                {circleOptions
                  .filter((c) => c !== 'all')
                  .map((circle) => (
                    <option key={circle} value={circle}>
                      {circle}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort By Select */}
            <div className="w-36 sm:w-44 shrink-0">
              <select
                id="sort-by-select"
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              >
                <option value="name">{getTranslation(lang, 'sortName')}</option>
                <option value="recent">{getTranslation(lang, 'sortRecent')}</option>
                <option value="lastInteraction">{getTranslation(lang, 'sortLastContact')}</option>
                <option value="updated">{getTranslation(lang, 'sortUpdated')}</option>
              </select>
            </div>

            {/* Toggle advanced filters button */}
            <button
              id="toggle-advanced-filters-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                'shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap',
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-200'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'filters')}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Filter Badges Row: Follow-Ups Due, Upcoming Birthdays, Starred */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, needsFollowUp: !prev.needsFollowUp, page: 1 }))
            }
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap',
              filters.needsFollowUp
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{getTranslation(lang, 'touchpointDue')}</span>
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, upcomingBirthday: !prev.upcomingBirthday, page: 1 }))
            }
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap',
              filters.upcomingBirthday
                ? 'bg-pink-500 text-white border-pink-600 shadow-xs'
                : 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/80 text-pink-700 dark:text-pink-300 hover:bg-pink-100'
            )}
          >
            <Cake className="w-3 h-3" />
            <span>{getTranslation(lang, 'upcomingBirthdays30')}</span>
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, favoriteOnly: !prev.favoriteOnly, page: 1 }))
            }
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap',
              filters.favoriteOnly
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
            )}
          >
            <Star
              className={cn(
                'w-3 h-3',
                filters.favoriteOnly ? 'fill-slate-900 text-slate-900' : 'text-amber-500'
              )}
            />
            <span>{getTranslation(lang, 'starredVips')}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Tag chips strip */}
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Tags:</span>
          </span>
          <button
            id="tag-filter-all"
            onClick={() => handleTagChange('all')}
            className={cn(
              'px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap',
              filters.tag === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            All
          </button>
          {tags.map((tag) => {
            const isSelected = filters.tag.toLowerCase() === tag.name.toLowerCase();
            return (
              <button
                key={tag.id}
                id={`tag-filter-${tag.name.toLowerCase()}`}
                onClick={() => handleTagChange(tag.name)}
                className={cn(
                  'px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap border',
                  isSelected
                    ? 'bg-primary-600 border-primary-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-400'
                )}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            {/* Organization filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Filter by Organization / Company
              </label>
              <input
                id="filter-organization-input"
                type="text"
                placeholder="e.g. ABC ISP, Studio..."
                value={filters.organization === 'all' ? '' : filters.organization}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    organization: e.target.value || 'all',
                    page: 1,
                  }))
                }
                className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Filter by Location
              </label>
              <input
                id="filter-location-input"
                type="text"
                placeholder="e.g. Dhaka, San Francisco..."
                value={filters.location === 'all' ? '' : filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    location: e.target.value || 'all',
                    page: 1,
                  }))
                }
                className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Reset button */}
            <div className="flex items-end gap-2">
              {hasActiveFilters && (
                <button
                  id="clear-all-filters-btn"
                  onClick={clearAllFilters}
                  className="w-full py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Loading, Empty, or Cards/Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading contacts...</p>
        </div>
      ) : (people || []).length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-600 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No contacts found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? 'Try adjusting your search criteria or resetting filters to view more profiles.'
                : 'Your private directory has no active contacts in this view. Click below to add one!'}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200"
            >
              Clear Filters
            </button>
          ) : isAdmin ? (
            <button
              onClick={onOpenAddPerson}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-500 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Contact</span>
            </button>
          ) : null}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => {
            const relColor = getRelationshipColor(person.relationshipType);
            const health = getRelationshipHealth(person);

            return (
              <SwipeableCard key={person.id} person={person}>
              <div id={`person-card-${person.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-primary-400/80 dark:hover:border-primary-500/80 transition-all p-5 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Header with Photo, Name, Health Score & Star */}
                  <div className="flex items-start gap-3.5">
                    <div
                      onClick={() => onSelectPerson(person.id)}
                      className="cursor-pointer flex-shrink-0 relative"
                    >
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
                          {getInitials(person.name)}
                        </div>
                      )}

                      {/* Health Score Pill indicator badge */}
                      <span
                        title={`Relationship Health: ${health.score}% (${health.status})`}
                        className={cn(
                          'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900',
                          health.status === 'strong'
                            ? 'bg-emerald-500'
                            : health.status === 'nurture'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <div
                          onClick={() => onSelectPerson(person.id)}
                          className="cursor-pointer"
                        >
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {person.name}
                          </h3>
                          {person.nickname && (
                            <p className="text-xs text-slate-400 italic">
                              "{person.nickname}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {onOpenQRCode && (
                            <button
                              onClick={() => onOpenQRCode(person)}
                              title="View Digital QR & vCard"
                              className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`person-card-fav-${person.id}`}
                            onClick={(e) => onToggleFavorite(person.id, e)}
                            className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                            title={person.isFavorite ? 'Remove star' : 'Mark VIP star'}
                          >
                            <Star
                              className={cn(
                                'w-4 h-4',
                                person.isFavorite
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              )}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Relationship Pill & Circles */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            relColor.bg,
                            relColor.text,
                            relColor.border
                          )}
                        >
                          {person.relationshipType}
                        </span>

                        {person.circles && person.circles[0] && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {person.circles[0]}
                          </span>
                        )}

                        {person.isArchived && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {person.occupation && (
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {person.occupation}
                        </span>
                      </div>
                    )}
                    {person.organization && (
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400 truncate">
                          {person.organization}
                          <span className="hidden sm:inline">{person.department ? ` • ${person.department}` : ''}</span>
                        </span>
                      </div>
                    )}
                    {person.location && (
                      <div className="hidden sm:flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400 truncate">
                          {person.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills preview - hidden on mobile for cleaner UI */}
                  {person.skills && person.skills.length > 0 && (
                    <div className="mt-3 hidden sm:flex flex-wrap gap-1">
                      {(person.skills || []).slice(0, 3).map((skill: any, idx) => {
                        const skillName = typeof skill === 'object' && skill !== null ? ((skill as any).name || (skill as any).value || '') : String(skill || '');
                        if (!skillName) return null;
                        return (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {skillName}
                          </span>
                        );
                      })}
                      {(person.skills || []).length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                          +{(person.skills || []).length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags - hidden on mobile */}
                  {person.tags && person.tags.length > 0 && (
                    <div className="mt-2.5 hidden sm:flex flex-wrap gap-1">
                      {(person.tags || []).map((tag: any, idx) => {
                        const tagName = typeof tag === 'object' && tag !== null ? (tag.name || tag.id || '') : String(tag || '');
                        if (!tagName) return null;
                        return (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40"
                          >
                            #{tagName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer bar with last contact & quick actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      'text-[11px] flex items-center gap-1 font-medium',
                      health.status === 'overdue'
                        ? 'text-rose-600 dark:text-rose-400'
                        : health.status === 'nurture'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-400'
                    )}
                    title={health.message}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{person.lastInteractionAt ? formatDate(person.lastInteractionAt) : 'No touchpoints'}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    {onOpenOutreach && (
                      <button
                        onClick={() => onOpenOutreach(person)}
                        title="1-Click WhatsApp / Email Outreach"
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    { (isAdmin || person.userId === currentUserId) && ( <button id={`card-log-inter-${person.id}`}
                        onClick={() => onOpenAddInteraction(person.id)}
                        title="Log Touchpoint"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    { (isAdmin || person.userId === currentUserId) && ( <button id={`card-add-note-${person.id}`}
                        onClick={() => onOpenAddNote(person.id)}
                        title="Add Note"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <FilePlus2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    { (isAdmin || person.userId === currentUserId) && ( <button id={`card-edit-${person.id}`}
                        onClick={() => onEditPerson(person)}
                        title="Edit Profile"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      id={`card-view-${person.id}`}
                      onClick={() => onSelectPerson(person.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
              </SwipeableCard>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role & Organization</th>
                  <th className="py-3 px-4">Relationship & Circles</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Last Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {people.map((person) => {
                  const relColor = getRelationshipColor(person.relationshipType);
                  const health = getRelationshipHealth(person);

                  return (
                    <tr
                      key={person.id}
                      id={`table-row-${person.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onSelectPerson(person.id)}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          {person.photo ? (
                            <img
                              src={person.photo}
                              alt={person.name}
                              className="w-8 h-8 rounded-lg object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                              {getInitials(person.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                              {person.name}
                            </p>
                            {person.nickname && (
                              <p className="text-[10px] text-slate-400">"{person.nickname}"</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-900 dark:text-slate-200">
                          {person.occupation || '—'}
                        </p>
                        <p className="text-[11px] text-slate-400">{person.organization || ''}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
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
                          {person.circles && person.circles[0] && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {person.circles[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            health.status === 'strong'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : health.status === 'nurture'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300'
                          )}
                        >
                          {health.score}% {health.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(person.tags || []).slice(0, 2).map((t: any, idx) => {
                            const tagName = typeof t === 'object' && t !== null ? (t.name || t.id || '') : String(t || '');
                            if (!tagName) return null;
                            return (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-300"
                              >
                                #{tagName}
                              </span>
                            );
                          })}
                          {(person.tags || []).length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{(person.tags || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {person.lastInteractionAt ? formatDate(person.lastInteractionAt) : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onOpenQRCode && (
                            <button
                              onClick={() => onOpenQRCode(person)}
                              title="QR Code"
                              className="p-1 text-slate-400 hover:text-primary-600"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`tbl-fav-${person.id}`}
                            onClick={(e) => onToggleFavorite(person.id, e)}
                            className="p-1 text-slate-300 hover:text-amber-500"
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
                          { (isAdmin || person.userId === currentUserId) && ( <button id={`tbl-edit-${person.id}`}
                              onClick={() => onEditPerson(person)}
                              className="p-1 text-slate-400 hover:text-primary-600"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`tbl-view-${person.id}`}
                            onClick={() => onSelectPerson(person.id)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-white">{filters.page}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span> ({total} contacts)
          </p>
          <div className="flex items-center gap-1.5">
            <button
              id="pagination-prev-btn"
              disabled={filters.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="pagination-next-btn"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      {isAdmin && (
        <button
          onClick={onOpenAddPerson}
          className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-[0_4px_14px_rgba(14,165,233,0.4)] flex items-center justify-center transition-transform active:scale-95"
          aria-label="Add Contact"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
