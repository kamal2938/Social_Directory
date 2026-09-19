import re

with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

# I want to replace everything from `          {/* Footer Actions */}` (if exists) up to the end of the file
# with the proper new footer.

footer_start = content.find("          {/* Footer Actions */}")
if footer_start != -1:
    content = content[:footer_start]
else:
    footer_start = content.find("            {/* Footer */}")
    if footer_start != -1:
        content = content[:footer_start]

new_footer = """
          {/* Footer */}
          <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {activeTab !== 'basic' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'professional') setActiveTab('basic');
                  else if (activeTab === 'contact') setActiveTab('professional');
                  else if (activeTab === 'crm') setActiveTab('contact');
                }}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
            )}
            
            <div className="flex items-center gap-2">
              {activeTab !== 'crm' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'basic') setActiveTab('professional');
                    else if (activeTab === 'professional') setActiveTab('contact');
                    else if (activeTab === 'contact') setActiveTab('crm');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white shadow-xs transition-colors"
                >
                  Next Step →
                </button>
              )}
              {activeTab === 'crm' && (
                <button
                  id="submit-person-btn"
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Contact'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
"""

content = content + new_footer

with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)
