#!/usr/bin/env python3
"""Build The AI-Powered Content Planner — 18-tab xlsx, navy/mint styling."""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter

NAVY = "16233B"
MINT = "6EE7A8"
WHITE = "FFFFFF"
LIGHT = "F2F5F9"

wb = Workbook()

def style_header(ws, row, cols, height=22):
    for c in range(1, cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = Font(bold=True, color=WHITE, size=11)
        cell.fill = PatternFill("solid", fgColor=NAVY)
        cell.alignment = Alignment(vertical="center")
    ws.row_dimensions[row].height = height

def title_row(ws, text, cols, subtitle=None):
    ws.cell(row=1, column=1, value=text).font = Font(bold=True, size=16, color=NAVY)
    if subtitle:
        ws.cell(row=2, column=1, value=subtitle).font = Font(italic=True, size=10, color="6B7280")
    for c in range(1, cols + 1):
        ws.cell(row=1, column=c).fill = PatternFill("solid", fgColor=WHITE)
        ws.cell(row=2, column=c).fill = PatternFill("solid", fgColor=WHITE)

def mint_accent(cell):
    cell.fill = PatternFill("solid", fgColor=MINT)
    cell.font = Font(bold=True, color=NAVY)

STATUS_LIST = '"Idea,Scripted,Filmed,Scheduled,Posted"'
PLATFORM_LIST = '"TikTok,YouTube,Instagram,LinkedIn,Facebook,X"'
PILLAR_LIST = '"Pillar 1,Pillar 2,Pillar 3,Pillar 4,Pillar 5"'

MONTH_HEADERS = ["Date", "Platform", "Pillar", "Hook / Idea", "Status", "Link", "Notes"]
MONTH_WIDTHS = [12, 14, 14, 42, 14, 24, 30]

def add_validations(ws):
    dv_status = DataValidation(type="list", formula1=STATUS_LIST, allow_blank=True)
    dv_platform = DataValidation(type="list", formula1=PLATFORM_LIST, allow_blank=True)
    dv_pillar = DataValidation(type="list", formula1=PILLAR_LIST, allow_blank=True)
    for dv in (dv_status, dv_platform, dv_pillar):
        ws.add_data_validation(dv)
    dv_status.add(f"E5:E70")
    dv_platform.add(f"B5:B70")
    dv_pillar.add(f"C5:C70")
    # conditional formatting: mint fill when posted
    ws.conditional_formatting.add(
        "A5:G70",
        FormulaRule(formula=['$E5="Posted"'], fill=PatternFill("solid", fgColor="D9F9EA"), stopIfTrue=False),
    )

def build_month(ws, name):
    title_row(ws, name, 7, "Undated — reuse any year. Duplicate this tab for future years if you fill it up.")
    for i, w in enumerate(MONTH_WIDTHS, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for i, h in enumerate(MONTH_HEADERS, 1):
        ws.cell(row=4, column=i, value=h)
    style_header(ws, 4, 7)
    add_validations(ws)
    ws.freeze_panes = "A5"

# ---------- Tab 1: How to Use ----------
ws = wb.active
ws.title = "How to Use"
title_row(ws, "The AI-Powered Content Planner", 4)
rows = [
    ("", ""),
    ("Your 5-minute setup:", ""),
    ("1.", "Go to the 'Content Pillars & Idea Bank' tab and fill in your 3-5 pillars (your main topics)."),
    ("2.", "Glance at the 'Prompt Library' — 50 fill-in-the-blank AI prompts that generate ideas, hooks, captions and scripts."),
    ("3.", "Open the current month tab and add your first post idea: date, platform, pillar, hook. Status starts as 'Idea'."),
    ("4.", "As you work, change Status: Idea > Scripted > Filmed > Scheduled > Posted. Posted rows turn green automatically."),
    ("5.", "After posting, log numbers in 'Post Tracker' and check 'Dashboard' for what's working."),
    ("", ""),
    ("The golden rule:", "Plan in batches. Use prompts 1-10 to fill a month of ideas in one sitting, then 11-20 for hooks, 21-30 for scripts."),
    ("", ""),
    ("FAQ", ""),
    ("Do I need a paid AI account?", "No. The prompts work in ChatGPT's free tier, Claude, Gemini or any chatbot."),
    ("How do I use a prompt?", "Copy it from the Prompt Library, paste into your AI chat, replace the [bracketed] parts, press enter."),
    ("Can I use this next year?", "Yes — everything is undated. Change the month dates and go again."),
    ("Does it work outside the UK?", "Yes, but the prompts' tone examples are UK-casual. Ask your AI to adjust tone if you like."),
    ("Commercial use?", "This planner is for YOUR content planning. Please don't resell or redistribute the template itself."),
    ("", ""),
    ("Need help?", "DM @theaipound on TikTok or YouTube — happy to help."),
]
r = 4
for a, b in rows:
    ws.cell(row=r, column=1, value=a).font = Font(bold=True, color=NAVY)
    ws.cell(row=r, column=2, value=b)
    ws.cell(row=r, column=2).alignment = Alignment(wrap_text=True, vertical="top")
    r += 1
ws.column_dimensions["A"].width = 30
ws.column_dimensions["B"].width = 95
for rr in range(4, r):
    ws.row_dimensions[rr].height = 30

# ---------- Tab 2: Dashboard ----------
ws = wb.create_sheet("Dashboard")
title_row(ws, "Dashboard", 6, "Your numbers at a glance. Post Tracker feeds the best-performer box.")
ws.column_dimensions["A"].width = 22
for col in "BCDEFG":
    ws.column_dimensions[col].width = 16
# stat tiles
tiles = [("Posts this month", "='Month 1'!H2"), ("Posted (Month 1)", "='Month 1'!H3"),
         ("Total posts planned", "='Month 1'!H4"), ("Current streak", "")]
for i, (label, formula) in enumerate(tiles, 1):
    c = ws.cell(row=4, column=i, value=label)
    style_header(ws, 4, 4)
    v = ws.cell(row=5, column=i, value=formula)
    v.font = Font(bold=True, size=18, color=NAVY)
    v.fill = PatternFill("solid", fgColor=LIGHT)
    if label == "Current streak":
        ws.cell(row=6, column=i, value="days in a row — update manually").font = Font(size=8, color="6B7280")
    else:
        ws.cell(row=6, column=i, value="auto-counted").font = Font(size=8, color="6B7280")
ws.cell(row=8, column=1, value="Best performer this month").font = Font(bold=True, size=12, color=NAVY)
best = [("Hook:", ""), ("Platform:", ""), ("Views:", ""), ("Likes:", ""), ("Why it worked:", "")]
r = 9
for a, b in best:
    ws.cell(row=r, column=1, value=a).font = Font(bold=True)
    ws.cell(row=r, column=2, value=b).fill = PatternFill("solid", fgColor=LIGHT)
    r += 1
ws.cell(row=15, column=1, value="Month-by-month counts (planned / posted)").font = Font(bold=True, size=12, color=NAVY)

for i, h in enumerate(["Month", "Planned", "Posted"], 1):
    ws.cell(row=16, column=i, value=h)
style_header(ws, 16, 3)
for m in range(1, 13):
    rr = 16 + m
    ws.cell(row=rr, column=1, value=f"Month {m}")
    ws.cell(row=rr, column=2, value=f"=COUNTA('Month {m}'!E5:E70)")
    ws.cell(row=rr, column=3, value=f"=COUNTIF('Month {m}'!E5:E70,\"Posted\")")

# ---------- Tab 3: Pillars & Idea Bank ----------
ws = wb.create_sheet("Pillars & Idea Bank")
title_row(ws, "Content Pillars & Idea Bank", 4, "Pick 3-5 pillars = your main recurring topics. Feed ideas in here whenever they strike.")
ws.cell(row=4, column=1, value="Your pillars").font = Font(bold=True, size=12, color=NAVY)
for i, h in enumerate(["#", "Pillar name", "What it covers", "Target audience"], 1):
    ws.cell(row=5, column=i, value=h)
style_header(ws, 5, 4)
for i in range(1, 6):
    ws.cell(row=5 + i, column=1, value=i).font = Font(bold=True, color=NAVY)
    ws.cell(row=5 + i, column=1).fill = PatternFill("solid", fgColor=MINT)
ws.cell(row=12, column=1, value="Idea bank").font = Font(bold=True, size=12, color=NAVY)
for i, h in enumerate(["Date captured", "Idea", "Pillar", "Used in month?", "Link / notes"], 1):
    ws.cell(row=13, column=i, value=h)
style_header(ws, 13, 5)
for w, col in zip([14, 50, 14, 16, 30], "ABCDE"):
    ws.column_dimensions[col].width = w

# ---------- Tabs 4-15: Month 1-12 ----------
for m in range(1, 13):
    ws = wb.create_sheet(f"Month {m}")
    build_month(ws, f"Month {m}")
    # helper counters (hidden-ish, right side)
    ws.cell(row=1, column=8, value="Counts").font = Font(bold=True, color=WHITE)
    ws.cell(row=2, column=8, value="=COUNTA(E5:E70)").font = Font(color=NAVY)
    ws.cell(row=3, column=8, value='=COUNTIF(E5:E70,"Posted")').font = Font(color=NAVY)
    ws.cell(row=4, column=8, value="=COUNTA(D5:D70)").font = Font(color=NAVY)
    ws.column_dimensions["H"].hidden = False
# 3 sample rows in Month 1 (buyers see how it works)
samples = [
    ["Mon 5th", "TikTok", "Pillar 1", "Nobody tells you this about your first 90 days", "Posted", "tiktok.com/@you/video1", "Best performer so far — do a part 2"],
    ["Wed 7th", "YouTube", "Pillar 2", "The £0 AI stack every solopreneur needs", "Scheduled", "", "Used Prompt 27 for the script"],
    ["Fri 9th", "Instagram", "Pillar 1", "3 AI tools I ditched (and what replaced them)", "Idea", "", "Repurpose as a carousel too — Prompt 39"],
]
ws = wb["Month 1"]
for ri, row in enumerate(samples):
    for ci, val in enumerate(row, 1):
        ws.cell(row=5 + ri, column=ci, value=val)

# ---------- Tab 16: Prompt Library ----------
ws = wb.create_sheet("Prompt Library")
title_row(ws, "Prompt Library — 50 AI Prompts", 4, "Copy, paste into ChatGPT/Claude/Gemini, replace [brackets], done. Use the filter arrow on 'Category'.")
PROMPTS = [
    ("Ideation", "I run a [type of business] helping [audience] with [outcome]. Give me 30 short-form video ideas that show rather than tell the result."),
    ("Ideation", "List 10 common mistakes [audience] make with [topic]. For each, give a 1-line hook I can turn into a Short."),
    ("Ideation", "Act as a content strategist for [niche]. Give me 5 content pillars, each with 5 post ideas."),
    ("Ideation", "Here are my last 5 posts and their view counts: [paste]. Which angles did best, and what should I make next?"),
    ("Ideation", "Give me 10 'versus' comparisons relevant to [audience] choosing between [tool A] and [tool B]."),
    ("Ideation", "Turn this customer question into 5 pieces of content: [question]."),
    ("Ideation", "What do [audience] believe about [topic] that's wrong? Give 10 myth-busting hooks."),
    ("Ideation", "Give me 12 'day in the life of a [role]' story beats, each filmable in 30 seconds."),
    ("Ideation", "List 20 FAQs my audience asks about [topic], ranked by likely search demand."),
    ("Ideation", "Suggest 10 behind-the-scenes moments in my workflow that would make relatable content for [audience]."),
    ("Hooks", "Write 10 scroll-stopping first lines for a video about [topic]. Max 8 words each, no clichés."),
    ("Hooks", "Give me 10 number-led hooks for [topic]."),
    ("Hooks", "Rewrite this hook 5 ways — curious, contrarian, urgent, funny, straight-talking: [hook]."),
    ("Hooks", "Write 10 hooks using the pattern 'Nobody tells [audience] that...'"),
    ("Hooks", "Give me 10 pattern-interrupt openers for a video about [tool]."),
    ("Hooks", "Write 5 hooks that name a specific price or number: [topic]."),
    ("Hooks", "Turn this statistic into 10 hooks: [stat]."),
    ("Hooks", "Write 10 'what if' hooks for [audience] about [topic]."),
    ("Hooks", "Give me 10 mid-story openers: 'So there I was...'"),
    ("Hooks", "Rewrite my 3 worst-performing hooks to be more specific: [paste]."),
    ("Captions & scripts", "Write a 30-second Short script about [topic]: hook, 3 fast points, CTA to [offer]. Casual UK tone."),
    ("Captions & scripts", "Write an Instagram caption for this video: [summary]. 2 lines + 5 niche hashtags."),
    ("Captions & scripts", "Turn this outline into a punchy script with timestamps: [outline]."),
    ("Captions & scripts", "Write a LinkedIn post about [topic]: bold opinion first, 3 short paragraphs, end with a question. First person, casual."),
    ("Captions & scripts", "Condense this script to 15 seconds without losing the hook: [script]."),
    ("Captions & scripts", "Write 3 caption options for this post, each under 125 characters: [summary]."),
    ("Captions & scripts", "Give me a 60-second beginner-friendly tutorial script for [task] using [tool]."),
    ("Captions & scripts", "Rewrite this caption in my voice — friendly, UK, no fluff: [caption]."),
    ("Captions & scripts", "Write a story script: the mistake I made with [topic], what it cost, the fix."),
    ("Captions & scripts", "Write 5 CTA lines for [offer] that don't sound salesy."),
    ("Repurposing", "Turn this video transcript into a LinkedIn post: [transcript]."),
    ("Repurposing", "Extract 5 standalone quotes from this script: [script]."),
    ("Repurposing", "Turn this blog section into a 30-second script: [text]."),
    ("Repurposing", "Give me 10 short-form ideas from this longer video: [transcript]."),
    ("Repurposing", "Convert this post into 5 tweets."),
    ("Repurposing", "Turn these 5 comments into content ideas: [comments]."),
    ("Repurposing", "Adapt this script for [platform]: keep the hook, change the structure: [script]."),
    ("Repurposing", "Turn my [service] sales page into a 3-post series."),
    ("Repurposing", "Summarise this video into a 5-slide carousel outline, one point each: [transcript]."),
    ("Repurposing", "Turn this week's 3 posts into a 'what I learned this week' recap script."),
    ("Growth & analysis", "Here are my last 10 posts with views and likes: [paste]. Analyse what's working and plan next week."),
    ("Growth & analysis", "Audit my bio and suggest 3 sharper versions: [bio]. Audience: [audience]."),
    ("Growth & analysis", "Suggest the best UK posting times for [platform] targeting [audience], with your reasoning."),
    ("Growth & analysis", "Review my 5 best hooks and find the repeatable pattern: [hooks]."),
    ("Growth & analysis", "Here's a comment: [comment]. Write 3 reply options: warm, witty, expert."),
    ("Growth & analysis", "My watch-time drops at [timestamp]. Diagnose why and rewrite that section: [script]."),
    ("Growth & analysis", "Give me a 30-day content sprint for launching [product]: 3 posts a week, mixed formats."),
    ("Growth & analysis", "Create a monthly theme calendar for [niche]: 4 weekly themes, 3 post ideas each."),
    ("Growth & analysis", "My average views went from [X] to [Y] this month. Give 5 hypotheses and how to test each."),
    ("Growth & analysis", "Plan my first 10 posts as a new [niche] creator: establish credibility, entertain, convert."),
]
for i, h in enumerate(["#", "Category", "The prompt (copy everything in this cell)", "Your AI output / notes"], 1):
    ws.cell(row=4, column=i, value=h)
style_header(ws, 4, 4)
for idx, (cat, p) in enumerate(PROMPTS, 1):
    rr = 4 + idx
    ws.cell(row=rr, column=1, value=idx).font = Font(bold=True, color=NAVY)
    ws.cell(row=rr, column=2, value=cat)
    pc = ws.cell(row=rr, column=3, value=p)
    pc.alignment = Alignment(wrap_text=True, vertical="top")
    pc.fill = PatternFill("solid", fgColor=LIGHT)
    ws.cell(row=rr, column=4).alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[rr].height = 34
ws.auto_filter.ref = "A4:D54"
for w, col in zip([6, 18, 70, 32], "ABCD"):
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A5"

# ---------- Tab 17: Post Tracker ----------
ws = wb.create_sheet("Post Tracker")
title_row(ws, "Post Tracker", 8, "Log every posted video's numbers weekly. Your best hooks go in the Best-Hook Log below.")
headers = ["Date posted", "Platform", "Hook", "Views", "Likes", "New followers", "Comments", "Link"]
for i, h in enumerate(headers, 1):
    ws.cell(row=4, column=i, value=h)
style_header(ws, 4, 8)
dv_platform = DataValidation(type="list", formula1=PLATFORM_LIST, allow_blank=True)
ws.add_data_validation(dv_platform)
dv_platform.add("B5:B200")
for i in range(1, 9):
    ws.cell(row=4 + 0, column=i)
# weekly totals
ws.cell(row=3, column=10, value="Weekly totals").font = Font(bold=True, color=NAVY)
for lbl, col in [("Views", "D"), ("Likes", "E"), ("New followers", "F")]:
    ws.cell(row=4, column=col == "D" and 10 or (10 if col == "D" else 11 if col == "E" else 12), value=lbl)
# simple totals block
ws.cell(row=4, column=10, value="Total views")
ws.cell(row=5, column=10, value="=SUM(D5:D200)").font = Font(bold=True, color=NAVY)
ws.cell(row=6, column=10, value="Total likes")
ws.cell(row=7, column=10, value="=SUM(E5:E200)").font = Font(bold=True, color=NAVY)
ws.cell(row=8, column=10, value="Total new followers")
ws.cell(row=9, column=10, value="=SUM(F5:F200)").font = Font(bold=True, color=NAVY)
ws.cell(row=11, column=10, value="Best-hook log").font = Font(bold=True, size=12, color=NAVY)
for i, h in enumerate(["Hook", "Views", "Why it worked"], 10):
    pass
ws.cell(row=12, column=10, value="Hook")
ws.cell(row=12, column=11, value="Views")
ws.cell(row=12, column=12, value="Why it worked")
for c in range(10, 13):
    cell = ws.cell(row=12, column=c)
    cell.font = Font(bold=True, color=WHITE)
    cell.fill = PatternFill("solid", fgColor=NAVY)
# sample row
sample = ["18 Oct", "TikTok", "Nobody tells you this about your first 90 days", 0, 0, 0, 0, "tiktok.com/@you/video1"]
for ci, val in enumerate(sample, 1):
    ws.cell(row=5, column=ci, value=val)
for w, col in zip([12, 12, 44, 10, 10, 14, 12, 26, 2, 18, 10, 30], "ABCDEFGHIJKL"):
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A5"

# ---------- Tab 18: Brand Kit ----------
ws = wb.create_sheet("Brand Kit")
title_row(ws, "Brand Kit", 3, "Keep your look and voice consistent. Fill in yours, or borrow The AI Pound's as a starting point.")
sections = [
    ("Colours", [("Primary (navy)", "#16233B"), ("Accent (mint)", "#6EE7A8"),
                  ("White", "#FFFFFF"), ("Light background", "#F2F5F9")]),
    ("Fonts", [("Headings", "Montserrat / Arial Bold"), ("Body", "Inter / Arial")]),
    ("Tone rules", [
        ("Rule 1", "Casual, opinionated, straight-talking. British."), ("Rule 2", "Talk like a mate who happens to know AI, not a guru."),
        ("Rule 3", "Never say: 'endless possibilities', 'game-changer', 'unlock', 'watch your profits soar'."),
        ("Rule 4", "Numbers beat adjectives — name prices, times, results."),
    ]),
    ("CTA bank", [
        ("Soft", "Free audit, link in bio."), ("Value", "Grab the free checklist in my bio."),
        ("Direct", "DM me ADS for 3 ad variants in 48 hours."), ("Follow", "Follow for AI + money tips for one-person businesses."),
    ]),
]
r = 4
for name, items in sections:
    ws.cell(row=r, column=1, value=name).font = Font(bold=True, size=12, color=NAVY)
    r += 1
    for a, b in items:
        ws.cell(row=r, column=1, value=a).font = Font(bold=True)
        v = ws.cell(row=r, column=2, value=b)
        v.fill = PatternFill("solid", fgColor=LIGHT)
        r += 1
    r += 1
ws.cell(row=5, column=2).fill = PatternFill("solid", fgColor=NAVY)
ws.cell(row=5, column=2).font = Font(color=NAVY)
ws.cell(row=6, column=2).fill = PatternFill("solid", fgColor=MINT)
ws.column_dimensions["A"].width = 24
ws.column_dimensions["B"].width = 60

wb.save("AI-Powered-Content-Planner.xlsx")
print("Saved with tabs:", wb.sheetnames)
