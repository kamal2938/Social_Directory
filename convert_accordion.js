const fs = require('fs');
let code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

// First, insert AccordionSection component before PersonDetailModal
const accordionComponent = `
const AccordionSection = ({ id, title, icon: Icon, badge, children, activeTab, setActiveTab }: any) => {
  const isOpen = activeTab === id;
  return (
    <div className="bg-white dark:bg-slate-900 border-b sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:rounded-xl mb-3 overflow-hidden shadow-xs transition-all">
      <button onClick={() => setActiveTab(isOpen ? '' : id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-2 font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200">
          <Icon className="w-5 h-5 text-primary-500" />
          {title}
        </div>
        <div className="flex items-center gap-3">
          {badge && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">{badge}</span>}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {isOpen && <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">{children}</div>}
    </div>
  );
};
`;

if (!code.includes('AccordionSection')) {
  code = code.replace(
    'export const PersonDetailModal: React.FC',
    accordionComponent + '\nexport const PersonDetailModal: React.FC'
  );
}

// Remove Tab Navigation
code = code.replace(/\{\/\* Tab Navigation \*\/\}([\s\S]*?)<div className="flex-1 min-h-0 overflow-y-auto/m, '<div className="flex-1 min-h-0 overflow-y-auto');

// Replace {activeTab === 'overview' ? ( ... ) : activeTab === 'health' ? ... }
// I will just use regex to wrap existing blocks. Actually, regex might be brittle.
