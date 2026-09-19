import {
  MessageCircle, HeartPulse } from 'lucide-react';
import { HealthTab } from './HealthTab';
import { FinanceTab } from './FinanceTab';
import { VaultTab } from './VaultTab';
import { EventsGiftsTab } from './EventsGiftsTab';
import { FamilyTreeTab } from './FamilyTreeTab';
import { DollarSign, Shield, Calendar as CalendarIcon, Network as NetworkIcon , UserCircle, ChevronUp, MessageSquarePlus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Edit,
  Trash2,
  Archive,
  Mail,
  Phone,
  Globe,
  Briefcase,
  MapPin,
  Layers,
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Send,
  ExternalLink,
  Linkedin,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  GraduationCap,
  QrCode,
  Users,
  Activity,
  HeartHandshake,
  Sparkles,
  Cake,
  ChevronDown,
} from 'lucide-react';
import { Person, Note, Interaction, TimelineEvent } from '../types';
import { api } from '../lib/api';
import {
  cn,
  formatDate,
  formatDateTime,
  getInitials,
  getRelationshipColor,
  getInteractionIconInfo,
  getRelationshipHealth,
} from '../lib/utils';

interface PersonDetailModalProps {
  personId: string | null;
  onClose: () => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onToggleFavorite: (personId: string, e: React.MouseEvent) => void;
  onToggleArchive: (personId: string, e: React.MouseEvent) => void;
  onDataUpdated: () => void;
  onOpenQRCode?: (person: Person) => void;
  onOpenOutreach?: (person: Person, defaultTopic?: 'birthday' | 'catchup' | 'meeting' | 'general') => void;
  isAdmin?: boolean;
  currentUserId?: string;
  embedded?: boolean;
}

const ProfileSectionCard = ({ title, icon: Icon, children, onEdit }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-y sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:rounded-xl mb-3 shadow-xs">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-bold text-[16px] text-slate-900 dark:text-white flex items-center gap-2">
          {title}
        </h3>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
};


