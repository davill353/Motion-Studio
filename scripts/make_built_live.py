"""Built Live: turn a screen recording (+ optional voice memo) into a 60s timed-build short.
Usage: python3 scripts/make_built_live.py builtlive/<episode>.json
Output: renders/builtlive/<id>.mp4

Episode file (times are "mm:ss" or seconds, measured on the screen recording):
{
  "id": "ep01-clinic-receptionist",
  "recording": "path/to/screen.mp4",
  "voice": "path/to/voice-memo.m4a",         # optional; sets the video length. Leave out to use "seconds".
  "seconds": 55,                              # length of the build part when there is no voice
  "deepen": true,                             # same voice treatment as the trailer (1 semitone down + warmth)
  "timer_minutes": 30,
  "finished_at": "27:12",                     # when the build was done (timer stops here)
  "hook": "30 minutes to build an AI receptionist",
  "chapters": [["00:00", "Webhook"], ["06:30", "Clinic info"], ["12:00", "AI brain"], ["19:40", "Telegram"], ["27:20", "Live test"]],
  "realtime": [["27:20", "27:45"]],           # parts played at normal speed (e.g. the live test on your phone)
  "zooms": [{"from": "27:20", "to": "27:45", "x": 0.8, "y": 0.5, "scale": 1.8}],   # x,y = focus point 0..1
  "blur": [{"x": 0.62, "y": 0.30, "w": 0.30, "h": 0.05, "from": "03:00", "to": "05:00"}],  # hide API keys etc. (fractions of the screen)
  "label": "Demo build",
  "end_title": "Comment AUTOMATE",
  "end_sub": "I'll send you the free guide",
  "keywords": ["AI", "WhatsApp", "Telegram", "clinic"]
}"""
import json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads(pathlib.Path(sys.argv[1]).read_text())
ID = cfg["id"]
PUB = ROOT / "public" / "builtlive"; PUB.mkdir(parents=True, exist_ok=True)
OUT = ROOT / "renders" / "builtlive"; OUT.mkdir(parents=True, exist_ok=True)
FPS, END = 30, 3.0

def run(*c, **kw):
    r = subprocess.run([str(x) for x in c], capture_output=True, text=True, **kw)
    if r.returncode: raise SystemExit(f"{c[0]} failed:\n{r.stderr[-1500:]}")
    return r
def dur(p): return float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p).stdout)
def sec(v):
    if isinstance(v, (int, float)): return float(v)
    n = 0.0
    for part in str(v).split(":"): n = n * 60 + float(part)
    return n
def say(m): print(m, flush=True)

rec = pathlib.Path(cfg["recording"]); D = dur(rec)
finished = min(sec(cfg.get("finished_at", D)), D)

