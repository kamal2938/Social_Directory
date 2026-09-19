import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Database, 
  MessageSquare, 
  ArrowRight, 
  Star, 
  Activity, 
  BookOpen,
  X,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { TabType, DirectoryStats } from '../types';
import { Language, getTranslation } from '../lib/i18n';

interface HomeViewProps {
  setActiveTab: (tab: TabType) => void;
  stats: DirectoryStats | null;
  onOpenAddPerson?: () => void;
  onOpenAdminLogin?: () => void;
  onOpenLogin?: () => void;
  isAdmin?: boolean;
  lang: Language;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  stats,
  onOpenAddPerson,
  onOpenAdminLogin,
  onOpenLogin,
  isAdmin = false,
  lang,
}) => {
  const [activeStepModal, setActiveStepModal] = useState<number | null>(null);
  const [activeFooterTab, setActiveFooterTab] = useState<'why' | 'what' | 'how'>('why');

  const stepDetailsBn = {
    1: {
      title: "কন্টাক্ট যুক্ত করুন (Add Contact & Profile Management)",
      subtitle: "কিভাবে নতুন পরিচিতি বা কন্টাক্ট যুক্ত ও পরিচালনা করবেন?",
      description: "আপনার পেশাদার ও ব্যক্তিগত পরিচিতিদের সুরক্ষিত রাখতে সঠিক তথ্যসহ কন্টাক্ট এন্ট্রি করার প্রক্রিয়া:",
      steps: [
        "প্রথমে অ্যাডমিন বা অথরাইজড অ্যাকাউন্ট দিয়ে লগইন করুন (অথবা ডেমো অ্যাডমিন মোড ব্যবহার করুন)।",
        "অ্যাপের নেভিগেশন বার বা ডিরেক্টরি পেজ থেকে '+ Add Person' বাটনটিতে ক্লিক করুন।",
        "সঠিক নাম, ইমেল, ফোন নম্বর, পেশা, অর্গানাইজেশন এবং সোশ্যাল মিডিয়া লিংক (যেমন: LinkedIn, GitHub, Twitter) পূরণ করুন।",
        "প্রয়োজনে কন্টাক্টের ছবি বা অবতার যুক্ত করে 'Save' বাটনে ক্লিক করুন।"
      ],
      benefit: "এর মাধ্যমে আপনার সমস্ত গুরুত্বপূর্ণ পরিচিতি ক্লাউড ডেটাবেজে নিরাপদে সংরক্ষিত থাকে এবং যেকোনো ডিভাইস থেকে এক ক্লিকে খুঁজে পাওয়া যায়।"
    },
    2: {
      title: "ট্যাগ ও গ্রুপ করুন (Tags & Categorization)",
      subtitle: "কিভাবে ট্যাগ ও ক্যাটাগরি দিয়ে কন্টাক্ট সাজাবেন?",
      description: "আপনার নেটওয়ার্ককে সুবিন্যস্ত ও ফিল্টার করার জন্য ট্যাগিং সিস্টেম অত্যন্ত কার্যকর:",
      steps: [
        "ডিরেক্টরি পেজে গিয়ে যেকোনো কন্টাক্টে কাস্টম ট্যাগ (যেমন: VIP, Client, Developer, Investor) অ্যাসাইন করুন।",
        "বাম পাশের মেনু থেকে 'Tags' সেকশনে গিয়ে নতুন ট্যাগ তৈরি এবং ম্যানেজ করতে পারেন।",
        "সার্চ বারের নিচে ট্যাগ ফিল্টার ব্যবহার করে নির্দিষ্ট ক্যাটাগরির মানুষগুলোকে মুহূর্তের মধ্যে আলাদা করে দেখতে পারবেন।"
      ],
      benefit: "বিশাল নেটওয়ার্কের মধ্য থেকেও নির্দিষ্ট গ্রুপের মানুষকে আলাদা করা এবং প্রজেক্ট অনুযায়ী কন্টাক্ট ম্যানেজ করা সহজ হয়।"
    },
    3: {
      title: "মিটিং ও টাচপয়েন্ট ট্র্যাক করুন (Interactions & Touchpoints)",
      subtitle: "কিভাবে মিটিং, কল বা টাচপয়েন্ট হিস্ট্রি রেকর্ড রাখবেন?",
      description: "কার সাথে কখন এবং কী বিষয়ে কথা হয়েছে তা ট্র্যাক রাখার জন্য ইন্টারঅ্যাকশন লগ ব্যবহার করুন:",
      steps: [
        "যেকোনো কন্টাক্টের ডিটেইলস কার্ড বা প্রোফাইল ওপেন করুন।",
        "'Interactions' বা 'Notes' সেকশনে গিয়ে নতুন টাচপয়েন্ট (যেমন: Meeting, Phone Call, Email, Coffee Chat) যুক্ত করুন।",
        "আলোচনার মূল বিষয়বস্তু বা নোটস লিখে তা সংরক্ষণ করুন।"
      ],
      benefit: "কন্টাক্টের সাথে দীর্ঘমেয়াদী সম্পর্ক বজায় রাখতে এবং পূর্বের আলোচনার ইতিহাস এক নজরে দেখতে এটি দারুণ সাহায্য করে।"
    }
  };

  const stepDetailsEn = {
    1: {
      title: "Add Contacts & Profile Management",
      subtitle: "How to add and manage new connections?",
      description: "Steps to enter contact information securely:",
      steps: [
        "Log in with Admin or authorized credentials (or use demo mode).",
        "Click '+ Add Person' from the navigation bar or directory page.",
        "Fill in correct name, email, phone, occupation, organization, and social links.",
        "Click 'Save' to securely store in the cloud database."
      ],
      benefit: "Keeps all your important contacts securely stored in the cloud database, accessible from any device."
    },
    2: {
      title: "Tags & Categorization",
      subtitle: "How to organize contacts with tags and groups?",
      description: "Using tags to filter and categorize your network:",
      steps: [
        "Assign custom tags (e.g. VIP, Client, Developer) to contacts.",
        "Create and manage new tags in the Tags section.",
        "Use tag filters in search to instantly separate specific groups."
      ],
      benefit: "Makes it easy to segment specific groups and manage projects effectively."
    },
    3: {
      title: "Track Meetings & Touchpoints",
      subtitle: "How to log meetings and interaction history?",
      description: "Recording touchpoints to maintain strong relationships:",
      steps: [
        "Open any contact's profile card or details.",
        "Go to the Interactions or Notes section and add a touchpoint.",
        "Record discussion topics and save notes."
      ],
      benefit: "Helps maintain long-term relationships and review past discussions at a glance."
    }
  };

  const stepDetails = lang === 'bn' ? stepDetailsBn : stepDetailsEn;

  return (
    <div className="space-y-6 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1">
      
      {/* 1. Hero Section (Top Banner) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white p-8 sm:p-12 shadow-xl border border-primary-500/25">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 top-0 w-64 h-64 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{getTranslation(lang, 'homeBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {getTranslation(lang, 'homeTitle')}
          </h1>

          <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
            {getTranslation(lang, 'homeSubtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('people')}
              className="px-6 py-3 rounded-xl bg-white text-primary-700 hover:bg-primary-50 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{getTranslation(lang, 'exploreDirectory')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {isAdmin && onOpenAddPerson ? (
              <button
                onClick={onOpenAddPerson}
                className="px-6 py-3 rounded-xl bg-primary-800/80 hover:bg-primary-800 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{getTranslation(lang, 'addPerson')}</span>
              </button>
            ) : onOpenLogin ? (
              <button
                onClick={onOpenLogin}
                className="px-6 py-3 rounded-xl bg-primary-800/80 hover:bg-primary-800 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-3 rounded-xl bg-primary-800/80 hover:bg-primary-800 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{getTranslation(lang, 'viewDashboard')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Trust & Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalPeople ?? 0}+
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getTranslation(lang, 'savedContacts')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getTranslation(lang, 'cloudSecure')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.favorites ?? 0}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getTranslation(lang, 'starredContacts')}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">99.9%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getTranslation(lang, 'uptimeReliability')}</div>
          </div>
        </div>
      </div>

      {/* 2. Core Benefits / Value Proposition */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {getTranslation(lang, 'whyChooseUs')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {getTranslation(lang, 'whyChooseUsSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getTranslation(lang, 'feat1Title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {getTranslation(lang, 'feat1Desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getTranslation(lang, 'feat2Title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {getTranslation(lang, 'feat2Desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getTranslation(lang, 'feat3Title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {getTranslation(lang, 'feat3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Teaser / How It Works (With Clickable Detailed Links) */}
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{getTranslation(lang, 'howItWorks')}</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {getTranslation(lang, 'howItWorksSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{getTranslation(lang, 'step1Title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {getTranslation(lang, 'step1Desc')}
              </p>
            </div>
            <button
              onClick={() => setActiveStepModal(1)}
              className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'detailedGuideBtn')}</span>
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{getTranslation(lang, 'step2Title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {getTranslation(lang, 'step2Desc')}
              </p>
            </div>
            <button
              onClick={() => setActiveStepModal(2)}
              className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'detailedGuideBtn')}</span>
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{getTranslation(lang, 'step3Title')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {getTranslation(lang, 'step3Desc')}
              </p>
            </div>
            <button
              onClick={() => setActiveStepModal(3)}
              className="mt-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1.5 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'detailedGuideBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Call to Action Footer / Closing Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl border border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          {getTranslation(lang, 'closingTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {getTranslation(lang, 'closingDesc')}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('people')}
            className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {getTranslation(lang, 'exploreNow')}
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {getTranslation(lang, 'viewTouchpoints')}
          </button>
        </div>
      </div>

      {/* 6. Comprehensive Bilingual Info Footer with Interactive Tabs */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আমাদের সম্পর্কে আরও জানুন' : 'Learn More About Our Platform'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'ট্যাবগুলোতে ক্লিক করে বিস্তারিত তথ্য দেখুন' : 'Click the tabs below to read full details'}
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-col sm:flex-row gap-1.5 bg-slate-100/80 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            <button
              onClick={() => setActiveFooterTab('why')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFooterTab === 'why'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'bn' ? 'কেন আসবেন?' : 'Why Visit?'}</span>
            </button>

            <button
              onClick={() => setActiveFooterTab('what')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFooterTab === 'what'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'bn' ? 'কী করবেন?' : 'What Can You Do?'}</span>
            </button>

            <button
              onClick={() => setActiveFooterTab('how')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFooterTab === 'how'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'bn' ? 'কীভাবে উপকারী?' : 'How is it Helpful?'}</span>
            </button>
          </div>

          {/* Tab Content Display Panel */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex flex-col justify-center animate-fadeIn">
            {activeFooterTab === 'why' && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary-500" />
                  <span>{lang === 'bn' ? 'কেন এই সাইটে আসবেন?' : 'Why Visit This Site?'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' 
                    ? 'ব্যক্তিগত ও পেশাদার সম্পর্কের সুস্থ পরিচালনা এবং আপনার যোগাযোগের পুরো নেটওয়ার্ককে এক ছাদের নিচে সুরক্ষিত রাখতে আমাদের এই প্ল্যাটফর্মটি তৈরি করা হয়েছে।' 
                    : 'Built to simplify relationship management, keeping your professional and personal network perfectly organized and secured under one unified cloud platform.'}
                </p>
              </div>
            )}

            {activeFooterTab === 'what' && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary-500" />
                  <span>{lang === 'bn' ? 'এখানে আপনি কী করতে পারবেন?' : 'What Can You Do Here?'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' 
                    ? 'সহজেই যেকোনো পরিচিতি যোগ করুন, কাস্টম ক্যাটাগরি ও ট্যাগ দিন, মিটিং বা কল করার পর সেটির আলোচনার নোট ও ইতিহাস ক্লাউড সিঙ্ক ফিচার দিয়ে সুরক্ষিতভাবে সংরক্ষণ করুন।' 
                    : 'Seamlessly add connections, categorize with smart tags, and record detailed meeting notes, phone calls, and interactions with real-time secure backup.'}
                </p>
              </div>
            )}

            {activeFooterTab === 'how' && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span>{lang === 'bn' ? 'এটি সবার জন্য কীভাবে উপকারী?' : 'How is it Helpful for Everyone?'}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' 
                    ? 'এটি উদ্যোক্তা, ফ্রিল্যান্সার, ম্যানেজার বা যেকোনো ব্যক্তির জন্য তার দীর্ঘমেয়াদী নেটওয়ার্ককে সতেজ রাখতে, সঠিক সময়ে ফলো-আপ করতে এবং গুরুত্বপূর্ণ তথ্য কখনো না হারাতে সাহায্য করে।' 
                    : 'Empowers entrepreneurs, freelancers, team managers, and active networkers to nurture relationships, remember key details, and never miss critical follow-ups.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Minimalist Copyright Statement */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>© {new Date().getFullYear()} Smart Social Directory. </span>
            <span>{lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-primary-500 transition-colors cursor-pointer">{lang === 'bn' ? 'শর্তাবলী' : 'Terms'}</span>
            <span className="hover:text-primary-500 transition-colors cursor-pointer">{lang === 'bn' ? 'গোপনীয়তা' : 'Privacy'}</span>
            <span className="hover:text-primary-500 transition-colors cursor-pointer">{lang === 'bn' ? 'সহায়তা' : 'Support'}</span>
          </div>
        </div>
      </div>

      {/* ===================================================
          DETAILED TUTORIAL MODAL FOR STEPS
          =================================================== */}
      {activeStepModal !== null && stepDetails[activeStepModal as keyof typeof stepDetails] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative">
            <button
              onClick={() => setActiveStepModal(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg">
                {activeStepModal}
              </div>
              <div>
                <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{getTranslation(lang, 'stepGuideLabel')}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {stepDetails[activeStepModal as keyof typeof stepDetails].title}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {stepDetails[activeStepModal as keyof typeof stepDetails].subtitle}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {stepDetails[activeStepModal as keyof typeof stepDetails].description}
              </p>

              <div className="space-y-2 pt-2">
                {stepDetails[activeStepModal as keyof typeof stepDetails].steps.map((stepText, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/50 text-primary-800 dark:text-primary-300 text-xs">
                <span className="font-bold">{lang === 'bn' ? 'প্রধান সুবিধা: ' : 'Key Benefit: '}</span>
                {stepDetails[activeStepModal as keyof typeof stepDetails].benefit}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStepModal(null)}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                {getTranslation(lang, 'understandBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

