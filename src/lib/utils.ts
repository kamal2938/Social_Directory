import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Person } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'Never';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getRelationshipColor(type: string): { bg: string; text: string; border: string } {
  switch (type?.toLowerCase()) {
    case 'colleague':
      return { bg: 'bg-primary-50 dark:bg-primary-950/50', text: 'text-primary-700 dark:text-primary-300', border: 'border-primary-200 dark:border-primary-800/60' };
    case 'friend':
      return { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/60' };
    case 'client':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60' };
    case 'mentor':
    case 'teacher':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/60' };
    case 'classmate':
      return { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800/60' };
    case 'family contact':
      return { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60' };
    case 'online contact':
      return { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/60' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
  }
}

export function getInteractionIconInfo(type: string): { name: string; color: string; bg: string } {
  switch (type) {
    case 'Meeting':
      return { name: 'Users', color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/50' };
    case 'Phone Call':
      return { name: 'Phone', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' };
    case 'Message':
    case 'WhatsApp':
      return { name: 'MessageSquare', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50' };
    case 'Email':
      return { name: 'Mail', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50' };
    case 'Online Meeting':
      return { name: 'Video', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50' };
    case 'Event':
      return { name: 'Calendar', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' };
    default:
      return { name: 'Clock', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' };
  }
}

export interface RelationshipHealth {
  score: number;
  status: 'strong' | 'nurture' | 'overdue';
  message: string;
  daysSince: number | null;
  cadence: number;
}

export function getRelationshipHealth(person: Person): RelationshipHealth {
  const cadence = person.followUpCadenceDays || (person.isFavorite ? 14 : 30);

  if (!person.lastInteractionAt) {
    return {
      score: 30,
      status: 'nurture',
      message: 'No touchpoints recorded yet. Schedule a check-in!',
      daysSince: null,
      cadence,
    };
  }

  const lastDate = new Date(person.lastInteractionAt).getTime();
  const now = Date.now();
  const daysSince = Math.max(0, Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)));

  if (daysSince <= cadence) {
    const daysLeft = cadence - daysSince;
    const score = Math.min(100, Math.max(60, Math.round(100 - (daysSince / cadence) * 35)));
    return {
      score,
      status: 'strong',
      message: daysLeft === 0 ? 'Touchpoint due today!' : `On track! Next touchpoint due in ${daysLeft} days.`,
      daysSince,
      cadence,
    };
  } else if (daysSince <= cadence * 1.5) {
    const score = Math.max(35, Math.round(55 - ((daysSince - cadence) / (cadence * 0.5)) * 20));
    return {
      score,
      status: 'nurture',
      message: `Due for touchpoint (${daysSince} days since last contact).`,
      daysSince,
      cadence,
    };
  } else {
    const overdueDays = daysSince - cadence;
    const score = Math.max(10, Math.round(30 - Math.min(25, overdueDays * 0.5)));
    return {
      score,
      status: 'overdue',
      message: `Overdue by ${overdueDays} days (${daysSince} days since contact).`,
      daysSince,
      cadence,
    };
  }
}

export function generateVCard(person: Person): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${person.name || ''}`,
    `N:${person.name || ''};;;;`,
  ];

  if (person.organization) {
    lines.push(`ORG:${person.organization}`);
  }
  if (person.jobTitle || person.occupation) {
    lines.push(`TITLE:${person.jobTitle || person.occupation}`);
  }
  if (person.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${person.phone}`);
  }
  if (person.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${person.email}`);
  }
  if (person.website) {
    lines.push(`URL:${person.website}`);
  }
  if (person.location) {
    lines.push(`ADR;TYPE=WORK:;;;${person.location};;;`);
  }
  if (person.bio) {
    lines.push(`NOTE:${person.bio.replace(/\n/g, '\\n')}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(person: Person): void {
  const vcardText = generateVCard(person);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(person.name || 'contact').toLowerCase().replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}
