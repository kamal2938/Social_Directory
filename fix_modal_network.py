with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

code = code.replace("icon={Network}", "icon={NetworkIcon}")

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
