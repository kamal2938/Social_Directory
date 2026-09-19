import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# Let's fix the tab body opening div
tab_body_regex = re.compile(r"\{\/\* Tab Body \*\/\}\n\s*<div className=\"flex-1 min-h-0 overflow-y-auto.*?>")

content = tab_body_regex.sub(r"{/* Tab Body */}\n        <div className=\"flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2\">\n          <div className=\"space-y-2\">", content)

# I need to find where the Tab Body ends. The Tab Body is just a long div.
# Instead of managing a new div wrapper, let's just make the tab body have the right classes:
content = content.replace("          <div className=\"space-y-2\">", "")
content = tab_body_regex.sub(r"{/* Tab Body */}\n        <div className=\"flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-3 space-y-3\">\n", content)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
