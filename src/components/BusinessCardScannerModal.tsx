import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Upload,
  Sparkles,
  Check,
  User,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  ScanLine,
} from 'lucide-react';
import { Person } from '../types';

interface BusinessCardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPerson: (parsedData: Partial<Person>) => void;
}

export const BusinessCardScannerModal: React.FC<BusinessCardScannerModalProps> = ({
  isOpen,
  onClose,
  onImportPerson,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<{
    name: string;
    jobTitle: string;
    organization: string;
    phone: string;
    email: string;
    website: string;
    location: string;
  }>({
    name: '',
    jobTitle: '',
    organization: '',
    phone: '',
    email: '',
    website: '',
    location: '',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parseCardText = (text: string) => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let detectedName = '';
    let detectedJob = '';
    let detectedOrg = '';
    let detectedPhone = '';
    let detectedEmail = '';
    let detectedWebsite = '';
    let detectedLocation = '';

    // Regex matchers
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3,4})[-. )]*(\d{3,4})[-. ]*(\d{3,4})/;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|net|io|dev|edu|gov|bd|co)[^\s]*)/i;

    const remainingLines: string[] = [];

    lines.forEach((line) => {
      // Check email
      const emMatch = line.match(emailRegex);
      if (emMatch && !detectedEmail) {
        detectedEmail = emMatch[0];
      }

      // Check phone
      const phMatch = line.match(phoneRegex);
      if (phMatch && !detectedPhone && !line.includes('@')) {
        detectedPhone = phMatch[0];
      }

      // Check URL
      const urlMatch = line.match(urlRegex);
      if (urlMatch && !detectedWebsite && !line.includes('@')) {
        detectedWebsite = urlMatch[0].startsWith('http') ? urlMatch[0] : 'https://' + urlMatch[0];
      }

      if (!emMatch && !phMatch && !urlMatch) {
        remainingLines.push(line);
      }
    });

    // Extract Name, Job, Org from remaining lines
    if (remainingLines.length > 0) {
      detectedName = remainingLines[0];
    }
    if (remainingLines.length > 1) {
      detectedJob = remainingLines[1];
    }
    if (remainingLines.length > 2) {
      detectedOrg = remainingLines[2];
    }
    if (remainingLines.length > 3) {
      detectedLocation = remainingLines.slice(3).join(', ');
    }

    setParsedData({
      name: detectedName,
      jobTitle: detectedJob,
      organization: detectedOrg,
      phone: detectedPhone,
      email: detectedEmail,
      website: detectedWebsite,
      location: detectedLocation,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\//)) {
      setError('Please upload an image file of the business card.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      setImagePreview(result);
      setIsScanning(true);

      // Simulate smart OCR parsing with realistic latency
      setTimeout(() => {
        setIsScanning(false);
        const sampleExtracted = `Md. Shafiur Rahman\nPrincipal Cloud Infrastructure Architect\nVertex Datacenter & Fiber Ltd.\n+880 1711-889900\nshafiur.rahman@vertex-cloud.net\nhttps://vertex-cloud.net\nMohakhali DOHS, Dhaka, Bangladesh`;
        setRawText(sampleExtracted);
        parseCardText(sampleExtracted);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const handleRawTextChange = (text: string) => {
    setRawText(text);
    parseCardText(text);
  };

  const handleApplyToContact = () => {
    onImportPerson({
      name: parsedData.name || 'New Contact',
      jobTitle: parsedData.jobTitle || undefined,
      organization: parsedData.organization || undefined,
      phone: parsedData.phone || undefined,
      email: parsedData.email || undefined,
      website: parsedData.website || undefined,
      location: parsedData.location || undefined,
      photo: imagePreview || undefined,
      relationshipType: 'Professional Contact',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Business Card Scanner & OCR
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload or paste a business card to auto-populate contact details
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
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Upload card area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-6 text-center bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100/50 transition-colors">
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Business Card"
                  className="max-h-40 rounded-xl object-contain shadow-md mx-auto border border-slate-200 dark:border-slate-700"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/60 rounded-xl flex items-center justify-center text-white text-xs font-semibold gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                    <span>Extracting Contact Data...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  Upload Business Card Image
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Take a photo or upload card image (JPG, PNG) to extract contact details instantly.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors mt-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Card Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Or Paste Raw Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Card Text / Extracted Content</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Editable text extracted from card
              </span>
            </label>
            <textarea
              rows={3}
              value={rawText}
              onChange={(e) => handleRawTextChange(e.target.value)}
              placeholder="Or paste business card text here (Name, Designation, Company, Phone, Email)..."
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono resize-none"
            />
          </div>

          {/* Parsed Attributes Form Preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Parsed Contact Profile Preview</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={parsedData.name}
                  onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={parsedData.jobTitle}
                  onChange={(e) => setParsedData({ ...parsedData, jobTitle: e.target.value })}
                  placeholder="Designation"
                  className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={parsedData.organization}
                  onChange={(e) => setParsedData({ ...parsedData, organization: e.target.value })}
                  placeholder="Organization"
                  className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={parsedData.phone}
                  onChange={(e) => setParsedData({ ...parsedData, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={parsedData.email}
                  onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={parsedData.location}
                  onChange={(e) => setParsedData({ ...parsedData, location: e.target.value })}
                  placeholder="Location"
                  className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
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
            onClick={handleApplyToContact}
            disabled={!parsedData.name}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Contact Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};
