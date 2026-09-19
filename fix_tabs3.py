with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("<div className=\\\"space-y-4\\\">", '<div className="space-y-4">')

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
