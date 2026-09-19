with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

# 1. Add handleCoverPhotoUpload
photo_handler_code = """  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (typeof loadEvent.target?.result === 'string') {
        setPhoto(loadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };"""

cover_handler_code = """  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (typeof loadEvent.target?.result === 'string') {
        setCoverPhoto(loadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };"""

if "handleCoverPhotoUpload" not in content:
    content = content.replace(photo_handler_code, photo_handler_code + "\n\n" + cover_handler_code)

# 2. Replace URL input with File Upload UI
ui_target = """              <div>
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

ui_replacement = """              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" />
                  Cover Photo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <Upload className="w-4 h-4" />
                    <span>{coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden"
                      onChange={handleCoverPhotoUpload}
                    />
                  </label>
                  {coverPhoto && (
                    <button
                      type="button"
                      onClick={() => setCoverPhoto('')}
                      className="text-xs text-red-500 hover:underline px-2 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {coverPhoto && (
                  <div className="mt-2 h-20 w-full rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url(${coverPhoto})` }} />
                )}
              </div>"""

content = content.replace(ui_target, ui_replacement)

with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)
print("Applied cover photo upload patch")
