import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

# We need to find the start of the body.
start_marker = '<div className="flex-1 min-h-0 overflow-y-auto'
start_idx = code.find(start_marker)

# Let's find the closing of this div.
# We know from previous analysis that the final closing divs are around line 1034-1040.
