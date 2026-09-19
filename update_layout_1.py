import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# Replace AccordionSection definition
accordion_regex = re.compile(r"const AccordionSection =.*?return \(.*?\n\s*\);\n};\n", re.DOTALL)
profile_card = """const ProfileSectionCard = ({ title, icon: Icon, children, onEdit }: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-t sm:border sm:border-slate-200 sm:dark:border-slate-800 sm:rounded-xl mb-3 shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
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
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
"""
content = accordion_regex.sub(profile_card, content)

# Replace all usages of AccordionSection with ProfileSectionCard
content = re.sub(r'<AccordionSection title="([^"]+)" icon=\{([^}]+)\}( defaultOpen=\{true\})?>', 
                 r'<ProfileSectionCard title="\1" onEdit={() => { onEdit(person); onClose(); }}>', 
                 content)
content = content.replace("</AccordionSection>", "</ProfileSectionCard>")

# Change the modal inner layout and header
# Find where modalInner starts
modal_inner_start = content.find("  const modalInner = (\n")
# Find the start of the Tab Navigation
tab_nav_start = content.find("          {/* Tab Navigation */}")

new_header = """  const modalInner = (
    <div className={cn("bg-slate-100 dark:bg-black w-full flex flex-col relative border-0 sm:border border-slate-200 dark:border-slate-800", embedded ? "shadow-xs rounded-2xl" : "h-full sm:h-auto rounded-none sm:rounded-2xl max-w-2xl shadow-none sm:shadow-2xl overflow-hidden sm:max-h-[92vh]")}>
      
      {/* Header Area (FB Style) */}
      <div className="bg-white dark:bg-slate-900 flex-shrink-0 relative">
        {/* Cover Photo Area */}
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 relative">
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {onOpenQRCode && (
                <button
                  onClick={() => onOpenQRCode(person!)}
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                  title="QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit(person!);
                    onClose();
                  }}
                  className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                  title="Edit Contact"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Avatar & Profile Info */}
        <div className="px-4 pb-4">
          <div className="relative flex justify-center -mt-16 sm:-mt-20 mb-3">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0 relative">
               {person?.photo ? (
                  <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
               ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-slate-300 dark:text-slate-600">
                    {person ? getInitials(person.name) : ''}
                  </span>
               )}
               {person?.isFavorite && (
                 <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white dark:bg-slate-900 rounded-full p-0.5">
                   <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                 </div>
               )}
            </div>
          </div>

          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              {person?.name}
              {person?.isArchived && <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Archived</span>}
            </h2>
            <div className="text-[14px] text-slate-600 dark:text-slate-400 mt-1 flex justify-center items-center gap-2">
               {person?.jobTitle || person?.occupation ? (
                 <span className="font-medium text-slate-800 dark:text-slate-200">
                   {person.jobTitle || person.occupation} {person.organization && `at ${person.organization}`}
                 </span>
               ) : null}
            </div>
            
            <div className="mt-1.5 text-xs text-slate-500 flex items-center justify-center gap-3">
               <span className="font-semibold text-slate-800 dark:text-slate-200">{interactions.length} <span className="font-normal text-slate-500">interactions</span></span>
               <span>•</span>
               <span className="font-semibold text-slate-800 dark:text-slate-200">{person?.relationshipType} <span className="font-normal text-slate-500">relation</span></span>
            </div>
            {person?.bio && (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                {person.bio}
              </p>
            )}
          </div>

          {/* Quick Action Bar (Dashboard, Edit, Call etc) */}
          <div className="flex gap-2 mt-5 px-2">
             <a
                href={person?.phone ? `tel:${person.phone}` : '#'}
                onClick={(e) => !person?.phone && e.preventDefault()}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors", person?.phone ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed")}
             >
                <Phone className="w-4 h-4" /> Call
             </a>
             <a
                href={person?.email ? `mailto:${person.email}` : '#'}
                onClick={(e) => !person?.email && e.preventDefault()}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold transition-colors", person?.email ? "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed")}
             >
                <Mail className="w-4 h-4" /> Email
             </a>
             <button
                onClick={() => {
                  onEdit(person!);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Edit Contact"
             >
               <Edit className="w-4 h-4" />
               <span className="hidden sm:inline">Edit</span>
             </button>
             {onOpenOutreach && (
               <button
                  onClick={() => onOpenOutreach(person!, 'catchup')}
                  className="flex items-center justify-center p-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="AI Draft Outreach"
               >
                 <Sparkles className="w-5 h-5" />
               </button>
             )}
          </div>
        </div>

"""

if modal_inner_start != -1 and tab_nav_start != -1:
    content = content[:modal_inner_start] + new_header + content[tab_nav_start:]

# Change the Tab Navigation container padding and border to match FB style
content = content.replace("          {/* Tab Navigation */}\n          <div className=\"flex items-center gap-2 mt-4 border-b border-slate-200 dark:border-slate-800 -mb-4 sm:-mb-6 overflow-x-auto\">", 
                          "          {/* Tab Navigation */}\n          <div className=\"px-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto\">")

# Fix the Tab body wrapper spacing
content = content.replace("        {/* Tab Body */}\n        <div className=\"flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6\">",
                          "        {/* Tab Body */}\n        <div className=\"flex-1 min-h-0 overflow-y-auto py-3 sm:py-4 bg-slate-100 dark:bg-slate-950\">\n          <div className=\"px-0 sm:px-4 space-y-3\">")
content = content.replace("        {/* Tab Body */}\n        <div className=\"flex-1 min-h-0 overflow-y-auto bg-slate-100/50 dark:bg-slate-950/50 p-3 sm:p-4 space-y-4\">",
                          "        {/* Tab Body */}\n        <div className=\"flex-1 min-h-0 overflow-y-auto py-3 sm:py-4 bg-slate-100 dark:bg-slate-950\">\n          <div className=\"px-0 sm:px-4 space-y-3\">")


with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
