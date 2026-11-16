"""Builds print-ready PNGs (transparent) for The AI Pound merch. Run: python3 designs.py && node render.js"""
import json
MINT, WHITE, NAVY = "#6ee7a8", "#ffffff", "#16233b"
def mark(size, colour=MINT, stroke=None):
    s = stroke or max(6, size * 0.055)
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 400 400"><rect x="20" y="20" width="360" height="360" rx="80" fill="none" '
            f'stroke="{colour}" stroke-width="{22 if stroke is None else stroke}"/><text x="200" y="292" text-anchor="middle" font-family="Inter" '
            f'font-weight="900" font-size="250" fill="{colour}">£</text></svg>')
def page(w, h, body):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;background:transparent}}'
            f'.c{{width:{w}px;height:{h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter;text-align:center}}</style>'
            f'</head><body><div class="c">{body}</div></body></html>')
D = {}
# 1. Left chest (approx 4in at 300dpi)
D["01-left-chest-mark"] = (1200, 1200, mark(820) + f'<div style="margin-top:50px;font-weight:900;font-size:118px;color:{WHITE};letter-spacing:6px">THE AI POUND</div>')
# 2. Big back print
D["02-back-large"] = (4500, 5400, mark(2600) + f'<div style="margin-top:220px;font-weight:900;font-size:520px;color:{WHITE};letter-spacing:10px;line-height:1">THE AI POUND</div>'
     f'<div style="margin-top:140px;font-weight:600;font-size:200px;color:{MINT};letter-spacing:4px">Practical AI for UK business</div>')
# 3. Brand-line front (dark garments)
D["03-front-ai-writes-it-dark"] = (4500, 5400, mark(900) + f'<div style="margin-top:260px;font-weight:900;font-size:520px;line-height:1.02;color:{WHITE};letter-spacing:-8px">AI WRITES IT.</div>'
     f'<div style="margin-top:60px;font-weight:900;font-size:520px;line-height:1.02;color:{MINT};letter-spacing:-8px">YOU APPROVE IT.</div>'
     f'<div style="margin-top:220px;font-weight:700;font-size:170px;color:{WHITE};letter-spacing:12px;opacity:.9">THE AI POUND</div>')
# 4. Same for light garments
D["04-front-ai-writes-it-light"] = (4500, 5400, mark(900, NAVY) + f'<div style="margin-top:260px;font-weight:900;font-size:520px;line-height:1.02;color:{NAVY};letter-spacing:-8px">AI WRITES IT.</div>'
     f'<div style="margin-top:60px;font-weight:900;font-size:520px;line-height:1.02;color:#1d9a62;letter-spacing:-8px">YOU APPROVE IT.</div>'
     f'<div style="margin-top:220px;font-weight:700;font-size:170px;color:{NAVY};letter-spacing:12px">THE AI POUND</div>')
# 5. Local pride
D["05-front-made-in-sandy"] = (4500, 5400, f'<div style="font-weight:700;font-size:240px;color:{MINT};letter-spacing:30px">PRACTICAL AI</div>' + '<div style="height:200px"></div>' + mark(1700) +
     f'<div style="margin-top:220px;font-weight:900;font-size:470px;color:{WHITE};letter-spacing:6px;line-height:1">MADE IN SANDY</div>'
     f'<div style="margin-top:120px;font-weight:600;font-size:190px;color:{WHITE};opacity:.85;letter-spacing:8px">BEDS · HERTS · BUCKS</div>')
# 6. Cap / beanie embroidery (flat, 2 colours, thick strokes for thread)
D["06-cap-embroidery"] = (1800, 700, f'<div style="display:flex;align-items:center;gap:70px">{mark(520, MINT, 32)}<div style="font-weight:900;font-size:190px;color:{WHITE};letter-spacing:4px;line-height:.95;text-align:left">THE AI<br>POUND</div></div>')
json.dump({k: [w, h, page(w, h, b)] for k, (w, h, b) in D.items()}, open("designs.json", "w"))
print(len(D), "designs")
