with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

# I will revert all of them. The simplest way is to fetch the original code from git if we could, but we can't.
# I will just write a regex to find all instances of `</AccordionSection>\n<AccordionSection id="timeline"...`
# Wait, let's just do it step by step.

code = code.replace(
"""                </AccordionSection>
<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>
                  notes.map((note) => (""",
"""                ) : (
                  notes.map((note) => ("""
)

code = code.replace(
"""                </AccordionSection>
<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>
                  interactions.map((interaction) => (""",
"""                ) : (
                  interactions.map((interaction) => ("""
)

code = code.replace(
"""                </AccordionSection>
<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>
                  sortedTimeline.map((item) => (""",
"""                ) : (
                  sortedTimeline.map((item) => ("""
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
