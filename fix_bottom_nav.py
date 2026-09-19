with open('src/components/BottomNav.tsx', 'r') as f:
    code = f.read()

# Replace:
# <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
#   {tab.label}
# </span>
# With nothing. (Actually, just delete that span).

import re
code = re.sub(r'<span className=\{cn\("text-\[10px\]", isActive \? "font-bold" : "font-medium"\)\}>\s*\{tab\.label\}\s*</span>', '', code)

# Let's adjust the icon's container padding to make it centered.
# `<div className={cn("p-1 rounded-full transition-all", isActive ? "bg-primary-100 dark:bg-primary-900/30" : "bg-transparent")}>`
# We could make it larger since the text is gone, e.g., p-2
code = code.replace('"p-1 rounded-full transition-all"', '"p-2.5 rounded-full transition-all"')

# Also, the flex container has space-y-1, remove it or just leave it.
code = code.replace('"flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"', '"flex flex-col items-center justify-center w-full h-full transition-colors"')

with open('src/components/BottomNav.tsx', 'w') as f:
    f.write(code)