# 1. Voice memo: trim silence, deepen, normalise -> sets the length
voice_wav, words = None, []
if cfg.get("voice"):
    say("voice: cleaning up")
    voice_wav = PUB / f"{ID}.voice.wav"
    chain = ["silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.15",
             "areverse", "silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.3", "areverse",
             "highpass=f=70"]
    if cfg.get("deepen", True): chain += ["rubberband=pitch=0.9439:formant=shifted", "equalizer=f=140:t=q:w=1:g=4"]
    chain += ["loudnorm=I=-16:TP=-1.5:LRA=11"]
    run("ffmpeg", "-y", "-loglevel", "error", "-i", cfg["voice"], "-af", ",".join(chain), "-ac", "1", "-ar", "48000", voice_wav)
    target = dur(voice_wav) + 0.6
    say("voice: transcribing")
    mp3 = PUB / f"{ID}.stt.mp3"; run("ffmpeg", "-y", "-loglevel", "error", "-i", voice_wav, "-b:a", "96k", mp3)
    r = run("curl", "-sS", "--max-time", "180", "-X", "POST", "https://api.elevenlabs.io/v1/speech-to-text", "-H", "xi-api-key: proxy-injected",
            "-F", "model_id=scribe_v1", "-F", "language_code=en", "-F", "timestamps_granularity=word", "-F", "tag_audio_events=false", "-F", f"file=@{mp3}").stdout
    mp3.unlink()
    data = json.loads(r)
    if "words" not in data: raise SystemExit("Transcription failed: " + r[:300])
    words = [{"text": w["text"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in data["words"] if w.get("type") == "word"]
    (PUB / f"{ID}.words.json").write_text(json.dumps({"text": data.get("text", ""), "words": words}, indent=1))
else:
    target = float(cfg.get("seconds", 55))

# 2. Timelapse plan: real-time parts at 1x, everything else at one fast speed
rt = sorted((sec(a), min(sec(b), D)) for a, b in cfg.get("realtime", []))
rt_total = sum(b - a for a, b in rt)
fast_src = D - rt_total
speed = max(1.0, fast_src / max(1.0, target - rt_total))
pieces, cur = [], 0.0
for a, b in rt:
    if a > cur: pieces.append((cur, a, speed))
    pieces.append((a, b, 1.0)); cur = b
if cur < D: pieces.append((cur, D, speed))
segs, out_t = [], 0.0
for a, b, s in pieces:
    segs.append({"srcStart": round(a, 3), "srcEnd": round(b, 3), "outStart": round(out_t, 3), "speed": round(s, 4)}); out_t += (b - a) / s
video_secs = out_t
say(f"timelapse: {D/60:.1f} min recording -> {video_secs:.1f}s at {speed:.0f}x (+{rt_total:.0f}s real time)")

# 3. Build the timelapse (blur boxes first, then cut + speed up)
fc = ["[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b1220,setsar=1[base]"]
last = "base"
for i, b in enumerate(cfg.get("blur", [])):
    x, y, w, h = (int(round(b[k] * (1920 if k in "xw" else 1080))) for k in ("x", "y", "w", "h"))
    w, h = max(8, w - w % 2), max(8, h - h % 2)
    en = f":enable='between(t,{sec(b.get('from', 0))},{sec(b.get('to', D))})'"
    fc.append(f"[{last}]split[m{i}][c{i}];[c{i}]crop={w}:{h}:{x}:{y},boxblur=lr='min(20,min(w,h)/2-1)':lp=4:cr='min(10,min(cw,ch)/2-1)':cp=4[b{i}];[m{i}][b{i}]overlay={x}:{y}{en}[v{i}]")
    last = f"v{i}"
fc.append(f"[{last}]split={len(segs)}" + "".join(f"[s{i}]" for i in range(len(segs))))
for i, s in enumerate(segs):
    fc.append(f"[s{i}]trim=start={s['srcStart']}:end={s['srcEnd']},setpts=(PTS-STARTPTS)/{s['speed']}[t{i}]")
fc.append("".join(f"[t{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0,fps={FPS}[out]")
tl = PUB / f"{ID}.mp4"
say("timelapse: encoding")
run("ffmpeg", "-y", "-loglevel", "error", "-i", rec, "-filter_complex", ";".join(fc), "-map", "[out]", "-an",
    "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-pix_fmt", "yuv420p", tl)
video_secs = dur(tl)

# 4. Render
props = {"video": f"builtlive/{ID}.mp4", "segments": segs, "videoSeconds": round(video_secs, 3), "timerMinutes": cfg.get("timer_minutes", 30),
         "finishedAt": finished, "chapters": [{"at": sec(a), "label": l} for a, l in cfg.get("chapters", [])], "hook": cfg.get("hook", ""),
         "words": words, "keywords": cfg.get("keywords", ["AI"]), "endTitle": cfg.get("end_title", "Comment AUTOMATE"),
         "endSub": cfg.get("end_sub", "I'll send you the free guide"), "label": cfg.get("label", ""),
         "zooms": [{"from": sec(z["from"]), "to": sec(z["to"]), "x": z.get("x", 0.5), "y": z.get("y", 0.5), "scale": z.get("scale", 1.6)} for z in cfg.get("zooms", [])]}
pf = PUB / f"{ID}.props.json"; pf.write_text(json.dumps(props))
raw = OUT / f"{ID}.raw.mp4"
br = ["--browser-executable=/opt/pw-browsers/chromium"] if pathlib.Path("/opt/pw-browsers/chromium").exists() else []
say("render: remotion")
subprocess.run(["npx", "remotion", "render", "BuiltLive", str(raw), f"--props={pf}", "--crf=18", "--muted", *br], check=True, cwd=ROOT, capture_output=True)

# 5. Sound: voice on top, music underneath (ducked under the voice), fade out on the end card
total = video_secs + END
music = ROOT / "public" / "pound" / "audio" / "music.mp3"
final = OUT / f"{ID}.mp4"
say("audio: mixing")
if voice_wav:
    af = (f"[1:a]aresample=48000,asplit=2[vo][sc];[2:a]aresample=48000,volume=0.22,atrim=0:{total:.2f},afade=t=out:st={total-1.8:.2f}:d=1.8[mu];"
          f"[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck];[vo]apad[vp];"
          f"[vp][duck]amix=inputs=2:duration=longest:normalize=0,atrim=0:{total:.2f},loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    run("ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-i", voice_wav, "-stream_loop", "-1", "-i", music, "-filter_complex", af,
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{total:.2f}", final)
else:
    af = f"[1:a]volume=0.5,atrim=0:{total:.2f},afade=t=out:st={total-1.8:.2f}:d=1.8,loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    run("ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-stream_loop", "-1", "-i", music, "-filter_complex", af,
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.2f}", final)
raw.unlink()
print(json.dumps({"output": str(final.relative_to(ROOT)), "seconds": round(dur(final), 1), "speed": round(speed, 1)}))
