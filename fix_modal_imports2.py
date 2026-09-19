import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

# Replace any occurrence of lucide-react imports to inject the missing ones
code = re.sub(
    r"import \{(.*?)\} from 'lucide-react';",
    r"import {\1, UserCircle, ChevronUp, Network, MessageSquarePlus } from 'lucide-react';",
    code,
    count=1
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
