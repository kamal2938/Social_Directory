import re

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

missing = ['ChevronUp', 'ChevronDown', 'UserCircle', 'Network', 'MessageSquarePlus', 'Activity']
for m in missing:
    if m not in code:
        code = code.replace("import {", f"import {{ {m}, ", 1)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)

with open('src/components/PeopleView.tsx', 'r') as f:
    code = f.read()

if 'useSwipeable' not in code:
    code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useSwipeable } from 'react-swipeable';\nimport { toast as hotToast } from 'react-hot-toast';")

swipeableComponent = """
const SwipeableCard = ({ person, children }: any) => {
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (person.phone) {
        hotToast.success('Calling ' + person.name + '...');
        window.location.href = 'tel:' + person.phone;
      } else {
        hotToast.error('No phone number saved for ' + person.name);
      }
    },
    onSwipedLeft: () => {
      if (person.phone) {
        hotToast.success('Opening WhatsApp for ' + person.name + '...');
        window.open('https://wa.me/' + person.phone.replace(/[^0-9]/g, ''), '_blank');
      } else {
        hotToast.error('No phone number saved for ' + person.name);
      }
    },
    trackMouse: false
  });

  return (
    <div {...handlers} className="relative group">
      {children}
    </div>
  );
};
"""

if 'SwipeableCard' not in code:
    code = code.replace('export const PeopleView: React.FC', swipeableComponent + '\nexport const PeopleView: React.FC')

    # Now wrap the card
    code = re.sub(
        r'<div\s+key=\{person\.id\}\s+id=\{`person-card-\$\{person\.id\}`\}',
        r'<SwipeableCard key={person.id} person={person}>\n              <div id={`person-card-${person.id}`}',
        code
    )

    code = re.sub(
        r'(<\/div>\s*)\);\s*\}\)',
        r'\1  </SwipeableCard>\n            );\n          })',
        code
    )

with open('src/components/PeopleView.tsx', 'w') as f:
    f.write(code)

