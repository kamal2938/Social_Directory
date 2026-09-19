import { Toaster, toast as hotToast } from 'react-hot-toast';
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { PeopleView } from './components/PeopleView';
import { TagsView } from './components/TagsView';
import { InteractionsView } from './components/InteractionsView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { PersonDetailModal } from './components/PersonDetailModal';
import { AddEditPersonModal } from './components/AddEditPersonModal';
import { QuickLogModal } from './components/QuickLogModal';
import { QRCodeModal } from './components/QRCodeModal';
import { OutreachModal } from './components/OutreachModal';
import { BusinessCardScannerModal } from './components/BusinessCardScannerModal';
import { NetworkGraphModal } from './components/NetworkGraphModal';
import { Person, Tag, DirectoryStats, FilterState, TabType, User } from './types';
import { api, tokenStorage } from './lib/api';
import { AuthView } from './components/AuthView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Language } from './lib/i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('social_dir_lang') as Language) || 'bn';
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('social_dir_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('social_dir_color') || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('social_dir_lang', lang);
  }, [lang]);

  // Data states
  const [people, setPeople] = useState<Person[]>([]);
  const [allPeopleList, setAllPeopleList] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<DirectoryStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    tag: 'all',
    relationship: 'all',
    organization: 'all',
    location: 'all',
    circle: undefined,
    needsFollowUp: false,
    upcomingBirthday: false,
    favoriteOnly: false,
    archivedOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 12,
  });

  // Modals state
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [quickLogModal, setQuickLogModal] = useState<{
    isOpen: boolean;
    mode: 'interaction' | 'note';
    personId?: string;
  }>({
    isOpen: false,
    mode: 'interaction',
  });

  // Advanced CRM Modals
  const [qrModalPerson, setQrModalPerson] = useState<Person | null>(null);
  const [outreachModalState, setOutreachModalState] = useState<{
    isOpen: boolean;
    person?: Person;
    defaultTopic?: 'birthday' | 'catchup' | 'meeting' | 'general';
  }>({
    isOpen: false,
  });
  const [isCardScannerOpen, setIsCardScannerOpen] = useState(false);
  const [isNetworkGraphOpen, setIsNetworkGraphOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    hotToast.success(msg);
  };

  // Sync Dark mode with HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('social_dir_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('social_dir_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('social_dir_color', themeColor);
    document.documentElement.classList.remove('theme-blue', 'theme-emerald', 'theme-violet', 'theme-rose', 'theme-amber');
    if (themeColor !== 'blue') {
      document.documentElement.classList.add('theme-' + themeColor);
    }
  }, [themeColor]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Load initial tags & stats
  const fetchStatsAndTags = async () => {
    try {
      const [statsData, tagsData] = await Promise.all([
        api.getStats(),
        api.getTags(),
      ]);
      setStats(statsData);
      setTags(tagsData);
    } catch (err) {
      console.error('Failed to load stats/tags:', err);
    }
  };

  // Fetch all people for select pickers and network visualizer
  const fetchAllPeopleList = async () => {
    try {
      const res = await api.getPeople({ limit: 500, archivedOnly: false });
      setAllPeopleList(res.items);
    } catch (err) {
      console.error('Failed to load all people list:', err);
    }
  };

  // Fetch People based on current view/filters
  const fetchPeople = useCallback(async () => {
    try {
      setLoading(true);
      const isFavTab = activeTab === 'favorites';
      const isArchivedTab = activeTab === 'archived';

      const currentFilters: Partial<FilterState> = {
        ...filters,
        favoriteOnly: isFavTab || filters.favoriteOnly,
        archivedOnly: isArchivedTab,
      };

      const res = await api.getPeople(currentFilters);
      setPeople(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load people:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    fetchStatsAndTags();
    fetchAllPeopleList();
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'people' || activeTab === 'favorites' || activeTab === 'archived') {
      fetchPeople();
    }
  }, [fetchPeople, activeTab, filters, currentUser]);

  useEffect(() => {
    // Initial load
    const loadInitialData = async () => {
      const startTime = Date.now();
      let fetchedSettings: any = null;
      try {
        fetchedSettings = await api.getSettings();
        setAppSettings(fetchedSettings);
        if (fetchedSettings?.appName) {
          document.title = `${fetchedSettings.appName} - Private Personal CRM`;
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }

      try {
        const res = await api.getMe();
        if (res.user && res.user.username !== 'viewer') {
          setCurrentUser(res.user);
        } else {
          tokenStorage.clear();
          setCurrentUser(null);
        }
      } catch (e) {
        tokenStorage.clear();
        setCurrentUser(null);
      }

      // Preload the logo from Cloudinary before hiding the loading screen
      if (fetchedSettings?.logoUrl) {
        await new Promise((resolve) => {
          const img = new window.Image();
          img.src = fetchedSettings.logoUrl;
          img.onload = resolve;
          img.onerror = resolve; // Ignore errors and proceed
        });
      }

      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(0, 400 - elapsedTime); // Make sure the loading screen shows for at least 400ms smoothly
      setTimeout(() => {
        setIsAuthChecking(false);
      }, delay);
    };
    loadInitialData();

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  // Tab change handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      page: 1,
      favoriteOnly: tab === 'favorites',
      archivedOnly: tab === 'archived',
    }));
  };

  // Handle global search in navbar
  const handleGlobalSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, query, page: 1 }));
    if (activeTab !== 'people' && activeTab !== 'favorites' && activeTab !== 'archived') {
      setActiveTab('people');
    }
  };

  // Favorite toggle
  const handleToggleFavorite = async (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role !== 'admin') {
      showToast('Admin login required to modify favorites');
      setIsAdminLoginOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(personId);
      setPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, isFavorite: res.isFavorite } : p))
      );
      setAllPeopleList((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, isFavorite: res.isFavorite } : p))
      );
      fetchStatsAndTags();
      showToast(res.isFavorite ? 'Contact added to Starred VIPs' : 'Contact removed from Starred');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Archive toggle
  const handleToggleArchive = async (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser?.role !== 'admin') {
      showToast('Admin login required to archive contacts');
      setIsAdminLoginOpen(true);
      return;
    }
    try {
      const res = await api.toggleArchive(personId);
      setPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, isArchived: res.isArchived } : p))
      );
      fetchPeople();
      fetchStatsAndTags();
      fetchAllPeopleList();
      showToast(res.isArchived ? 'Contact archived' : 'Contact restored from archive');
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    }
  };

  // Save Person (Create or Update)
  const handleSavePerson = async (personData: Partial<Person>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Admin access required to save contact');
      setIsAdminLoginOpen(true);
      return;
    }
    if (editingPerson) {
      await api.updatePerson(editingPerson.id, personData);
      showToast('Contact updated successfully!');
    } else {
      await api.createPerson(personData);
      showToast('New contact added to directory!');
    }
    setEditingPerson(null);
    setIsAddPersonOpen(false);
    fetchPeople();
    fetchStatsAndTags();
    fetchAllPeopleList();
  };

  // Delete Person
  const handleDeletePerson = async (person: Person) => {
    if (currentUser?.role !== 'admin') {
      showToast('Admin access required to delete contact');
      setIsAdminLoginOpen(true);
      return;
    }
    
    // confirm is blocked in iframes, so deleting directly
    try {
      await api.deletePerson(person.id);
      showToast('Contact profile deleted.');
      setSelectedPersonId(null);
      fetchPeople();
      fetchStatsAndTags();
      fetchAllPeopleList();
    } catch (err: any) {
      if (err?.message?.includes('not found')) {
        // Already deleted, just close modal and refresh
        setSelectedPersonId(null);
        fetchPeople();
      } else {
        console.error('Failed to delete person:', err);
        showToast('Failed to delete: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Add new tag helper
  const handleAddNewTag = async (tagName: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Admin access required to create tags');
      setIsAdminLoginOpen(true);
      throw new Error('Admin access required');
    }
    const newTag = await api.createTag(tagName);
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  // Handle OCR scanned card to fill in new contact modal
  const handleApplyScannedCard = (scannedData: Partial<Person>) => {
    if (currentUser?.role !== 'admin') {
      showToast('Admin access required to add scanned contacts');
      setIsAdminLoginOpen(true);
      return;
    }
    setIsCardScannerOpen(false);
    setEditingPerson({
      id: '',
      userId: currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isArchived: false,
      relationshipType: 'Professional Contact',
      tags: ['business-card'],
      skills: [],
      socialLinks: [],
      name: scannedData.name || '',
      jobTitle: scannedData.jobTitle || '',
      organization: scannedData.organization || '',
      email: scannedData.email || '',
      phone: scannedData.phone || '',
      website: scannedData.website || '',
      location: scannedData.location || '',
      ...scannedData,
    });
    setIsAddPersonOpen(true);
    showToast('Business card scanned! Review details and save.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-primary-500 selection:text-white relative">
      {/* Loading Overlay */}
      {isAuthChecking && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-md transition-all duration-300">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200/50 dark:border-slate-800/50 border-t-primary-500 animate-[spin_1.5s_linear_infinite]"></div>
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-lg relative z-10 bg-white dark:bg-slate-900">
              {appSettings?.logoUrl ? (
                <img src={appSettings.logoUrl} alt="Loading" className="w-full h-full object-cover animate-pulse" />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toaster */}
      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />

      {/* Sidebar Navigation */}
      <Sidebar
        appSettings={appSettings}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        stats={stats}
        onOpenAddPerson={() => {
          setEditingPerson(null);
          setIsAddPersonOpen(true);
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={currentUser}
        isAdmin={currentUser?.role === 'admin'}
        onOpenLogin={() => setShowAuth(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogout={currentUser ? async () => {
          await api.logout();
          setCurrentUser(null);
          showToast(lang === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully');
        } : undefined}
        lang={lang}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Navbar */}
        <Navbar
          appSettings={appSettings}
          activeTab={activeTab}
          searchQuery={filters.query}
          onSearchChange={handleGlobalSearch}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onOpenAddPerson={() => {
            setEditingPerson(null);
            setIsAddPersonOpen(true);
          }}
          onOpenQuickLog={() =>
            setQuickLogModal({ isOpen: true, mode: 'interaction' })
          }
          onOpenAddNote={() =>
            setQuickLogModal({ isOpen: true, mode: 'note' })
          }
          setSidebarOpen={setSidebarOpen}
          user={currentUser}
          isAdmin={currentUser?.role === 'admin'}
          onOpenLogin={() => setShowAuth(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onLogout={currentUser ? async () => {
            await api.logout();
            setCurrentUser(null);
            showToast(lang === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully');
          } : undefined}
          lang={lang}
          setLang={setLang}
        />

        {/* Dynamic Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {activeTab === 'home' && (
            <HomeView
              setActiveTab={setActiveTab}
              stats={stats}
              onOpenAddPerson={() => {
                setEditingPerson(null);
                setIsAddPersonOpen(true);
              }}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              onOpenLogin={!currentUser ? () => setShowAuth(true) : undefined}
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNavigate={handleTabChange}
              onSelectPerson={(id) => setSelectedPersonId(id)}
              onOpenAddPerson={() => {
                setEditingPerson(null);
                setIsAddPersonOpen(true);
              }}
              onOpenAddInteraction={(personId) =>
                setQuickLogModal({ isOpen: true, mode: 'interaction', personId })
              }
              onOpenAddNote={(personId) =>
                setQuickLogModal({ isOpen: true, mode: 'note', personId })
              }
              onOpenOutreach={(person, defaultTopic) =>
                setOutreachModalState({ isOpen: true, person, defaultTopic })
              }
              onOpenCardScanner={() => setIsCardScannerOpen(true)}
              onOpenNetworkGraph={() => setIsNetworkGraphOpen(true)}
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'people' && (
            <PeopleView
              people={people}
              total={total}
              totalPages={totalPages}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              tags={tags}
              onOpenAddPerson={() => {
                if (currentUser?.role !== 'admin') return;
                setEditingPerson(null);
                setIsAddPersonOpen(true);
              }}
              onSelectPerson={(id) => setSelectedPersonId(id)}
              onEditPerson={(p) => { if (currentUser?.role !== 'admin' && p.userId !== currentUser?.id) return; setEditingPerson(p); }}
              onDeletePerson={handleDeletePerson}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onOpenAddInteraction={(personId) => { setQuickLogModal({ isOpen: true, mode: 'interaction', personId }); }}
              onOpenAddNote={(personId) => { setQuickLogModal({ isOpen: true, mode: 'note', personId }); }}
              onOpenQRCode={(p) => setQrModalPerson(p)}
              onOpenOutreach={(person, defaultTopic) =>
                setOutreachModalState({ isOpen: true, person, defaultTopic })
              }
              onOpenCardScanner={() => setIsCardScannerOpen(true)}
              onOpenNetworkGraph={() => setIsNetworkGraphOpen(true)}
              title="People Directory"
              subtitle="All active contacts, coworkers, mentors, clients, and professional connections."
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'favorites' && (
            <PeopleView
              people={people}
              total={total}
              totalPages={totalPages}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              tags={tags}
              onOpenAddPerson={() => {
                if (currentUser?.role !== 'admin') return;
                setEditingPerson(null);
                setIsAddPersonOpen(true);
              }}
              onSelectPerson={(id) => setSelectedPersonId(id)}
              onEditPerson={(p) => { if (currentUser?.role !== 'admin' && p.userId !== currentUser?.id) return; setEditingPerson(p); }}
              onDeletePerson={handleDeletePerson}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onOpenAddInteraction={(personId) => { setQuickLogModal({ isOpen: true, mode: 'interaction', personId }); }}
              onOpenAddNote={(personId) => { setQuickLogModal({ isOpen: true, mode: 'note', personId }); }}
              onOpenQRCode={(p) => setQrModalPerson(p)}
              onOpenOutreach={(person, defaultTopic) =>
                setOutreachModalState({ isOpen: true, person, defaultTopic })
              }
              onOpenCardScanner={() => setIsCardScannerOpen(true)}
              onOpenNetworkGraph={() => setIsNetworkGraphOpen(true)}
              title="Starred Contacts"
              subtitle="Your most important, frequent, or high-priority relationships."
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'archived' && (
            <PeopleView
              people={people}
              total={total}
              totalPages={totalPages}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              tags={tags}
              onOpenAddPerson={() => {
                if (currentUser?.role !== 'admin') return;
                setEditingPerson(null);
                setIsAddPersonOpen(true);
              }}
              onSelectPerson={(id) => setSelectedPersonId(id)}
              onEditPerson={(p) => { if (currentUser?.role !== 'admin' && p.userId !== currentUser?.id) return; setEditingPerson(p); }}
              onDeletePerson={handleDeletePerson}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onOpenAddInteraction={(personId) => { setQuickLogModal({ isOpen: true, mode: 'interaction', personId }); }}
              onOpenAddNote={(personId) => { setQuickLogModal({ isOpen: true, mode: 'note', personId }); }}
              onOpenQRCode={(p) => setQrModalPerson(p)}
              onOpenOutreach={(person, defaultTopic) =>
                setOutreachModalState({ isOpen: true, person, defaultTopic })
              }
              onOpenCardScanner={() => setIsCardScannerOpen(true)}
              onOpenNetworkGraph={() => setIsNetworkGraphOpen(true)}
              title="Archived Contacts"
              subtitle="Contacts preserved for reference without cluttering your active directory."
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'tags' && (
            <TagsView
              tags={tags}
              onRefresh={fetchStatsAndTags}
              onSelectTag={(tagName) => {
                setFilters((prev) => ({ ...prev, tag: tagName, page: 1 }));
                setActiveTab('people');
              }}
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'interactions' && (
            <InteractionsView
              onOpenAddInteraction={() => {
                if (currentUser?.role !== 'admin') return;
                setQuickLogModal({ isOpen: true, mode: 'interaction' });
              }}
              onSelectPerson={(id) => setSelectedPersonId(id)}
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
             
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
              onClose={() => setActiveTab('people')}
              onRefreshAll={() => {
                fetchStatsAndTags();
                fetchPeople();
                fetchAllPeopleList();
              }}
              onEditPerson={(p) => setEditingPerson(p)}
              onDeletePerson={(p) => handleDeletePerson(p)}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onOpenQRCode={(p) => setQrModalPerson(p)}
              onOpenOutreach={(p, topic) => setOutreachModalState({ isOpen: true, person: p, defaultTopic: topic })}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              appSettings={appSettings}
              onSettingsUpdated={setAppSettings}
              themeColor={themeColor}
              onChangeTheme={setThemeColor}
              onRefreshAll={() => {
                fetchStatsAndTags();
                fetchPeople();
                fetchAllPeopleList();
              }}
              isAdmin={currentUser?.role === 'admin'}
              lang={lang}
              onUpdateUser={(u) => setCurrentUser(u)}
            />
          )}
        </main>
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lang={lang} 
          isAdmin={currentUser?.role === 'admin'} 
          user={currentUser}
        />
      </div>

      {/* Person Detail View Modal */}
      {selectedPersonId && (
        <PersonDetailModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onEdit={(person) => setEditingPerson(person)}
          onDelete={handleDeletePerson}
          onToggleFavorite={handleToggleFavorite}
          onToggleArchive={handleToggleArchive}
          onDataUpdated={() => {
            fetchStatsAndTags();
            fetchPeople();
            fetchAllPeopleList();
          }}
          onOpenQRCode={(p) => setQrModalPerson(p)}
          onOpenOutreach={(p, topic) => setOutreachModalState({ isOpen: true, person: p, defaultTopic: topic })}
          isAdmin={currentUser?.role === 'admin'}
         
        />
      )}

      {/* Add / Edit Person Modal (Admin Only) */}
      {(isAddPersonOpen || editingPerson) && (
        <AddEditPersonModal
          isOpen={isAddPersonOpen || !!editingPerson}
          onClose={() => {
            setIsAddPersonOpen(false);
            setEditingPerson(null);
          }}
          onSave={handleSavePerson}
          initialData={editingPerson}
          existingTags={tags}
          onAddNewTag={handleAddNewTag}
        />
      )}

      {/* Quick Log Interaction / Note Modal (Admin Only) */}
      {quickLogModal.isOpen && (
        <QuickLogModal
          isOpen={quickLogModal.isOpen}
          onClose={() => setQuickLogModal({ isOpen: false, mode: 'interaction' })}
          mode={quickLogModal.mode}
          initialPersonId={quickLogModal.personId}
          peopleList={allPeopleList}
          onSuccess={() => {
            showToast(
              quickLogModal.mode === 'interaction'
                ? 'Interaction touchpoint logged!'
                : 'Note added to contact!'
            );
            fetchStatsAndTags();
            fetchPeople();
          }}
        />
      )}

      {/* QR Code / Digital Business Card Modal */}
      {qrModalPerson && (
        <QRCodeModal
          isOpen={!!qrModalPerson}
          onClose={() => setQrModalPerson(null)}
          person={qrModalPerson}
        />
      )}

      {/* 1-Click Outreach (WhatsApp, Email, Call) Modal */}
      {outreachModalState.isOpen && (
        <OutreachModal
          isOpen={outreachModalState.isOpen}
          onClose={() => setOutreachModalState({ isOpen: false })}
          person={outreachModalState.person || null}
          defaultTopic={outreachModalState.defaultTopic}
          onLogInteraction={async () => { await fetchStatsAndTags(); await fetchPeople(); }}
        />
      )}

      {/* Business Card Scanner (OCR) Modal */}
      {isCardScannerOpen && (
        <BusinessCardScannerModal
          isOpen={isCardScannerOpen}
          onClose={() => setIsCardScannerOpen(false)}
          onImportPerson={handleApplyScannedCard}
        />
      )}

      {/* Interactive Visual Network Graph Modal */}
      {isNetworkGraphOpen && (
        <NetworkGraphModal
          isOpen={isNetworkGraphOpen}
          onClose={() => setIsNetworkGraphOpen(false)}
          people={allPeopleList}
          onSelectPerson={(person) => {
            setIsNetworkGraphOpen(false);
            setSelectedPersonId(person.id);
          }}
        />
      )}

      {/* Admin Shield Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(adminUser) => {
          setCurrentUser(adminUser);
          setIsAdminLoginOpen(false);
          showToast(`Logged in as Administrator (${adminUser.fullName || adminUser.username})`);
          fetchStatsAndTags();
          fetchPeople();
          fetchAllPeopleList();
        }}
      />

      {/* User Login & Registration Modal */}
      {showAuth && (
        <AuthView
          onLogin={(user) => {
            setCurrentUser(user);
            setShowAuth(false);
            showToast(`Welcome back, ${user.fullName || user.username}!`);
            fetchStatsAndTags();
            fetchPeople();
            fetchAllPeopleList();
          }}
          onCancel={() => {
            setShowAuth(false);
          }}
          onOpenAdminLogin={() => {
            setShowAuth(false);
            setIsAdminLoginOpen(true);
          }}
        />
      )}
    </div>
  );
}
