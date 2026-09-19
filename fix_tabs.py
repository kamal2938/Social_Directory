import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("          ) : activeTab === 'overview' ? (\n            /* OVERVIEW TAB */\n            ", "          ) : activeTab === 'overview' ? (\n            /* OVERVIEW TAB */\n            <div className=\"space-y-3\">\n            ")

# And we need to close this div where the Overview tab ends.
# I will find where the notes tab starts:
# `) : activeTab === 'notes' ? (`
content = content.replace("              </ProfileSectionCard>\n          ) : activeTab === 'notes' ? (", "              </ProfileSectionCard>\n            </div>\n          ) : activeTab === 'notes' ? (")


with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
