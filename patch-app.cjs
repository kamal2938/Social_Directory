const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure that non-admins default to settings
appContent = appContent.replace(
  /const \[activeTab, setActiveTab\] = useState<TabType>\('home'\);/,
  "const [activeTab, setActiveTab] = useState<TabType>('home');\n  useEffect(() => { if (currentUser && currentUser.role !== 'admin' && activeTab !== 'settings') setActiveTab('settings'); }, [currentUser]);"
);

fs.writeFileSync('src/App.tsx', appContent);
console.log('App patched');
