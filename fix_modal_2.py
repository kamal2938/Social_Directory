with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

code = code.replace(
"""          ) : !person ? (
            <div className="py-12 text-center text-red-500 text-xs">
              Contact not found.
            </div>
          </AccordionSection>
<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>
<>""",
"""          ) : !person ? (
            <div className="py-12 text-center text-red-500 text-xs">
              Contact not found.
            </div>
          ) : (
<>"""
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
