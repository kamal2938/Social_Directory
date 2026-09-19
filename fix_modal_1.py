with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    '               </AccordionSection>\n<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>\n                  <span',
    '                ) : (\n                  <span'
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
