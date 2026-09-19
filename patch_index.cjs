const fs = require('fs');

const path = 'index.html';
let code = fs.readFileSync(path, 'utf-8');

const targetStr = `    <meta name="twitter:card" content="summary_large_image" />
  </head>`;

const replacement = `    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0f172a" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="apple-touch-icon" href="/icon.svg" />
  </head>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync(path, code);
    console.log("Success patching index.html");
} else {
    console.log("Failed to find target");
}
