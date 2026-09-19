import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import * as fs from 'fs';
import * as crypto from 'crypto';
import {
  DirectoryDatabase, User, Person, Tag, Note, Interaction, ActivityLog, AppSettings
} from './types.js';

let db: any = null;
try {
  const configRaw = fs.readFileSync('./firebase-applet-config.json', 'utf8');
  const config = JSON.parse(configRaw);
  const app = initializeApp({
    projectId: config.projectId,
    apiKey: config.apiKey,
    databaseURL: `https://${config.projectId}.firebaseio.com`
  });
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  }, config.firestoreDatabaseId);
} catch (e: any) {
  console.warn('Firebase config missing or invalid', e.message);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

function removeUndefined(obj: any) {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => newObj[key] === undefined && delete newObj[key]);
  return newObj;
}

export class StorageService {
  private static memoryUsers: Map<string, User> = new Map([
    [
      'user-admin-default',
      {
        id: 'user-admin-default',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'System Admin',
        role: 'admin',
        passwordHash: hashPassword('admin123'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User
    ],
    [
      'user-saha-default',
      {
        id: 'user-saha-default',
        username: 'mdsahakamal016@gmail.com',
        email: 'mdsahakamal016@gmail.com',
        fullName: 'Md Saha Kamal',
        role: 'admin',
        passwordHash: hashPassword('admin123'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User
    ]
  ]);

  public async logActivity(userId: string, action: any, entityType: any, entityId?: string, entityName?: string, details?: string): Promise<void> {
    const act: ActivityLog = {
      id: crypto.randomUUID(),
      userId, action, entityType, entityId, entityName, details,
      timestamp: new Date().toISOString()
    } as any;
    if (db) {
      try {
        await setDoc(doc(db, 'activityLogs', act.id), removeUndefined(act));
      } catch (e) {
        console.warn('Firestore logActivity error:', e);
      }
    }
  }

  public async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'activityLogs'));
      let logs = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as ActivityLog));
      logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return logs.slice(0, limit);
    } catch (e) {
      console.warn('Firestore getActivityLogs error:', e);
      return [];
    }
  }

  private static memorySettings: AppSettings = { id: 'global' };

  public async getSettings(): Promise<AppSettings> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          return { id: 'global', ...snap.data() as any };
        }
      } catch (e) {
        console.warn('Firestore getSettings error:', e);
      }
    }
    return StorageService.memorySettings;
  }

  public async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    StorageService.memorySettings = { ...StorageService.memorySettings, ...settings, id: 'global' };
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'global'), StorageService.memorySettings, { merge: true });
      } catch (e) {
        console.warn('Firestore updateSettings error:', e);
      }
    }
  }

  public async getUsers(): Promise<User[]> {
    let firestoreUsers: User[] = [];
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        firestoreUsers = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as User));
      } catch (e) {
        console.warn('Firestore getUsers error:', e);
      }
    }
    const combined = new Map<string, User>();
    for (const u of StorageService.memoryUsers.values()) {
      combined.set(u.id, u);
    }
    for (const u of firestoreUsers) {
      combined.set(u.id, u);
    }
    return Array.from(combined.values());
  }

  public async getPrimaryUser(): Promise<User | undefined> {
    const users = await this.getUsers();
    users.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return users[0];
  }

  public async findUserByUsername(identifier: string): Promise<User | undefined> {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const users = await this.getUsers();
    return users.find(u => 
      (u.username && u.username.toLowerCase() === clean) || 
      (u.email && u.email.toLowerCase() === clean)
    );
  }

  public async saveUser(user: User): Promise<void> {
    StorageService.memoryUsers.set(user.id, user);
    if (db) {
      try {
        await setDoc(doc(db, 'users', user.id), removeUndefined(user));
      } catch (e) {
        console.warn('Firestore saveUser error:', e);
      }
    }
  }

  public async findUserById(id: string): Promise<User | undefined> {
    const mem = StorageService.memoryUsers.get(id);
    if (mem) return mem;
    if (db) {
      try {
        const d = await getDoc(doc(db, 'users', id));
        if (d.exists()) {
          const user = { id: d.id, ...d.data() as any } as User;
          StorageService.memoryUsers.set(id, user);
          return user;
        }
      } catch (e) {
        console.warn('Firestore findUserById error:', e);
      }
    }
    return undefined;
  }

  public async createUser(username: string, email: string, passwordPlain: string, fullName: string, role: 'admin' | 'viewer' | 'user' = 'viewer'): Promise<User> {
    const user: User = {
      id: 'user-' + crypto.randomUUID(),
      username, email, fullName, role,
      passwordHash: hashPassword(passwordPlain),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    StorageService.memoryUsers.set(user.id, user);
    if (db) {
      try {
        await setDoc(doc(db, 'users', user.id), removeUndefined(user));
      } catch (e) {
        console.warn('Firestore createUser error:', e);
      }
    }
    return user;
  }

  public async updateUserProfile(userId: string, updates: { fullName?: string; email?: string; avatar?: string }): Promise<User | null> {
    const user = await this.findUserById(userId);
    if (!user) return null;
    Object.assign(user, updates);
    user.updatedAt = new Date().toISOString();
    if (db) await setDoc(doc(db, 'users', userId), removeUndefined(user));
    return user;
  }

  public async updateUserPassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string): Promise<boolean> {
    const user = await this.findUserById(userId);
    if (!user) return false;
    if (!verifyPassword(oldPasswordPlain, user.passwordHash)) return false;
    user.passwordHash = hashPassword(newPasswordPlain);
    user.updatedAt = new Date().toISOString();
    if (db) await setDoc(doc(db, 'users', userId), removeUndefined(user));
    return true;
  }

  public async updateUserRole(userId: string, role: 'admin' | 'viewer' | 'user'): Promise<User | null> {
    const user = await this.findUserById(userId);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date().toISOString();
    if (db) await setDoc(doc(db, 'users', userId), removeUndefined(user));
    return user;
  }
  public async getStats() {
    if (!db) return { totalPeople: 0, archivedPeople: 0, favorites: 0, totalTags: 0, totalOrganizations: 0, allCircles: [], upcomingBirthdays: [], overdueFollowUps: [], recentContacts: [], recentInteractions: [], relationshipCounts: {}, recentActivity: [] } as any;
    
    const [pSnap, iSnap, tSnap] = await Promise.all([
      getDocs(collection(db, 'people')),
      getDocs(collection(db, 'interactions')),
      getDocs(collection(db, 'tags'))
    ]);
    
    const people = pSnap.docs.map(d => {
      const data = ({ id: d.id, ...d.data() as any } as Person);
      if (!data.id) data.id = d.id;
      if (!data.name) data.name = 'Unknown';
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      return data;
    });
    const interactions = iSnap.docs.map(d => ({ id: d.id, ...d.data() as any } as Interaction));
    
    const totalPeople = people.filter((p) => !p.isArchived).length;
    const archivedPeople = people.filter((p) => p.isArchived).length;
    const favorites = people.filter((p) => p.isFavorite && !p.isArchived).length;
    const totalTags = tSnap.size;

    const orgSet = new Set<string>();
    const circlesSet = new Set<string>();
    const now = new Date();

    const activePeople = people.filter((p) => !p.isArchived);

    activePeople.forEach((p) => {
      if (p.organization && p.organization.trim()) {
        orgSet.add(p.organization.trim());
      }
      if (Array.isArray(p.circles)) {
        p.circles.forEach((c) => {
          if (c && c.trim()) circlesSet.add(c.trim());
        });
      }
    });

    const recentContacts = [...activePeople]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    const recentInteractions = [...interactions]
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
      .slice(0, 6);

    // Distribution by relationship
    const relationshipCounts: Record<string, number> = {};
    activePeople.forEach((p) => {
      const type = p.relationshipType || 'Other';
      relationshipCounts[type] = (relationshipCounts[type] || 0) + 1;
    });

    // Upcoming Birthdays in the next 30 days
    const upcomingBirthdays = activePeople
      .filter((p) => {
        if (!p.dateOfBirth) return false;
        const bday = new Date(p.dateOfBirth);
        if (isNaN(bday.getTime())) return false;
        const currentYear = now.getFullYear();
        let nextBday = new Date(currentYear, bday.getMonth(), bday.getDate());
        if (nextBday < new Date(currentYear, now.getMonth(), now.getDate())) {
          nextBday = new Date(currentYear + 1, bday.getMonth(), bday.getDate());
        }
        const diffDays = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      })
      .sort((a, b) => {
        const getDiff = (dob?: string) => {
          if (!dob) return 999;
          const d = new Date(dob);
          let nb = new Date(now.getFullYear(), d.getMonth(), d.getDate());
          if (nb < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            nb = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
          }
          return nb.getTime() - now.getTime();
        };
        return getDiff(a.dateOfBirth) - getDiff(b.dateOfBirth);
      });

    // Overdue Follow-ups (Stay in Touch)
    const overdueFollowUps = activePeople
      .filter((p) => {
        const cadence = p.followUpCadenceDays || (p.isFavorite ? 14 : 30);
        const lastTouch = p.lastInteractionAt ? new Date(p.lastInteractionAt) : new Date(p.createdAt);
        const daysSince = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= cadence;
      })
      .sort((a, b) => {
        const getOverdueDays = (p: Person) => {
          const cadence = p.followUpCadenceDays || (p.isFavorite ? 14 : 30);
          const lastTouch = p.lastInteractionAt ? new Date(p.lastInteractionAt) : new Date(p.createdAt);
          const daysSince = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince - cadence;
        };
        return getOverdueDays(b) - getOverdueDays(a);
      });

    const recentActivity = await this.getActivityLogs(8);

    return {
      totalPeople,
      archivedPeople,
      favorites,
      totalTags,
      totalOrganizations: orgSet.size,
      allCircles: Array.from(circlesSet).sort(),
      upcomingBirthdays: upcomingBirthdays.slice(0, 10),
      overdueFollowUps: overdueFollowUps.slice(0, 10),
      recentContacts,
      recentInteractions,
      relationshipCounts,
      recentActivity,
    };
  }

  public async getPeople(params: {
    query?: string;
    tag?: string;
    favoriteOnly?: boolean;
    archivedOnly?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    circle?: string; organization?: string; location?: string; needsFollowUp?: boolean; upcomingBirthday?: boolean;
    relationship?: string;
  }) {
    if (!db) return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    const snap = await getDocs(collection(db, 'people'));
    let people = snap.docs.map(d => {
      const data = ({ id: d.id, ...d.data() as any } as Person);
      if (!data.id) data.id = d.id;
      if (!data.name) data.name = 'Unknown';
      if (data.tags) {
        data.tags = (data.tags || [])
          .map((t: any) => (typeof t === 'object' && t !== null ? (t.name || t.id || '') : String(t || '')))
          .filter(Boolean);
      }
      return data;
    });

    if (params.favoriteOnly) people = people.filter(p => p.isFavorite);
    if (params.archivedOnly) people = people.filter(p => p.isArchived);
    else if (!params.archivedOnly) people = people.filter(p => !p.isArchived);

    if (params.query) {
      const qs = params.query.toLowerCase();
      people = people.filter(p => 
        (p.name || '').toLowerCase().includes(qs) ||
        (p.organization && p.organization.toLowerCase().includes(qs)) ||
        (p.jobTitle && p.jobTitle.toLowerCase().includes(qs)) ||
        (p.bio && p.bio.toLowerCase().includes(qs)) ||
        (p.email && p.email.toLowerCase().includes(qs))
      );
    }
    if (params.tag) {
      people = people.filter(p => p.tags && p.tags.includes(params.tag!));
    }
    if (params.organization) {
      people = people.filter(p => p.organization === params.organization);
    }
    if (params.location) {
      people = people.filter(p => p.location === params.location);
    }
    if (params.circle) {
      people = people.filter(p => p.circles && p.circles.includes(params.circle!));
    }
    if (params.relationship) {
      people = people.filter(p => p.relationshipType === params.relationship);
    }

    const sortBy = params.sortBy || 'name';
    const sortOrder = params.sortOrder || 'asc';
    people.sort((a: any, b: any) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = params.page || 1;
    const limit = params.limit || 10;
    const total = people.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = people.slice(start, start + limit);

    return { items: paginated, total, page, limit, totalPages };
  }
  public async getPersonById(id: string) {
    if (!db) return null;
    const docSnap = await getDoc(doc(db, 'people', id));
    if (!docSnap.exists()) return null;
    const person = ({ id: docSnap.id, ...docSnap.data() } as Person);
    if (!person.id) person.id = docSnap.id;
    if (!person.name) person.name = 'Unknown';
    // Ensure tags is always an array of clean string tag names
    const tags = (person.tags || [])
      .map((t: any) => (typeof t === 'object' && t !== null ? (t.name || t.id || '') : String(t || '')))
      .filter(Boolean);
    return { ...person, tags };
  }

  public async getMyPerson(userId: string, email: string, fullName: string): Promise<Person> {
    const all = await this.getPeople({ limit: 1000 });
    let found = all.items.find(p => p.userId === userId || (p.email && email && p.email.toLowerCase() === email.toLowerCase()));
    if (!found) {
      found = await this.createPerson(userId, {
        name: fullName || 'My Profile',
        email: email || '',
        tags: ['Self'],
        relationshipType: 'Self',
        bio: 'My personal profile card'
      });
    }
    return found;
  }

  public async createPerson(userId: string, data: Partial<Person>): Promise<Person> {
    const person: Person = {
      id: 'person-' + crypto.randomUUID(),
      userId,
      name: data.name || 'Unknown',
      nickname: data.nickname,
      photo: data.photo,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      location: data.location,
      bio: data.bio,
      occupation: data.occupation,
      organization: data.organization,
      department: data.department,
      jobTitle: data.jobTitle,
      skills: data.skills || [],
      education: data.education,
      email: data.email,
      phone: data.phone,
      website: data.website,
      socialLinks: data.socialLinks || [],
      relationshipType: data.relationshipType || 'Professional Contact',
      tags: data.tags || [],
      circles: data.circles || [],
      followUpCadenceDays: data.followUpCadenceDays || 30,
      customFields: data.customFields || {},
      isFavorite: !!data.isFavorite,
      isArchived: !!data.isArchived,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastInteractionAt: data.lastInteractionAt,
    } as any;
    if (db) await setDoc(doc(db, 'people', person.id), removeUndefined(person));
    await this.logActivity(userId, 'PERSON_ADDED' as any, 'person', person.id, person.name);
    return person;
  }

  public async updatePerson(userId: string, id: string, data: Partial<Person>): Promise<Person | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'people', id));
    if (!d.exists()) return null;
    const person = ({ id: d.id, ...d.data() as any } as Person);
    
    const user = await this.findUserById(userId);
    const isAdmin = user && user.role === 'admin';
    
    if (person.userId !== userId && !isAdmin) return null;
    const updated = { ...person, ...data, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'people', id), removeUndefined(updated));
    await this.logActivity(userId, 'PERSON_UPDATED' as any, 'person', id, updated.name);
    return updated;
  }

  public async toggleFavorite(userId: string, id: string): Promise<boolean | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'people', id));
    if (!d.exists()) return null;
    const p = ({ id: d.id, ...d.data() as any } as Person);
    p.isFavorite = !p.isFavorite;
    p.updatedAt = new Date().toISOString();
    await setDoc(doc(db, 'people', id), removeUndefined(p));
    return p.isFavorite;
  }

  public async toggleArchive(userId: string, id: string): Promise<boolean | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'people', id));
    if (!d.exists()) return null;
    const p = ({ id: d.id, ...d.data() as any } as Person);
    p.isArchived = !p.isArchived;
    p.updatedAt = new Date().toISOString();
    await setDoc(doc(db, 'people', id), removeUndefined(p));
    return p.isArchived;
  }

  public async deletePerson(userId: string, id: string): Promise<boolean> {
    console.log("deletePerson START", { userId, id, hasDb: !!db });
    if (!db) return false;
    const d = await getDoc(doc(db, 'people', id));
    console.log("deletePerson DOC EXISTS:", d.exists());
    if (!d.exists()) return false;
    const p = ({ id: d.id, ...d.data() as any } as Person);
    
    const user = await this.findUserById(userId);
    const isAdmin = user && user.role === 'admin';
    console.log("deletePerson PERMS:", { pUserId: p.userId, userId, isAdmin, userFound: !!user });
    
    if (p.userId !== userId && !isAdmin) return false;
    await deleteDoc(doc(db, 'people', id));
    await this.logActivity(userId, 'PERSON_DELETED' as any, 'person', id, p.name);
    return true;
  }
  public async getTags(): Promise<(Tag & { count: number })[]> {
    if (!db) return [];
    const [tagsSnap, peopleSnap] = await Promise.all([
      getDocs(collection(db, 'tags')),
      getDocs(collection(db, 'people'))
    ]);
    const tags = tagsSnap.docs.map(d => ({ id: d.id, ...d.data() as any } as Tag));
    const people = peopleSnap.docs.map(d => ({ id: d.id, ...d.data() as any } as Person));
    return tags.map(t => {
      const count = people.filter(p => p.tags && p.tags.includes(t.name)).length;
      return { ...t, count };
    });
  }

  public async createTag(name: string, color?: string, description?: string): Promise<Tag> {
    const tag: Tag = {
      id: 'tag-' + crypto.randomUUID(),
      name,
      color: color || '#8b5cf6',
      description,
      createdAt: new Date().toISOString()
    } as any;
    if (db) await setDoc(doc(db, 'tags', tag.id), removeUndefined(tag));
    return tag;
  }

  public async updateTag(id: string, name: string, color?: string, description?: string): Promise<Tag | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'tags', id));
    if (!d.exists()) return null;
    const tag = ({ id: d.id, ...d.data() as any } as Tag);
    const oldName = tag.name;
    tag.name = name;
    if (color) tag.color = color;
    if (description !== undefined) tag.description = description;
    
    if (oldName !== name) {
      const snap = await getDocs(collection(db, 'people'));
      const batch = writeBatch(db);
      let changed = false;
      snap.docs.forEach(pd => {
        const p = ({ id: pd.id, ...pd.data() as any } as Person);
        if (p.tags && p.tags.includes(oldName)) {
          p.tags = p.tags.map(t => t === oldName ? name : t);
          batch.set(pd.ref, removeUndefined(p));
          changed = true;
        }
      });
      if (changed) await batch.commit();
    }
    await setDoc(doc(db, 'tags', id), removeUndefined(tag));
    return tag;
  }

  public async deleteTag(id: string): Promise<boolean> {
    if (!db) return false;
    const d = await getDoc(doc(db, 'tags', id));
    if (!d.exists()) return false;
    const tag = ({ id: d.id, ...d.data() as any } as Tag);
    await deleteDoc(doc(db, 'tags', id));
    
    const snap = await getDocs(collection(db, 'people'));
    const batch = writeBatch(db);
    let changed = false;
    snap.docs.forEach(pd => {
      const p = ({ id: pd.id, ...pd.data() as any } as Person);
      if (p.tags && p.tags.includes(tag.name)) {
        p.tags = p.tags.filter(t => t !== tag.name);
        batch.set(pd.ref, removeUndefined(p));
        changed = true;
      }
    });
    if (changed) await batch.commit();
    return true;
  }

  public async getNotesByPersonId(personId: string): Promise<Note[]> {
    if (!db) return [];
    const snap = await getDocs(collection(db, 'notes'));
    let notes = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as Note));
    notes = notes.filter(n => n.personId === personId);
    notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return notes;
  }

  public async getInteractionsByPersonId(personId: string): Promise<Interaction[]> {
    if (!db) return [];
    const snap = await getDocs(collection(db, 'interactions'));
    let inters = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as Interaction));
    inters = inters.filter(i => i.personId === personId);
    inters.sort((a, b) => b.date.localeCompare(a.date));
    return inters;
  }

  public async getNotes(query?: string, limit = 50): Promise<Note[]> {
    if (!db) return [];
    const snap = await getDocs(collection(db, 'notes'));
    let notes = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as Note));
    notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (query) {
      const qs = query.toLowerCase();
      notes = notes.filter(n => n.content.toLowerCase().includes(qs) || n.personName.toLowerCase().includes(qs));
    }
    return notes.slice(0, limit);
  }

  public async addNote(userId: string, personId: string, content: string): Promise<Note | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'people', personId));
    if (!d.exists()) return null;
    const person = ({ id: d.id, ...d.data() as any } as Person);
    
    const note: Note = {
      id: 'note-' + crypto.randomUUID(),
      personId,
      personName: person.name,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    await setDoc(doc(db, 'notes', note.id), removeUndefined(note));
    await this.logActivity(userId, 'NOTE_ADDED' as any, 'note', note.id, person.name, `Added note to ${person.name}`);
    return note;
  }

  public async updateNote(userId: string, noteId: string, content: string): Promise<Note | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'notes', noteId));
    if (!d.exists()) return null;
    const note = ({ id: d.id, ...d.data() as any } as Note);
    note.content = content;
    note.updatedAt = new Date().toISOString();
    await setDoc(doc(db, 'notes', noteId), removeUndefined(note));
    return note;
  }

  public async deleteNote(userId: string, noteId: string): Promise<boolean> {
    if (!db) return false;
    await deleteDoc(doc(db, 'notes', noteId));
    return true;
  }
  public async getInteractions(query?: string, limit = 50): Promise<Interaction[]> {
    if (!db) return [];
    const snap = await getDocs(collection(db, 'interactions'));
    let inters = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as Interaction));
    inters.sort((a, b) => b.date.localeCompare(a.date));
    if (query) {
      const qs = query.toLowerCase();
      inters = inters.filter(i => 
        i.description.toLowerCase().includes(qs) || 
        i.personName.toLowerCase().includes(qs) ||
        (i.notes && i.notes.toLowerCase().includes(qs))
      );
    }
    return inters.slice(0, limit);
  }

  public async addInteraction(
    userId: string, personId: string, type: Interaction['type'], 
    date: string, description: string, notes?: string
  ): Promise<Interaction | null> {
    if (!db) return null;
    const d = await getDoc(doc(db, 'people', personId));
    if (!d.exists()) return null;
    const person = ({ id: d.id, ...d.data() as any } as Person);
    
    const inter: Interaction = {
      id: 'inter-' + crypto.randomUUID(),
      personId,
      personName: person.name,
      type, date, description, notes,
      createdAt: new Date().toISOString()
    } as any;
    await setDoc(doc(db, 'interactions', inter.id), removeUndefined(inter));
    
    person.lastInteractionAt = new Date().toISOString();
    await setDoc(doc(db, 'people', personId), removeUndefined(person));
    
    await this.logActivity(userId, 'INTERACTION_ADDED' as any, 'interaction', inter.id, person.name, `Logged ${type} with ${person.name}`);
    return inter;
  }

  public async deleteInteraction(userId: string, interactionId: string): Promise<boolean> {
    if (!db) return false;
    await deleteDoc(doc(db, 'interactions', interactionId));
    return true;
  }

  public async exportFullJson(): Promise<DirectoryDatabase> {
    const [users, people, tags, notes, inters, logs] = await Promise.all([
      this.getUsers(),
      db ? getDocs(collection(db, 'people')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() as any } as Person))) : Promise.resolve([]),
      db ? getDocs(collection(db, 'tags')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() as any } as Tag))) : Promise.resolve([]),
      db ? getDocs(collection(db, 'notes')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() as any } as Note))) : Promise.resolve([]),
      db ? getDocs(collection(db, 'interactions')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() as any } as Interaction))) : Promise.resolve([]),
      this.getActivityLogs(1000)
    ]);
    return {
      users, people, tags, notes, interactions: inters, activityLogs: logs,
      settings: { appTitle: 'Social Directory', ownerName: users[0]?.fullName || 'Admin' }
    } as any;
  }

  public async exportPeopleCsv(): Promise<string> {
    if (!db) return 'Name,Email,Phone,Organization,Job Title,Tags\n';
    const snap = await getDocs(collection(db, 'people'));
    const people = snap.docs.map(d => ({ id: d.id, ...d.data() as any } as Person));
    if (people.length === 0) return 'Name,Email,Phone,Organization,Job Title,Tags\n';
    const header = ['Name', 'Email', 'Phone', 'Organization', 'Job Title', 'Tags'];
    const rows = people.map(p => [
      `"${p.name || ''}"`,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.organization || ''}"`,
      `"${p.jobTitle || ''}"`,
      `"${(p.tags || []).join(', ')}"`
    ]);
    return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public async importJson(userId: string, importedData: Partial<DirectoryDatabase>) {
    if (!db) throw new Error('Database not initialized');
    if (!importedData.people || !Array.isArray(importedData.people)) {
      throw new Error('Invalid JSON format: missing people array');
    }
    const batch = writeBatch(db);
    let pCount = 0;
    for (const p of importedData.people) {
      if (!p.id) p.id = 'person-' + crypto.randomUUID();
      if (!p.userId) p.userId = userId;
      batch.set(doc(db, 'people', p.id), removeUndefined(p));
      pCount++;
    }
    let tCount = 0;
    if (importedData.tags) {
      for (const t of importedData.tags) {
        if (!t.id) t.id = 'tag-' + crypto.randomUUID();
        batch.set(doc(db, 'tags', t.id), removeUndefined(t));
        tCount++;
      }
    }
    await batch.commit();
    await this.logActivity(userId, 'IMPORT_COMPLETED' as any, 'system', undefined, 'System Database', `Imported ${pCount} people`);
    return { importedPeople: pCount, importedTags: tCount, importedNotes: 0, importedInteractions: 0 };
  }

  public async importCsv(userId: string, csvText: string) {
    if (!db) throw new Error('Database not initialized');
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) throw new Error('CSV file contains no data rows');
    let importedPeople = 0;
    const batch = writeBatch(db);
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 1 && parts[0]) {
        const id = 'person-' + crypto.randomUUID();
        const person: Partial<Person> = {
          id, userId,
          name: parts[0],
          email: parts[1] || undefined,
          phone: parts[2] || undefined,
          organization: parts[3] || undefined,
          jobTitle: parts[4] || undefined,
          tags: parts[5] ? parts[5].split(',').map(t => t.trim()) : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any;
        batch.set(doc(db, 'people', id), removeUndefined(person as Person));
        importedPeople++;
      }
    }
    if (importedPeople > 0) await batch.commit();
    await this.logActivity(userId, 'IMPORT_COMPLETED' as any, 'system', undefined, 'System Database', `Imported ${importedPeople} people from CSV`);
    return { importedCount: importedPeople, created: importedPeople, updated: 0, errors: [] };
  }

  public async resetToSeed() {
    return { message: 'Seed reset not implemented for Firestore natively yet.' };
  }

  // --- Phase 1: Health & Emergency ---

  public async getHealthProfile(personId: string, userId: string) {
    const d = await getDoc(doc(db, 'health_profiles', personId));
    if (!d.exists()) {
      return { 
        id: personId, 
        personId: personId, 
        bloodGroup: '', 
        bloodGroupPrivacy: 'private',
        notes: '',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return ({ id: d.id, ...d.data() as any });
  }

  public async updateHealthProfile(personId: string, userId: string, data: any) {
    const ref = doc(db, 'health_profiles', personId);
    const d = await getDoc(ref);
    let updated;
    if (d.exists()) {
      updated = { ...d.data() as any, ...data, updatedAt: new Date().toISOString() };
    } else {
      updated = {
        id: personId,
        personId,
        bloodGroup: 'Unknown / Not Specified',
        visibility: 'Only Me',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async getMedicines(personId: string, userId: string) {
    const q = query(collection(db, 'medicines'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  }

  public async addMedicine(personId: string, userId: string, data: any) {
    const id = 'med-' + crypto.randomUUID();
    const med = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'medicines', id), removeUndefined(med));
    return med;
  }
  
  public async updateMedicine(id: string, userId: string, data: any) {
    const ref = doc(db, 'medicines', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data() as any, ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteMedicine(id: string, userId: string) {
    await deleteDoc(doc(db, 'medicines', id));
    return true;
  }

  public async getAllergies(personId: string, userId: string) {
    const q = query(collection(db, 'allergies'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  }

  public async addAllergy(personId: string, userId: string, data: any) {
    const id = 'allergy-' + crypto.randomUUID();
    const allergy = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'allergies', id), removeUndefined(allergy));
    return allergy;
  }

  public async updateAllergy(id: string, userId: string, data: any) {
    const ref = doc(db, 'allergies', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data() as any, ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteAllergy(id: string, userId: string) {
    await deleteDoc(doc(db, 'allergies', id));
    return true;
  }

  public async getEmergencyContacts(personId: string, userId: string) {
    const q = query(collection(db, 'emergency_contacts'), where('personId', '==', personId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  }

  public async addEmergencyContact(personId: string, userId: string, data: any) {
    const id = 'emc-' + crypto.randomUUID();
    const contact = {
      id, personId, ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'emergency_contacts', id), removeUndefined(contact));
    return contact;
  }

  public async updateEmergencyContact(id: string, userId: string, data: any) {
    const ref = doc(db, 'emergency_contacts', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data() as any, ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }

  public async deleteEmergencyContact(id: string, userId: string) {
    await deleteDoc(doc(db, 'emergency_contacts', id));
    return true;
  }

  // --- Phase 2-5 CRUD ---
  // Finance
  public async getTransactions(personId: string) {
    const snap = await getDocs(query(collection(db, 'finance_transactions'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addTransaction(personId: string, data: any) {
    const id = 'txn-' + crypto.randomUUID();
    const docData = { id, personId, ...data, paidAmount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'finance_transactions', id), removeUndefined(docData));
    return docData;
  }
  public async updateTransaction(id: string, data: any) {
    const ref = doc(db, 'finance_transactions', id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    const updated = { ...d.data(), ...data, updatedAt: new Date().toISOString() };
    await setDoc(ref, removeUndefined(updated));
    return updated;
  }
  public async deleteTransaction(id: string) {
    await deleteDoc(doc(db, 'finance_transactions', id));
    return true;
  }
  public async addPayment(transactionId: string, data: any) {
    const id = 'pay-' + crypto.randomUUID();
    const docData = { id, transactionId, ...data, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'transaction_payments', id), removeUndefined(docData));
    
    // Update transaction paidAmount
    const tRef = doc(db, 'finance_transactions', transactionId);
    const tDoc = await getDoc(tRef);
    if (tDoc.exists()) {
      const t = tDoc.data();
      const newPaid = (t.paidAmount || 0) + Number(data.amount || 0);
      let status = t.status;
      if (newPaid >= t.amount) status = 'Settled';
      else if (newPaid > 0) status = 'Partially Settled';
      await setDoc(tRef, removeUndefined({ ...t, paidAmount: newPaid, status, updatedAt: new Date().toISOString() }));
    }
    return docData;
  }

  // Vault
  public async getDocuments(personId: string) {
    const snap = await getDocs(query(collection(db, 'personal_documents'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addDocument(personId: string, data: any) {
    const id = 'doc-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'personal_documents', id), removeUndefined(docData));
    return docData;
  }
  public async deleteDocument(id: string) {
    await deleteDoc(doc(db, 'personal_documents', id));
    return true;
  }

  // Events
  public async getEvents(personId: string) {
    const snap = await getDocs(query(collection(db, 'personal_events'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addEvent(personId: string, data: any) {
    const id = 'evt-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'personal_events', id), removeUndefined(docData));
    return docData;
  }
  public async deleteEvent(id: string) {
    await deleteDoc(doc(db, 'personal_events', id));
    return true;
  }

  // Gifts
  public async getGifts(personId: string) {
    const snap = await getDocs(query(collection(db, 'gift_history'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addGift(personId: string, data: any) {
    const id = 'gft-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'gift_history', id), removeUndefined(docData));
    return docData;
  }
  public async deleteGift(id: string) {
    await deleteDoc(doc(db, 'gift_history', id));
    return true;
  }

  // Preferences
  public async getPreferences(personId: string) {
    const snap = await getDocs(query(collection(db, 'personal_preferences'), where('personId', '==', personId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  public async addPreference(personId: string, data: any) {
    const id = 'pref-' + crypto.randomUUID();
    const docData = { id, personId, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'personal_preferences', id), removeUndefined(docData));
    return docData;
  }
  public async deletePreference(id: string) {
    await deleteDoc(doc(db, 'personal_preferences', id));
    return true;
  }

}
export const storage = new StorageService();