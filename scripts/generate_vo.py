"""Generates voiceover clips with ElevenLabs (one per scene) and writes src/pound/vo-manifest.json.
Usage: python3 scripts/generate_vo.py <voice_id>   (API key is injected by the environment / pass XI_API_KEY)."""
import json, os, subprocess, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
voice = sys.argv[1]
key = os.environ.get("XI_API_KEY", "proxy-injected")
lines = json.loads(subprocess.check_output(["npx", "-y", "tsx", "-e",
    "import {VO} from './src/pound/vo'; console.log(JSON.stringify(VO))"], cwd=ROOT))
manifest = {}
for reel, segs in lines.items():
    out = ROOT / "public" / "pound" / "vo" / reel
    out.mkdir(parents=True, exist_ok=True)
    durs = []
    for i, text in enumerate(segs):
        f = out / f"{i:02d}.mp3"
        meta = out / f"{i:02d}.txt"
        if not (f.exists() and meta.exists() and meta.read_text() == text):
            body = {"text": text, "model_id": "eleven_multilingual_v2",
                    "previous_text": segs[i - 1] if i else None,
                    "next_text": segs[i + 1] if i + 1 < len(segs) else None,
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True}}
            code = subprocess.run(["curl", "-sS", "--max-time", "90", "-X", "POST",
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
                "-H", f"xi-api-key: {key}", "-H", "Content-Type: application/json",
                "-d", json.dumps(body), "-o", str(f), "-w", "%{http_code}"], capture_output=True, text=True).stdout
            if code != "200":
                raise SystemExit(f"{reel} #{i}: HTTP {code}: {f.read_text(errors='ignore')[:200]}")
            meta.write_text(text)
        d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                           "-of", "csv=p=0", str(f)]).decode().strip())
        durs.append(round(d, 3))
    manifest[reel] = durs
    print(reel, len(durs), "clips,", round(sum(durs), 1), "s of speech", flush=True)
(ROOT / "src" / "pound" / "vo-manifest.json").write_text(json.dumps(manifest, indent=1))
