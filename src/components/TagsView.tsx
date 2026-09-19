import React, { useState } from 'react';
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit,
  Check,
  Users,
  Search,
  Hash,
} from 'lucide-react';
import { Tag } from '../types';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { Language, getTranslation } from '../lib/i18n';

interface TagsViewProps {
  tags: Tag[];
  onRefresh: () => void;
  onSelectTag: (tagName: string) => void;
  isAdmin?: boolean;
  lang?: Language;
}

export const TagsView: React.FC<TagsViewProps> = ({ tags, onRefresh, onSelectTag, isAdmin = false, lang = 'en' as Language }) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2563eb');
  const [search, setSearch] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [loading, setLoading] = useState(false);

  const presetColors = [
    '#2563eb', // blue
    '#0ea5e9', // sky
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#64748b', // slate
    '#eab308', // amber
  ];

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newTagName.trim()) return;
    try {
      setLoading(true);
      await api.createTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      onRefresh();
    } catch (err) {
      console.error('Error creating tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!editingTag || !editName.trim()) return;
    try {
      setLoading(true);
      await api.updateTag(editingTag.id, editName.trim(), editColor);
      setEditingTag(null);
      onRefresh();
    } catch (err) {
      console.error('Error updating tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (!isAdmin) return;
    try {
      await api.deleteTag(tag.id);
      onRefresh();
    } catch (err) {
      console.error('Error deleting tag:', err);
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-primary-600" />
          <span>{getTranslation(lang, 'tagsTitle')}</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {tags.length} total
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {getTranslation(lang, 'tagsSubtitle')}
        </p>
      </div>

      {/* Grid: Create Form / Info Box + Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Tag Box or Viewer Info Box */}
        {isAdmin ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-600" />
              <span>{getTranslation(lang, 'createNewTag')}</span>
            </h3>

            <form onSubmit={handleCreateTag} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {getTranslation(lang, 'tagName')}
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="new-tag-name-input"
                    type="text"
                    placeholder="e.g. Core Team, VIP, Mentor, Cloud"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  {getTranslation(lang, 'tagColor')}
                </label>
                <div className="flex items-center gap-2">
                  {presetColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewTagColor(col)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: col }}
                    >
                      {newTagColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="submit-create-tag-btn"
                type="submit"
                disabled={loading || !newTagName.trim()}
                className="w-full py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors mt-2"
              >
                {loading ? getTranslation(lang, 'loading') : getTranslation(lang, 'createTagBtn')}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <TagIcon className="w-4 h-4 text-primary-600" />
              <span>{getTranslation(lang, 'tagsTitle')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {getTranslation(lang, 'tagsSubtitle')}
            </p>
          </div>
        )}

        {/* Tags List */}
        <div className={cn("space-y-4", isAdmin ? "md:col-span-2" : "md:col-span-2")}>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              id="search-tags-input"
              type="text"
              placeholder={getTranslation(lang, 'searchPeoplePlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 py-1 px-2 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {filteredTags.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              {getTranslation(lang, 'noTags')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  id={`tag-card-${tag.id}`}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-primary-400 transition-colors flex items-center justify-between group"
                >
                  <div
                    onClick={() => onSelectTag(tag.name)}
                    className="cursor-pointer flex items-center gap-2.5 min-w-0 flex-1"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color || '#2563eb' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        #{tag.name}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{getTranslation(lang, 'linkedPeople')}</span>
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingTag(tag);
                          setEditName(tag.name);
                          setEditColor(tag.color || '#2563eb');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={getTranslation(lang, 'edit')}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={getTranslation(lang, 'delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Tag Modal (Admin only) */}
      {isAdmin && editingTag && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {getTranslation(lang, 'edit')} #{editingTag.name}
            </h3>

            <form onSubmit={handleUpdateTag} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {getTranslation(lang, 'tagName')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {getTranslation(lang, 'tagColor')}
                </label>
                <div className="flex items-center gap-2">
                  {presetColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setEditColor(col)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ backgroundColor: col }}
                    >
                      {editColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTag(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {getTranslation(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading || !editName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold"
                >
                  {getTranslation(lang, 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

