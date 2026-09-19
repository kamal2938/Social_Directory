const fs = require('fs');

const path = 'server.ts';
let code = fs.readFileSync(path, 'utf-8');

const targetStr = `  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================`;

const replacement = `  // ==========================================
  // PWA MANIFEST
  // ==========================================
  app.get('/manifest.json', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const appName = settings?.appName || 'Social Directory';
      const logoUrl = settings?.logoUrl || '/icon.svg';

      res.json({
        name: appName,
        short_name: appName,
        description: "A private, secure personal CRM and social directory.",
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          {
            src: logoUrl,
            sizes: '192x192 512x512',
            type: logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
            purpose: 'any maskable'
          }
        ]
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to generate manifest' });
    }
  });

  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync(path, code);
    console.log("Success patching server");
} else {
    console.log("Failed to find target");
}
