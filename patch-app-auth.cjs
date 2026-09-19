const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add showAuth state
app = app.replace(
  /const \[currentUser, setCurrentUser\] = useState<User \| null>\(null\);/,
  `const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);`
);

// Update initial auth check to not use AuthView
app = app.replace(
  /if \(!currentUser\) \{\n    return <AuthView onLogin=\{\(user\) => setCurrentUser\(user\)\} \/>;\n  \}/,
  `if (showAuth) {
    return <AuthView onLogin={(user) => { setCurrentUser(user); setShowAuth(false); }} onCancel={() => setShowAuth(false)} />;
  }`
);

// We should also replace the catch handler in useEffect to set a default guest
app = app.replace(
  /setCurrentUser\(\{\n\s*id: 'viewer',/,
  `setCurrentUser({
            id: 'guest',
            role: 'viewer',`
);

// In Sidebar, "onOpenAdminLogin" can remain for admins, and we can add a "Login" button for normal users if they are 'guest'
// Actually, earlier I mapped "onOpenAdminLogin" to open the AdminLoginModal. 
// Let's check how Sidebar is called in App.tsx.
fs.writeFileSync('src/App.tsx', app);
console.log('App auth patched');
