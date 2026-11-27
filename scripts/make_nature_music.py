"""Nature-documentary music + birdsong for "INBOX ZERO" (public/whichone/nature/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "nature"
rng = np.random.default_rng(5)
def save(name, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
N = lambda n: 440 * 2 ** ((n - 69) / 12)
def pluck(f, d=1.2):  # Karplus-Strong
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(SR * d))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = 0.5 * (buf[i % n] + buf[(i + 1) % n]) * 0.996
    return out
def flute(f, d):
    t = np.arange(int(SR * d)) / SR; vib = 1 + 0.006 * np.sin(2 * np.pi * 5 * t)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    env = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.15)
    return env * (np.sin(ph) + 0.12 * np.sin(2 * ph)) + 0.02 * rng.uniform(-1, 1, len(t)) * env
def place(buf, x, at, v=1.0):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += v * x[:n]
def reverb(x):
    y = x.copy()
    for d, g in ((0.029, 0.4), (0.053, 0.3), (0.089, 0.22), (0.14, 0.15), (0.21, 0.1)):
        i = int(d * SR); y[i:] += g * x[:-i]
    return y
# curious section 18 s: staccato plucks walking up/down (D dorian), sparse flute
cur = np.zeros(int(SR * 18)); step = 0.3
walk = [50, 57, 53, 57, 52, 57, 53, 55] * 8
for k, n in enumerate(walk[:int(18 / step)]):
    place(cur, pluck(N(n + 12), 0.6), k * step, 0.6 if k % 2 else 0.9)
for n, at, d in [(74, 1.2, 0.5), (77, 1.8, 0.5), (76, 2.4, 1.0), (72, 4.8, 0.5), (74, 5.4, 1.2), (81, 8.4, 0.4), (79, 8.9, 0.4), (77, 9.4, 1.2), (74, 12.0, 0.5), (76, 12.6, 0.5), (72, 13.2, 1.5)]:
    place(cur, flute(N(n), d), at, 0.35)
save("curious", reverb(cur), 0.6)
# calm section 16 s: warm major plucks (G major arpeggio) + long flute
calm = np.zeros(int(SR * 16))
arp = [55, 59, 62, 67, 62, 59] ; chords = [0, 0, 5, 5, 7, 7, 0, 0]
for c in range(8):
    for k, n in enumerate(arp): place(calm, pluck(N(n + chords[c]), 1.0), c * 2 + k * 0.33, 0.55)
for n, at, d in [(79, 0.5, 1.5), (83, 2.2, 1.2), (81, 3.6, 2.0), (79, 6.0, 1.5), (76, 7.6, 1.2), (78, 9.0, 1.0), (79, 10.2, 3.0)]:
    place(calm, flute(N(n), d), at, 0.35)
save("calm", reverb(calm), 0.6)
# birdsong: chirps scattered over 12 s
bird = np.zeros(int(SR * 12))
for k in range(26):
    at = rng.uniform(0, 11.5); f0 = rng.uniform(2800, 4200); d = rng.uniform(0.06, 0.14)
    t = np.arange(int(SR * d)) / SR; f = f0 * (1 + 0.35 * np.sin(np.pi * t / d)); ph = 2 * np.pi * np.cumsum(f) / SR
    chirp = np.sin(ph) * np.sin(np.pi * t / d) ** 2
    for r in range(rng.integers(1, 4)): place(bird, chirp, at + r * (d + 0.04), 0.5)
save("birds", bird, 0.35)
print("ok")
