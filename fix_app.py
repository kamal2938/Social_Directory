import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Fix the broken line 35-37
code = code.replace('return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />localStorage.getItem(\'social_dir_lang\') as Language) || \'bn\';', 
                    'return (localStorage.getItem(\'social_dir_lang\') as Language) || \'bn\';')

# Add toaster to main return
main_return = 'return (\n    <div className={cn(\n      "min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans overflow-x-hidden",'
new_main_return = 'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />\n    <div className={cn(\n      "min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans overflow-x-hidden",'

if '<Toaster position="bottom-center"' not in code:
    code = code.replace(main_return, new_main_return)
else:
    # try replacing a looser match
    code = re.sub(
        r'return \(\n\s*<div className=\{cn\(\n\s*"min-h-screen bg-slate-100 dark:bg-slate-950',
        'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />\n    <div className={cn(\n      "min-h-screen bg-slate-100 dark:bg-slate-950',
        code
    )

with open('src/App.tsx', 'w') as f:
    f.write(code)
