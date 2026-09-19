import re

with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

# First, remove everything from `            {/* Footer */}` to the end of the file.
bad_footer_start = content.find("            {/* Footer */}")
if bad_footer_start != -1:
    content = content[:bad_footer_start]

# Now, we need to correctly replace the old footer inside the component.
# The old footer is:
#               {activeTab !== 'crm' && (
#                 <button
#                   type="button"
#                   onClick={() => {
# ...
#               </button>
#             </div>
#           </div>

old_footer_start_regex = re.compile(r"              \{activeTab !== 'crm' && \(\n\s*<button\n\s*type=\"button\"\n\s*onClick=\{\(\) => \{")

match = old_footer_start_regex.search(content)

if match:
    old_footer_start = match.start()
    
    # find the end of this block
    old_footer_end_str = "              </button>\n            </div>\n          </div>"
    old_footer_end = content.find(old_footer_end_str, old_footer_start)
    if old_footer_end != -1:
        old_footer_end += len(old_footer_end_str)
        
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
                  className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold transition-colors"
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
          </div>
"""
        content = content[:old_footer_start] + new_footer + content[old_footer_end:]
    else:
        print("old_footer_end not found")
else:
    print("old_footer_start_regex not matched")

# Ensure the file ends with standard component closing
if not content.endswith("  );\n};\n"):
    if not content.endswith("};\n"):
        content += "  );\n};\n"
        
with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)
