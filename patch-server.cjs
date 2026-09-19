const fs = require('fs');

// 1. Add firebase-admin and firebase-config endpoint
let server = fs.readFileSync('server.ts', 'utf8');

const adminImports = `
import * as admin from 'firebase-admin';
try {
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  admin.initializeApp({ projectId: config.projectId });
} catch (e) {
  console.warn('Firebase admin init failed', e);
}
`;
server = server.replace("import express, { Request, Response, NextFunction } from 'express';", "import express, { Request, Response, NextFunction } from 'express';\n" + adminImports);

const firebaseConfigRoute = `
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
      const decoded = await admin.auth().verifyIdToken(idToken);
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
`;
server = server.replace("// ==========================================\n  // AUTH ROUTES", "// ==========================================\n  // AUTH ROUTES\n" + firebaseConfigRoute);

// 2. Update Register route to create Person and set role 'user'
server = server.replace(
  /const assignedRole = 'viewer';\n\s*const newUser = await storage\.createUser\(username, email, password, fullName, assignedRole\);/,
  `const newUser = await storage.createUser(username, email, password, fullName, 'user');
    await storage.createPerson(newUser.id, { name: fullName, email: email, tags: ['Self'], relationshipType: 'Self' });`
);

// 3. Update people routes to allow users to edit/delete their OWN profile.
// Replace requireAdmin with custom logic for PUT and DELETE people, and notes/interactions if needed.
// Actually, it's easier to modify requireAdmin? No, requireAdmin is for strict admin.
// Let's replace requireAdmin on specific routes.
function replaceRoute(serverCode, routeMethod, routePath, replacement) {
  const regex = new RegExp(`app\.${routeMethod}\\('${routePath}', authMiddleware, requireAdmin, async \\(req: Request, res: Response\\) => \\{`);
  return serverCode.replace(regex, `app.${routeMethod}('${routePath}', authMiddleware, async (req: Request, res: Response) => {`);
}

server = replaceRoute(server, 'put', '/api/people/:id');
server = replaceRoute(server, 'delete', '/api/people/:id');
server = replaceRoute(server, 'post', '/api/people/:id/notes');
server = replaceRoute(server, 'post', '/api/people/:id/interactions');

// Add the ownership check inside PUT /api/people/:id
server = server.replace(
  /const updated = await storage\.updatePerson\(userId, req\.params\.id, req\.body\);/,
  `const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    if (user?.role !== 'admin' && person.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own profile' });
    }
    const updated = await storage.updatePerson(userId, req.params.id, req.body);`
);

// Add the ownership check inside DELETE /api/people/:id
server = server.replace(
  /const success = await storage\.deletePerson\(userId, req\.params\.id\);/,
  `const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (!person) return res.status(404).json({ error: 'Person not found' });
    if (user?.role !== 'admin' && person.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own profile' });
    }
    const success = await storage.deletePerson(userId, req.params.id);`
);

// Allow anyone (even viewer?) to view, but only admin/owner to edit notes. 
// Wait, the user said: "tar nijer profile ke fully access korte parbe edit,deletec,modify ,etc."
// Meaning notes & interactions on their OWN profile should be editable.
// In storage.ts, we already check ownership for notes and interactions?
// Let's assume storage.addNote / storage.addInteraction checks it, or we just allow it if they pass the check.
// Actually, storage doesn't check owner for addNote. It just adds it.
server = server.replace(
  /const note = await storage\.addNote\(userId, req\.params\.id, content\);/,
  `const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (user?.role !== 'admin' && person?.userId !== userId) return res.status(403).json({ error: 'Only admins or the profile owner can add notes' });
    const note = await storage.addNote(userId, req.params.id, content);`
);

server = server.replace(
  /const interaction = await storage\.addInteraction\([\s\S]*?\);/,
  `const person = await storage.getPersonById(req.params.id);
    const user = await storage.findUserById(userId);
    if (user?.role !== 'admin' && person?.userId !== userId) return res.status(403).json({ error: 'Only admins or the profile owner can add interactions' });
    const interaction = await storage.addInteraction(userId, req.params.id, type || 'Meeting', date, description, notes);`
);

fs.writeFileSync('server.ts', server);
console.log('Server routes patched');
