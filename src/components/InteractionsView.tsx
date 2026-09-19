import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Calendar,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import { Interaction } from '../types';
import { api } from '../lib/api';
import { cn, formatDate, getInteractionIconInfo } from '../lib/utils';
import { Language, getTranslation } from '../lib/i18n';

interface InteractionsViewProps {
  onOpenAddInteraction: () => void;
  onSelectPerson: (personId: string) => void;
  isAdmin?: boolean;
  lang?: Language;
}

export const InteractionsView: React.FC<InteractionsViewProps> = ({
  onOpenAddInteraction,
  onSelectPerson,
  isAdmin = true,
  lang = 'en' as Language,
}) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const data = await api.getInteractions();
      setInteractions(data);
    } catch (err) {
      console.error('Failed to load interactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInteraction(id);
      await fetchInteractions();
    } catch (err) {
      console.error('Error deleting interaction:', err);
    }
  };

  const filtered = interactions.filter((item) => {
    const matchesSearch =
      item.personName?.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600" />
            <span>{getTranslation(lang, 'interactionsTitle')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {interactions.length} total
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {getTranslation(lang, 'interactionsSubtitle')}
          </p>
        </div>

        {isAdmin && (
          <button
            id="log-interaction-header-btn"
            onClick={onOpenAddInteraction}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{getTranslation(lang, 'logTouchpoint')}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="interaction-search-input"
            type="text"
            placeholder={getTranslation(lang, 'searchInteractionsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            id="interaction-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="all">{getTranslation(lang, 'typeAll')}</option>
            <option value="Meeting">{getTranslation(lang, 'typeMeeting')}</option>
            <option value="Phone Call">{getTranslation(lang, 'typeCall')}</option>
            <option value="Email">{getTranslation(lang, 'typeEmail')}</option>
            <option value="Message">{getTranslation(lang, 'typeChat')}</option>
            <option value="Note">{getTranslation(lang, 'typeNote')}</option>
          </select>
        </div>
      </div>

      {/* Interactions Feed */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading interactions...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No logged touchpoints found.</p>
          {isAdmin && (
            <button
              onClick={onOpenAddInteraction}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-500"
            >
              Log Your First Touchpoint
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const iconInfo = getInteractionIconInfo(item.type);
            return (
              <div
                key={item.id}
                id={`interaction-entry-${item.id}`}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-primary-400/80 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={cn(
                        'text-xs font-bold px-2.5 py-0.5 rounded-full border',
                        iconInfo.bg,
                        iconInfo.color,
                        'border-current/20'
                      )}
                    >
                      {item.type}
                    </span>

                    <button
                      onClick={() => onSelectPerson(item.personId)}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
                    >
                      <span>{item.personName || 'Contact'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.date)}</span>
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.description}
                  </p>

                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap pl-3 border-l-2 border-primary-500 bg-slate-50/60 dark:bg-slate-800/40 p-2 rounded-r-lg">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete touchpoint entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