const AccordionSection = ({ id, title, icon: Icon, badge, children, activeTab, setActiveTab }: any) => {
  const isOpen = activeTab === id;
  return (
    <div className="bg-white dark:bg-slate-900 border-b sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:rounded-xl mb-3 overflow-hidden shadow-xs transition-all">
      <button onClick={() => setActiveTab(isOpen ? '' : id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-2 font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
          <Icon className="w-5 h-5 text-primary-500" />
          {title}
        </div>
        <div className="flex items-center gap-3">
          {badge !== undefined && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">{badge}</span>}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {isOpen && <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">{children}</div>}
    </div>
  );
};

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  personId,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleArchive,
  onDataUpdated,
  onOpenQRCode,
  onOpenOutreach,
  isAdmin = true,
  currentUserId,
  embedded = false,
}) => {
  const [person, setPerson] = useState<Person | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const isOwner = person?.userId === currentUserId;
  const canEdit = isAdmin || isOwner;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'interactions' | 'timeline' | 'health' | 'finance' | 'vault' | 'events' | 'family'>('overview');

  // New Note state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // New Interaction form state
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionType, setInteractionType] = useState<Interaction['type']>('Meeting');
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);
  const [interactionDesc, setInteractionDesc] = useState('');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [savingInteraction, setSavingInteraction] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDetails = async () => {
    if (!personId) return;
    try {
      setLoading(true);
      const data = await api.getPerson(personId);
      setPerson(data.person || null);
      setNotes(data.notes || []);
      setInteractions(data.interactions || []);
      setTimeline(data.timeline || []);
    } catch (err) {
      console.error('Failed to load person details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [personId]);

  useEffect(() => {
    if (embedded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [embedded, onClose]);

  if (!personId) return null;
  if (!loading && !person) return null;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !personId) return;
    try {
      setSavingNote(true);
      await api.addNote(personId, newNoteContent.trim());
      setNewNoteContent('');
      await fetchDetails();
      onDataUpdated();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.deleteNote(noteId);
      await fetchDetails();
      onDataUpdated();
    } catch (err) {
      if (!(err as any)?.message?.includes('not found')) console.error('Error deleting note:', err);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionDesc.trim() || !personId) return;
    try {
      setSavingInteraction(true);
      await api.addInteraction(personId, {
        type: interactionType,
        date: interactionDate,
        description: interactionDesc.trim(),
        notes: interactionNotes.trim() || undefined,
      });
      setInteractionDesc('');
      setInteractionNotes('');
      setShowInteractionForm(false);
      await fetchDetails();
      onDataUpdated();
    } catch (err) {
      console.error('Error adding interaction:', err);
    } finally {
      setSavingInteraction(false);
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    try {
      await api.deleteInteraction(interactionId);
      await fetchDetails();
      onDataUpdated();
    } catch (err) {
      if (!(err as any)?.message?.includes('not found')) console.error('Error deleting interaction:', err);
    }
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-primary-600" />;
      case 'github':
        return <Github className="w-4 h-4 text-slate-800 dark:text-slate-200" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-sky-500" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-primary-700" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      default:
        return <Globe className="w-4 h-4 text-slate-500" />;
    }
  };

  const health = person ? getRelationshipHealth(person) : null;

  const modalInner = (
    <div className={cn("bg-slate-50 dark:bg-slate-950 w-full flex flex-col relative border-0 sm:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 ease-out", embedded ? "shadow-xs rounded-2xl" : "h-full sm:h-auto rounded-none sm:rounded-2xl max-w-2xl shadow-none sm:shadow-2xl overflow-hidden sm:max-h-[92vh]")}>
      <div className="flex-1 overflow-y-auto min-h-0 w-full flex flex-col">
      
      {/* Header Area (FB Style) */}
      <div className="bg-white dark:bg-slate-900 flex-shrink-0 relative">
        {/* Cover Photo Area */}
        <div 
          className="h-32 sm:h-40 w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 relative bg-cover bg-center"
          style={person?.coverPhoto ? { backgroundImage: `url(${person.coverPhoto})` } : {}}
        >
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {onOpenQRCode && (
                <button
                  onClick={() => onOpenQRCode(person!)}
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                  title="QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              )}
              {canEdit && (
                <>
                  <button
                    onClick={() => {
                      onEdit(person!);
                      onClose();
                    }}
                    className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                    title="Edit Contact"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(person!)}
                    className="p-2 rounded-full bg-black/20 hover:bg-red-500/80 text-white backdrop-blur-sm transition-colors"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Avatar & Profile Info */}
        <div className="px-4 pb-4">
          <div className="relative flex justify-center -mt-16 sm:-mt-20 mb-3">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0 relative">
               {person?.photo ? (
                  <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-slate-300 dark:text-slate-600">
                    {person ? getInitials(person.name) : ''}
                  </span>
               )}
               {person?.isFavorite && (
                 <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white dark:bg-slate-900 rounded-full p-0.5">
                   <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                 </div>
               )}
            </div>
          </div>
          {/* Quick Actions (Thumb Zone) */}
          {!embedded && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 mb-4 px-4">
              {person?.phone && (
                <a href={"tel:" + person.phone} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Call</span>
                </a>
              )}
              {person?.phone && (
                <a href={"https://wa.me/" + person.phone.replace(/[^0-9]/g, '')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">WhatsApp</span>
                </a>
              )}
              {person?.email && (
                <a href={"mailto:" + person.email} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Email</span>
                </a>
              )}
              <button onClick={() => setActiveTab('notes')} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Notes</span>
              </button>
            </div>
          )}


          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              {person?.name}
              {person?.isArchived && <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Archived</span>}
            </h2>
            <div className="text-[14px] text-slate-600 dark:text-slate-400 mt-1 flex justify-center items-center gap-2">
               {person?.jobTitle || person?.occupation ? (
                 <span className="font-medium text-slate-800 dark:text-slate-200">
                   {person.jobTitle || person.occupation} {person.organization && `at ${person.organization}`}
                 </span>
               ) : null}
            </div>
            
            <div className="mt-1.5 text-xs text-slate-500 flex items-center justify-center gap-3">
               <span className="font-semibold text-slate-800 dark:text-slate-200">{interactions.length} <span className="font-normal text-slate-500">interactions</span></span>
               <span>•</span>
               <span className="font-semibold text-slate-800 dark:text-slate-200">{person?.relationshipType} <span className="font-normal text-slate-500">relation</span></span>
            </div>
            {person?.bio && (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                {person.bio}
              </p>
            )}
          </div>

          {/* Quick Action Bar (Dashboard, Edit, Call etc) */}
          <div className="flex gap-2 mt-5 px-2">
             <a
                href={person?.phone ? `tel:${person.phone}` : '#'}
                onClick={(e) => !person?.phone && e.preventDefault()}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors", person?.phone ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed")}
             >
                <Phone className="w-4 h-4" /> Call
             </a>
             <a
                href={person?.email ? `mailto:${person.email}` : '#'}
                onClick={(e) => !person?.email && e.preventDefault()}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors", person?.email ? "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed")}
             >
                <Mail className="w-4 h-4" /> Email
             </a>
             {canEdit ? (
               <>
                 <button
                    onClick={() => {
                      onEdit(person!);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Edit Contact"
                 >
                   <Edit className="w-4 h-4" />
                   <span className="hidden lg:inline">Edit</span>
                 </button>
                 <button
                    onClick={() => onDelete(person!)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete Contact"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </>
             ) : (
               <button
                  onClick={() => {
                    onEdit(person!);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Edit Contact"
               >
                 <Edit className="w-4 h-4" />
                 <span className="hidden sm:inline">Edit</span>
               </button>
             )}
             {onOpenOutreach && (
               <button
                  onClick={() => onOpenOutreach(person!, 'catchup')}
                  className="flex items-center justify-center p-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="AI Draft Outreach"
               >
                 <Sparkles className="w-5 h-5" />
               </button>
             )}
          </div>
        </div>
      </div>

          <div className="bg-slate-100 dark:bg-slate-950 sm:p-2 flex-1 pb-10">
          <div className="px-0 sm:px-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading profile details...
            </div>
          ) : !person ? (
            <div className="py-12 text-center text-red-500 text-xs">
              Contact not found.
            </div>
          ) : (
<>
<AccordionSection id="overview" title="Overview" icon={UserCircle} activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* OVERVIEW TAB */}
            <div className="space-y-4">
              <ProfileSectionCard title="Relationship & CRM" onEdit={() => { onEdit(person); onClose(); }}>
                <div className="space-y-4">
                  {/* Relationship Health Score & Cadence Banner */}
                  {health && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-800/40 dark:to-indigo-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              Health Score
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {health.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                              health.status === 'strong'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : health.status === 'nurture'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            )}
                          >
                            {health.score}% • {health.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-300 rounded-full',
                            health.status === 'strong'
                              ? 'bg-emerald-500'
                              : health.status === 'nurture'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          )}
                          style={{ width: `${health.score}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Cadence: Every {person.followUpCadenceDays || (person.isFavorite ? 14 : 30)} days</span>
                        <span>Last touchpoint: {person.lastInteractionAt ? formatDate(person.lastInteractionAt) : 'None'}</span>
                      </div>
                    </div>
                  )}

                  {/* Circles & Groups */}
                  {person.circles && person.circles.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Circles & Groups</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(person.circles || []).map((circle, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800"
                          >
                            {circle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ProfileSectionCard>

              <ProfileSectionCard title="Basic Details" onEdit={() => { onEdit(person); onClose(); }}>
                <div className="space-y-4">
                  {/* Bio Section */}
                  {person.bio && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Bio & Context</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        {person.bio}
                      </p>
                    </div>
                  )}

                  {/* Personal & Demographics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {person.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Location:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{person.location}</span>
                      </div>
                    )}
                    {person.gender && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Gender:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{person.gender}</span>
                      </div>
                    )}
                    {person.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <Cake className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">DOB:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(person.dateOfBirth)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </ProfileSectionCard>

              <ProfileSectionCard title="Professional & Education" onEdit={() => { onEdit(person); onClose(); }}>
                <div className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Occupation / Role:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{person.occupation || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Organization:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{person.organization || 'Not specified'}</span>
                    </div>
                    {person.department && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Department:</span>
                        <span className="text-slate-700 dark:text-slate-300">{person.department}</span>
                      </div>
                    )}
                    {person.jobTitle && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Job Title:</span>
                        <span className="text-slate-700 dark:text-slate-300">{person.jobTitle}</span>
                      </div>
                    )}
                    {person.education && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block text-[11px] flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>Education:</span>
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{person.education}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {person.skills && person.skills.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Key Skills & Expertise</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(person.skills || []).map((skill: any, idx) => {
                          const skillName = typeof skill === 'object' && skill !== null ? ((skill as any).name || (skill as any).value || '') : String(skill || '');
                          if (!skillName) return null;
                          return (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                              {skillName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </ProfileSectionCard>

              <ProfileSectionCard title="Contact & Social Links" onEdit={() => { onEdit(person); onClose(); }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {person.email && (
                      <a href={`mailto:${person.email}`} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors flex items-center gap-3 group bg-white dark:bg-slate-900">
                        <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-400 font-medium">Email</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600">{person.email}</p>
                        </div>
                      </a>
                    )}
                    {person.phone && (
                      <a href={`tel:${person.phone}`} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors flex items-center gap-3 group bg-white dark:bg-slate-900">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-400 font-medium">Phone</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600">{person.phone}</p>
                        </div>
                      </a>
                    )}
                    {person.website && (
                      <a href={person.website} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-colors flex items-center gap-3 group bg-white dark:bg-slate-900">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] text-slate-400 font-medium">Website</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 flex items-center gap-1">
                            <span>{person.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </p>
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Social Profiles */}
                  {person.socialLinks && person.socialLinks.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 mt-2">Social Profiles</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(person.socialLinks || []).map((link) => (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 group bg-slate-50 dark:bg-slate-800/50">
                            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900">
                              {renderSocialIcon(link.platform)}
                            </div>
                            <span className="font-semibold capitalize">{link.platform}</span>
                            <span className="text-slate-400 truncate flex-1 text-[11px]">
                              {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ProfileSectionCard>

              {((person.tags && person.tags.length > 0) || (person.customFields && Object.keys(person.customFields).length > 0)) && (
                <ProfileSectionCard title="CRM Tags & Attributes" onEdit={() => { onEdit(person); onClose(); }}>
                  <div className="space-y-4">
                    {/* Tags */}
                    {person.tags && person.tags.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>Tags</span>
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(person.tags || []).map((tag: any, idx) => {
                            const tagName = typeof tag === 'object' && tag !== null ? (tag.name || tag.id || '') : String(tag || '');
                            if (!tagName) return null;
                            return (
                              <span key={idx} className="px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 text-xs font-semibold border border-primary-200 dark:border-primary-800">
                                #{tagName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Dynamic Custom Fields */}
                    {person.customFields && Object.keys(person.customFields).length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Custom Attributes</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {Object.entries(person.customFields || {}).map(([key, value]) => (
                            <div key={key} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                              <span className="text-slate-400 block text-[11px] font-medium">{key}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ProfileSectionCard>
              )}
            </div>
            </AccordionSection>
<AccordionSection id="health" title="Health & Wellness" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab}>
            <HealthTab person={person} />

          </AccordionSection>
<AccordionSection id="finance" title="Financial Profile" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab}>
<FinanceTab person={person} />
</AccordionSection>
          
<AccordionSection id="vault" title="Secure Vault" icon={Archive} activeTab={activeTab} setActiveTab={setActiveTab}>
<VaultTab person={person} />
</AccordionSection>
          
<AccordionSection id="events" title="Events & Gifts" icon={Cake} activeTab={activeTab} setActiveTab={setActiveTab}>
<EventsGiftsTab person={person} />
</AccordionSection>
          
<AccordionSection id="family" title="Family Tree" icon={NetworkIcon} activeTab={activeTab} setActiveTab={setActiveTab}>
<FamilyTreeTab person={person} />
</AccordionSection>

<AccordionSection id="notes" title="Notes" icon={FileText} badge={notes.length} activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* NOTES TAB */}
            <div className="space-y-4">
              {/* Add Note Form */}
              {canEdit && (
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    id="new-note-textarea"
                    rows={3}
                    placeholder="Write a private note about this contact (e.g. key interests, project details, follow-ups)..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />
                  <div className="flex justify-end">
                    <button
                      id="submit-note-btn"
                      type="submit"
                      disabled={savingNote || !newNoteContent.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{savingNote ? 'Saving...' : 'Add Note'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {notes.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">
                    No personal notes recorded for {person.name} yet.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          {formatDateTime(note.createdAt)}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AccordionSection>
<AccordionSection id="interactions" title="Interactions" icon={MessageSquarePlus} badge={interactions.length} activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* INTERACTIONS TAB */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Logged Touchpoints & Conversations
                </h4>
                {canEdit && (
                  <button
                    id="open-interaction-form-btn"
                    onClick={() => setShowInteractionForm(!showInteractionForm)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Interaction</span>
                  </button>
                )}
              </div>

              {/* Interaction Form Modal/Drawer */}
              {isAdmin && showInteractionForm && (
                <form
                  onSubmit={handleAddInteraction}
                  className="p-4 rounded-xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/40 dark:bg-primary-950/20 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Interaction Type
                      </label>
                      <select
                        id="new-interaction-type-select"
                        value={interactionType}
                        onChange={(e) => setInteractionType(e.target.value as any)}
                        className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      >
                        <option value="Meeting">Meeting (In-person)</option>
                        <option value="Online Meeting">Online Meeting (Zoom/Meet)</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="WhatsApp">WhatsApp Message</option>
                        <option value="Email">Email</option>
                        <option value="Event">Event / Conference</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Date
                      </label>
                      <input
                        id="new-interaction-date-input"
                        type="date"
                        value={interactionDate}
                        onChange={(e) => setInteractionDate(e.target.value)}
                        className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Short Description / Subject
                    </label>
                    <input
                      id="new-interaction-desc-input"
                      type="text"
                      placeholder="e.g. Discussed core network routing setup and project budget..."
                      value={interactionDesc}
                      onChange={(e) => setInteractionDesc(e.target.value)}
                      className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Detailed Notes / Takeaways (Optional)
                    </label>
                    <textarea
                      id="new-interaction-notes-input"
                      rows={2}
                      placeholder="Action items or key decisions..."
                      value={interactionNotes}
                      onChange={(e) => setInteractionNotes(e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowInteractionForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-interaction-btn"
                      type="submit"
                      disabled={savingInteraction || !interactionDesc.trim()}
                      className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white text-xs font-semibold"
                    >
                      {savingInteraction ? 'Saving...' : 'Save Interaction'}
                    </button>
                  </div>
                </form>
              )}

              {/* Interactions List */}
              <div className="space-y-3">
                {interactions.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">
                    No interactions logged for {person.name} yet.
                  </p>
                ) : (
                  interactions.map((item) => {
                    const iconInfo = getInteractionIconInfo(item.type);
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={cn('font-bold text-xs', iconInfo.color)}>
                              ● {item.type}
                            </span>
                            <span className="text-slate-400">
                              {formatDate(item.date)}
                            </span>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteInteraction(item.id)}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="Delete interaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          {item.description}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap pl-3 border-l-2 border-primary-500">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </AccordionSection>
<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>
            {/* TIMELINE TAB */}
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-slate-900 flex-shrink-0" />
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {event.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(event.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </AccordionSection>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="w-full relative">{modalInner}</div>;
  }

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {modalInner}
    </div>
  );
};
