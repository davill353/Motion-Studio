const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const D = JSON.parse(fs.readFileSync(process.argv[2] || 'designs.json')); const b = await chromium.launch();
for (const [name, [w, h, html]] of Object.entries(D)) { const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: (process.argv[3] || '../print-files') + `/${name}.png`, omitBackground: true }); await p.close(); console.log(name, w, h); }
await b.close(); })();
