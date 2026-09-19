const fs = require('fs');

let code = fs.readFileSync('src/components/AddEditPersonModal.tsx', 'utf8');

// The activeTab values are: 'basic' | 'professional' | 'contact' | 'crm'
// Instead of Tab buttons at the top, we want to show a step progress indicator and Next/Back buttons at the bottom.
// Wait, the easiest way is to keep `activeTab` but render it as a wizard!

// Increase input sizes from py-2/py-1.5 to py-3 (or py-2.5) for mobile friendliness.
code = code.replace(/px-3 py-2 text-sm/g, "px-4 py-3 text-base sm:text-sm");
code = code.replace(/px-2.5 py-1.5 text-sm/g, "px-4 py-3 text-base sm:text-sm");
code = code.replace(/px-3 py-1.5 text-sm/g, "px-4 py-3 text-base sm:text-sm");
code = code.replace(/py-2 text-sm/g, "py-3 text-base sm:text-sm");

// To convert the Tab Navigation to a Wizard Header:
// The original header has: ` {/* Tab Navigation */}` -> ` {/* Form Body */}`
// I will replace it with a Step indicator.

const wizardHeader = `
        {/* Wizard Progress */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto hide-scrollbar">
          {[
            { id: 'basic', label: 'Basic Info', num: 1 },
            { id: 'professional', label: 'Work', num: 2 },
            { id: 'contact', label: 'Contact', num: 3 },
            { id: 'crm', label: 'Details', num: 4 }
          ].map((step) => {
            const isActive = activeTab === step.id;
            const idx = ['basic', 'professional', 'contact', 'crm'].indexOf(activeTab);
            const isCompleted = ['basic', 'professional', 'contact', 'crm'].indexOf(step.id) < idx;
            
            return (
              <div
                key={step.id}
                className={"flex items-center gap-2 px-4 py-3 min-w-max border-b-2 transition-colors " + (isActive ? "border-primary-600 text-primary-700 dark:text-primary-400" : "border-transparent text-slate-500 dark:text-slate-400")}
              >
                <div className={"w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold " + (isActive ? "bg-primary-600 text-white" : isCompleted ? "bg-primary-100 text-primary-600" : "bg-slate-200 dark:bg-slate-800")}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.num}
                </div>
                <span className="text-sm font-semibold">{step.label}</span>
              </div>
            );
          })}
        </div>
`;

code = code.replace(/\{\/\* Tab Navigation \*\/\}[\s\S]*?\{\/\* Form Body \*\/\}/, wizardHeader + '\n        {/* Form Body */}');

// Now for the footer, replace the Save button with Next/Prev/Save.
// The footer looks like:
// {/* Footer */}
// <div className="p-4 sm:p-6 border-t ...">
//   <button ... cancel ...>
//   <button ... save ...>
// </div>

const footerRegex = /\{\/\* Footer \*\/\}[\s\S]*?<\/div>/;
const wizardFooter = `
        {/* Wizard Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['basic', 'professional', 'contact', 'crm'];
                  setActiveTab(tabs[tabs.indexOf(activeTab) - 1] as any);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
            )}
            
            {activeTab !== 'crm' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['basic', 'professional', 'contact', 'crm'];
                  setActiveTab(tabs[tabs.indexOf(activeTab) + 1] as any);
                }}
                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 shadow-sm transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !name.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Contact</span>
                )}
              </button>
            )}
          </div>
        </div>
`;

code = code.replace(footerRegex, wizardFooter);

fs.writeFileSync('src/components/AddEditPersonModal.tsx', code);
console.log('AddEditPersonModal updated');
