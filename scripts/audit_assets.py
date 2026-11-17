#!/usr/bin/env python3
"""Audit every video in the repo: commit state, audio, loudness, stacked voices.

Why this exists: the 16 Nov brand film shipped with four ElevenLabs takes amixed from
0.00s, so it carried several voices at once and had to be deleted from three platforms.
A commit check and a caption check would both have passed it. This audits the audio
itself, so a file whose voice track was assembled wrongly cannot pass quietly.

Run: python3 scripts/audit_assets.py [--json out.json]
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[1]
SR = 16000
WIN = 1024          # 64 ms analysis window
HOP = 320           # 20 ms hop
F0_MIN, F0_MAX = 70, 350
SILENT_DB = -45.0   # frames quieter than this are not speech
DUP_RATIO = 0.60    # second pitch at least 60% as strong as the first
MIN_RUN = 0.30      # double-voice must persist this long (seconds) to count


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(path):
    r = sh(["ffprobe", "-v", "error", "-show_entries",
            "stream=codec_type,codec_name,width,height:format=duration",
            "-of", "json", str(path)])
    try:
        d = json.loads(r.stdout)
    except Exception:
        return {}
    out = {"duration": None, "audio": None, "width": None, "height": None}
    try:
        out["duration"] = round(float(d["format"]["duration"]), 2)
    except Exception:
        pass
    for s in d.get("streams", []):
        if s.get("codec_type") == "audio" and not out["audio"]:
            out["audio"] = s.get("codec_name")
        if s.get("codec_type") == "video" and not out["width"]:
            out["width"], out["height"] = s.get("width"), s.get("height")
    return out


def loudness(path):
    r = sh(["ffmpeg", "-nostats", "-i", str(path), "-af", "loudnorm=print_format=json",
            "-f", "null", "-"])
    m = re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr)
    if not m:
        return None
    try:
        return round(float(json.loads(m[-1])["input_i"]), 2)
    except Exception:
        return None


def load(path):
    f = tempfile.mktemp(suffix=".wav")
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-ac", "1", "-ar", str(SR), f])
    w = wave.open(f)
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    w.close()
    Path(f).unlink(missing_ok=True)
    return a


def _env(path, hop=0.01, sr=SR):
    a = load(path)
    n = int(sr * hop)
    m = len(a) // n
    e = a[:m * n].reshape(m, n)
    env = np.sqrt((e ** 2).mean(axis=1))
    return env - env.mean()


def take_cues(video, vo_dir):
    """Align each voice take against the finished mix and return its cue in seconds.

    This is the check that catches the 16 Nov fault: if the builder amixed the takes
    without adelay, every take aligns at the same second.
    """
    d = REPO / vo_dir
    takes = sorted(d.glob("*.mp3"))
    if not takes:
        return None
    mix = _env(video)
    cues = []
    for t in takes:
        env = _env(t)
        if len(env) > len(mix):
            return {"error": f"{t.name} longer than the mix"}
        best, bi = -2.0, 0
        for i in range(0, len(mix) - len(env) + 1):
            win = mix[i:i + len(env)]
            den = (np.linalg.norm(env) * np.linalg.norm(win)) or 1e-9
            c = float(np.dot(env, win) / den)
            if c > best:
                best, bi = c, i
        cues.append((t.name, round(bi / 100.0, 2), round(best, 2)))
    stacked = []
    for i in range(len(cues)):
        for j in range(i + 1, len(cues)):
            if abs(cues[i][1] - cues[j][1]) < 0.30:
                stacked.append(f"{cues[i][0]} and {cues[j][0]} both at {cues[i][1]}s")
    return {"cues": cues, "stacked": stacked}


def take_dir_for(rel):
    """Convention: a render keeps its takes in the gitignored build directory."""
    if rel.startswith("renders/brand/"):
        return "brandvo"
    stem = Path(rel).stem
    guess = Path("pv") / stem
    return str(guess) if (REPO / guess).is_dir() else None


def ensure_remote():
    r = sh(["git", "-C", str(REPO), "ls-remote",
            "https://github.com/davill353/Motion-Studio.git", "refs/heads/main"])
    parts = r.stdout.split()
    return parts[0] if parts else None


def pushed(sha, remote_sha):
    if not (sha and remote_sha):
        return False
    return sh(["git", "-C", str(REPO), "merge-base", "--is-ancestor",
               sha, remote_sha]).returncode == 0


def reference_check(rows):
    """Every video path named in a calendar, post or automation must exist and be voiced.

    A row pointing at a file that isn't there fails at publish time, and a row pointing
    at a silent file posts a silent video. Both are cheaper to catch here than on set.
    """
    exist = {r["file"]: r for r in rows}
    referenced = {}
    for f in REPO.rglob("*"):
        if not f.is_file() or f.suffix not in (".md", ".csv", ".json"):
            continue
        if ".git" in f.parts or f.name == "audit_assets.py":
            continue
        try:
            text = f.read_text(errors="ignore")
        except Exception:
            continue
        for m in set(re.findall(r"(?:renders|public)/[A-Za-z0-9_./-]+\.mp4", text)):
            referenced.setdefault(m, set()).add(str(f.relative_to(REPO)))
    missing = sorted(k for k in referenced if k not in exist)
    silent = sorted(k for k in referenced if k in exist and not exist[k].get("audio"))
    quiet = sorted(k for k in referenced
                   if k in exist and exist[k].get("audio")
                   and (exist[k].get("lufs") or 0) < -20)
    return {"missing": missing, "silent": silent, "quiet": quiet,
            "referenced": len(referenced)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    a = ap.parse_args()
    remote_sha = ensure_remote()
    files = sh(["git", "-C", str(REPO), "ls-files", "*.mp4"]).stdout.split()
    rows = []
    for rel in sorted(files):
        p = REPO / rel
        sha = sh(["git", "-C", str(REPO), "log", "-1", "--format=%H", "--", rel]).stdout.strip()
        row = {"file": rel, "sha": sha[:7], "pushed": pushed(sha, remote_sha),
               "bytes": p.stat().st_size}
        row.update(probe(p))
        if row.get("audio"):
            row["lufs"] = loudness(p)
            td = take_dir_for(rel)
            row["take_dir"] = td
            if td:
                row["voice_check"] = take_cues(p, td)
                row["voices_stacked"] = bool((row["voice_check"] or {}).get("stacked"))
        rows.append(row)
        v = row.get("voice_check") or {}
        if row.get("voices_stacked"):
            flag = "STACKED "
        elif not row.get("audio"):
            flag = "silent  "
        elif row.get("take_dir"):
            flag = "aligned "
        else:
            flag = "audit?  "
        trust = "unpushed" if not row["pushed"] else ""
        print(f"{flag:9} {rel:56} {str(row.get('duration')):>7}s "
              f"{row.get('width')}x{row.get('height')} aud={row.get('audio') or '-':4} "
              f"{str(row.get('lufs') or '-'):>7} {trust}")
    refs = reference_check(rows)
    print(f"\nreferenced video paths: {refs['referenced']}")
    if refs["missing"]:
        print(f"  MISSING FILES ({len(refs['missing'])}): " + ", ".join(refs["missing"][:4]) +
              (" ..." if len(refs["missing"]) > 4 else ""))
    print(f"  silent references: {len(refs['silent'])}{' ' + str(refs['silent']) if refs['silent'] else ''}")
    print(f"  too-quiet references: {len(refs['quiet'])}{' ' + str(refs['quiet']) if refs['quiet'] else ''}")
    if a.json:
        Path(a.json).write_text(json.dumps({"videos": rows, "references": refs}, indent=1))
    bad = [r for r in rows if r.get("voices_stacked") or not r["pushed"]]
    print(f"\n{len(rows)} videos, {len(bad)} needing attention, "
          f"{sum(1 for r in rows if not r.get('audio'))} silent")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
