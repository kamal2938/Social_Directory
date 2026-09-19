with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

# Add state for coverPhoto
content = content.replace("const [photo, setPhoto] = useState('');", "const [photo, setPhoto] = useState('');\n  const [coverPhoto, setCoverPhoto] = useState('');")

# Add initialData loading
content = content.replace("setPhoto(initialData.photo || '');", "setPhoto(initialData.photo || '');\n      setCoverPhoto(initialData.coverPhoto || '');")

# Add reset loading
content = content.replace("setPhoto('');", "setPhoto('');\n      setCoverPhoto('');", 1)

# Add to onSave
content = content.replace("photo: photo || undefined,", "photo: photo || undefined,\n        coverPhoto: coverPhoto || undefined,")

# Add input UI (below photo URL)
ui_target = """              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">"""

ui_replacement = """              </div>
              
              <div>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">"""

content = content.replace(ui_target, ui_replacement)

# ensure Image icon is imported
if "Image" not in content[:500]:
    content = content.replace("import { User,", "import { User, Image,")

with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)
print("Patched AddEditPersonModal.tsx")
