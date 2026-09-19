const fs = require('fs');
let content = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

// Import HealthTab
if (!content.includes('import { HealthTab }')) {
  content = content.replace("import { Heart, Building2, MapPin, Briefcase, Mail, Phone, Globe, Calendar, User, Clock, Trash2, Edit2, History, MessageSquare, StickyNote, Activity, Target, Network, Share2 } from 'lucide-react';", 
    "import { Heart, Building2, MapPin, Briefcase, Mail, Phone, Globe, Calendar, User, Clock, Trash2, Edit2, History, MessageSquare, StickyNote, Activity, Target, Network, Share2, HeartPulse } from 'lucide-react';\nimport { HealthTab } from './HealthTab';");
}

// Add state for 'health'
content = content.replace("useState<'overview' | 'notes' | 'interactions' | 'timeline'>('overview');", "useState<'overview' | 'notes' | 'interactions' | 'timeline' | 'health'>('overview');");

// Add Tab Button
const tabButtons = `
              <button
                id="tab-health-btn"
                onClick={() => setActiveTab('health')}
                className={\`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${
                  activeTab === 'health'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }\`}
              >
                <HeartPulse className="w-4 h-4" />
                Health & Emergency
              </button>
`;
content = content.replace('{/* Tab Body */}', tabButtons + '            {/* Tab Body */}');

// Add Tab Body
const healthBody = `
          ) : activeTab === 'health' ? (
            <HealthTab person={person} />
`;
content = content.replace(") : activeTab === 'notes' ? (", healthBody + ") : activeTab === 'notes' ? (");

fs.writeFileSync('src/components/PersonDetailModal.tsx', content);
console.log('modal patched');
