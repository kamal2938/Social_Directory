const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  /isAdmin\?: boolean;\n\s*onOpenAdminLogin\?: \(\) => void;/,
  `isAdmin?: boolean;
  isGuest?: boolean;
  onOpenLogin?: () => void;
  onOpenAdminLogin?: () => void;`
);

content = content.replace(
  /isAdmin = false,\n\s*onOpenAdminLogin,/,
  `isAdmin = false,
  isGuest = true,
  onOpenLogin,
  onOpenAdminLogin,`
);

// Update footer buttons
content = content.replace(
  /\{\!isAdmin && onOpenAdminLogin \? \([\s\S]*?\) : null\}/,
  `
  {!isGuest && onLogout ? (
    <button
      onClick={onLogout}
      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold whitespace-nowrap transition-colors"
    >
      {lang === 'bn' ? 'বের হন' : 'Logout'}
    </button>
  ) : (
    <div className="flex flex-col gap-1">
      {onOpenLogin && (
        <button
          onClick={onOpenLogin}
          className="px-2 py-1 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-500/40 text-[10px] font-bold whitespace-nowrap transition-colors"
        >
          {lang === 'bn' ? 'লগইন/রেজিস্টার' : 'User Login'}
        </button>
      )}
      {onOpenAdminLogin && (
        <button
          onClick={onOpenAdminLogin}
          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold whitespace-nowrap transition-colors"
        >
          {lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}
        </button>
      )}
    </div>
  )}
  `
);

content = content.replace(
  /\{isAdmin \? \(lang === 'bn' \? 'অ্যাডমিন মোড' : 'Admin Mode'\) : \(lang === 'bn' \? 'ভিউয়ার মোড' : 'Viewer Mode'\)\}/,
  `{isAdmin ? 'Admin Mode' : isGuest ? 'Guest Viewer' : 'User Mode'}`
);

content = content.replace(
  /\{isAdmin \? \(lang === 'bn' \? 'পূর্ণ অ্যাক্সেস' : 'Full Access'\) : \(lang === 'bn' \? 'রিড-অনলি মোড' : 'Read-Only'\)\}/,
  `{isAdmin ? 'Full Access' : isGuest ? 'Read-Only' : 'Own Profile Access'}`
);

fs.writeFileSync('src/components/Sidebar.tsx', content);
console.log('Sidebar patched 2');
