with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

# Only keep the first occurrence of the cover photo block!
# We can find them all and remove the 2nd and 3rd ones.
target_block = """              <div>
                <label htmlFor="person-cover-photo-url" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" />
                  Cover Photo URL
                </label>
                <input
                  id="person-cover-photo-url"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverPhoto}
                  onChange={(e) => setCoverPhoto(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                />
              </div>"""

# Replace all with empty, then add it back to only the correct spot.
# Actually, the string also has `              </div>\n              \n              <div>`
# Let's just do a clean regex or split.

parts = content.split(target_block)
if len(parts) > 1:
    # re-join keeping only the first one
    new_content = parts[0] + target_block + parts[1] + "".join(parts[2:])
    with open('src/components/AddEditPersonModal.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed extra cover photo fields")
