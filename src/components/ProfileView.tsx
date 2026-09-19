import React, { useState, useEffect } from 'react';
import { Person, Note, Interaction, TimelineEvent } from '../types';
import { api } from '../lib/api';
import { Language, getTranslation } from '../lib/i18n';
import { User as UserIcon, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { PersonDetailModal } from './PersonDetailModal';

interface ProfileViewProps {
  currentUserId?: string;
  isAdmin?: boolean;
  lang?: Language;
  onRefreshAll?: () => void;
  onOpenQRCode?: (person: Person) => void;
  onOpenOutreach?: (person: Person, defaultTopic?: 'birthday' | 'catchup' | 'meeting' | 'general') => void;
  onEditPerson?: (person: Person) => void;
  onDeletePerson?: (person: Person) => void;
  onToggleFavorite?: (personId: string, e: React.MouseEvent) => void;
  onToggleArchive?: (personId: string, e: React.MouseEvent) => void;
  onClose?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUserId,
  isAdmin = false,
  lang = 'en' as Language,
  onRefreshAll,
  onOpenQRCode,
  onOpenOutreach,
  onEditPerson,
  onDeletePerson,
  onToggleFavorite,
  onToggleArchive,
  onClose
}) => {
  const [myPerson, setMyPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProfileCard = async () => {
    try {
      setLoading(true);
      setError(null);
      const person = await api.getMyPerson();
      setMyPerson(person);
    } catch (err: any) {
      setError(err.message || 'Failed to load your profile card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfileCard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading your profile directory card...</p>
      </div>
    );
  }

  if (error || !myPerson) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl max-w-xl mx-auto text-center space-y-3 my-10">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error || 'Profile card not found'}</p>
        <button
          onClick={fetchMyProfileCard}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-primary-600" />
            <span>{lang === 'bn' ? 'আমার প্রোফাইল ডিরেক্টরি কার্ড' : 'My Profile Directory Card'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'bn'
              ? 'এটি আপনার ব্যক্তিগত ডিরেক্টরি রেকর্ড। এখান থেকে আপনার তথ্য দেখতে ও পরিবর্তন করতে পারেন।'
              : 'This is your personal directory record. You can edit your info, add notes, interactions, health records, vault items, and family connections here.'}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ডিরেক্টরি তালিকায় ফিরুন' : 'Back to Contacts'}</span>
          </button>
        )}
      </div>

      <div className="w-full">
        <PersonDetailModal
          personId={myPerson.id}
          embedded={true}
          onClose={onClose || (() => {})}
          onEdit={(p) => {
            if (onEditPerson) onEditPerson(p);
            fetchMyProfileCard();
          }}
          onDelete={(p) => {
            if (onDeletePerson) onDeletePerson(p);
          }}
          onToggleFavorite={onToggleFavorite || (() => {})}
          onToggleArchive={onToggleArchive || (() => {})}
          onDataUpdated={() => {
            fetchMyProfileCard();
            if (onRefreshAll) onRefreshAll();
          }}
          onOpenQRCode={onOpenQRCode}
          onOpenOutreach={onOpenOutreach}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};
