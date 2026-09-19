const fs = require('fs');
let content = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

const imports = `import { FinanceTab } from './FinanceTab';\nimport { VaultTab } from './VaultTab';\nimport { EventsGiftsTab } from './EventsGiftsTab';\nimport { FamilyTreeTab } from './FamilyTreeTab';\nimport { DollarSign, Shield, Calendar as CalendarIcon, Network as NetworkIcon } from 'lucide-react';`;

content = content.replace("import { HealthTab } from './HealthTab';", "import { HealthTab } from './HealthTab';\n" + imports);
content = content.replace("useState<'overview' | 'notes' | 'interactions' | 'timeline' | 'health'>('overview');", "useState<'overview' | 'notes' | 'interactions' | 'timeline' | 'health' | 'finance' | 'vault' | 'events' | 'family'>('overview');");

const extraButtons = `
              <button onClick={() => setActiveTab('finance')} className={\`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'finance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}\`}><DollarSign className="w-4 h-4"/> Finance</button>
              <button onClick={() => setActiveTab('vault')} className={\`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'vault' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}\`}><Shield className="w-4 h-4"/> Vault</button>
              <button onClick={() => setActiveTab('events')} className={\`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'events' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}\`}><CalendarIcon className="w-4 h-4"/> Events & Gifts</button>
              <button onClick={() => setActiveTab('family')} className={\`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap \${activeTab === 'family' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}\`}><NetworkIcon className="w-4 h-4"/> Family Tree</button>
`;
content = content.replace('{/* Tab Body */}', extraButtons + '            {/* Tab Body */}');

const extraBodies = `
          ) : activeTab === 'finance' ? ( <FinanceTab person={person} />
          ) : activeTab === 'vault' ? ( <VaultTab person={person} />
          ) : activeTab === 'events' ? ( <EventsGiftsTab person={person} />
          ) : activeTab === 'family' ? ( <FamilyTreeTab person={person} />
`;
content = content.replace(") : activeTab === 'notes' ? (", extraBodies + ") : activeTab === 'notes' ? (");

fs.writeFileSync('src/components/PersonDetailModal.tsx', content);
console.log('Modal tabs patched.');
