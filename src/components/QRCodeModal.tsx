import React, { useState } from 'react';
import {
  X,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  Phone,
  Mail,
  Building,
  User,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Person } from '../types';
import { generateVCard, downloadVCard, copyToClipboard } from '../lib/utils';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  const [copied, setCopied] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState('');

  if (!isOpen || !person) return null;

  const vCardString = generateVCard(person);

  const handleCopyVCard = async () => {
    const success = await copyToClipboard(vCardString);
    if (success) {
      setCopied(true);
      setCopySuccessMsg('vCard copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setCopySuccessMsg('');
      }, 2500);
    }
  };

  const handleDownloadVcf = () => {
    downloadVCard(person);
  };

  const handleCopySummary = async () => {
    const summary = `${person.name}${person.jobTitle ? ' - ' + person.jobTitle : ''}${person.organization ? ' (' + person.organization + ')' : ''}\nPhone: ${person.phone || 'N/A'}\nEmail: ${person.email || 'N/A'}\nLocation: ${person.location || 'N/A'}`;
    const success = await copyToClipboard(summary);
    if (success) {
      setCopied(true);
      setCopySuccessMsg('Contact summary copied!');
      setTimeout(() => {
        setCopied(false);
        setCopySuccessMsg('');
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/40">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Digital Business Card
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan with any phone camera to save contact
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

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col items-center text-center space-y-4">
          {/* Contact Badge */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md mb-2 bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                person.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg">
              {person.name}
            </h4>
            {(person.jobTitle || person.organization) && (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {person.jobTitle}
                {person.jobTitle && person.organization ? ' • ' : ''}
                {person.organization}
              </p>
            )}
            <span className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              {person.relationshipType}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center">
            <QRCodeSVG
              value={vCardString}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Brief info list */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 text-left text-xs space-y-1.5 border border-slate-200 dark:border-slate-800">
            {person.phone && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">{person.phone}</span>
              </div>
            )}
            {person.email && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{person.email}</span>
              </div>
            )}
            {person.organization && (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{person.organization}</span>
              </div>
            )}
          </div>

          {copySuccessMsg && (
            <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
              ✓ {copySuccessMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleDownloadVcf}
              className="py-2.5 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download .vcf</span>
            </button>

            <button
              onClick={handleCopyVCard}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy vCard'}</span>
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-medium underline"
          >
            <Share2 className="w-3 h-3" />
            <span>Copy Text Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
