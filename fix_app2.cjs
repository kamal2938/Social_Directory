const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Revert the messed up return
code = code.replace(
    'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />localStorage.getItem(\'social_dir_lang\') as Language) || \'bn\';',
    'return (localStorage.getItem(\'social_dir_lang\') as Language) || \'bn\';'
);

// Actually, find the main return block.
// It is around line 405. Let's find `return (` which is followed by `<div className="min-h-screen` or something similar.
code = code.replace(
    'return (\n    <div className={`min-h-screen',
    'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />\n    <div className={`min-h-screen'
);
code = code.replace(
    'return (\n    <div className="min-h-screen',
    'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />\n    <div className="min-h-screen'
);
code = code.replace(
    'return (\n    <div className={',
    'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />\n    <div className={'
);

// If the last </>\n  ); is already there, we don't need to add it, but if we just added <> we need to make sure.
// Wait, I already added </>\n  ); at the end in the previous script. Let's check the end of the file.
