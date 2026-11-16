#!/usr/bin/env python3
"""Clinic pilot ad v2: search-phrase hook, approval line second, split CTA. 1080x1920."""
from PIL import Image, ImageDraw, ImageFont
import subprocess, pathlib, json, sys

W, H = 1080, 1920
NAVY = (22, 35, 59); MINT = (110, 231, 168); WHITE = (255, 255, 255)
BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG  = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
out = pathlib.Path("frames"); out.mkdir(exist_ok=True)

def cover(path, zoom=1.0, dx=0.0):
    im = Image.open(path).convert("RGB")
    s = max(W / im.width, H / im.height) * zoom
    im = im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS)
    x = (im.width - W)//2 + int(dx * (im.width - W)/2); y = (im.height - H)//2
    return im.crop((x, y, x+W, y+H))

def scrim(im, strength=242):
    g = Image.new("L", (1, H))
    for y in range(H):
        # dark at the very top (kicker), lighter in the middle, dark again at the bottom
        top = max(0.0, 1 - y / (H * 0.20)) * 0.72
        bottom = max(0.0, (y - H * 0.22) / (H * 0.78)) ** 1.25
        g.putpixel((0, y), int(strength * max(top, bottom)))
    return Image.composite(Image.new("RGB", (W, H), NAVY), im, g.resize((W, H)))

def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur+" "+w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def scene(src, kicker, headline, sub=None, name="f", zoom=1.0, dx=0.0, size=84):
    base = scrim(cover(src, zoom, dx)); d = ImageDraw.Draw(base)
    f_k, f_h, f_s = ImageFont.truetype(BOLD, 38), ImageFont.truetype(BOLD, size), ImageFont.truetype(REG, 42)
    m = 72
    d.text((m, 132), kicker.upper(), font=f_k, fill=MINT)
    d.rectangle([m, 196, m+92, 203], fill=MINT)
    lines = wrap(d, headline, f_h, W-2*m)
    y = H - 300 - len(lines)*(size+14)
    for ln in lines:
        d.text((m, y), ln, font=f_h, fill=WHITE); y += size+14
    if sub:
        y += 18
        for ln in wrap(d, sub, f_s, W-2*m):
            d.text((m, y), ln, font=f_s, fill=(216,226,240)); y += 54
    d.text((m, H-96), "THE AI POUND", font=f_k, fill=MINT)
    p = out/f"{name}.png"; base.save(p); return p

def endcard(name="f4"):
    base = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(base); m = 84
    f_k = ImageFont.truetype(BOLD, 40); f_big = ImageFont.truetype(BOLD, 104)
    f_s = ImageFont.truetype(REG, 46); f_b = ImageFont.truetype(BOLD, 54)
    d.text((m, 250), "FOR CLINICS & SALONS", font=f_k, fill=MINT)
    d.rectangle([m, 322, m+104, 330], fill=MINT)
    d.text((m, 420), "Free", font=f_big, fill=WHITE)
    d.text((m, 545), "2-week", font=f_big, fill=MINT)
    d.text((m, 670), "pilot", font=f_big, fill=WHITE)
    y = 850
    for ln in ["No card. No contract.", "On your real enquiries."]:
        d.text((m, y), ln, font=f_s, fill=(216,226,240)); y += 66
    d.rectangle([m, 1040, W-m, 1050], fill=(58,74,104))
    d.text((m, 1110), "theaipound.co.uk/pilot", font=f_b, fill=WHITE)
    d.text((m, 1230), "Comment PILOT", font=ImageFont.truetype(BOLD, 56), fill=MINT)
    d.text((m, 1310), "and I'll set it up with you", font=f_s, fill=(216,226,240))
    d.text((m, H-140), "David · The AI Pound · @theaipound", font=f_k, fill=(160,176,200))
    p = out/f"{name}.png"; base.save(p); return p

shots = [
    (scene("s1.png", "AI for clinics", "It answers the questions your receptionist answers twelve times a day",
           "Evenings and weekends included", "f0", 1.10, 0.30, 80), 0.0),
    (scene("s2.png", "The rule", "You approve every reply, until you trust it", None, "f1", 1.14, -0.35, 84), 0.0),
    (scene("s1.png", "How it stays safe", "Prices from your own sheet. Clinical questions come to you.",
           None, "f2", 1.18, 0.35, 76), 0.0),
    (scene("s2.png", "The offer", "Two weeks free, on your real enquiries", None, "f3", 1.0, 0.0, 88), 0.0),
    (endcard("f4"), 0.0),
]
print(json.dumps([str(s[0]) for s in shots]))
