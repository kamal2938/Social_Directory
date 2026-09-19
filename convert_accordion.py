import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

# Add icons
if 'ChevronDown' not in code:
    code = code.replace('import {', 'import { ChevronDown, ChevronUp, UserCircle, ')

accordion_component = """
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
          {badge !== undefined && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">{badge}</span>}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {isOpen && <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">{children}</div>}
    </div>
  );
};
"""

if 'AccordionSection' not in code:
    code = code.replace('export const PersonDetailModal: React.FC', accordion_component + '\nexport const PersonDetailModal: React.FC')

# Strip tab navigation
code = re.sub(r'\{/\* Tab Navigation \*/\}.*?<div className="flex-1 min-h-0 overflow-y-auto', '<div className="flex-1 min-h-0 overflow-y-auto', code, flags=re.DOTALL)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
print('Phase 1 done')
