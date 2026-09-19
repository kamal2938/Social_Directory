with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

code = code.replace(
"""                </AccordionSection>
<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>
                  interactions.map((item) => {""",
"""                ) : (
                  interactions.map((item) => {"""
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
