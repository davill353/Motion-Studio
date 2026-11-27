"""90s answering-machine + VHS sounds for "The Receptionist from 1995" (public/whichone/retro/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "retro"
rng = np.random.default_rng(3)
def save(name, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def t(d): return np.arange(int(SR * d)) / SR
def place(buf, x, at, v=1.0):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += v * x[:n]
# UK double ring x2 (400+450 Hz, 0.4 on 0.2 off 0.4 on 2.0 off)
ring = np.zeros(int(SR * 3.0))
for st in (0.0, 0.6):
    tt = t(0.4); place(ring, (np.sin(2 * np.pi * 400 * tt) + np.sin(2 * np.pi * 450 * tt)) * np.sign(np.sin(2 * np.pi * 25 * tt)) * 0.5, st)
save("ring", ring, 0.6)
tt = t(0.08); save("click", rng.uniform(-1, 1, len(tt)) * np.exp(-tt * 80), 0.7)
tt = t(0.7); save("beep", np.sin(2 * np.pi * 1000 * tt) * np.minimum(1, (0.7 - tt) / 0.01), 0.55)
tt = t(5.0); whir = 0.3 * np.sin(2 * np.pi * 60 * tt) + 0.2 * rng.uniform(-1, 1, len(tt)); save("whir", whir, 0.12)
# VHS noise burst + rewind squeal
tt = t(0.6); save("static", rng.uniform(-1, 1, len(tt)) * np.minimum(1, (0.6 - tt) / 0.1), 0.5)
tt = t(1.2); f = 800 + 2500 * tt / 1.2; save("rewind", np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + 0.3 * rng.uniform(-1, 1, len(tt)), 0.5)
# 2026 notification chime
tt = t(0.6); save("chime", (np.sin(2 * np.pi * 1318 * tt) + 0.6 * np.sin(2 * np.pi * 1760 * tt * (tt > 0.08))) * np.exp(-tt * 7), 0.6)
# light 2026 bed: soft synth pad C major
tt = t(14); pad = sum(np.sin(2 * np.pi * f * tt) for f in (261.6, 329.6, 392.0, 493.9)) * np.minimum(1, tt / 1.5) * np.minimum(1, (14 - tt) / 1.5)
pad += 0.4 * np.sin(2 * np.pi * 130.8 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 2 * tt)))
save("bed2026", pad, 0.35)
# 1995 muzak bed: cheesy organ arpeggio
mz = np.zeros(int(SR * 26)); N = lambda n: 440 * 2 ** ((n - 69) / 12)
seq = [60, 64, 67, 72, 67, 64] * 40
for k, n in enumerate(seq):
    at = k * 0.25
    if at > 25.5: break
    tt = t(0.24); place(mz, (np.sin(2 * np.pi * N(n) * tt) + 0.5 * np.sin(4 * np.pi * N(n) * tt)) * np.exp(-tt * 6), at, 0.5)
save("muzak", mz, 0.3)
print("ok")
