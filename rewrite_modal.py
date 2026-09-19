import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# Replace AccordionSection
accordion_start = content.find("const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }: any) => {")
accordion_end = content.find("};", accordion_start) + 2

profile_card = """const ProfileSectionCard = ({ title, icon: Icon, children, onEdit }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-y sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:rounded-xl mb-3 shadow-xs">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-bold text-[16px] text-slate-900 dark:text-white flex items-center gap-2">
          {title}
        </h3>
        {onEdit && (
          <button 
            onClick={onEdit}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
};"""

content = content[:accordion_start] + profile_card + content[accordion_end:]

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
