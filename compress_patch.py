import re

with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

compress_fn = """
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };
"""

# Replace the handlers to use this compression
photo_handler_replacement = """  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      setError('');
      const compressedBase64 = await compressImage(file, 400, 400, 0.7);
      setPhoto(compressedBase64);
    } catch (err) {
      setError('Failed to process photo.');
    }
  };"""

cover_handler_replacement = """  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\\/(jpeg|jpg|png|webp)$/)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      setError('');
      const compressedBase64 = await compressImage(file, 1200, 600, 0.6); // Compress more for cover
      
      // Check size (rough estimate of base64 size)
      if (compressedBase64.length > 700000) { // Keep under ~700KB to fit in Firestore 1MB doc limit
         setError('Image is still too large after compression. Please use a smaller image.');
         return;
      }
      
      setCoverPhoto(compressedBase64);
    } catch (err) {
      setError('Failed to process cover photo.');
    }
  };"""

# Find the old handlers and replace
# Replace handlePhotoUpload
photo_match = re.search(r'const handlePhotoUpload =.*?reader\.readAsDataURL\(file\);\n  };', content, re.DOTALL)
if photo_match:
    content = content.replace(photo_match.group(0), compress_fn + "\n" + photo_handler_replacement)

# Replace handleCoverPhotoUpload
cover_match = re.search(r'const handleCoverPhotoUpload =.*?reader\.readAsDataURL\(file\);\n  };', content, re.DOTALL)
if cover_match:
    content = content.replace(cover_match.group(0), cover_handler_replacement)

with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)

print("Applied compression logic.")
