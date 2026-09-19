const fs = require('fs');

let code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

// I will extract everything between `) : activeTab === 'overview' ? (` and the end of the chain.
// Wait, I can just use a regex with multiple replacements.

code = code.replace(
  /: activeTab === 'overview' \? \(/g,
  ': (\n<>\n<AccordionSection id="overview" title="Overview" icon={UserCircle} activeTab={activeTab} setActiveTab={setActiveTab}>'
);

code = code.replace(
  /\) : activeTab === 'health' \? \(/g,
  '</AccordionSection>\n<AccordionSection id="health" title="Health & Wellness" icon={Activity} activeTab={activeTab} setActiveTab={setActiveTab}>'
);

code = code.replace(
  /\) : activeTab === 'finance' \? \( (<FinanceTab person={person} \/>)/g,
  '</AccordionSection>\n<AccordionSection id="finance" title="Financial Profile" icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab}>\n$1\n</AccordionSection>'
);

code = code.replace(
  /\) : activeTab === 'vault' \? \( (<VaultTab person={person} \/>)/g,
  '\n<AccordionSection id="vault" title="Secure Vault" icon={Archive} activeTab={activeTab} setActiveTab={setActiveTab}>\n$1\n</AccordionSection>'
);

code = code.replace(
  /\) : activeTab === 'events' \? \( (<EventsGiftsTab person={person} \/>)/g,
  '\n<AccordionSection id="events" title="Events & Gifts" icon={Cake} activeTab={activeTab} setActiveTab={setActiveTab}>\n$1\n</AccordionSection>'
);

code = code.replace(
  /\) : activeTab === 'family' \? \( (<FamilyTreeTab person={person} \/>)/g,
  '\n<AccordionSection id="family" title="Family Tree" icon={Network} activeTab={activeTab} setActiveTab={setActiveTab}>\n$1\n</AccordionSection>'
);

code = code.replace(
  /\) : activeTab === 'notes' \? \(/g,
  '\n<AccordionSection id="notes" title="Notes" icon={FileText} badge={notes.length} activeTab={activeTab} setActiveTab={setActiveTab}>'
);

code = code.replace(
  /\) : activeTab === 'interactions' \? \(/g,
  '</AccordionSection>\n<AccordionSection id="interactions" title="Interactions" icon={MessageSquarePlus} badge={interactions.length} activeTab={activeTab} setActiveTab={setActiveTab}>'
);

code = code.replace(
  /\) : \(/g,
  '</AccordionSection>\n<AccordionSection id="timeline" title="Timeline" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab}>'
);

// The very last one ends with `)}` at the end of the condition block.
// I can just find the end of timeline and replace it manually.

fs.writeFileSync('src/components/PersonDetailModal.tsx', code);
console.log('Ternaries partially replaced');
