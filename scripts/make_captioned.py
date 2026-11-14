"""Turn a raw phone clip into a branded, captioned vertical video.
Usage: python3 scripts/make_captioned.py <input video> <id> "<hook title>" [--end "Follow for Day 1"] [--keywords "word,word"] [--no-trim]
Output: renders/plan/<id>.mp4   (needs ElevenLabs speech-to-text via the environment's network secret)"""
import argparse, json, pathlib, re, subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("id"); ap.add_argument("hook")
ap.add_argument("--end", default="Follow for more")
ap.add_argument("--keywords", default="AI,free,clinic,clinics,Bedfordshire,salon,salons,WhatsApp,Sandy,Bedford")
ap.add_argument("--no-trim", action="store_true")
a = ap.parse_args()
def run(*c, **kw): return subprocess.run(c, check=True, capture_output=True, text=True, **kw)
def dur(p): return float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)).stdout)

# 1. trim leading/trailing silence
start, end = 0.0, dur(a.src)
if not a.no_trim:
    log = subprocess.run(["ffmpeg", "-i", a.src, "-af", "silencedetect=noise=-35dB:d=0.4", "-f", "null", "-"], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    if ss and ss[0] < 0.05 and se: start = max(0, se[0] - 0.15)
    if ss and (len(se) < len(ss) or abs(se[-1] - end) < 0.1): end = min(end, ss[-1] + 0.25)
# 2. normalise to 1080x1920 30fps
out_v = ROOT / "public" / "talking" / f"{a.id}.mp4"; out_v.parent.mkdir(parents=True, exist_ok=True)
run("ffmpeg", "-y", "-loglevel", "error", "-ss", f"{start:.2f}", "-to", f"{end:.2f}", "-i", a.src,
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30", "-c:v", "libx264", "-crf", "18", "-preset", "fast",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", str(out_v))
secs = dur(out_v)
# 3. transcribe (ElevenLabs Scribe)
mp3 = out_v.with_suffix(".mp3"); run("ffmpeg", "-y", "-loglevel", "error", "-i", str(out_v), "-vn", "-ac", "1", "-b:a", "96k", str(mp3))
r = run("curl", "-sS", "--max-time", "180", "-X", "POST", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: proxy-injected",
        "-F", "model_id=scribe_v1", "-F", "language_code=en", "-F", "timestamps_granularity=word", "-F", "tag_audio_events=false", "-F", f"file=@{mp3}").stdout
mp3.unlink()
data = json.loads(r)
if "words" not in data: raise SystemExit("Transcription failed: " + r[:300])
UK = {"inquiry": "enquiry", "inquiries": "enquiries", "color": "colour", "favorite": "favourite", "organize": "organise", "realize": "realise",
      "center": "centre", "optimize": "optimise", "analyze": "analyse", "program": "programme", "personalized": "personalised", "customize": "customise"}
def uk(t):
    core = re.sub(r"[^A-Za-z]", "", t); low = core.lower()
    if low in UK: rep = UK[low]; rep = rep.capitalize() if core[:1].isupper() else rep; return t.replace(core, rep)
    return t
words = [{"text": uk(w["text"].strip()), "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in data["words"] if w.get("type") == "word"]
(ROOT / "public" / "talking" / f"{a.id}.words.json").write_text(json.dumps({"text": data.get("text", ""), "words": words}, indent=1))
# 4. render
props = {"video": f"talking/{a.id}.mp4", "words": words, "hook": a.hook, "keywords": [k.strip() for k in a.keywords.split(",") if k.strip()],
         "endTitle": a.end, "videoSeconds": round(secs, 3)}
pf = ROOT / "public" / "talking" / f"{a.id}.props.json"; pf.write_text(json.dumps(props))
raw = ROOT / "renders" / "plan" / f"{a.id}.raw.mp4"; raw.parent.mkdir(parents=True, exist_ok=True)
br = ["--browser-executable=/opt/pw-browsers/chromium"] if pathlib.Path("/opt/pw-browsers/chromium").exists() else []
subprocess.run(["npx", "remotion", "render", "TalkingHead", str(raw), f"--props={pf}", "--crf=18", *br], check=True, cwd=ROOT, capture_output=True)
final = raw.with_name(f"{a.id}.mp4")
run("ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", str(final))
raw.unlink()
print(json.dumps({"output": str(final.relative_to(ROOT)), "seconds": round(dur(final), 1), "trimmed": [round(start, 2), round(end, 2)], "transcript": data.get("text", "")}))
