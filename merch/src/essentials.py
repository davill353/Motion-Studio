"""Tonal 'core set' (hoodie + joggers) print files in 5 colourways. Run: python3 essentials.py && node render.js essentials.json"""
import json
COLOURWAYS = {  # fabric colour, tonal ink colour
  "oat":   ("#d9ccb4", "#b9a989"),
  "stone": ("#a3a29b", "#86857e"),
  "sage":  ("#9fb6a3", "#839c88"),
  "navy":  ("#16233b", "#2a3d5f"),
  "jet":   ("#1c1c1e", "#34343a"),
}
def mark(size, col, stroke=22):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 400 400"><rect x="20" y="20" width="360" height="360" rx="80" fill="none" stroke="{col}" stroke-width="{stroke}"/>'
            f'<text x="200" y="292" text-anchor="middle" font-family="Inter" font-weight="900" font-size="250" fill="{col}">£</text></svg>')
def page(w, h, body):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;background:transparent}}.c{{width:{w}px;height:{h}px;display:flex;'
            f'flex-direction:column;align-items:center;justify-content:center;font-family:Inter;text-align:center}}</style></head><body><div class="c">{body}</div></body></html>')
out = {}
for cw, (_, ink) in COLOURWAYS.items():
    # Hoodie front: centre-chest tonal wordmark (puff/rubber print look), ~10 x 2 in
    out[f"core-{cw}-hoodie-chest"] = (3000, 700, f'<div style="font-weight:800;font-size:250px;letter-spacing:46px;white-space:nowrap;color:{ink};line-height:1;margin-right:-46px">THE AI POUND</div>'
        f'<div style="margin-top:70px;font-weight:600;font-size:92px;letter-spacing:40px;white-space:nowrap;color:{ink};margin-right:-40px">PRACTICAL AI · EST. 2026</div>')
    # Hoodie back: small mark under the collar, ~3 x 3 in
    out[f"core-{cw}-hoodie-back-mark"] = (900, 900, mark(860, ink, 26))
    # Hood / sleeve: tiny vertical text, ~5 x 0.8 in
    out[f"core-{cw}-sleeve"] = (1500, 240, f'<div style="font-weight:700;font-size:150px;letter-spacing:30px;color:{ink};margin-right:-30px">SANDY · UK</div>')
    # Joggers: left thigh wordmark, ~4.5 x 1 in
    out[f"core-{cw}-joggers-thigh"] = (1350, 360, f'<div style="font-weight:800;font-size:118px;letter-spacing:22px;white-space:nowrap;color:{ink};margin-right:-22px">THE AI POUND</div>')
json.dump({k: [w, h, page(w, h, b)] for k, (w, h, b) in out.items()}, open("essentials.json", "w"))
json.dump(COLOURWAYS, open("colourways.json", "w"))
print(len(out), "files")
