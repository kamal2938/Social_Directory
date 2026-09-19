import React, { useState, useEffect } from 'react';
import { X, MessageSquare, FileText, Send, Calendar } from 'lucide-react';
import { Person, Interaction } from '../types';
import { api } from '../lib/api';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'interaction' | 'note';
  initialPersonId?: string;
  peopleList: Person[];
  onSuccess: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialPersonId,
  peopleList,
  onSuccess,
}) => {
  const [personId, setPersonId] = useState(initialPersonId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Interaction fields
  const [interactionType, setInteractionType] = useState<Interaction['type']>('Meeting');
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);
  const [interactionDesc, setInteractionDesc] = useState('');
  const [interactionNotes, setInteractionNotes] = useState('');

  // Note fields
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (initialPersonId) {
      setPersonId(initialPersonId);
    } else if ((peopleList || []).length > 0 && !personId) {
      setPersonId(peopleList[0].id);
    }
    setError('');
    setInteractionDesc('');
    setInteractionNotes('');
    setNoteContent('');
  }, [initialPersonId, peopleList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) {
      setError('Please select a contact from the list.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (mode === 'interaction') {
        if (!interactionDesc.trim()) {
          setError('Please provide a short description of the interaction.');
          return;
        }
        await api.addInteraction(personId, {
          type: interactionType,
          date: interactionDate,
          description: interactionDesc.trim(),
          notes: interactionNotes.trim() || undefined,
        });
      } else {
        if (!noteContent.trim()) {
          setError('Please write note content.');
          return;
        }
        await api.addNote(personId, noteContent.trim());
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
          <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
            {mode === 'interaction' ? (
              <>
                <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Log New Interaction</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Add Quick Note</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Select Contact */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Contact <span className="text-red-500">*</span>
            </label>
            <select
              id="quick-log-person-select"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            >
              <option value="">-- Choose Contact --</option>
              {peopleList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.organization ? `(${p.organization})` : ''}
                </option>
              ))}
            </select>
          </div>

          {mode === 'interaction' ? (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    id="quick-interaction-type"
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value as any)}
                    className="w-full py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  >
                    <option value="Meeting">Meeting (In-person)</option>
                    <option value="Online Meeting">Online Meeting (Zoom/Meet)</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Message">Message (WhatsApp/Slack)</option>
                    <option value="Email">Email</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    id="quick-interaction-date"
                    type="date"
                    value={interactionDate}
                    onChange={(e) => setInteractionDate(e.target.value)}
                    className="w-full py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Summary / Discussion Subject
                </label>
                <input
                  id="quick-interaction-desc"
                  type="text"
                  placeholder="e.g. Discussed upcoming Q3 partnership..."
                  value={interactionDesc}
                  onChange={(e) => setInteractionDesc(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Key Notes & Follow-ups
                </label>
                <textarea
                  id="quick-interaction-notes"
                  rows={2}
                  placeholder="Additional context or takeaways..."
                  value={interactionNotes}
                  onChange={(e) => setInteractionNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Note Content
              </label>
              <textarea
                id="quick-note-content"
                rows={4}
                placeholder="Write your private note about this contact..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="quick-log-submit-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
