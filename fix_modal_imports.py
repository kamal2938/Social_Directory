import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

# I will just replace `import {  MessageCircle, HeartPulse } from 'lucide-react';`
# with `import { MessageCircle, HeartPulse, UserCircle, ChevronUp, Network, MessageSquarePlus } from 'lucide-react';`

code = code.replace(
    "import {  MessageCircle, HeartPulse } from 'lucide-react';",
    "import { MessageCircle, HeartPulse, UserCircle, ChevronUp, Network, MessageSquarePlus } from 'lucide-react';"
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
