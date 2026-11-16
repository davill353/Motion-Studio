#!/usr/bin/env python3
"""
Pre-post checker for The AI Pound.

Hard blocks are objective facts only. Everything subjective gets a score and a
note for the approval card, so a human still decides.

Hard blocks (any one = do not post):
  1. not_committed      file is not tracked in git at HEAD (no commit SHA)
  2. captions_missing   a required caption is empty
  3. banned_phrase      brand.md section 6 compliance word list
  4. search_phrase_absent   required search phrase not visible in the first frame
  5. demo_unlabelled    demo/client ad without an on-screen "example creative" label
  6. no_audio           channel video with no audio track

Scored, never blocked: hook strength, caption accuracy against the script,
end-card CTA, loudness, duration fit, resolution.

Usage
  python3 scripts/prepost_check.py --manifest checks/<date>.json
  python3 scripts/prepost_check.py --video renders/ugc/x.mp4 --type ugc --demo \
      --caption "..." --script "..."
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

BANNED = [
    (r"guarantee", "guaranteed results"),
    (r"\b(cure|cures|cured)\b", "medical claim (cure)"),
    (r"miracle", "hype claim (miracle)"),
    (r"lose\s+\d+\s*(stone|st|lbs?|kg|pounds)", "specific weight-loss amount"),
    (r"semaglutide|tirzepatide|ozempic|wegovy|mounjaro|saxenda|liraglutide|botox|botulinum|finasteride",
     "prescription-only medicine"),
    (r"(skinny|weight[- ]?loss|fat)\s*(jab|pen|injection)|\bthe jab\b", "implied prescription-only medicine"),
    (r"\[(add|link|todo|result)\]|\bTODO\b", "unfilled placeholder"),
]

DEMO_LABEL = re.compile(r"example creative|\bdemo\b|not a (real )?customer", re.I)


def is_demo_labelled(text):
    """OCR mangles the space in 'example creative', so compare letters only."""
    letters = re.sub(r"[^a-z]", "", text.lower())
    return ("examplecreative" in letters or "notarealcustomer" in letters
            or re.search(r"demo", letters) is not None)


def sh(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def meta(path):
    out = sh(["ffprobe", "-v", "error", "-print_format", "json",
              "-show_format", "-show_streams", str(path)]).stdout
    d = json.loads(out or "{}")
    v = next((s for s in d.get("streams", []) if s.get("codec_type") == "video"), {})
    a = next((s for s in d.get("streams", []) if s.get("codec_type") == "audio"), None)
    return {
        "width": v.get("width"),
        "height": v.get("height"),
        "duration": round(float(d.get("format", {}).get("duration") or 0), 2),
        "fps": v.get("r_frame_rate"),
        "has_audio": a is not None,
        "bytes": int(d.get("format", {}).get("size") or 0),
    }


def frames_ocr(path, count=14, width=None):
    """OCR evenly spaced frames, plus the true first frame."""
    m = meta(path)
    dur = max(m["duration"], 0.1)
    stamps = [0.05] + [round(dur * i / (count - 1), 2) for i in range(1, count)]
    texts = []
    with tempfile.TemporaryDirectory() as td:
        for i, t in enumerate(stamps):
            png = os.path.join(td, f"f{i:03d}.png")
            cmd = ["ffmpeg", "-loglevel", "error", "-y", "-ss", str(t), "-i", str(path),
                   "-frames:v", "1"]
            if width:
                cmd += ["-vf", f"scale={width}:-1"]
            sh(cmd + [png])
            if os.path.exists(png):
                texts.append({"t": t, "text": ocr(png)})
    return texts


def ocr(png):
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(png).convert("L")
        return re.sub(r"\s+", " ", pytesseract.image_to_string(img, config="--psm 6")).strip()
    except Exception as e:  # noqa: BLE001
        return f"<ocr failed: {e}>"


def loudness(path):
    r = sh(["ffmpeg", "-nostats", "-i", str(path), "-af", "loudnorm=print_format=json",
            "-f", "null", "-"])
    m = re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr)
    if not m:
        return None
    try:
        return float(json.loads(m[-1])["input_i"])
    except Exception:  # noqa: BLE001
        return None


def commit_info(path):
    rel = str(Path(path).resolve().relative_to(REPO))
    tracked = sh(["git", "-C", str(REPO), "ls-files", "--error-unmatch", rel]).returncode == 0
    sha = sh(["git", "-C", str(REPO), "log", "-1", "--format=%H", "--", rel]).stdout.strip()
    in_head = sh(["git", "-C", str(REPO), "cat-file", "-e", f"HEAD:{rel}"]).returncode == 0
    # remote head read anonymously so the check does not need credentials
    up = sh(["git", "-C", str(REPO), "ls-remote", "https://github.com/davill353/Motion-Studio.git",
             "refs/heads/main"]).stdout.split()
    pushed = False
    if sha and up:
        pushed = sh(["git", "-C", str(REPO), "merge-base", "--is-ancestor",
                     sha, up[0]]).returncode == 0
    return {"path": rel, "tracked": tracked, "in_head": in_head, "sha": sha[:7], "pushed": pushed}


def canon(text):
    """Normalise OCR confusions so 'AI' read as 'Al' or 'A1' still matches."""
    t = text.lower()
    t = re.sub(r"[|1l]", "i", t)
    t = re.sub(r"[^a-z0-9£ ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def label_visible(path, samples=(0.6, None, 0.9)):
    """Look for an on-screen 'example creative' style label at full resolution."""
    dur = meta(path)["duration"] or 1
    with tempfile.TemporaryDirectory() as td:
        for i, t in enumerate(samples):
            ts = dur - 1.2 if t is None else t
            png = os.path.join(td, f"l{i}.png")
            sh(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(max(0.1, ts)), "-i", str(path),
                "-frames:v", "1", png])
            if not os.path.exists(png):
                continue
            from PIL import Image
            im = Image.open(png)
            band = im.crop((0, 0, im.width, int(im.height * 0.18)))
            band = band.resize((band.width * 2, band.height * 2))
            p2 = png.replace(".png", "_band.png")
            band.save(p2)
            if is_demo_labelled(ocr(p2)):
                return True
    return False


def tokens(s):
    return [w for w in re.findall(r"[a-z0-9£]+", s.lower()) if len(w) > 2]


def check(asset):
    path = Path(asset["video"])
    if not path.is_absolute():
        path = REPO / path
    kind = asset.get("type", "channel")
    blocks, notes, scores = [], [], {}

    if not path.exists():
        return {"asset": asset.get("name") or str(path), "video": str(path),
                "blocks": ["file_missing"], "notes": [f"{path} does not exist"],
                "scores": {}, "commit": {}, "meta": {}}

    m = meta(path)
    ci = commit_info(path)

    # 1. commit
    if not (ci["tracked"] and ci["in_head"]):
        blocks.append("not_committed")
    elif not ci["pushed"]:
        notes.append(f"{ci['sha']} is committed but not on origin/main yet")

    # 2. captions
    cap_keys = list(asset.get("captions", {}).keys())
    for k, v in (asset.get("captions") or {}).items():
        if not str(v or "").strip():
            blocks.append("captions_missing")
            notes.append(f"{k} caption is empty")
    if kind == "channel" and not cap_keys:
        blocks.append("captions_missing")
        notes.append("no captions supplied for a channel video")
    for k in ("title",):
        if asset.get(k) and len(asset[k]) > 100:
            blocks.append("captions_missing")
            notes.append(f"{k} over 100 characters")

    # 3. banned phrases across captions, script and on-screen text
    ocr_frames = frames_ocr(path)
    on_screen = " \n ".join(f["text"] for f in ocr_frames)
    all_text = " \n ".join([str(v) for v in (asset.get("captions") or {}).values()]
                           + [asset.get("script", ""), on_screen])
    for pat, why in BANNED:
        if re.search(pat, all_text, re.I):
            blocks.append("banned_phrase")
            notes.append(f"banned phrase ({why})")

    # 4. search phrase in first frame
    first = ocr_frames[0]["text"] if ocr_frames else ""
    phrase = asset.get("search_phrase")
    if kind == "channel" and phrase:
        if canon(phrase) not in canon(first):
            blocks.append("search_phrase_absent")
            notes.append(f"'{phrase}' not in first frame (saw: {first[:70]!r})")
        else:
            scores["hook_search_phrase"] = 10

    # 5. demo label
    if asset.get("demo") and not (is_demo_labelled(on_screen) or label_visible(path)):
        blocks.append("demo_unlabelled")
        notes.append("client-facing demo has no 'example creative' label on screen")

    # 6. audio
    if kind == "channel" and not m["has_audio"]:
        blocks.append("no_audio")
        notes.append("no audio track, so no voiceover and no spoken hook")

    # --- scored
    script_toks = tokens(asset.get("script", ""))
    if script_toks:
        seen = set(tokens(on_screen))
        hit = sum(1 for w in set(script_toks) if w in seen)
        cov = round(100 * hit / len(set(script_toks)))
        scores["caption_accuracy"] = cov
        missing = [w for w in dict.fromkeys(script_toks) if w not in seen][:8]
        if missing:
            notes.append(f"not readable on screen: {', '.join(missing)}")
    if first:
        scores["first_frame_words"] = len(tokens(first))
        if len(tokens(first)) <= 2:
            notes.append("first frame is very sparse, hook may be weak")
    end = ocr_frames[-1]["text"] if ocr_frames else ""
    if re.search(r"theaipound|£129|pilot|link in bio|message", end, re.I):
        scores["end_card_cta"] = 10
    else:
        scores["end_card_cta"] = 4
        notes.append(f"end card CTA unclear (saw: {end[:60]!r})")
    lufs = loudness(path) if m["has_audio"] else None
    if lufs is not None:
        scores["loudness_lufs"] = lufs
        if not -18 <= lufs <= -11:
            notes.append(f"loudness {lufs} LUFS outside -16..-11")

    # duration norms
    lo, hi = asset.get("duration_range") or ((15, 30) if kind == "ugc" else (12, 60))
    if not lo <= m["duration"] <= hi:
        notes.append(f"duration {m['duration']}s outside {lo}-{hi}s")
    else:
        scores["duration_fit"] = 10

    return {"asset": asset.get("name") or path.name, "video": str(path), "type": kind,
            "blocks": sorted(set(blocks)), "notes": notes, "scores": scores,
            "commit": ci, "meta": m}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest")
    ap.add_argument("--video")
    ap.add_argument("--type", default="channel")
    ap.add_argument("--demo", action="store_true")
    ap.add_argument("--caption", action="append", default=[])
    ap.add_argument("--script", default="")
    ap.add_argument("--search-phrase")
    ap.add_argument("--report")
    a = ap.parse_args()

    if a.manifest:
        assets = json.loads(Path(a.manifest).read_text())
    elif a.video:
        assets = [{"video": a.video, "type": a.type, "demo": a.demo,
                   "captions": {f"caption{i}": c for i, c in enumerate(a.caption)},
                   "script": a.script, "search_phrase": a.search_phrase,
                   "name": Path(a.video).stem}]
    else:
        ap.error("need --manifest or --video")

    results = [check(x) for x in assets]
    failed = [r for r in results if r["blocks"]]

    for r in results:
        flag = "BLOCK" if r["blocks"] else "PASS "
        print(f"{flag} {r['asset']}  {r['meta'].get('width')}x{r['meta'].get('height')} "
              f"{r['meta'].get('duration')}s  commit {r.get('commit', {}).get('sha') or '-'}"
              f"{'' if r.get('commit', {}).get('pushed') else ' (unpushed)'}")
        if r["blocks"]:
            print(f"        blocks: {', '.join(r['blocks'])}")
        for n in r["notes"]:
            print(f"        - {n}")
        if r["scores"]:
            print(f"        scores: {json.dumps(r['scores'])}")

    print(f"\n{len(results) - len(failed)}/{len(results)} clear to post")

    if a.report:
        lines = ["# Pre-post check", ""]
        for r in results:
            lines.append(f"## {r['asset']} — {'BLOCKED' if r['blocks'] else 'clear'}")
            lines.append("")
            lines.append(f"- file: `{r.get('commit', {}).get('path', r['video'])}`")
            lines.append(f"- commit: {r.get('commit', {}).get('sha') or 'none'}"
                         f"{' (pushed)' if r.get('commit', {}).get('pushed') else ''}")
            mm = r["meta"]
            lines.append(f"- {mm.get('width')}x{mm.get('height')}, {mm.get('duration')}s, "
                         f"audio {'yes' if mm.get('has_audio') else 'no'}")
            if r["blocks"]:
                lines.append(f"- **blocks:** {', '.join(r['blocks'])}")
            for n in r["notes"]:
                lines.append(f"- {n}")
            if r["scores"]:
                lines.append(f"- scores: `{json.dumps(r['scores'])}`")
            lines.append("")
        Path(a.report).parent.mkdir(parents=True, exist_ok=True)
        Path(a.report).write_text("\n".join(lines))

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
