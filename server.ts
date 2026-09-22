import express, { Request, Response, NextFunction } from 'express';

import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
try {
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  admin.initializeApp({ projectId: config.projectId });
} catch (e) {
  console.warn('Firebase admin init failed', e);
}

import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { storage, verifyPassword, hashPassword } from './server/storage.js';

const PORT = 3000;
const SESSION_TOKENS = new Map<string, { userId: string; expiresAt: number }>();

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of SESSION_TOKENS.entries()) {
    if (session.expiresAt < now) {
      SESSION_TOKENS.delete(token);
    }
  }
}, 60000);

export function createToken(userId: string): string {
  const token = 'dtk_' + crypto.randomBytes(32).toString('hex');
  // 7-day session
  SESSION_TOKENS.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function getUserIdFromToken(token?: string): string | null {
  if (!token) return null;
  const session = SESSION_TOKENS.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    SESSION_TOKENS.delete(token);
    return null;
  }
  return session.userId;
}

// Auth Middleware
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

  // Fallback: Check query or cookie if provided
  if (!token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  let userId = getUserIdFromToken(token);

  if (!userId) {
    // Fallback to default guest/viewer user for safe read-only access
    let viewerUser = await storage.findUserByUsername('viewer');
    if (!viewerUser) {
      try {
        viewerUser = await storage.createUser('viewer', 'viewer@example.com', 'viewer123', 'Guest Viewer', 'viewer');
      } catch (e) {
        console.warn('Failed to create default viewer user:', e);
      }
    }
    if (viewerUser) {
      userId = viewerUser.id;
      if (token) {
        // Register this token for the session so it stays mapped
        SESSION_TOKENS.set(token, {
          userId,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }
    }
  }

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized. Please login to access your private directory.' });
    return;
  }

  (req as any).userId = userId;
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const user = await storage.findUserById(userId);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required.' });
    return;
  }
  next();
}

async function ensureDefaultUsers() {
  try {
    let admin = await storage.findUserByUsername('admin');
    if (!admin) {
      await storage.createUser('admin', 'admin@example.com', 'admin123', 'System Admin', 'admin');
      console.log('Default admin user created: admin / admin123');
    }
    let viewer = await storage.findUserByUsername('viewer');
    if (!viewer) {
      await storage.createUser('viewer', 'viewer@example.com', 'viewer123', 'Guest Viewer', 'viewer');
      console.log('Default viewer user created: viewer / viewer123');
    }
  } catch (err) {
    console.warn('Error ensuring default users exist:', err);
  }
}

