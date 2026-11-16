#!/usr/bin/env python3
"""Printable walk-in route sheet for the PECR-held businesses (sole traders)."""
import pathlib, html, subprocess

TSV = pathlib.Path("walkin-addresses.tsv")
rows = []
for line in TSV.read_text().splitlines():
    if not line.strip() or line.lower().startswith("name\t"):
        continue
    p = line.split("\t") + [""] * 8
    rows.append(dict(zip(["name","town","address","postcode","phone","rating","reviews","note"], p)))

CLINICS = {"Sculpt & Cherish","Clarity Clinic","Gabriella Ratiu - Permanent Makeup and Skin",
           "Lucia Biermanski Micropigmentation & Aesthetics","The Light Sanctum"}
by_town = {}
for r in rows:
    by_town.setdefault(r["town"].strip(), []).append(r)

DAYS = [
    ("Tuesday 17 November", "Hitchin", "10:30-12:00, then 14:00-15:30. Weekday lunch service starts at 12, so clear out before then."),
    ("Wednesday 18 November", "Bedford", "Restaurants only, 10:30-12:00 and 14:00-15:30. Ten of them, all central, so park once."),
    ("Thursday 19 November", "Bedford", "The four clinics. Mid-morning is best; avoid treatment hours after 16:00."),
    ("Friday 20 November", "Biggleswade", "One stop. Do it on the way to or from Bedford."),
]

def nice(r):
    addr = ", ".join(x for x in [r["address"], r["postcode"]] if x and x != "NOT FOUND").rstrip(", ")
    return addr or "address not confirmed"

def block(day, town, note):
    items = [r for r in by_town.get(town, []) if True]
    return items

# assign: Hitchin restaurants -> Tue, Bedford restaurants -> Wed, Bedford clinics -> Thu, rest -> Fri
plan = {"Tuesday 17 November": [], "Wednesday 18 November": [], "Thursday 19 November": [], "Friday 20 November": []}
for r in rows:
    t = r["town"].strip(); clinic = r["name"] in CLINICS
    if t == "Hitchin": plan["Tuesday 17 November"].append(r)
    elif t == "Bedford" and not clinic: plan["Wednesday 18 November"].append(r)
    elif t == "Bedford" and clinic: plan["Thursday 19 November"].append(r)
    elif t == "Biggleswade": plan["Friday 20 November"].append(r)
    else: plan["Friday 20 November"].append(r)

def row_html(r):
    addr = nice(r)
    phone = r["phone"] or ""
    social = ""
    if r["reviews"] and r["reviews"].isdigit():
        social = f'<span class="meta">{r["rating"]}★ x{r["reviews"]} reviews</span>'
    return f"""<tr>
      <td class="tick">☐</td>
      <td>
        <div class="biz">{html.escape(r["name"])}</div>
        <div class="addr">{html.escape(addr)}{(" · " + html.escape(phone)) if phone else ""}</div>
        {social}
      </td>
      <td class="log"><span class="line"></span><span class="lbl">name / role</span></td>
      <td class="log"><span class="line"></span><span class="lbl">outcome / follow-up</span></td>
    </tr>"""

sections = []
for day, town, note in DAYS:
    items = plan[day]
    if not items: continue
    n_clinic = sum(1 for r in items if r["name"] in CLINICS)
    kind = (f"{n_clinic} clinic" + ("s" if n_clinic!=1 else "") + f", {len(items)-n_clinic} restaurant" + ("s" if len(items)-n_clinic!=1 else "")) if n_clinic else f"{len(items)} restaurant" + ("s" if len(items)!=1 else "")
    sections.append(f"""
    <section>
      <div class="daybar"><span class="day">{day}</span><span class="town">{town}</span><span class="count">{kind}</span></div>
      <p class="note">{note}</p>
      <table>
        <thead><tr><th class="tick"></th><th>Business</th><th>Who you spoke to</th><th>Outcome</th></tr></thead>
        <tbody>{''.join(row_html(r) for r in items)}</tbody>
      </table>
    </section>""")

doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: A4; margin: 14mm 12mm 12mm 12mm; }}
body {{ font-family: "Liberation Sans", Arial, sans-serif; color:#16233B; font-size:10pt; }}
h1 {{ font-size:20pt; margin:0 0 2mm; }}
.sub {{ color:#4a5a72; font-size:9.5pt; margin:0 0 5mm; }}
.script {{ border:0.6pt solid #c9d3e0; border-left:3pt solid #6EE7A8; padding:3mm 4mm; margin:0 0 5mm; font-size:9pt; line-height:1.45; }}
.script b {{ color:#16233B; }}
.daybar {{ display:flex; justify-content:space-between; align-items:baseline; border-bottom:1.4pt solid #16233B; padding-bottom:1.2mm; margin:6mm 0 1mm; }}
.day {{ font-weight:bold; font-size:12pt; }}
.town {{ font-weight:bold; color:#16233B; font-size:12pt; }}
.count {{ color:#5b6b83; font-size:8.5pt; }}
.note {{ color:#5b6b83; font-size:8.5pt; margin:1mm 0 2mm; }}
table {{ width:100%; border-collapse:collapse; }}
th {{ text-align:left; font-size:8pt; text-transform:uppercase; letter-spacing:.04em; color:#6b7a90; border-bottom:0.5pt solid #d6dee8; padding:1mm 1mm; }}
td {{ vertical-align:top; padding:2mm 1mm; border-bottom:0.5pt solid #e6ebf2; }}
td.tick, th.tick {{ width:6mm; font-size:13pt; color:#16233B; }}
.biz {{ font-weight:bold; font-size:10pt; }}
.addr {{ color:#4a5a72; font-size:8.5pt; }}
.meta {{ color:#0f8a5f; font-size:8pt; }}
td.log {{ width:33mm; }}
.line {{ display:block; border-bottom:0.5pt dotted #b9c4d3; height:4.5mm; }}
.lbl {{ color:#93a1b5; font-size:7pt; }}
.foot {{ margin-top:6mm; font-size:8pt; color:#5b6b83; }}
</style></head><body>
<h1>Walk-in sheet</h1>
<p class="sub">21 businesses that cannot be cold emailed under PECR. Sole traders and partnerships need consent before email, so these are door-knocks with the flyer. Log each one in the Pipeline tab the same day.</p>
<div class="script">
<b>60-second opener.</b> "Hi, I'm David, I'm local, from Sandy. Quick one, I won't keep you. Do you get lots of the same questions on WhatsApp or Instagram: prices, aftercare, 'have you got anything Thursday'?<br>
I set up an assistant that answers those in your words, from your own price list, and sends anything clinical straight to you. You approve every reply to start with.<br>
I'm running free two-week pilots for a few places round here. No card, no contract. If it doesn't save you time I switch it off. Who's the best person to leave this with?"<br>
<b>Then:</b> flyer out, get the owner's name and best number or Instagram, book the 45-minute setup on the spot if they bite.
</div>
{''.join(sections)}
<p class="foot">Best walk-in times: Tuesday to Thursday, 10:30-12:00 or 14:00-15:30. Avoid Saturdays, lunch service and the first hour of the day. Nothing here is an email: no cold email to a sole trader, ever.</p>
</body></html>"""

pathlib.Path("walkin-sheet.html").write_text(doc)
subprocess.run(["weasyprint","walkin-sheet.html","walkin-sheet.pdf"],check=True)
print("built walkin-sheet.pdf")
