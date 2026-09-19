import {
  User,
  Person,
  Tag,
  Note,
  Interaction,
  DashboardStats,
  ActivityLog,
  FilterState,
  TimelineEvent,
} from '../types';

const TOKEN_KEY = 'social_directory_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let refreshPromise: Promise<string | null> | null = null;

async function autoAuthenticate(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const token = tokenStorage.get();
      if (!token) return null;
      
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          tokenStorage.set(data.token);
          return data.token;
        }
      }
    } catch (e) {
      console.warn('Auto-auth attempt failed:', e);
    } finally {
      refreshPromise = null;
    }
    return null;
  })();
  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
    tokenStorage.clear();
    const newToken = await autoAuthenticate();
    if (newToken) {
      return request<T>(endpoint, options, true);
    }
    // Dispatch custom event for auth change
    window.dispatchEvent(new Event('auth_unauthorized'));
    throw new Error('Unauthorized or session expired. Please log in.');
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = `Server error (${response.status})`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Settings
  getSettings: () => request<any>('/api/settings'),
  updateSettings: (data: any) => request<any>('/api/settings', { method: 'POST', body: JSON.stringify(data) }),

  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    tokenStorage.set(data.token);
    return data;
  },

  register: async (userData: { username: string; email: string; password: string; fullName: string }) => {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    tokenStorage.set(data.token);
    return data;
  },

  firebaseLogin: async (idToken: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
    tokenStorage.set(data.token);
    return data;
  },
  demoLogin: async () => {
    const data = await request<{ token: string; user: User }>('/api/auth/demo-login', {
      method: 'POST',
    });
    tokenStorage.set(data.token);
    return data;
  },

  viewerLogin: async () => {
    const data = await request<{ token: string; user: User }>('/api/auth/viewer-login', {
      method: 'POST',
    });
    tokenStorage.set(data.token);
    return data;
  },

  getMe: async () => {
    const data = await request<{ user: User; token?: string }>('/api/auth/me');
    if (data.token) {
      tokenStorage.set(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      tokenStorage.clear();
    }
  },

  updateProfile: async (profileData: { fullName?: string; email?: string; avatar?: string }) => {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getMyPerson: async () => {
    return request<Person>('/api/auth/my-person');
  },

  updatePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    return request<{ message: string }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  },

  getAdminUsers: async () => {
    return request<User[]>('/api/admin/users');
  },

  updateAdminUserRole: async (userId: string, role: string) => {
    return request<{ user: User }>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  // Stats & Activity
  getStats: async () => {
    return request<DashboardStats>('/api/stats');
  },

  getActivityLogs: async (limit = 50) => {
    return request<ActivityLog[]>(`/api/activity-logs?limit=${limit}`);
  },

  // People
  getPeople: async (filters: Partial<FilterState>) => {
    const params = new URLSearchParams();
    if (filters.query) params.append('query', filters.query);
    if (filters.tag && filters.tag !== 'all') params.append('tag', filters.tag);
    if (filters.circle && filters.circle !== 'all') params.append('circle', filters.circle);
    if (filters.relationship && filters.relationship !== 'all') params.append('relationship', filters.relationship);
    if (filters.organization && filters.organization !== 'all') params.append('organization', filters.organization);
    if (filters.location && filters.location !== 'all') params.append('location', filters.location);
    if (filters.favoriteOnly) params.append('favoriteOnly', 'true');
    if (filters.archivedOnly) params.append('archivedOnly', 'true');
    if (filters.needsFollowUp) params.append('needsFollowUp', 'true');
    if (filters.upcomingBirthday) params.append('upcomingBirthday', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return request<{
      items: Person[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/api/people?${params.toString()}`);
  },

  getPerson: async (id: string) => {
    return request<{
      person: Person;
      notes: Note[];
      interactions: Interaction[];
      timeline: TimelineEvent[];
    }>(`/api/people/${id}`);
  },

  createPerson: async (person: Partial<Person>) => {
    return request<Person>('/api/people', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  },

  updatePerson: async (id: string, person: Partial<Person>) => {
    return request<Person>(`/api/people/${id}`, {
      method: 'PUT',
      body: JSON.stringify(person),
    });
  },

  deletePerson: async (id: string) => {
    return request<{ message: string }>(`/api/people/${id}`, {
      method: 'DELETE',
    });
  },

  toggleFavorite: async (id: string) => {
    return request<{ isFavorite: boolean }>(`/api/people/${id}/toggle-favorite`, {
      method: 'POST',
    });
  },

  toggleArchive: async (id: string) => {
    return request<{ isArchived: boolean }>(`/api/people/${id}/toggle-archive`, {
      method: 'POST',
    });
  },

  // Notes
  getNotes: async (query?: string) => {
    const url = query ? `/api/notes?query=${encodeURIComponent(query)}` : '/api/notes';
    return request<Note[]>(url);
  },

  addNote: async (personId: string, content: string) => {
    return request<Note>(`/api/people/${personId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  updateNote: async (noteId: string, content: string) => {
    return request<Note>(`/api/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  deleteNote: async (noteId: string) => {
    return request<{ message: string }>(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
  },

  // Interactions
  getInteractions: async (query?: string) => {
    const url = query ? `/api/interactions?query=${encodeURIComponent(query)}` : '/api/interactions';
    return request<Interaction[]>(url);
  },

  addInteraction: async (
    personId: string,
    payload: { type: Interaction['type']; date: string; description: string; notes?: string }
  ) => {
    return request<Interaction>(`/api/people/${personId}/interactions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteInteraction: async (interactionId: string) => {
    return request<{ message: string }>(`/api/interactions/${interactionId}`, {
      method: 'DELETE',
    });
  },

  // Tags
  getTags: async () => {
    return request<Tag[]>('/api/tags');
  },

  createTag: async (name: string, color?: string, description?: string) => {
    return request<Tag>('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color, description }),
    });
  },

  updateTag: async (id: string, name: string, color?: string, description?: string) => {
    return request<Tag>(`/api/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, color, description }),
    });
  },

  deleteTag: async (id: string) => {
    return request<{ message: string }>(`/api/tags/${id}`, {
      method: 'DELETE',
    });
  },

  // Database & Import / Export
  exportJsonUrl: () => {
    const token = tokenStorage.get();
    return `/api/export/json?token=${token || ''}`;
  },

  exportCsvUrl: () => {
    const token = tokenStorage.get();
    return `/api/export/csv?token=${token || ''}`;
  },

  exportJSON: async () => {
    return request<any>('/api/export/json');
  },

  exportCSV: async () => {
    const token = tokenStorage.get();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/export/csv', { headers });
    return res.text();
  },

  importJson: async (data: any) => {
    return request<{
      importedCount: number;
      importedPeople: number;
      importedNotes: number;
      importedInteractions: number;
      importedTags: number;
    }>('/api/import/json', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  importJSON: async (data: any) => {
    return request<{
      importedCount: number;
      importedPeople: number;
      importedNotes: number;
      importedInteractions: number;
      importedTags: number;
    }>('/api/import/json', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  importCsv: async (csvText: string) => {
    return request<{
      importedCount: number;
      created: number;
      updated: number;
      errors: string[];
    }>('/api/import/csv', {
      method: 'POST',
      body: JSON.stringify({ csvText }),
    });
  },

  importCSV: async (csvText: string) => {
    return request<{
      importedCount: number;
      created: number;
      updated: number;
      errors: string[];
    }>('/api/import/csv', {
      method: 'POST',
      body: JSON.stringify({ csvText }),
    });
  },

  resetDatabase: async () => {
    return request<{ message: string; stats: DashboardStats }>('/api/database/reset', {
      method: 'POST',
    });
  },
};


// --- Phase 1: Health & Emergency ---

export async function getHealthData(personId: string) {
  return request('/api/people/' + personId + '/health');
}

export async function updateHealthProfile(personId: string, data: any) {
  return request('/api/people/' + personId + '/health', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function addMedicine(personId: string, data: any) {
  return request('/api/people/' + personId + '/medicines', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateMedicine(id: string, data: any) {
  return request('/api/medicines/' + id, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteMedicine(id: string) {
  return request('/api/medicines/' + id, { method: 'DELETE' });
}

export async function addAllergy(personId: string, data: any) {
  return request('/api/people/' + personId + '/allergies', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAllergy(id: string, data: any) {
  return request('/api/allergies/' + id, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteAllergy(id: string) {
  return request('/api/allergies/' + id, { method: 'DELETE' });
}

export async function addEmergencyContact(personId: string, data: any) {
  return request('/api/people/' + personId + '/emergency-contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateEmergencyContact(id: string, data: any) {
  return request('/api/emergency-contacts/' + id, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteEmergencyContact(id: string) {
  return request('/api/emergency-contacts/' + id, { method: 'DELETE' });
}


// --- Phase 2-5 API ---

export async function getTransactions(personId: string) { return request<any>('/api/people/' + personId + '/transactions'); }
export async function addTransaction(personId: string, data: any) { return request<any>('/api/people/' + personId + '/transactions', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateTransaction(id: string, data: any) { return request<any>('/api/transactions/' + id, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteTransaction(id: string) { return request<any>('/api/transactions/' + id, { method: 'DELETE' }); }
export async function addPayment(txnId: string, data: any) { return request<any>('/api/transactions/' + txnId + '/payments', { method: 'POST', body: JSON.stringify(data) }); }

export async function getDocuments(personId: string) { return request<any>('/api/people/' + personId + '/documents'); }
export async function addDocument(personId: string, data: any) { return request<any>('/api/people/' + personId + '/documents', { method: 'POST', body: JSON.stringify(data) }); }
export async function deleteDocument(id: string) { return request<any>('/api/documents/' + id, { method: 'DELETE' }); }

export async function getEvents(personId: string) { return request<any>('/api/people/' + personId + '/events'); }
export async function addEvent(personId: string, data: any) { return request<any>('/api/people/' + personId + '/events', { method: 'POST', body: JSON.stringify(data) }); }
export async function deleteEvent(id: string) { return request<any>('/api/events/' + id, { method: 'DELETE' }); }

export async function getGifts(personId: string) { return request<any>('/api/people/' + personId + '/gifts'); }
export async function addGift(personId: string, data: any) { return request<any>('/api/people/' + personId + '/gifts', { method: 'POST', body: JSON.stringify(data) }); }
export async function deleteGift(id: string) { return request<any>('/api/gifts/' + id, { method: 'DELETE' }); }

export async function getPreferences(personId: string) { return request<any>('/api/people/' + personId + '/preferences'); }
export async function addPreference(personId: string, data: any) { return request<any>('/api/people/' + personId + '/preferences', { method: 'POST', body: JSON.stringify(data) }); }
export async function deletePreference(id: string) { return request<any>('/api/preferences/' + id, { method: 'DELETE' }); }

