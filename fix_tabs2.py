import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# Fix the JSX elements must have one parent element error
content = re.sub(r"activeTab === 'overview' \? \(\n\s*/\* OVERVIEW TAB \*/\n\s*<ProfileSectionCard", 
                 r"activeTab === 'overview' ? (\n            /* OVERVIEW TAB */\n            <div className=\"space-y-4\">\n              <ProfileSectionCard", 
                 content)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
