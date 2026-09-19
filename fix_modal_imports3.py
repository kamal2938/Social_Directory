with open('src/components/PersonDetailModal.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "import { UserCircle, ChevronUp, Network, MessageSquarePlus } from 'lucide-react';" in line:
        continue # remove line 1
    if "Network as NetworkIcon , UserCircle, ChevronUp, Network, MessageSquarePlus" in line:
        line = line.replace("Network as NetworkIcon , UserCircle, ChevronUp, Network, MessageSquarePlus", "Network as NetworkIcon , UserCircle, ChevronUp, MessageSquarePlus")
    new_lines.append(line)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.writelines(new_lines)
