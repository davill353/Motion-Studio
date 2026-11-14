#!/usr/bin/env python3
"""Clinic pilot video ad v1: 5 scenes, 1080x1920, fast static-camera build."""
from PIL import Image, ImageDraw, ImageFont
import subprocess, pathlib

W, H = 1080, 1920
NAVY = (22, 35, 59); MINT = (110, 231, 168); WHITE = (255, 255, 255)
BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
out = pathlib.Path("frames"); out.mkdir(exist_ok=True)

def cover(path, zoom=1.0, dx=0.0):
    im = Image.open(path).convert("RGB")
    s = max(W / im.width, H / im.height) * zoom
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - W) // 2 + int(dx * (im.width - W) / 2)
    y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))

def scrim(im, strength=240):
    g = Image.new("L", (1, H))
    for y in range(H):
        t = max(0.0, (y - H * 0.26) / (H * 0.74))
        g.putpixel((0, y), int(strength * (t ** 1.3)))
    return Image.composite(Image.new("RGB", (W, H), NAVY), im, g.resize((W, H)))

def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        trial = (cur + " " + w).strip()
        if d.textlength(trial, font=font) <= maxw: cur = trial
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def scene(src, kicker, headline, sub=None, name="f", zoom=1.0, dx=0.0, size=84):
    base = scrim(cover(src, zoom, dx)); d = ImageDraw.Draw(base)
    f_k, f_h, f_s = ImageFont.truetype(BOLD, 38), ImageFont.truetype(BOLD, size), ImageFont.truetype(REG, 40)
    m = 72
    d.text((m, 132), kicker.upper(), font=f_k, fill=MINT)
    d.rectangle([m, 196, m + 92, 203], fill=MINT)
    lines = wrap(d, headline, f_h, W - 2 * m)
    y = H - 300 - len(lines) * (size + 14)
    for ln in lines:
        d.text((m, y), ln, font=f_h, fill=WHITE); y += size + 14
    if sub:
        y += 16
        for ln in wrap(d, sub, f_s, W - 2 * m):
            d.text((m, y), ln, font=f_s, fill=(216, 226, 240)); y += 52
    d.text((m, H - 96), "THE AI POUND", font=f_k, fill=MINT)
    p = out / f"{name}.png"; base.save(p); return p

def endcard(name="f4"):
    base = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(base); m = 84
    f_k = ImageFont.truetype(BOLD, 40); f_big = ImageFont.truetype(BOLD, 96)
    f_s = ImageFont.truetype(REG, 44); f_b = ImageFont.truetype(BOLD, 52)
    d.text((m, 300), "FOR CLINICS & SALONS", font=f_k, fill=MINT)
    d.rectangle([m, 372, m + 104, 380], fill=MINT)
    d.text((m, 470), "Free", font=f_big, fill=WHITE)
    d.text((m, 590), "2-week", font=f_big, fill=MINT)
    d.text((m, 710), "pilot", font=f_big, fill=WHITE)
    y = 900
    for ln in ["No card. No contract.", "I set it up with you in 45 minutes.", "Keep it only if it saves you time."]:
        d.text((m, y), ln, font=f_s, fill=(216, 226, 240)); y += 62
    d.rectangle([m, 1170, W - m, 1180], fill=(58, 74, 104))
    d.text((m, 1240), "theaipound.co.uk/pilot", font=f_b, fill=WHITE)
    d.text((m, 1330), "Comment AUTOMATE and I'll send it", font=f_s, fill=MINT)
    d.text((m, H - 140), "David · The AI Pound · @theaipound", font=f_k, fill=(160, 176, 200))
    p = out / f"{name}.png"; base.save(p); return p

shots = [
    (scene("s1.png", "For clinics & salons", "Never miss a clinic enquiry",
           "even when you're with a client", "f0", 1.0, 0.0, 88), 3.8),
    (scene("s2.png", "What it does", "It answers the 12 questions you type every day",
           None, "f1", 1.18, 0.35, 82), 3.8),
    (scene("s1.png", "How it stays safe", "Prices from your own sheet. Clinical questions go to you.",
           None, "f2", 1.14, -0.40, 78), 4.2),
    (scene("s2.png", "The rule", "You approve every reply, until you trust it",
           None, "f3", 1.0, 0.0, 84), 3.8),
    (endcard("f4"), 5.2),
]
print("frames:", [str(s[0]) for s in shots])

clips = []
for i, (f, dur) in enumerate(shots):
    c = f"c{i}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loop", "1", "-t", str(dur), "-i", str(f),
                    "-vf", f"fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast",
                    "-crf", "23", "-r", "30", c], check=True, capture_output=True)
    clips.append((c, dur))

inputs = [x for c, _ in clips for x in ("-i", c)]
fc, prev, off = [], "[0:v]", clips[0][1] - 0.3
for i in range(1, len(clips)):
    fc.append(f"{prev}[{i}:v]xfade=transition=fade:duration=0.3:offset={off:.2f}[v{i}]")
    prev = f"[v{i}]"; off += clips[i][1] - 0.3
subprocess.run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", prev,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", "ad-clinic-pilot-01.mp4"], check=True, capture_output=True)
print("done")
