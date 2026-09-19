const fs = require('fs');

let code = fs.readFileSync('src/components/PeopleView.tsx', 'utf8');

if (!code.includes('useSwipeable')) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useSwipeable } from 'react-swipeable';\nimport { toast as hotToast } from 'react-hot-toast';");
}

const swipeableCardComponent = `
const SwipeableCard = ({ person, children, onToggleFavorite, onOpenQRCode }: any) => {
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
    <div {...handlers} className="relative overflow-hidden group">
      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 sm:hidden">
         <div className="bg-emerald-500 text-white p-2 rounded-full"><Phone className="w-4 h-4"/></div>
         <div className="bg-emerald-500 text-white p-2 rounded-full"><MessageCircle className="w-4 h-4"/></div>
      </div>
      {children}
    </div>
  );
};
`;

if (!code.includes('SwipeableCard')) {
  code = code.replace("export const PeopleView: React.FC", swipeableCardComponent + "\nexport const PeopleView: React.FC");
}

// Then wrap the grid card with <SwipeableCard person={person}>
const cardStartRegex = /<div\s+key=\{person\.id\}\s+id=\{`person-card-\$\{person\.id\}`\}/g;
// Replace <div key={person.id} ...> with <SwipeableCard key={person.id} person={person}><div ...>
code = code.replace(
  cardStartRegex, 
  '<SwipeableCard key={person.id} person={person}>\n              <div id={`person-card-${person.id}`}'
);

// We need to close it. The card ends with:
//               </div>
//             );
//           })}
const cardEndRegex = /<\/div>\s*\);\s*\}\)/g;
code = code.replace(
  cardEndRegex,
  '</div>\n              </SwipeableCard>\n            );\n          })'
);

// We need to add sticky search bar: "স্টিকি সার্চ বার (Sticky Search)"
// The header contains the search/filter area.
// Current: <div className="space-y-6 pb-12">
// We can make the Header sticky.
// Wait, the header is at the top of PeopleView, but the search bar is below the title.
// Actually, `DashboardView` or `HomeView` handles the main app layout. `PeopleView` just renders the list.
// The search bar in `PeopleView`? Let's check where `Filters` are rendered.

fs.writeFileSync('src/components/PeopleView.tsx', code);
console.log("Swipe implemented!");
