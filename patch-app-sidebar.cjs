const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /isAdmin=\{currentUser\.role === 'admin'\}/,
  `isAdmin={currentUser.role === 'admin'}
        isGuest={currentUser.username === 'viewer' || currentUser.id === 'guest'}
        onOpenLogin={() => setShowAuth(true)}`
);

fs.writeFileSync('src/App.tsx', app);
console.log('App sidebar patched');
