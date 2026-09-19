import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

# Fix exposed JSX comments
code = code.replace('            /* OVERVIEW TAB */', '            {/* OVERVIEW TAB */}')
code = code.replace('            /* INTERACTIONS TAB */', '            {/* INTERACTIONS TAB */}')
code = code.replace('            /* TIMELINE TAB */', '            {/* TIMELINE TAB */}')
code = code.replace('            /* NOTES TAB */', '            {/* NOTES TAB */}')

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
