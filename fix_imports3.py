with open('src/App.tsx', 'r') as f:
    code = f.read()

if 'import { Toaster' not in code:
    code = "import { Toaster, toast as hotToast } from 'react-hot-toast';\n" + code

with open('src/App.tsx', 'w') as f:
    f.write(code)

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

missing_icons = ['ChevronUp', 'ChevronDown', 'UserCircle', 'Network', 'MessageSquarePlus']
for icon in missing_icons:
    if icon not in code:
        code = code.replace("import {", f"import {{ {icon}, ", 1)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)

