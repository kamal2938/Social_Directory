import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# I want to replace
#           ) : activeTab === 'overview' ? (
#             /* OVERVIEW TAB */
#                               <ProfileSectionCard title="Relationship & CRM"
# with
#           ) : activeTab === 'overview' ? (
#             /* OVERVIEW TAB */
#             <div className="space-y-3">
#                               <ProfileSectionCard title="Relationship & CRM"

content = content.replace("          ) : activeTab === 'overview' ? (\n            /* OVERVIEW TAB */\n                              <ProfileSectionCard", "          ) : activeTab === 'overview' ? (\n            /* OVERVIEW TAB */\n            <div className=\"space-y-3\">\n                              <ProfileSectionCard")


# Also need to fix line 783 where the `</div>` was for this Overview tab. Wait, line 783 already has `</div>`.
# Let's verify line 783.
# Wait, I also had an error at 739 `error TS1005: ')' expected.`
# Let's check lines 739.

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
