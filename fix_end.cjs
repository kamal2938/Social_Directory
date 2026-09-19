const fs = require('fs');
const path = 'src/components/SettingsView.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  /                      <\/>\n                    \)\n                \)}\n              <\/div>/,
  "                      </>\n                )}\n              </div>"
);

fs.writeFileSync(path, code);
console.log('Fixed end');
