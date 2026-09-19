const fs = require('fs');

let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

// Add props
code = code.replace(/interface SettingsViewProps \{/, "interface SettingsViewProps {\n  themeColor: string;\n  onChangeTheme: (color: string) => void;");
code = code.replace(/export const SettingsView: React.FC<SettingsViewProps> = \(\{\n?  onRefreshAll\,?\n?\}\) => \{/, "export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshAll, themeColor, onChangeTheme }) => {");

// We might need to add Palette icon import
if (!code.includes('Palette')) {
  code = code.replace(/import \{/, "import { Palette, Check, ");
}

// Create the theme block UI
const themeBlock = `
      {/* Theme Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Theme & Colors
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize your directory with your favorite accent color.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          {[
            { id: 'blue', color: 'bg-blue-600', name: 'Blue' },
            { id: 'emerald', color: 'bg-emerald-600', name: 'Emerald' },
            { id: 'violet', color: 'bg-violet-600', name: 'Violet' },
            { id: 'rose', color: 'bg-rose-600', name: 'Rose' },
            { id: 'amber', color: 'bg-amber-600', name: 'Amber' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChangeTheme(theme.id)}
              className={\`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all \${
                themeColor === theme.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }\`}
            >
              <div className={\`w-4 h-4 rounded-full shadow-inner \${theme.color}\`} />
              <span className="text-sm font-semibold">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
`;

// Insert it before the export section
code = code.replace(/\{\/\* Export Section \*\/\}/, themeBlock + '\n      {/* Export Section */}');

fs.writeFileSync('src/components/SettingsView.tsx', code);
