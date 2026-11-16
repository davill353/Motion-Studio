const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const PF = path.resolve('../print-files'); const img = n => 'data:image/png;base64,' + fs.readFileSync(`${PF}/${n}.png`).toString('base64');
const TEE = c => `<svg viewBox="0 0 600 640" width="600" height="640" style="position:absolute;inset:0"><path d="M150 40 L230 10 Q300 60 370 10 L450 40 L590 160 L520 250 L470 210 L470 630 L130 630 L130 210 L80 250 L10 160 Z" fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width="3"/><path d="M230 10 Q300 70 370 10" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="6"/></svg>`;
const tee = (c, art, box, label) => `<div class="m"><div class="t">${TEE(c)}${art.map(([n,b]) => `<img src="${img(n)}" style="position:absolute;left:${b[0]}px;top:${b[1]}px;width:${b[2]}px">`).join('')}</div><div class="l">${label}</div></div>`;
const cap = (c, label) => `<div class="m"><div class="t"><svg viewBox="0 0 600 640" width="600" height="640" style="position:absolute;inset:0"><path d="M120 400 Q120 170 300 160 Q480 170 480 400 Z" fill="${c}"/><path d="M90 400 Q300 360 510 400 Q540 470 300 470 Q60 470 90 400 Z" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width="3"/></svg><img src="${img('06-cap-embroidery')}" style="position:absolute;left:190px;top:270px;width:220px"></div><div class="l">${label}</div></div>`;
const html = `<!doctype html><html><head><style>body{margin:0;background:#eef1f5;font-family:Inter;display:flex;flex-wrap:wrap;gap:24px;padding:24px;width:1900px;justify-content:center;box-sizing:border-box}
.m{background:#fff;border-radius:18px;padding:16px;width:600px}.t{position:relative;width:600px;height:640px}.l{font-weight:800;font-size:22px;color:#16233b;margin-top:8px;text-align:center}</style></head><body>
${tee('#16233b', [['01-left-chest-mark',[355,120,80]]], 0, '1 · Navy tee: left-chest logo (front)')}
${tee('#16233b', [['02-back-large',[185,110,230]]], 0, '2 · Navy tee / hoodie: big back print')}
${tee('#16233b', [['03-front-ai-writes-it-dark',[175,100,250]]], 0, '3 · Navy tee: "AI writes it. You approve it."')}
${tee('#f4f4f2', [['04-front-ai-writes-it-light',[175,100,250]]], 0, '4 · White tee: same slogan, navy ink')}
${tee('#1b2a46', [['05-front-made-in-sandy',[175,100,250]]], 0, '5 · Navy tee: "Practical AI · Made in Sandy"')}
${cap('#16233b', '6 · Navy cap: embroidered logo')}
</body></html>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1948, height: 1400 } });
await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: '../mockups/ai-pound-merch-mockups.png', fullPage: true }); await b.close(); })();
