import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

outreach_start = content.find("          {/* 1-Click Outreach Bar */}")
outreach_end = content.find("          {/* Tab Navigation */}")

quick_actions = """          {/* Quick Action Bar */}
          {person && (
            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-4 gap-2">
              <a
                href={person.phone ? `tel:${person.phone}` : '#'}
                onClick={(e) => !person.phone && e.preventDefault()}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
                  person.phone ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60" : "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400"
                )}
              >
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Call</span>
              </a>
              
              <a
                href={person.phone ? `sms:${person.phone}` : '#'}
                onClick={(e) => !person.phone && e.preventDefault()}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
                  person.phone ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60" : "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400"
                )}
              >
                <MessageSquare className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Message</span>
              </a>

              <a
                href={person.email ? `mailto:${person.email}` : '#'}
                onClick={(e) => !person.email && e.preventDefault()}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
                  person.email ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60" : "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400"
                )}
              >
                <Mail className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Email</span>
              </a>

              <button
                onClick={() => onOpenOutreach ? onOpenOutreach(person, 'catchup') : {}}
                disabled={!onOpenOutreach}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
                  onOpenOutreach ? "bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/60" : "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400"
                )}
              >
                <Sparkles className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">AI Draft</span>
              </button>
            </div>
          )}
"""

content = content[:outreach_start] + quick_actions + content[outreach_end:]

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
