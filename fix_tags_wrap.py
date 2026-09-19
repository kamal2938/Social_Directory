with open('src/components/PeopleView.tsx', 'r') as f:
    code = f.read()

# Replace flex-wrap with something else
code = code.replace(
    '<div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin flex-wrap">',
    '<div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 hide-scrollbar">'
)

with open('src/components/PeopleView.tsx', 'w') as f:
    f.write(code)
