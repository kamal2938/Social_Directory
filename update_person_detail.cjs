const fs = require('fs');

let code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

// Replace the outer container to make it a bottom-sheet/full-screen slide on mobile
// And replace Quick Actions.

// 1. Change the wrapper classes.
code = code.replace(
  'className={cn("bg-slate-100 dark:bg-black w-full flex flex-col relative border-0 sm:border border-slate-200 dark:border-slate-800", embedded ? "shadow-xs rounded-2xl" : "h-full sm:h-auto rounded-none sm:rounded-2xl max-w-2xl shadow-none sm:shadow-2xl overflow-hidden sm:max-h-[92vh]")}',
  'className={cn("bg-slate-50 dark:bg-slate-950 w-full flex flex-col relative border-0 sm:border border-slate-200 dark:border-slate-800 transition-transform duration-300", embedded ? "shadow-xs rounded-2xl" : "h-full sm:h-auto rounded-none sm:rounded-2xl max-w-2xl shadow-none sm:shadow-2xl overflow-hidden sm:max-h-[92vh]")}'
);

code = code.replace(
  'className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-150"',
  'className="fixed inset-0 z-[100] overflow-hidden bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200"'
);

// We need to inject Framer motion or just use CSS animations for the slide up.
// Actually, animate-in slide-in-from-bottom is supported by tailwindcss-animate if it's there.
// I'll add `animate-in slide-in-from-bottom duration-300` to the modalInner itself.

const oldInnerClasses = 'className={cn("bg-slate-50 dark:bg-slate-950 w-full flex flex-col relative border-0 sm:border border-slate-200 dark:border-slate-800 transition-transform duration-300"';
const newInnerClasses = 'className={cn("bg-slate-50 dark:bg-slate-950 w-full flex flex-col relative border-0 sm:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 ease-out"';
code = code.replace(oldInnerClasses, newInnerClasses);

// Add quick action buttons under the profile picture.
// Let's find the avatar section.
const avatarSection = `               {person?.isFavorite && (
                 <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white dark:bg-slate-900 rounded-full p-0.5">
                   <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                 </div>
               )}
            </div>
          </div>`;

const quickActions = `
          {/* Quick Actions (Thumb Zone) */}
          {!embedded && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 mb-4 px-4">
              {person?.phone && (
                <a href={"tel:" + person.phone} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Call</span>
                </a>
              )}
              {person?.phone && (
                <a href={"https://wa.me/" + person.phone.replace(/[^0-9]/g, '')} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">WhatsApp</span>
                </a>
              )}
              {person?.email && (
                <a href={"mailto:" + person.email} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Email</span>
                </a>
              )}
              <button onClick={() => setActiveTab('notes')} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Notes</span>
              </button>
            </div>
          )}
`;

code = code.replace(avatarSection, avatarSection + quickActions);

// Need to ensure MessageCircle is imported.
if (!code.includes('MessageCircle,')) {
    code = code.replace('import {', 'import {\n  MessageCircle,');
}

fs.writeFileSync('src/components/PersonDetailModal.tsx', code);
console.log('PersonDetailModal.tsx updated');
