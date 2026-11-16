#!/usr/bin/env python3
"""Re-cut of the restaurant order demo: 25s, new opening, existing voiceover lines."""
from PIL import Image, ImageDraw, ImageFont
import subprocess, pathlib, json

W, H = 1080, 1920
NAVY = (22, 35, 59); MINT = (110, 231, 168); WHITE = (255, 255, 255); SLATE = (150, 166, 190)
BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
VO = pathlib.Path("public/pound/vo/03-Restaurant-Part1")
MUSIC = "public/pound/audio/music.mp3"
out = pathlib.Path("recut"); out.mkdir(exist_ok=True)

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", str(p)]).decode().strip())

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

def card(name, kicker, big, sub=None, money=None, small=None):
    im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im); m = 84
    f_k = ImageFont.truetype(BOLD, 40)
    f_big = ImageFont.truetype(BOLD, 96 if money is None else 150)
    f_sub = ImageFont.truetype(REG, 46)
    f_s = ImageFont.truetype(REG, 34)
    d.text((m, 220), kicker.upper(), font=f_k, fill=MINT)
    d.rectangle([m, 292, m + 104, 300], fill=MINT)
    y = 400
    if money:
        d.text((m, y), money, font=f_big, fill=MINT); y += 190
    for ln in wrap(d, big, f_big if not money else ImageFont.truetype(BOLD, 80), W - 2*m):
        d.text((m, y), ln, font=f_big if not money else ImageFont.truetype(BOLD, 80), fill=WHITE)
        y += 108 if not money else 92
    if sub:
        y += 26
        for ln in wrap(d, sub, f_sub, W - 2*m):
            d.text((m, y), ln, font=f_sub, fill=(214, 224, 238)); y += 60
    if small:
        for ln in wrap(d, small, f_s, W - 2*m):
            d.text((m, y), ln, font=f_s, fill=SLATE); y += 46
    d.text((m, H - 96), "THE AI POUND", font=f_k, fill=MINT)
    p = out / f"{name}.png"; im.save(p); return p

def endcard(name="s5"):
    im = Image.new("RGB", (W, H), NAVY); d = ImageDraw.Draw(im); m = 84
    f_k = ImageFont.truetype(BOLD, 40); f_b = ImageFont.truetype(BOLD, 92); f_s = ImageFont.truetype(REG, 44)
    d.text((m, 300), "BUILT FOR CAFÉS, TAKEAWAYS, FOOD TRUCKS", font=f_k, fill=MINT)
    d.rectangle([m, 372, m + 104, 380], fill=MINT)
    d.text((m, 470), "Follow", font=f_b, fill=WHITE)
    d.text((m, 582), "@theaipound", font=f_b, fill=MINT)
    y = 760
    for ln in ["Comment AUTOMATE if you want", "this built for your business.", "", "Demo build. Sample data."]:
        d.text((m, y), ln, font=f_s, fill=(214, 224, 238)); y += 58
    d.text((m, H - 96), "THE AI POUND", font=f_k, fill=MINT)
    p = out / f"{name}.png"; im.save(p); return p

scenes = [
    (card("s0", "A real café order", "Two flat whites and a bacon roll", "Priced from the café's own menu, before the phone goes down.", money="£10.90"), "00.mp3"),
    (card("s1", "What happens", "A messy message becomes a clean list", "Item, price, total. From the café's own menu.", ), "02.mp3"),
    (card("s2", "The approval", "The owner taps approve", "Order saved, customer confirmed. Nothing sends on its own.", ), "03.mp3"),
    (card("s3", "When it's unclear", "It asks. It never guesses", "No invented items, no invented prices.", ), "06.mp3"),
    (card("s4", "The point", "Prices straight from your menu", "Fewer mistakes, faster replies, a human still in charge.", ), "07.mp3"),
    (endcard("s5"), None),
]
timings = []
for p, a in scenes:
    d = 1.8 if a is None else dur(VO / a)
    timings.append((str(p), round(d, 3)))
print("timings:", timings, "total", round(sum(d for _, d in timings), 2))

# audio: concat the VO clips in order, then silence tail for the end card
vo_files = [str(VO / a) for _, a in scenes if a]
lst = out / "vo.txt"; lst.write_text("\n".join(f"file '{pathlib.Path(f).resolve()}'" for f in vo_files))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-c:a", "libmp3lame", "-q:a", "3", str(out / "vo-all.mp3")], check=True)
vo_len = dur(out / "vo-all.mp3")
vid_len = sum(d for _, d in timings)
pad = max(0.0, vid_len - vo_len)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(out / "vo-all.mp3"),
                "-af", f"apad=pad_dur={pad:.2f}", str(out / "vo-pad.wav")], check=True)

# video: images with per-scene durations
man = out / "img.txt"
man.write_text("\n".join(f"file '{pathlib.Path(p).resolve()}'\nduration {d}" for p, d in timings) + f"\nfile '{pathlib.Path(out/'s5.png').resolve()}'")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(man),
                "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
                str(out / "video.mp4")], check=True)

subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(out / "video.mp4"), "-i", str(out / "vo-pad.wav"),
                "-stream_loop", "-1", "-i", MUSIC,
                "-filter_complex", "[2:a]volume=0.06[m];[1:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
                "-shortest", "-movflags", "+faststart", "recut-restaurant-25s.mp4"], check=True)
print("done")
