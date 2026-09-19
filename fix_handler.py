with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

cover_handler = """
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Cover photo file size must be less than 3MB.');
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
  };
"""

# Find the end of handlePhotoUpload block to inject after it.
# We can search for `reader.readAsDataURL(file);\n  };`

target = "    reader.readAsDataURL(file);\n  };"
if target in content:
    content = content.replace(target, target + "\n" + cover_handler, 1)
    with open('src/components/AddEditPersonModal.tsx', 'w') as f:
        f.write(content)
    print("Added handleCoverPhotoUpload")
else:
    print("Target not found")

