with open('src/components/PeopleView.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"',
    'className="sticky top-16 sm:top-2 z-30 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"'
)

with open('src/components/PeopleView.tsx', 'w') as f:
    f.write(code)
