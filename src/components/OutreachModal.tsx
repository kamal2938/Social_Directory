import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Cake,
  Calendar,
  Coffee,
} from 'lucide-react';
import { Person, OutreachTemplate } from '../types';
import { copyToClipboard } from '../lib/utils';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onLogInteraction?: (personId: string, type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting', description: string) => Promise<void>;
  defaultTab?: 'whatsapp' | 'email' | 'call';
  defaultTopic?: 'birthday' | 'catchup' | 'meeting' | 'general';
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
  person,
  onLogInteraction,
  defaultTab = 'whatsapp',
  defaultTopic = 'general',
}) => {
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'call'>(defaultTab);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    defaultTopic === 'birthday' ? 'birthday' : defaultTopic === 'meeting' ? 'meeting' : 'catchup'
  );
  const [customMessage, setCustomMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoLogInteraction, setAutoLogInteraction] = useState(true);

  if (!isOpen || !person) return null;

  const firstName = person.nickname || person.name.split(' ')[0] || person.name;

  const templates: Record<string, { label: string; icon: React.ReactNode; text: string; emailSubject?: string }> = {
    catchup: {
      label: 'Casual Catch-up',
      icon: <Coffee className="w-3.5 h-3.5" />,
      text: `Hi ${firstName}, hope you're doing well! It's been a while since we last connected. Would love to catch up soon when you have some free time. Let me know!`,
      emailSubject: `Catching up / Quick check-in - ${person.name}`,
    },
    birthday: {
      label: 'Happy Birthday 🎂',
      icon: <Cake className="w-3.5 h-3.5" />,
      text: `Happy Birthday, ${firstName}! 🎉 Wishing you a wonderful year ahead filled with good health, great happiness, and continuous success! Have a fantastic day!`,
      emailSubject: `Happy Birthday ${firstName}! 🎂🎉`,
    },
    meeting: {
      label: 'Schedule a Meeting',
      icon: <Calendar className="w-3.5 h-3.5" />,
      text: `Hi ${firstName}, hope you're having a productive week. Are you available for a brief 15-minute call sometime this week or next week? Let me know what time works best for you.`,
      emailSubject: `Meeting Request / Quick sync with ${firstName}`,
    },
    professional: {
      label: 'Professional Check-in',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      text: `Hello ${firstName}, I came across an interesting update related to ${person.organization || 'our industry'} and thought of you. Hope everything is progressing smoothly on your end!`,
      emailSubject: `Quick industry update & check-in - ${person.name}`,
    },
    custom: {
      label: 'Custom Message',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      text: '',
      emailSubject: `Hello ${firstName}`,
    },
  };

  const currentText =
    selectedTemplate === 'custom'
      ? customMessage
      : templates[selectedTemplate]?.text || '';

  const currentSubject =
    emailSubject || templates[selectedTemplate]?.emailSubject || `Hello ${firstName}`;

  const cleanPhone = (person.phone || '').replace(/[^0-9+]/g, '');

  const handleLaunchChannel = async () => {
    if (channel === 'whatsapp') {
      const encodedMsg = encodeURIComponent(currentText);
      const url = cleanPhone
        ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMsg}`
        : `https://api.whatsapp.com/send?text=${encodedMsg}`;
      window.open(url, '_blank');
      if (autoLogInteraction && onLogInteraction) {
        await onLogInteraction(person.id, 'WhatsApp', `WhatsApp message sent: "${currentText.substring(0, 80)}..."`);
      }
    } else if (channel === 'email') {
      const mailtoUrl = `mailto:${person.email || ''}?subject=${encodeURIComponent(currentSubject)}&body=${encodeURIComponent(currentText)}`;
      window.open(mailtoUrl, '_blank');
      if (autoLogInteraction && onLogInteraction) {
        await onLogInteraction(person.id, 'Email', `Email sent (${currentSubject}): "${currentText.substring(0, 80)}..."`);
      }
    } else if (channel === 'call') {
      if (person.phone) {
        window.location.href = `tel:${cleanPhone}`;
      }
      if (autoLogInteraction && onLogInteraction) {
        await onLogInteraction(person.id, 'Call', `Phone call initiated to ${person.name} (${person.phone || 'N/A'})`);
      }
    }
    onClose();
  };

  const handleCopyText = async () => {
    const success = await copyToClipboard(currentText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/40 flex items-center justify-center font-bold text-sm">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                person.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Reach Out to {person.name}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-Click outreach with smart templates & automatic interaction logging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setChannel('whatsapp')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                channel === 'whatsapp'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
              }`}
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setChannel('email')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                channel === 'email'
                  ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-300'
              }`}
            >
              <Mail className="w-5 h-5 text-primary-600" />
              <span>Email</span>
            </button>

            <button
              onClick={() => setChannel('call')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                channel === 'call'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
              }`}
            >
              <Phone className="w-5 h-5 text-indigo-600" />
              <span>Phone Call</span>
            </button>
          </div>

          {channel !== 'call' ? (
            <>
              {/* Template Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Outreach Template
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2">
                  {Object.entries(templates).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedTemplate(key);
                        if (key !== 'custom') {
                          setCustomMessage(t.text);
                          if (t.emailSubject) setEmailSubject(t.emailSubject);
                        }
                      }}
                      className={`p-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                        selectedTemplate === key
                          ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-700 dark:text-primary-300 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {t.icon}
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {channel === 'email' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={currentSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Message Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Message Preview & Editable Text
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={selectedTemplate === 'custom' ? customMessage : currentText}
                  onChange={(e) => {
                    setSelectedTemplate('custom');
                    setCustomMessage(e.target.value);
                  }}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 resize-none leading-relaxed"
                  placeholder="Type your personalized message here..."
                />
              </div>
            </>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                Call {person.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {person.phone || 'No phone number saved for this contact.'}
              </p>
            </div>
          )}

          {/* Auto Log Toggle */}
          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoLogInteraction}
              onChange={(e) => setAutoLogInteraction(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 border-slate-300"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Automatically record this touchpoint in {person.name}'s interaction history
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunchChannel}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : channel === 'email'
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {channel === 'whatsapp'
                ? 'Open in WhatsApp'
                : channel === 'email'
                ? 'Send Email'
                : 'Initiate Call'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