async function startServer() {
  const app = express();

  await ensureDefaultUsers();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use('/api', (req, res, next) => {
    // Basic CORS & Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // ==========================================
  // AUTH ROUTES

  app.get('/api/firebase-config', (req, res) => {
    try {
      const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
      res.json(config);
    } catch (e) {
      res.status(500).json({error: 'Config not found'});
    }
  });

  app.post('/api/auth/firebase-login', async (req, res) => {
    const { idToken } = req.body;
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      const email = decoded.email || decoded.uid;
      let user = await storage.findUserByUsername(email);
      if (!user) {
        user = await storage.createUser(email, email, 'firebase-managed', email, 'admin');
      } else {
        user.role = 'admin';
        await storage.saveUser(user);
      }
      const token = createToken(user.id);
      const { passwordHash, ...userSafe } = user;
      res.json({ token, user: userSafe });
    } catch (err: any) {
      res.status(401).json({ error: 'Invalid Firebase Auth token: ' + err.message });
    }
  });

  // ==========================================

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    let { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username/email and password are required' });
      return;
    }
    username = String(username).trim();
    password = String(password).trim();

    let user = await storage.findUserByUsername(username);

    // Fallback: If attempting default admin login credentials
    const lowerUser = username.toLowerCase();
    const isDefaultAdminAttempt = (
      lowerUser === 'admin' ||
      lowerUser === 'admin@example.com' ||
      lowerUser === 'mdsahakamal016@gmail.com'
    ) && password === 'admin123';

    if (isDefaultAdminAttempt) {
      if (!user) {
        user = await storage.createUser('admin', 'admin@example.com', 'admin123', 'System Admin', 'admin');
      } else if (!verifyPassword(password, user.passwordHash)) {
        user.passwordHash = hashPassword('admin123');
        user.role = 'admin';
        await storage.saveUser(user);
      }
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = createToken(user.id);
    const { passwordHash, ...userSafe } = user;
    res.json({
      token,
      user: userSafe,
    });
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    let { username, email, password, fullName, role } = req.body;
    if (!username || !email || !password || !fullName) {
      res.status(400).json({ error: 'All registration fields are required' });
      return;
    }
    username = String(username).trim();
    email = String(email).trim().toLowerCase();
    password = String(password).trim();
    fullName = String(fullName).trim();

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existing = await storage.findUserByUsername(username);
    if (existing) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const newUser = await storage.createUser(username, email, password, fullName, 'user');
    await storage.createPerson(newUser.id, { name: fullName, email: email, tags: ['Self'], relationshipType: 'Self' });
    const token = createToken(newUser.id);
    const { passwordHash, ...userSafe } = newUser;
    res.status(201).json({
      token,
      user: userSafe,
    });
  });

  // Demo 1-click login for quick testing
  app.post('/api/auth/demo-login', async (req: Request, res: Response) => {
    let admin = await storage.findUserByUsername('admin');
    if (!admin) {
      admin = await storage.createUser('admin', 'admin@example.com', 'admin123', 'System Admin', 'admin');
    }
    const token = createToken(admin.id);
    const { passwordHash, ...userSafe } = admin;
    res.json({
      token,
      user: userSafe,
    });
  });

  // Guest / Viewer login
  app.post('/api/auth/viewer-login', async (req: Request, res: Response) => {
    let viewer = await storage.findUserByUsername('viewer');
    if (!viewer) {
      viewer = await storage.createUser('viewer', 'viewer@example.com', 'viewer123', 'Guest Viewer', 'viewer');
    }
    const token = createToken(viewer.id);
    const { passwordHash, ...userSafe } = viewer;
    res.json({
      token,
      user: userSafe,
    });
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    let userId = getUserIdFromToken(token);

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await storage.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash, ...userSafe } = user;
    res.json({ user: userSafe, token });
  });

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    if (token) {
      SESSION_TOKENS.delete(token);
    }
    res.json({ message: 'Logged out successfully' });
  });

  app.put('/api/auth/profile', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { fullName, email, avatar } = req.body;
    const updated = await storage.updateUserProfile(userId, { fullName, email, avatar });
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Also sync person record if exists
    const person = await storage.getMyPerson(userId, updated.email, updated.fullName);
    if (person) {
      await storage.updatePerson(userId, person.id, { name: updated.fullName, email: updated.email, photo: updated.avatar });
    }
    const { passwordHash, ...userSafe } = updated;
    res.json({ user: userSafe });
  });

  app.get('/api/auth/my-person', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.findUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const person = await storage.getMyPerson(user.id, user.email, user.fullName);
      res.json(person);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/auth/password', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const success = await storage.updateUserPassword(userId, currentPassword, newPassword);
    if (!success) {
      res.status(400).json({ error: 'Current password does not match' });
      return;
    }
    res.json({ message: 'Password updated successfully' });
  });

  // Admin Tools Endpoints (Step 3)
  app.get('/api/admin/users', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(u => {
        const { passwordHash, ...rest } = u as any;
        return rest;
      });
      res.json(safeUsers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/users/:id/role', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!['admin', 'viewer', 'user'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }
      const updated = await storage.updateUserRole(id, role);
      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const { passwordHash, ...userSafe } = updated as any;
      res.json({ user: userSafe });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // SETTINGS
  // ==========================================

  app.get('/api/settings', async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/settings', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    try {
      await storage.updateSettings(req.body);
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // STATS & DASHBOARD
  // ==========================================

  app.get('/api/stats', authMiddleware, async (req: Request, res: Response) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get('/api/activity-logs', authMiddleware, async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await storage.getActivityLogs(limit);
    res.json(logs);
  });

  // ==========================================
  // PEOPLE CRUD & SEARCH
  // ==========================================

  app.get('/api/people', authMiddleware, async (req: Request, res: Response) => {
    const {
      query,
      tag,
      circle,
      relationship,
      organization,
      location,
      favoriteOnly,
      archivedOnly,
      needsFollowUp,
      upcomingBirthday,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const result = await storage.getPeople({
      query: typeof query === 'string' ? query : undefined,
      tag: typeof tag === 'string' ? tag : undefined,
      circle: typeof circle === 'string' ? circle : undefined,
      relationship: typeof relationship === 'string' ? relationship : undefined,
      organization: typeof organization === 'string' ? organization : undefined,
      location: typeof location === 'string' ? location : undefined,
      favoriteOnly: favoriteOnly === 'true',
      archivedOnly: archivedOnly === 'true',
      needsFollowUp: needsFollowUp === 'true',
      upcomingBirthday: upcomingBirthday === 'true',
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json(result);
  });

  app.post('/api/people', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const data = req.body;
    if (!data.name || !data.name.trim()) {
      res.status(400).json({ error: 'Contact full name is required' });
      return;
    }

    const person = await storage.createPerson(userId, data);
    res.status(201).json(person);
  });

  app.get('/api/people/:id', authMiddleware, async (req: Request, res: Response) => {
    const person = await storage.getPersonById(req.params.id);
    if (!person) {
      res.status(404).json({ error: 'Person profile not found' });
      return;
    }
    const notes = await storage.getNotesByPersonId(req.params.id);
    const interactions = await storage.getInteractionsByPersonId(req.params.id);
    const logs = await storage.getActivityLogs(500);
    const personLogs = logs.filter(l => l.entityId === req.params.id);
    const timeline = personLogs.map(log => ({
      id: log.id,
      type: log.action || 'UNKNOWN',
      title: (log.action || 'UNKNOWN').replace(/_/g, ' '),
      description: log.details || '',
      date: log.timestamp
    }));
    res.json({ person, notes, interactions, timeline });
  });

  app.put('/api/people/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    if (user?.role !== 'admin' && person.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own profile' });
    }
    const updated = await storage.updatePerson(userId, req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/people/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const person = await storage.getPersonById(req.params.id);
      const user = await storage.findUserById(userId);
      if (!person) return res.status(404).json({ error: 'Person not found' });
      if (user?.role !== 'admin' && person.userId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own profile' });
      }
      const success = await storage.deletePerson(userId, req.params.id);
      if (!success) {
        res.status(404).json({ error: 'deletePerson returned false' });
        return;
      }
      res.json({ message: 'Person deleted successfully' });
    } catch (e: any) {
      console.error('DELETE /api/people/:id error:', e);
      res.status(500).json({ error: e.message || 'Failed to delete' });
    }
  });

  app.post('/api/people/:id/toggle-favorite', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const isFavorite = await storage.toggleFavorite(userId, req.params.id);
    if (isFavorite === null) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    res.json({ isFavorite });
  });

  app.post('/api/people/:id/toggle-archive', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const isArchived = await storage.toggleArchive(userId, req.params.id);
    if (isArchived === null) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    res.json({ isArchived });
  });

  // ==========================================
  // NOTES
  // ==========================================

  app.get('/api/notes', authMiddleware, async (req: Request, res: Response) => {
    const query = typeof req.query.query === 'string' ? req.query.query : undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const notes = await storage.getNotes(query, limit);
    res.json(notes);
  });

  app.post('/api/people/:id/notes', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Note content is required' });
      return;
    }

    const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (user?.role !== 'admin' && person?.userId !== userId) return res.status(403).json({ error: 'Only admins or the profile owner can add notes' });
    const note = await storage.addNote(userId, req.params.id, content);
    if (!note) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    res.status(201).json(note);
  });

  app.put('/api/notes/:noteId', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content } = req.body;
    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Note content is required' });
      return;
    }

    const updated = await storage.updateNote(userId, req.params.noteId, content);
    if (!updated) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/notes/:noteId', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const success = await storage.deleteNote(userId, req.params.noteId);
    if (!success) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json({ message: 'Note deleted successfully' });
  });

  // ==========================================
  // INTERACTIONS
  // ==========================================

  app.get('/api/interactions', authMiddleware, async (req: Request, res: Response) => {
    const query = typeof req.query.query === 'string' ? req.query.query : undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const interactions = await storage.getInteractions(query, limit);
    res.json(interactions);
  });

  app.post('/api/people/:id/interactions', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { type, date, description, notes } = req.body;
    if (!description || !description.trim()) {
      res.status(400).json({ error: 'Interaction description is required' });
      return;
    }

    const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (user?.role !== 'admin' && person?.userId !== userId) return res.status(403).json({ error: 'Only admins or the profile owner can add interactions' });
    const interaction = await storage.addInteraction(userId, req.params.id, type || 'Meeting', date, description, notes);
    if (!interaction) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }
    res.status(201).json(interaction);
  });

  app.delete('/api/interactions/:interactionId', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const success = await storage.deleteInteraction(userId, req.params.interactionId);
    if (!success) {
      res.status(404).json({ error: 'Interaction not found' });
      return;
    }
    res.json({ message: 'Interaction deleted successfully' });
  });

  // ==========================================
  // TAGS
  // ==========================================

  app.get('/api/tags', authMiddleware, async (req: Request, res: Response) => {
    const tags = await storage.getTags();
    res.json(tags);
  });

  app.post('/api/tags', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const { name, color, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tag name is required' });
      return;
    }
    const tag = await storage.createTag(name, color, description);
    res.status(201).json(tag);
  });

  app.put('/api/tags/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const { name, color, description } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Tag name is required' });
      return;
    }
    const updated = await storage.updateTag(req.params.id, name, color, description);
    if (!updated) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/tags/:id', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const success = await storage.deleteTag(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    res.json({ message: 'Tag deleted successfully' });
  });

  // ==========================================
  // EXPORT & IMPORT & DATABASE MANAGEMENT
  // ==========================================

  app.get('/api/export/json', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const data = await storage.exportFullJson();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="social-directory-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(data, null, 2));
  });

  app.get('/api/export/csv', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const csv = await storage.exportPeopleCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="people-contacts-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  });

  app.post('/api/import/json', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const data = req.body.data || req.body;
    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Invalid JSON data payload' });
      return;
    }
    const result = await storage.importJson(userId, data);
    res.json(result);
  });

  app.post('/api/import/csv', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { csvText } = req.body;
    if (!csvText || typeof csvText !== 'string') {
      res.status(400).json({ error: 'Valid CSV text content is required' });
      return;
    }
    const result = await storage.importCsv(userId, csvText);
    res.json(result);
  });

  app.post('/api/database/reset', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
    const fresh = await storage.resetToSeed();
    res.json({ message: 'Database reset to default seed records successfully', stats: await storage.getStats() });
  });

  // ==========================================
  // PHASE 1: HEALTH & EMERGENCY
  // ==========================================
  app.get('/api/people/:id/health', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const profile = await storage.getHealthProfile(req.params.id, userId);
      const medicines = await storage.getMedicines(req.params.id, userId);
      const allergies = await storage.getAllergies(req.params.id, userId);
      const emergencyContacts = await storage.getEmergencyContacts(req.params.id, userId);
      res.json({ profile, medicines, allergies, emergencyContacts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post('/api/people/:id/health', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.updateHealthProfile(req.params.id, userId, req.body));
  });

  app.post('/api/people/:id/medicines', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.addMedicine(req.params.id, userId, req.body));
  });
  app.put('/api/medicines/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.updateMedicine(req.params.id, userId, req.body));
  });
  app.delete('/api/medicines/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.deleteMedicine(req.params.id, userId));
  });

  app.post('/api/people/:id/allergies', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.addAllergy(req.params.id, userId, req.body));
  });
  app.put('/api/allergies/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.updateAllergy(req.params.id, userId, req.body));
  });
  app.delete('/api/allergies/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.deleteAllergy(req.params.id, userId));
  });

  app.post('/api/people/:id/emergency-contacts', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.addEmergencyContact(req.params.id, userId, req.body));
  });
  app.put('/api/emergency-contacts/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.updateEmergencyContact(req.params.id, userId, req.body));
  });
  app.delete('/api/emergency-contacts/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    res.json(await storage.deleteEmergencyContact(req.params.id, userId));
  });

  // ==========================================
  // PHASE 2-5: FINANCE, VAULT, EVENTS, GIFTS, PREFS
  // ==========================================
  app.get('/api/people/:id/transactions', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.getTransactions(req.params.id));
  });
  app.post('/api/people/:id/transactions', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.addTransaction(req.params.id, req.body));
  });
  app.put('/api/transactions/:id', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.updateTransaction(req.params.id, req.body));
  });
  app.delete('/api/transactions/:id', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.deleteTransaction(req.params.id));
  });
  app.post('/api/transactions/:id/payments', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.addPayment(req.params.id, req.body));
  });

  app.get('/api/people/:id/documents', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.getDocuments(req.params.id));
  });
  app.post('/api/people/:id/documents', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.addDocument(req.params.id, req.body));
  });
  app.delete('/api/documents/:id', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.deleteDocument(req.params.id));
  });

  app.get('/api/people/:id/events', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.getEvents(req.params.id));
  });
  app.post('/api/people/:id/events', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.addEvent(req.params.id, req.body));
  });
  app.delete('/api/events/:id', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.deleteEvent(req.params.id));
  });

  app.get('/api/people/:id/gifts', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.getGifts(req.params.id));
  });
  app.post('/api/people/:id/gifts', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.addGift(req.params.id, req.body));
  });
  app.delete('/api/gifts/:id', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.deleteGift(req.params.id));
  });

  app.get('/api/people/:id/preferences', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.getPreferences(req.params.id));
  });
  app.post('/api/people/:id/preferences', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.addPreference(req.params.id, req.body));
  });
  app.delete('/api/preferences/:id', authMiddleware, async (req: Request, res: Response) => {
    res.json(await storage.deletePreference(req.params.id));
  });

  // ==========================================
  // PWA MANIFEST
  // ==========================================
  app.get('/manifest.json', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const appName = settings?.appName || 'Social Directory';
      const logoUrl = settings?.logoUrl || '/icon.svg';

      res.json({
        name: appName,
        short_name: appName,
        description: "A private, secure personal CRM and social directory.",
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          {
            src: logoUrl,
            sizes: '192x192 512x512',
            type: logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
            purpose: 'any maskable'
          }
        ]
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to generate manifest' });
    }
  });

  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // Prevent static serving of index.html so we can intercept it
    app.get('*', async (req, res) => {
      try {
        const settings = await storage.getSettings();
        const logoUrl = settings?.logoUrl || '/icon.svg';
        const appName = settings?.appName || 'Social Directory';
        
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        html = html.replace('<link rel="apple-touch-icon" href="/icon.svg" />', `<link rel="apple-touch-icon" href="${logoUrl}" />`);
        html = html.replace(/<title>.*?<\/title>/, `<title>${appName}</title>`);
        res.send(html);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Social Directory server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
