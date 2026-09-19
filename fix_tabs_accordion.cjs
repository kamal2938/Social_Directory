const fs = require('fs');

let code = fs.readFileSync('src/components/PersonDetailModal.tsx', 'utf8');

// Remove the old Quick action bar
code = code.replace(
  /{[\s\S]*?\/\* Quick Action Bar \(Dashboard, Edit, Call etc\) \*\/\n[\s\S]*?<\/div>\n/m,
  ''
);

// We need an Accordion component. I'll add a simple state for accordion and replace the tab-based content.
// Since it's a huge component, I should probably use standard string replacements.

// The tab rendering logic starts after `{/* Tab Navigation */}` and ends with `<div className="flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2">`

// Let's first make sure lucide-react has `ChevronDown`, `ChevronUp`.
if (!code.includes('ChevronDown')) {
    code = code.replace('import {', 'import { ChevronDown, ChevronUp, ');
}

// Write the script to replace the tab logic
// Because it's too complex to regex replace the entire tab logic, I'll rewrite PersonDetailModal.tsx using the API tools, or just a small python script that strips lines 365 to 1030 and replaces it.

