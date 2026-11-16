import os, json, subprocess, math
from PIL import Image, ImageDraw, ImageFont

KEY = os.environ["ELEVENLABS_API_KEY"]
VOICE = "HUCZkwri1gOtkkToCapk"          # David's cloned voice, no pitch shift
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
NAVY = (0x16, 0x23, 0x3B)
MINT = (0x6E, 0xE7, 0xA8)
TXT = (0xF4, 0xF7, 0xFB)
MUT = (0xA9, 0xB8, 0xCE)
EDGE = (0x2C, 0x3D, 0x5C)
MUSIC = "msclone/public/pound/audio/music.mp3"

# Brand film: the brand, not a product. Claims stay inside what is provable.
CARDS = [
    ("Every AI advert", "says the same thing.", "Faster. Cheaper. Fully automatic."),
    ("We sell the", "opposite.", "An AI that stops and asks a human before it says anything."),
    ("A clinic's phone, answered.", "Orders taken.", "Inbox triaged. Every reply signed off by you."),
    ("The AI Pound.", "AI with an owner.", None),          # end card
]
SEGS = [
    "Every AI advert says the same thing. Faster. Cheaper. Fully automatic.",
    "We sell the opposite. An AI that stops and asks a human before it says anything.",
    "A clinic's phone, answered. A restaurant's orders, taken. Your inbox, triaged. Every reply signed off by you.",
    "The AI Pound. AI with an owner.",
]

FPS = 30
W, H = 1080, 1920


def tts():
    os.makedirs("brandvo", exist_ok=True)
    durs = []
    for i, t in enumerate(SEGS):
        out = f"brandvo/{i:02d}.mp3"
        if not os.path.exists(out):
            body = {"text": t, "model_id": "eleven_multilingual_v2",
                    "previous_text": SEGS[i - 1] if i else None,
                    "next_text": SEGS[i + 1] if i + 1 < len(SEGS) else None,
                    "voice_settings": {"stability": 0.48, "similarity_boost": 0.8,
                                       "style": 0.2, "use_speaker_boost": True}}
            code = subprocess.run(["curl", "-sS", "--max-time", "90", "-X", "POST",
                                   f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
                                   "-H", f"xi-api-key: {KEY}", "-H", "Content-Type: application/json",
                                   "-d", json.dumps(body), "-o", out, "-w", "%{http_code}"],
                                  capture_output=True, text=True).stdout
            if code != "200":
                raise SystemExit(f"tts {i} {code} {open(out, errors='ignore').read()[:200]}")
        durs.append(float(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out]).decode()))
    return durs


def wrap(d, text, font, maxw):
    out, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) > maxw and cur:
            out.append(cur); cur = w
        else:
            cur = t
    out.append(cur)
    return out


def fit(d, text, path, start, maxw, maxlines, minfs):
    fs = start
    while fs > minfs:
        f = ImageFont.truetype(path, fs)
        if len(wrap(d, text, f, maxw)) <= maxlines:
            return f
        fs -= 2
    return ImageFont.truetype(path, minfs)


durs = tts()
gap = 0.42
starts, t = [], 0.62
for du in durs:
    starts.append(t)
    t += du + gap
END = t + 2.0
NF = int(round(END * FPS))
m = 78

os.makedirs("brandframes", exist_ok=True)
f_brand = ImageFont.truetype(FB, 26)
f_foot = ImageFont.truetype(FR, 26)
f_url = ImageFont.truetype(FB, 46)

for i in range(NF):
    tt = i / FPS
    idx = 0
    for k, s in enumerate(starts):
        if tt >= s:
            idx = k
    # short crossfade-in on each card
    local = tt - starts[idx]
    img = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(img)
    # subtle grid, brand texture
    for gy in range(0, H, 48):
        for gx in range(0, W, 48):
            d.ellipse((gx + 2, gy + 2, gx + 4, gy + 4), fill=(0x22, 0x31, 0x4C))
    d.text((m, 74), "THE AI POUND", font=f_brand, fill=MINT)
    d.text((W - m - d.textlength("@theaipound", font=f_foot), 74), "@theaipound", font=f_foot, fill=MUT)
    d.line((m, 126, W - m, 126), fill=EDGE, width=2)

    head, sub, third = CARDS[idx]
    if idx < 3:
        f_h = fit(d, head, FB, 96, W - 2 * m, 3, 56)
        f_s = fit(d, sub, FB, 96, W - 2 * m, 2, 56)
        y = H * 0.30
        for ln in wrap(d, head, f_h, W - 2 * m):
            d.text((m, y), ln, font=f_h, fill=TXT); y += f_h.size + 10
        for ln in wrap(d, sub, f_s, W - 2 * m):
            d.text((m, y), ln, font=f_s, fill=MINT); y += f_s.size + 10
        if third:
            f_t = fit(d, third, FR, 40, W - 2 * m, 3, 30)
            y += 26
            for ln in wrap(d, third, f_t, W - 2 * m):
                d.text((m, y), ln, font=f_t, fill=MUT); y += f_t.size + 10
    else:
        # end card: one thought per line, offer and URL
        lines = [("The AI Pound.", TXT, 104), ("AI with an owner.", MINT, 76)]
        y = H * 0.30
        for txt, col, fs in lines:
            f = ImageFont.truetype(FB, fs)
            d.text((m, y), txt, font=f, fill=col); y += fs + 26
        y += 30
        for txt in ["Two weeks free on a pilot.", "No card. No contract."]:
            f = ImageFont.truetype(FR, 42)
            d.text((m, y), txt, font=f, fill=MUT); y += 56
        y += 26
        d.rounded_rectangle((m, y, W - m, y + 132), radius=18, outline=MINT, width=4)
        f = ImageFont.truetype(FB, 46)
        d.text((m + 34, y + 42), "theaipound.co.uk/pilot", font=f, fill=MINT)
    # progress bar, brand furniture
    prog = tt / END
    d.rectangle((0, H - 10, W, H), fill=(0x1B, 0x2A, 0x46))
    d.rectangle((0, H - 10, int(W * prog), H), fill=MINT)
    img.save(f"brandframes/f{i:04d}.png")

ins = " ".join(f"-i brandvo/{i:02d}.mp3" for i in range(len(durs)))
fl = "".join(f"[{i}:a]" for i in range(len(durs)))
subprocess.run(f"ffmpeg -loglevel error -y {ins} -filter_complex \"{fl}amix=inputs={len(durs)}:normalize=0[vo]\" "
               f"-map [vo] -t {END} -ar 44100 brandvo/voice.wav", shell=True, check=True)
subprocess.run(f"ffmpeg -loglevel error -y -stream_loop -1 -i {MUSIC} -t {END} -af "
               f"\"volume=0.10,afade=t=in:d=1.4,afade=t=out:st={max(0,END-2.6)}:d=2.6\" brandvo/music.wav",
               shell=True, check=True)
subprocess.run(f"ffmpeg -loglevel error -y -i brandvo/voice.wav -i brandvo/music.wav -filter_complex "
               f"\"[0][1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]\" -map [a] brandvo/mix.wav",
               shell=True, check=True)
os.makedirs("msclone/renders/brand", exist_ok=True)
out = "msclone/renders/brand/ai-pound-brand-film-9x16.mp4"
subprocess.run(f"ffmpeg -loglevel error -y -framerate {FPS} -i brandframes/f%04d.png -i brandvo/mix.wav "
               f"-c:v libx264 -pix_fmt yuv420p -crf 19 -c:a aac -b:a 192k -shortest {out}",
               shell=True, check=True)
print("rendered", out, round(END, 2), "s", NF, "frames")
