import React, { useState, useEffect } from 'react';
import { Palette, 
  Download,
  Upload,
  Trash2,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldCheck,
  User as UserIcon,
  Users,
  Check,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../lib/api';
import { uploadToCloudinary } from '../lib/cloudinary';
import { Language, getTranslation } from '../lib/i18n';
import { User, AppSettings } from '../types';

interface SettingsViewProps {
  appSettings?: AppSettings;
  onSettingsUpdated?: (settings: AppSettings) => void;
  themeColor: string;
  onChangeTheme: (color: string) => void;
  onRefreshAll: () => void;
  isAdmin?: boolean;
  lang?: Language;
  currentUserId?: string;
  onUpdateUser?: (user: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  appSettings,
  onSettingsUpdated,
  onRefreshAll, 
  themeColor, 
  onChangeTheme, 
  isAdmin = false, 
  lang = 'en' as Language,
  currentUserId,
  onUpdateUser
}) => {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isAboutMeOpen, setIsAboutMeOpen] = useState(false);

  // Admin Tools state (Step 3)
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminUsers();
    }
  }, [isAdmin]);

  const loadAdminUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await api.getAdminUsers();
      setAdminUsers(users);
    } catch (err: any) {
      console.error('Failed to load users for admin tools:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setMessage(null);
      await api.updateAdminUserRole(userId, newRole);
      setMessage({ type: 'success', text: `User role updated to ${newRole} successfully!` });
      loadAdminUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update user role: ' + err.message });
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await api.exportJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-directory-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Full JSON backup downloaded successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Export failed: ' + err.message });
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await api.exportCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-directory-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'CSV contacts export downloaded successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'CSV Export failed: ' + err.message });
    }
  };

  const handleJSONUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setMessage(null);
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await api.importJSON(parsed);
      setMessage({
        type: 'success',
        text: `JSON backup imported successfully! (${res.importedPeople} contacts, ${res.importedNotes} notes, ${res.importedInteractions} interactions, ${res.importedTags} tags)`,
      });
      onRefreshAll();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Import failed: ' + (err.message || 'Invalid JSON file') });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setMessage(null);
      const csvText = await file.text();

      const res = await api.importCSV(csvText);
      setMessage({
        type: 'success',
        text: `CSV import completed! Created: ${res.created ?? 0}, Updated: ${res.updated ?? 0}. Errors: ${res.errors?.length || 0}`,
      });
      onRefreshAll();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'CSV Import failed: ' + (err.message || 'Error processing CSV') });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleResetData = async () => {
    try {
      await api.resetDatabase();
      setMessage({ type: 'success', text: 'Directory has been reset to default clean seed records successfully.' });
      setResetConfirm(false);
      onRefreshAll();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to reset directory: ' + err.message });
    }
  };

  const [appNameInput, setAppNameInput] = useState(appSettings?.appName || 'Social Directory');
  const [logoUrlInput, setLogoUrlInput] = useState(appSettings?.logoUrl || '');
  const defaultBnText = `**অ্যাপের বৈশিষ্ট্যসমূহ (Features):**
📇 **কন্টাক্ট ম্যানেজমেন্ট (Contact Management):** নতুন কন্টাক্ট যোগ করুন এবং ক্যাটাগরি (পরিবার, বন্ধু, অফিস) অনুযায়ী সহজেই সাজান।
🏷️ **ট্যাগ এবং সার্কেল (Tags & Circles):** কাস্টম ট্যাগ ব্যবহার করে নির্দিষ্ট মানুষদের সহজেই গ্রুপ করুন এবং খুঁজে বের করুন।
📝 **নোট এবং ইন্টারঅ্যাকশন (Notes & Interactions):** প্রতিটি মানুষের সাথে আপনার মিটিং, কল বা মেসেজের বিস্তারিত তথ্য সেভ করে রাখুন।
🔔 **রিমাইন্ডার (Reminders):** গুরুত্বপূর্ণ ফলো-আপ বা জন্মদিনের নোটিফিকেশন পান।
📊 **ড্যাশবোর্ড (Dashboard):** আপনার পুরো নেটওয়ার্কের একটি কুইক ওভারভিউ দেখুন।
🎨 **কাস্টম থিম (Custom Themes):** নিজের পছন্দমতো অ্যাপের কালার থিম পরিবর্তন করুন।

**কীভাবে ব্যবহার করবেন (Step by step instructions):**
১. **ড্যাশবোর্ড (Dashboard):** অ্যাপটি ওপেন করলেই ড্যাশবোর্ডে আপনি আপনার কন্টাক্ট এবং সাম্প্রতিক অ্যাক্টিভিটির ওভারভিউ দেখতে পাবেন।
২. **নতুন কন্টাক্ট যোগ করা:** নিচে থাকা "People" ট্যাবে গিয়ে "+" বাটনে ক্লিক করে নতুন কন্টাক্টের নাম, ফোন নম্বর, ইমেইল এবং অন্যান্য তথ্য যোগ করুন।
৩. **ইন্টারঅ্যাকশন লগ করা:** যেকোনো কন্টাক্টের প্রোফাইলে ঢুকে "Log Interaction" বাটনে ক্লিক করে আপনাদের সর্বশেষ কথা বা মিটিংয়ের বিবরণ লিখে রাখুন।
৪. **সাজিয়ে রাখা:** "Tags" ট্যাবে গিয়ে আপনার প্রয়োজন অনুযায়ী নতুন ট্যাগ তৈরি করুন (যেমন- "VIP", "School Friends") এবং কন্টাক্টদের সেই অনুযায়ী যুক্ত করুন।
৫. **ফলো-আপ:** "Dashboard" অথবা প্রোফাইলের রিমাইন্ডার সেকশন থেকে নিয়মিত ফলো-আপ করার আপডেট রাখুন।
৬. **সেটিংস (Settings):** এই পেজ থেকে আপনি থিম কালার বদলাতে পারবেন এবং অ্যাপের অন্যান্য কনফিগারেশন সেট করতে পারবেন।`;

