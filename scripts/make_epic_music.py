"""Epic score for "THE BUILDER: an epic" (public/whichone/epic/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "epic"
rng = np.random.default_rng(21)
def save(name, x, peak=0.85):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
N = lambda n: 440 * 2 ** ((n - 69) / 12)
def place(buf, x, at, v=1.0):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += v * x[:n]
def taiko(v=1.0):
    t = np.arange(int(SR * 0.9)) / SR; f = 48 * (1 + 1.2 * np.exp(-t * 25))
    return v * (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) + 0.3 * rng.uniform(-1, 1, len(t)) * np.exp(-t * 30))
def choir(notes, d, swell=1.5):
    t = np.arange(int(SR * d)) / SR; out = np.zeros_like(t)
    env = np.minimum(1, t / swell) * np.minimum(1, (d - t) / 1.0)
    for n in notes:
        for det in (-0.004, 0, 0.004):
            f = N(n) * (1 + det); ph = 2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 5 * t)
            out += (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph) + 0.12 * np.sin(4 * ph)) / 3
    return out * env
def reverb(x):
    y = x.copy()
    for d, g in ((0.037, 0.45), (0.061, 0.35), (0.097, 0.27), (0.15, 0.2), (0.23, 0.14), (0.34, 0.09)):
        i = int(d * SR); y[i:] += g * x[:-i]
    return y
# dark section 18 s: D minor choir + slow taiko, building
dark = np.zeros(int(SR * 18))
place(dark, choir([50, 57, 62, 65], 6), 0, 0.5); place(dark, choir([46, 53, 58, 62], 6), 6, 0.55); place(dark, choir([48, 55, 60, 64], 6), 12, 0.6)
for k in range(18):
    at = k * 1.0
    place(dark, taiko(1.0 if k % 2 == 0 else 0.6), at, 0.8)
    if k >= 10: place(dark, taiko(0.5), at + 0.5, 0.6)
save("dark", reverb(dark), 0.8)
# heroic section 14 s: D major brass swell + driving taiko
hero = np.zeros(int(SR * 14))
place(hero, choir([50, 54, 57, 62, 66], 4.5, 0.6), 0, 0.6); place(hero, choir([55, 59, 62, 67, 71], 4.5, 0.6), 4.5, 0.6); place(hero, choir([50, 57, 62, 66, 69, 74], 5, 0.8), 9, 0.7)
for k in range(28): place(hero, taiko(1.0 if k % 4 == 0 else 0.55), k * 0.5, 0.7)
save("hero", reverb(hero), 0.85)
# single big hit
t = np.arange(int(SR * 2.5)) / SR
save("boom", reverb(np.tanh(3 * np.sin(2 * np.pi * 38 * t) * np.exp(-t * 2)) + 0.3 * rng.uniform(-1, 1, len(t)) * np.exp(-t * 10)), 0.95)
print("ok")
