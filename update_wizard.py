import re

with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

# Replace the tab selector with a modern progress indicator
tab_selector_start = content.find("        {/* Tab Selector */}")
tab_selector_end = content.find("        {/* Form Body */}")

step_indicator = """        {/* Step Indicator */}
        <div className="bg-slate-50 dark:bg-slate-900/60 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {['basic', 'professional', 'contact', 'crm'].map((step, idx) => {
              const isActive = activeTab === step;
              const isPast = ['basic', 'professional', 'contact', 'crm'].indexOf(activeTab) > idx;
              return (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors border",
                    isActive ? "bg-primary-600 text-white border-primary-600 shadow-xs" :
                    isPast ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800" :
                    "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  {idx < 3 && (
                    <div className={cn(
                      "w-4 sm:w-8 lg:w-12 h-0.5 mx-1.5 sm:mx-2 transition-colors rounded-full",
                      isPast ? "bg-primary-300 dark:bg-primary-700/60" : "bg-slate-200 dark:bg-slate-700"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>
              {activeTab === 'basic' && "1. Basic Details"}
              {activeTab === 'professional' && "2. Professional Info"}
              {activeTab === 'contact' && "3. Contact & Social Links"}
              {activeTab === 'crm' && "4. CRM & Custom Attributes"}
            </span>
            <span className="text-slate-400 text-[10px]">
              Step {['basic', 'professional', 'contact', 'crm'].indexOf(activeTab) + 1} of 4
            </span>
          </div>
        </div>
"""

content = content[:tab_selector_start] + step_indicator + content[tab_selector_end:]

with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)
