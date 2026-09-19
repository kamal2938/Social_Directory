const fs = require('fs');
const path = 'server.ts';
let code = fs.readFileSync(path, 'utf-8');

const targetStr = `  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }`;

const replacement = `  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // Prevent static serving of index.html so we can intercept it
    app.get('*', async (req, res) => {
      try {
        const settings = await storage.getSettings();
        const logoUrl = settings?.logoUrl || '/icon.svg';
        const appName = settings?.appName || 'Social Directory';
        
        let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        html = html.replace('<link rel="apple-touch-icon" href="/icon.svg" />', \`<link rel="apple-touch-icon" href="\${logoUrl}" />\`);
        html = html.replace(/<title>.*?<\\/title>/, \`<title>\${appName}</title>\`);
        res.send(html);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync(path, code);
    console.log("Success patching server to inject HTML");
} else {
    console.log("Failed to find target block in server.ts");
}
