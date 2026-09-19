const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { Toaster, toast as hotToast }')) {
    code = code.replace(
        "import React, { useState, useEffect, useCallback, useMemo } from 'react';",
        "import React, { useState, useEffect, useCallback, useMemo } from 'react';\nimport { Toaster, toast as hotToast } from 'react-hot-toast';"
    );
}

// replace showToast
code = code.replace(
    /const showToast = \(msg: string\) => {[\s\S]*?};/,
    "const showToast = (msg: string) => {\n    hotToast.success(msg);\n  };"
);

// add Toaster to the top of the return
code = code.replace(
    'return (',
    'return (\n    <>\n      <Toaster position="bottom-center" toastOptions={{ className: "text-sm", duration: 3000 }} />'
);
// replace last `);` with `</>\n  );`
const lastParen = code.lastIndexOf(');');
code = code.substring(0, lastParen) + '</>\n  );' + code.substring(lastParen + 2);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
