const fs = require('fs');
let content = fs.readFileSync('src/components/AuthView.tsx', 'utf8');

// Add onCancel prop
content = content.replace(
  /interface AuthViewProps \{/,
  "interface AuthViewProps {\n  onCancel?: () => void;"
);
content = content.replace(
  /export const AuthView: React\.FC<AuthViewProps> = \(\{ onLogin \}\) => \{/,
  "export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onCancel }) => {"
);

// Add Close button
content = content.replace(
  /<div className="auth-page-wrapper[^>]*>/,
  `$&
  {onCancel && (
    <button onClick={onCancel} className="absolute top-6 right-6 p-2 bg-slate-800 text-white rounded-full z-50 hover:bg-slate-700">
      <X className="w-6 h-6" />
    </button>
  )}`
);
content = content.replace(/import \{.*?\} from 'lucide-react';/, "import { User as UserIcon, Lock, Mail, ArrowRight, ArrowLeft, LogIn, UserPlus, ShieldCheck, X } from 'lucide-react';");

// Remove demo/guest buttons
content = content.replace(/<div className="forgot-link[\s\S]*?<\/div>/, '');
content = content.replace(/<div className="mt-3 flex gap-2 justify-center">[\s\S]*?<\/div>\s*<\/form>/, '</form>');

fs.writeFileSync('src/components/AuthView.tsx', content);
console.log('AuthView patched');
