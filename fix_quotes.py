import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("className=\\\"flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2\\\"", "className=\"flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2\"")
content = content.replace("className=\\\"space-y-2\\\"", "className=\"space-y-2\"")

content = content.replace("        <div className=\"flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2\">\n          <div className=\"space-y-2\">\n          <div className=\"px-0 sm:px-4 space-y-3\">", "        <div className=\"flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2\">\n          <div className=\"px-0 sm:px-4 space-y-3\">")


with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