const defaultEnText = `**App Features:**
📇 **Contact Management:** Add new contacts and organize them easily by category (Family, Friends, Office).
🏷️ **Tags & Circles:** Easily group and find specific people using custom tags.
📝 **Notes & Interactions:** Save detailed information of your meetings, calls or messages with each person.
🔔 **Reminders:** Get important follow-up or birthday notifications.
📊 **Dashboard:** View a quick overview of your entire network.
🎨 **Custom Themes:** Change the color theme of the app to your liking.

**How to use (Step by step instructions):**
1. **Dashboard:** As soon as you open the app, you will see an overview of your contacts and recent activities on the dashboard.
2. **Adding new contacts:** Go to the "People" tab below and click the "+" button to add the name, phone number, email and other information of the new contact.
3. **Logging Interactions:** Enter any contact's profile and click the "Log Interaction" button to write down the details of your latest conversation or meeting.
4. **Organizing:** Go to the "Tags" tab and create new tags according to your needs (eg- "VIP", "School Friends") and add contacts accordingly.
5. **Follow-up:** Keep regular follow-up updates from the "Dashboard" or profile reminder section.
6. **Settings:** From this page you can change the theme color and set other configurations of the app.`;

  const [aboutMeTextInput, setAboutMeTextInput] = useState(appSettings?.aboutMeText || (lang === 'bn' ? defaultBnText : defaultEnText));
  const [savingIdentity, setSavingIdentity] = useState(false);
  

  useEffect(() => {
    
  }, [isAdmin]);

  useEffect(() => {
    if (appSettings) {
      setAppNameInput(appSettings.appName || 'Social Directory');
      setLogoUrlInput(appSettings.logoUrl || '');
      setAboutMeTextInput(appSettings.aboutMeText || `**অ্যাপের বৈশিষ্ট্যসমূহ (Features):**\n📇 **কন্টাক্ট ম্যানেজমেন্ট (Contact Management):** নতুন কন্টাক্ট যোগ করুন এবং ক্যাটাগরি (পরিবার, বন্ধু, অফিস) অনুযায়ী সহজেই সাজান。\n🏷️ **ট্যাগ এবং সার্কেল (Tags & Circles):** কাস্টম ট্যাগ ব্যবহার করে নির্দিষ্ট মানুষদের সহজেই গ্রুপ করুন এবং খুঁজে বের করুন।\n📝 **নোট এবং ইন্টারঅ্যাকশন (Notes & Interactions):** প্রতিটি মানুষের সাথে আপনার মিটিং, কল বা মেসেজের বিস্তারিত তথ্য সেভ করে রাখুন।\n🔔 **রিমাইন্ডার (Reminders):** গুরুত্বপূর্ণ ফলো-আপ বা জন্মদিনের নোটিফিকেশন পান।\n📊 **ড্যাশবোর্ড (Dashboard):** আপনার পুরো নেটওয়ার্কের একটি কুইক ওভারভিউ দেখুন।\n🎨 **কাস্টম থিম (Custom Themes):** নিজের পছন্দমতো অ্যাপের কালার থিম পরিবর্তন করুন।\n\n**কীভাবে ব্যবহার করবেন (Step by step instructions):**\n১. **ড্যাশবোর্ড (Dashboard):** অ্যাপটি ওপেন করলেই ড্যাশবোর্ডে আপনি আপনার কন্টাক্ট এবং সাম্প্রতিক অ্যাক্টিভিটির ওভারভিউ দেখতে পাবেন।\n২. **নতুন কন্টাক্ট যোগ করা:** নিচে থাকা "People" ট্যাবে গিয়ে "+" বাটনে ক্লিক করে নতুন কন্টাক্টের নাম, ফোন নম্বর, ইমেইল এবং অন্যান্য তথ্য যোগ করুন।\n৩. **ইন্টারঅ্যাকশন লগ করা:** যেকোনো কন্টাক্টের প্রোফাইলে ঢুকে "Log Interaction" বাটনে ক্লিক করে আপনাদের সর্বশেষ কথা বা মিটিংয়ের বিবরণ লিখে রাখুন।\n৪. **সাজিয়ে রাখা:** "Tags" ট্যাবে গিয়ে আপনার প্রয়োজন অনুযায়ী নতুন ট্যাগ তৈরি করুন (যেমন- "VIP", "School Friends") এবং কন্টাক্টদের সেই অনুযায়ী যুক্ত করুন।\n৫. **ফলো-আপ:** "Dashboard" অথবা প্রোফাইলের রিমাইন্ডার সেকশন থেকে নিয়মিত ফলো-আপ করার আপডেট রাখুন।\n৬. **সেটিংস (Settings):** এই পেজ থেকে আপনি থিম কালার বদলাতে পারবেন এবং অ্যাপের অন্যান্য কনফিগারেশন সেট করতে পারবেন।`);
    }
  }, [appSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Increased limit to 5MB for Cloudinary
        setMessage({ type: 'error', text: 'Logo image must be smaller than 5MB' });
        return;
      }
      try {
        setSavingIdentity(true);
        setMessage({ type: 'success', text: 'Uploading image to Cloudinary...' });
        const url = await uploadToCloudinary(file);
        setLogoUrlInput(url);
        setMessage({ type: 'success', text: 'Image uploaded! Click Save to apply.' });
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
      } finally {
        setSavingIdentity(false);
      }
    }
  };

  const handleUpdateIdentity = async () => {
    try {
      setSavingIdentity(true);
      const res = await api.updateSettings({ appName: appNameInput, logoUrl: logoUrlInput, aboutMeText: aboutMeTextInput });
      if (onSettingsUpdated) onSettingsUpdated(res);
      setMessage({ type: 'success', text: 'App settings updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update settings: ' + err.message });
    } finally {
      setSavingIdentity(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>{getTranslation(lang, 'settingsTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {getTranslation(lang, 'settingsSubtitle')}
        </p>
      </div>

            {/* Alert status message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in duration-150 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

                {/* Step 3: Admin Tools (Super Admin can assign admin access & role-based functions) */}
      {isAdmin ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500">
                <Palette className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  App Identity (Admin Only)
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs">
                Global Settings
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the application name and logo globally. This will reflect across the entire app for all users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">App Name</label>
                <input 
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="e.g. Social Directory"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Logo Image</label>
                <div className="flex items-center gap-3">
                  {logoUrlInput && (
                    <img src={logoUrlInput} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                  )}
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/30 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleUpdateIdentity}
                disabled={savingIdentity}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {savingIdentity ? 'Saving...' : 'Save App Identity'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Admin Tools & Role Management
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
              Super Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Grant or revoke admin access and assign role-based functions (Support Admin / Admin / Viewer) to registered users and Firebase Authentication accounts.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Email</th>
                  <th className="py-2.5 px-3 font-semibold">Current Role</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Assign Function / Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">Loading users...</td>
                  </tr>
                ) : adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">No users found.</td>
                  </tr>
                ) : (
                  adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-600/20 text-primary-600 font-bold flex items-center justify-center text-xs">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <span>{u.fullName || u.username}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' 
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {u.role === 'admin' ? 'Support / Super Admin' : 'Viewer / Standard'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <select
                          value={u.role || 'viewer'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        >
                          <option value="admin">Admin (Support / Super)</option>
                          <option value="viewer">Viewer / Guest</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      ) : null}

      {/* Privacy & Security Card */}
      <div className="bg-gradient-to-br from-primary-50 to-slate-50 dark:from-primary-950/20 dark:to-slate-900 rounded-2xl p-5 border border-primary-200/80 dark:border-primary-800/50 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-600 text-white shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {getTranslation(lang, 'guaranteeTitle')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {getTranslation(lang, 'guaranteeSubtitle')}
            </p>
          </div>
        </div>

        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-4 list-disc">
          <li>
            {getTranslation(lang, 'privStorage')}
          </li>
          <li>
            {getTranslation(lang, 'legitSourcing')}
          </li>
          <li>
            {getTranslation(lang, 'completeOwner')}
          </li>
        </ul>
      </div>

      {/* Theme Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {getTranslation(lang, 'themeColors')}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {getTranslation(lang, 'personalizeTheme')}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {[
            { id: 'blue', color: 'bg-blue-600', nameKey: 'colorBlue' as const },
            { id: 'emerald', color: 'bg-emerald-600', nameKey: 'colorEmerald' as const },
            { id: 'violet', color: 'bg-violet-600', nameKey: 'colorViolet' as const },
            { id: 'rose', color: 'bg-rose-600', nameKey: 'colorRose' as const },
            { id: 'amber', color: 'bg-amber-600', nameKey: 'colorAmber' as const },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChangeTheme(theme.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                themeColor === theme.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full shadow-inner ${theme.color}`} />
              <span className="text-sm font-semibold">{getTranslation(lang, theme.nameKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Operations (Export, Import & Reset) */}
      {isAdmin ? (
        <>
          {/* Export Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {getTranslation(lang, 'exportDataTitle')}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'exportDataSub')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* JSON Full Backup */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-primary-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {getTranslation(lang, 'jsonBackup')}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {getTranslation(lang, 'jsonBackupDesc')}
                  </p>
                </div>
                <button
                  id="export-json-btn"
                  onClick={handleExportJSON}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'exportJson')}</span>
                </button>
              </div>

              {/* CSV Export */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {getTranslation(lang, 'csvExportTitle')}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {getTranslation(lang, 'csvExportDesc')}
                  </p>
                </div>
                <button
                  id="export-csv-btn"
                  onClick={handleExportCSV}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'exportJson')}</span>
                </button>
              </div>
            </div>
          </div>
          {/* Import Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {getTranslation(lang, 'importDataTitle')}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getTranslation(lang, 'importDataSub')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* JSON Restore */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-primary-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {getTranslation(lang, 'importDataTitle')}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {getTranslation(lang, 'jsonBackupDesc')}
                  </p>
                </div>

                <label className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importing ? getTranslation(lang, 'loading') : getTranslation(lang, 'importJson')}</span>
                  <input
                    id="import-json-input"
                    type="file"
                    accept=".json,application/json"
                    onChange={handleJSONUpload}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
              </div>

              {/* CSV Import */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {getTranslation(lang, 'importDataTitle')}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {getTranslation(lang, 'selectCsvFile')}
                  </p>
                </div>

                <label className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importing ? getTranslation(lang, 'loading') : getTranslation(lang, 'importJson')}</span>
                  <input
                    id="import-csv-input"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCSVUpload}
                    disabled={importing}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-5 border border-red-200 dark:border-red-900/50 space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-bold text-base">{getTranslation(lang, 'dangerZone')}</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {getTranslation(lang, 'dangerDesc')}
            </p>

            {resetConfirm ? (
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-xl border border-red-300 dark:border-red-800 space-y-2">
                <p className="text-xs font-bold text-red-900 dark:text-red-200">
                  {getTranslation(lang, 'confirmResetQuery')}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    id="confirm-reset-db-btn"
                    onClick={handleResetData}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {getTranslation(lang, 'yesReset')}
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    {getTranslation(lang, 'cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="trigger-reset-db-btn"
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl text-xs font-semibold transition-colors"
              >
                {getTranslation(lang, 'resetContacts')}
              </button>
            )}
          </div>
        </>
      ) : null}
    
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <button 
          onClick={() => setIsAboutMeOpen(!isAboutMeOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500">
            <Info className="w-5 h-5" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              About Me (App Features)
            </h3>
          </div>
          {isAboutMeOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {isAboutMeOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-4">
            {isAdmin ? (
              <div className="space-y-4 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Write down all the features of this app step by step. Both Bangla and English are supported. This content will be publicly viewable by all clients.
                </p>
                <textarea
                  value={aboutMeTextInput}
                  onChange={(e) => setAboutMeTextInput(e.target.value)}
                  placeholder="Write your app features here..."
                  rows={12}
                  className="w-full px-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleUpdateIdentity}
                    disabled={savingIdentity}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {savingIdentity ? "Saving..." : "Save About Me"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mt-4">
                {appSettings?.aboutMeText ? (
                  <span>{appSettings.aboutMeText}</span>
                ) : lang === 'bn' ? (
                      <>
                        <p className="font-bold mb-2">অ্যাপের বৈশিষ্ট্যসমূহ (Features):</p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                          <li>📇 <strong>কন্টাক্ট ম্যানেজমেন্ট (Contact Management):</strong> নতুন কন্টাক্ট যোগ করুন এবং ক্যাটাগরি (পরিবার, বন্ধু, অফিস) অনুযায়ী সহজেই সাজান।</li>
                          <li>🏷️ <strong>ট্যাগ এবং সার্কেল (Tags & Circles):</strong> কাস্টম ট্যাগ ব্যবহার করে নির্দিষ্ট মানুষদের সহজেই গ্রুপ করুন এবং খুঁজে বের করুন।</li>
                          <li>📝 <strong>নোট এবং ইন্টারঅ্যাকশন (Notes & Interactions):</strong> প্রতিটি মানুষের সাথে আপনার মিটিং, কল বা মেসেজের বিস্তারিত তথ্য সেভ করে রাখুন।</li>
                          <li>🔔 <strong>রিমাইন্ডার (Reminders):</strong> গুরুত্বপূর্ণ ফলো-আপ বা জন্মদিনের নোটিফিকেশন পান।</li>
                          <li>📊 <strong>ড্যাশবোর্ড (Dashboard):</strong> আপনার পুরো নেটওয়ার্কের একটি কুইক ওভারভিউ দেখুন।</li>
                          <li>🎨 <strong>কাস্টম থিম (Custom Themes):</strong> নিজের পছন্দমতো অ্যাপের কালার থিম পরিবর্তন করুন।</li>
                        </ul>
                        <p className="font-bold mb-2">কীভাবে ব্যবহার করবেন (Step by step instructions):</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li><strong>ড্যাশবোর্ড (Dashboard):</strong> অ্যাপটি ওপেন করলেই ড্যাশবোর্ডে আপনি আপনার কন্টাক্ট এবং সাম্প্রতিক অ্যাক্টিভিটির ওভারভিউ দেখতে পাবেন।</li>
                          <li><strong>নতুন কন্টাক্ট যোগ করা:</strong> নিচে থাকা "People" ট্যাবে গিয়ে "+" বাটনে ক্লিক করে নতুন কন্টাক্টের নাম, ফোন নম্বর, ইমেইল এবং অন্যান্য তথ্য যোগ করুন।</li>
                          <li><strong>ইন্টারঅ্যাকশন লগ করা:</strong> যেকোনো কন্টাক্টের প্রোফাইলে ঢুকে "Log Interaction" বাটনে ক্লিক করে আপনাদের সর্বশেষ কথা বা মিটিংয়ের বিবরণ লিখে রাখুন।</li>
                          <li><strong>সাজিয়ে রাখা:</strong> "Tags" ট্যাবে গিয়ে আপনার প্রয়োজন অনুযায়ী নতুন ট্যাগ তৈরি করুন (যেমন- "VIP", "School Friends") এবং কন্টাক্টদের সেই অনুযায়ী যুক্ত করুন।</li>
                          <li><strong>ফলো-আপ:</strong> "Dashboard" অথবা প্রোফাইলের রিমাইন্ডার সেকশন থেকে নিয়মিত ফলো-আপ করার আপডেট রাখুন।</li>
                          <li><strong>সেটিংস (Settings):</strong> এই পেজ থেকে আপনি থিম কালার বদলাতে পারবেন এবং অ্যাপের অন্যান্য কনফিগারেশন সেট করতে পারবেন।</li>
                        </ol>
                      </>
                    ) : (
                      <>
                        <p className="font-bold mb-2">App Features:</p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                          <li>📇 <strong>Contact Management:</strong> Add new contacts and organize them easily by category (Family, Friends, Office).</li>
                          <li>🏷️ <strong>Tags & Circles:</strong> Easily group and find specific people using custom tags.</li>
                          <li>📝 <strong>Notes & Interactions:</strong> Save detailed information of your meetings, calls or messages with each person.</li>
                          <li>🔔 <strong>Reminders:</strong> Get important follow-up or birthday notifications.</li>
                          <li>📊 <strong>Dashboard:</strong> View a quick overview of your entire network.</li>
                          <li>🎨 <strong>Custom Themes:</strong> Change the color theme of the app to your liking.</li>
                        </ul>
                        <p className="font-bold mb-2">How to use (Step by step instructions):</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li><strong>Dashboard:</strong> As soon as you open the app, you will see an overview of your contacts and recent activities on the dashboard.</li>
                          <li><strong>Adding new contacts:</strong> Go to the "People" tab below and click the "+" button to add the name, phone number, email and other information of the new contact.</li>
                          <li><strong>Logging Interactions:</strong> Enter any contact's profile and click the "Log Interaction" button to write down the details of your latest conversation or meeting.</li>
                          <li><strong>Organizing:</strong> Go to the "Tags" tab and create new tags according to your needs (eg- "VIP", "School Friends") and add contacts accordingly.</li>
                          <li><strong>Follow-up:</strong> Keep regular follow-up updates from the "Dashboard" or profile reminder section.</li>
                          <li><strong>Settings:</strong> From this page you can change the theme color and set other configurations of the app.</li>
                        </ol>
                      </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
