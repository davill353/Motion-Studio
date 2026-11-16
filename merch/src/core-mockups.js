const { chromium } = require('playwright'); const fs = require('fs');
const CW = JSON.parse(fs.readFileSync('colourways.json')); const PF = '../print-files/core-set';
const img = n => 'data:image/png;base64,' + fs.readFileSync(`${PF}/${n}.png`).toString('base64');
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f)))); return `rgb(${c})`; };
const hoodie = (fab, back = false) => `<svg viewBox="0 0 340 380" width="340" height="380">
 <path d="M120 40 Q170 0 220 40 L235 70 L300 95 L332 250 L300 258 L285 150 L280 340 L60 340 L55 150 L40 258 L8 250 L40 95 L105 70 Z" fill="${fab}"/>
 <path d="M120 40 Q170 0 220 40 L232 72 Q170 105 108 72 Z" fill="${shade(fab,0.88)}"/>
 <path d="M135 68 Q170 92 205 68" fill="none" stroke="${shade(fab,0.75)}" stroke-width="3"/>
${back ? "" : `<path d="M112 230 L228 230 L240 300 L100 300 Z" fill="none" stroke="${shade(fab,0.82)}" stroke-width="3"/>`}
 <rect x="60" y="322" width="220" height="18" fill="${shade(fab,0.9)}"/><rect x="8" y="240" width="32" height="12" fill="${shade(fab,0.9)}" transform="rotate(2 24 246)"/><rect x="300" y="240" width="32" height="12" fill="${shade(fab,0.9)}"/>
${back ? "" : `<line x1="160" y1="85" x2="157" y2="135" stroke="${shade(fab,0.7)}" stroke-width="2"/><line x1="180" y1="85" x2="183" y2="135" stroke="${shade(fab,0.7)}" stroke-width="2"/>`}</svg>`;
const joggers = (fab) => `<svg viewBox="0 0 240 380" width="240" height="380">
 <path d="M40 10 L200 10 L210 120 L198 350 L135 350 L122 150 L118 150 L105 350 L42 350 L30 120 Z" fill="${fab}"/>
 <rect x="40" y="10" width="160" height="22" fill="${shade(fab,0.9)}"/><rect x="42" y="336" width="63" height="16" fill="${shade(fab,0.88)}"/><rect x="135" y="336" width="63" height="16" fill="${shade(fab,0.88)}"/>
 <line x1="112" y1="32" x2="112" y2="70" stroke="${shade(fab,0.75)}" stroke-width="2"/></svg>`;
const cards = Object.entries(CW).map(([k, [fab]]) => `<div class="card"><div class="set">
 <div style="position:relative">${hoodie(fab)}<img src="${img(`core-${k}-hoodie-chest`)}" style="position:absolute;left:120px;top:140px;width:100px"></div>
 <div style="position:relative">${joggers(fab)}<img src="${img(`core-${k}-joggers-thigh`)}" style="position:absolute;left:150px;top:80px;width:48px"></div></div>
 <div class="name">${k[0].toUpperCase() + k.slice(1)}</div></div>`).join('');
const back = (k) => { const fab = CW[k][0]; return `<div class="card small"><div style="position:relative">${hoodie(fab, true)}<img src="${img(`core-${k}-hoodie-back-mark`)}" style="position:absolute;left:158px;top:82px;width:24px"></div><div class="name">Back: small mark under the hood</div></div>`; };
const html = `<!doctype html><html><head><style>body{margin:0;background:#f3f1ec;font-family:Inter;padding:30px;width:1900px}
h1{font-size:40px;margin:0 0 6px;color:#1c1c1e;letter-spacing:6px}.sub{color:#6b6860;margin-bottom:24px;font-size:18px;letter-spacing:2px}
.grid{display:flex;flex-wrap:wrap;gap:20px}.card{background:#fff;border-radius:16px;padding:20px 14px;width:600px;box-sizing:border-box}.set{display:flex;gap:6px;justify-content:center;align-items:flex-end}
.name{text-align:center;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:#1c1c1e;margin-top:12px}.small{width:600px;display:flex;flex-direction:column;align-items:center}</style></head><body>
<h1>THE AI POUND · CORE SET</h1><div class="sub">OVERSIZED HOODIE + JOGGERS · TONAL PRINT · 5 COLOURWAYS</div><div class="grid">${cards}${back('oat')}</div></body></html>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1960, height: 1300 } });
await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: '../mockups/ai-pound-core-set.png', fullPage: true }); await b.close(); })();
