import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace the custom toast UI with <Toaster />
toast_ui_regex = r'\{\/\* Toast Notification \*\/\}.*?</div>\n\s*\)\}'
code = re.sub(toast_ui_regex, '{/* Toaster */}\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />', code, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(code)
