"""Horror-trailer sound design for "THE DMs" (public/whichone/trailer/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "trailer"
rng = np.random.default_rng(7)
def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def t(d): return np.arange(int(SR * d)) / SR
def lp(x, a=0.02):  # one-pole low-pass
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
def fade(x, a=0.02, r=0.2):
    n = len(x); e = np.ones(n); ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai); e[-ri:] *= np.linspace(1, 0, ri); return x * e
# low drone, 12 s, slowly beating
tt = t(12); drone = sum(np.sin(2 * np.pi * f * tt) for f in (41, 41.7, 82.3)) + 0.3 * lp(rng.uniform(-1, 1, len(tt)), 0.01)
save("drone", fade(drone * (0.7 + 0.3 * np.sin(2 * np.pi * 0.15 * tt)), 1.5, 1.5), 0.6)
# BRAAAM: detuned saws + distortion, 2.5 s
tt = t(2.5); saw = lambda f: 2 * ((tt * f) % 1) - 1
br = sum(saw(f) for f in (55, 55.4, 54.6, 110.2, 27.5)); br = np.tanh(2.5 * lp(br, 0.06)); save("braam", fade(br, 0.01, 1.6), 0.95)
# heartbeat x2, 1.6 s
hb = np.zeros(int(SR * 1.6))
for st in (0.0, 0.28, 0.8, 1.08):
    tt = t(0.18); k = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 22); i = int(st * SR); hb[i:i + len(k)] += k
save("heartbeat", hb, 0.9)
# notification ping (clean) and dark ping (pitched down + echo)
tt = t(0.5); ping = (np.sin(2 * np.pi * 1318 * tt) + 0.5 * np.sin(2 * np.pi * 1975 * tt)) * np.exp(-tt * 9); save("ping", ping, 0.7)
tt = t(2.0); dp = (np.sin(2 * np.pi * 330 * tt) + 0.5 * np.sin(2 * np.pi * 494 * tt)) * np.exp(-tt * 3)
for d, g in ((0.25, 0.5), (0.5, 0.3), (0.75, 0.18)): i = int(d * SR); dp[i:] += g * dp[:len(dp) - i]
save("ping_dark", dp, 0.8)
# riser 3 s (noise sweep up)
tt = t(3); n = rng.uniform(-1, 1, len(tt)); out = np.zeros_like(n); acc = 0.0
for i, v in enumerate(n): a = 0.005 + 0.5 * (i / len(n)) ** 2; acc += a * (v - acc); out[i] = acc
save("riser", out * np.linspace(0.1, 1, len(tt)) ** 2, 0.8)
# whoosh-in to silence (reverse cymbal-ish) 1 s
tt = t(1.0); w = rng.uniform(-1, 1, len(tt)) * np.linspace(0, 1, len(tt)) ** 3; save("swell", w, 0.6)
# warm end pad 6 s
tt = t(6); pad = sum(np.sin(2 * np.pi * f * tt) for f in (261.6, 329.6, 392.0, 523.3)) * (1 - np.exp(-tt * 2)); save("pad", fade(pad, 0.5, 2.0), 0.4)
print("ok")
