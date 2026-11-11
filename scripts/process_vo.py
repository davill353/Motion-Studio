"""Cleans and speeds up voiceover clips: trims leading/trailing silence and breaths, speeds up, fades the tail.
Reads public/pound/vo/<reel>/NN.mp3 -> writes public/pound/vo-fast/<reel>/NN.mp3 and updates src/pound/vo-manifest.json.
Usage: python3 scripts/process_vo.py [speed=1.1] [tail_threshold_db=-30]"""
import json, pathlib, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
speed = float(sys.argv[1]) if len(sys.argv) > 1 else 1.1
thr = sys.argv[2] if len(sys.argv) > 2 else "-30"
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(p)]).decode())
manifest = {}
for reel_dir in sorted((ROOT/"public/pound/vo").iterdir()):
    out = ROOT/"public/pound/vo-fast"/reel_dir.name; out.mkdir(parents=True, exist_ok=True)
    durs = []
    for f in sorted(reel_dir.glob("*.mp3")):
        tmp = out/("_" + f.name)
        trim = (f"silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
                f"areverse,silenceremove=start_periods=1:start_threshold={thr}dB:start_silence=0.06,areverse,"
                f"atempo={speed}")
        subprocess.run(["ffmpeg","-loglevel","error","-y","-i",str(f),"-af",trim,str(tmp)],check=True)
        d = dur(tmp)
        subprocess.run(["ffmpeg","-loglevel","error","-y","-i",str(tmp),"-af",f"afade=t=in:d=0.02,afade=t=out:st={max(0,d-0.08):.3f}:d=0.08",
                        "-b:a","192k",str(out/f.name)],check=True)
        tmp.unlink(); durs.append(round(dur(out/f.name),3))
    manifest[reel_dir.name] = durs
    print(reel_dir.name, round(sum(durs),1), "s of speech")
(ROOT/"src/pound/vo-manifest.json").write_text(json.dumps(manifest, indent=1))
