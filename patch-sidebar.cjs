const fs = require('fs');
let sidebarContent = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Find the navItems array and add filtering
sidebarContent = sidebarContent.replace(
  /const navItems[\s\S]*?\];/, 
  (match) => match + "\n  const filteredNavItems = isAdmin ? navItems : navItems.filter(item => item.id === 'settings');"
);

// Replace mapping of navItems with filteredNavItems
sidebarContent = sidebarContent.replace(/\{navItems\.map\(\(item\)/g, '{filteredNavItems.map((item)');

fs.writeFileSync('src/components/Sidebar.tsx', sidebarContent);
console.log('Sidebar patched');
