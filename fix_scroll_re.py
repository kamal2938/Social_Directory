import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# Make the outer container scrollable, remove scroll from inner
# The outer container `modalInner` has `overflow-hidden` which is fine for the modal boundary.
# We will insert `<div className="flex-1 overflow-y-auto min-h-0 w-full flex flex-col">` right before `{/* Header Area (FB Style) */}`
# And remove `flex-1 min-h-0 overflow-y-auto` from the later div.

content = re.sub(
    r'(\s*{\/\* Header Area \(FB Style\) \*\/})',
    r'\n      <div className="flex-1 overflow-y-auto min-h-0 w-full flex flex-col">\1',
    content
)

content = re.sub(
    r'<div className="flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2">',
    r'<div className="bg-slate-100 dark:bg-slate-950 sm:p-2 flex-1 pb-10">',
    content
)

# And add the closing div at the end of modalInner
end_target = r'(\s*)(</AccordionSection>\s*</>\s*)}\s*</div>\s*</div>\s*</div>\s*\);\s*if \(embedded\)'
content = re.sub(
    end_target,
    r'\1\2\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n\n  if (embedded)',
    content
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)

print("Applied Regex patch")

