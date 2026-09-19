with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

target = """        {/* Cover Photo Area */}
        <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 relative">"""

replacement = """        {/* Cover Photo Area */}
        <div 
          className="h-32 sm:h-40 w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 relative bg-cover bg-center"
          style={person?.coverPhoto ? { backgroundImage: `url(${person.coverPhoto})` } : {}}
        >"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/PersonDetailModal.tsx', 'w') as f:
        f.write(content)
    print("Patched PersonDetailModal.tsx")
else:
    print("Target not found in PersonDetailModal.tsx")
