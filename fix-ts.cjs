const fs = require('fs');
// Fix server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(
  /import \* as admin from 'firebase-admin';/,
  "import * as fs from 'fs';\nimport * as admin from 'firebase-admin';\nimport { getAuth } from 'firebase-admin/auth';"
);
server = server.replace(
  /await admin\.auth\(\)\.verifyIdToken\(idToken\)/,
  "await getAuth().verifyIdToken(idToken)"
);
fs.writeFileSync('server.ts', server);

// Fix server/types.ts
let types = fs.readFileSync('server/types.ts', 'utf8');
types = types.replace(
  /role\?: "admin" \| "viewer";/,
  `role?: "admin" | "viewer" | "user";`
);
fs.writeFileSync('server/types.ts', types);

// Fix server/storage.ts
let storage = fs.readFileSync('server/storage.ts', 'utf8');
storage = storage.replace(
  /role: 'admin' \| 'viewer' = 'viewer'\): Promise<User> \{/,
  `role: 'admin' | 'viewer' | 'user' = 'viewer'): Promise<User> {`
);
fs.writeFileSync('server/storage.ts', storage);

// Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /id: 'guest',\n\s*role: 'viewer',\n\s*username: 'viewer',/,
  `id: 'guest',
            username: 'viewer',`
);
// Also ensure no double isAdmin in Sidebar props
app = app.replace(
  /isAdmin=\{currentUser\.role === 'admin'\}\s*currentUserId=\{currentUser\?\.id\}\s*isGuest=\{currentUser\.username === 'viewer' \|\| currentUser\.id === 'guest'\}\s*onOpenLogin=\{\(\) => setShowAuth\(true\)\}/g,
  `isAdmin={currentUser.role === 'admin'}
        isGuest={currentUser.username === 'viewer' || currentUser.id === 'guest'}
        onOpenLogin={() => setShowAuth(true)}`
); // The replacement I did earlier didn't introduce duplication of isAdmin, but let's just make sure.

fs.writeFileSync('src/App.tsx', app);
console.log('TypeScript errors fixed');
