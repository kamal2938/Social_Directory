with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

code = "import { UserCircle, ChevronUp, Network, MessageSquarePlus } from 'lucide-react';\n" + code

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
