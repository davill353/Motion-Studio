#!/usr/bin/env python3
"""Prepend a 1.4s search-phrase hook card to the builder videos."""
from PIL import Image, ImageDraw, ImageFont
import subprocess, pathlib

W, H = 1080, 1920
NAVY = (22, 35, 59); MINT = (110, 231, 168); WHITE = (255, 255, 255)
BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
out = pathlib.Path("build/builder_hooks"); out.mkdir(parents=True, exist_ok=True)

def wrap(d, text, font, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def card(name, kicker, big):
    im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im); m = 84
    f_k = ImageFont.truetype(BOLD, 46)
    f_big = ImageFont.truetype(BOLD, 104)
    d.text((m, 240), kicker.upper(), font=f_k, fill=MINT)
    d.rectangle([m, 316, m + 104, 324], fill=MINT)
    y = 470
    for ln in wrap(d, big, f_big, W - 2*m):
        d.text((m, y), ln, font=f_big, fill=WHITE); y += 118
    d.text((m, H - 96), "THE AI POUND", font=f_k, fill=MINT)
    p = out / f"{name}.png"; im.save(p); return p

JOBS = [
    ("two-builders", "AI for builders", "Two builders. Same Monday.", "renders/whichone/two-builders.mp4"),
    ("boss-level-builder", "AI for builders", "Boss level: run the jobs, not the phone.", "renders/whichone/boss-level-builder.mp4"),
]
for slug, kicker, big, src in JOBS:
    png = card(slug, kicker, big)
    dst = pathlib.Path(f"renders/whichone/{slug}-hook.mp4")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y",
        "-loop", "1", "-t", "1.4", "-i", str(png),
        "-i", src,
        "-f", "lavfi", "-t", "1.4", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-filter_complex",
        "[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[v0];"
        "[1:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[v1];"
        "[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];"
        "[2:a]aresample=48000,aformat=channel_layouts=stereo[a0];"
        "[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]",
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "192k",
        str(dst)
    ], check=True)
    d = subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(dst)]).decode().strip()
    print(f"{dst}  {float(d):.1f}s  {dst.stat().st_size//1024}KB")
