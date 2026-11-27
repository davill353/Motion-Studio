"""Upbeat pop loop with sleigh bells for "Your Inbox, Unwrapped" (public/whichone/unwrapped/beat.wav)."""
import numpy as np, wave, pathlib
SR = 44100; BPM = 118; BEAT = 60 / BPM; DUR = 42
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "unwrapped" / "beat.wav"
rng = np.random.default_rng(9)
N = lambda n: 440 * 2 ** ((n - 69) / 12)
buf = np.zeros(int(SR * DUR))
def place(x, at, v=1.0):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += v * x[:n]
def t(d): return np.arange(int(SR * d)) / SR
def kick():
    tt = t(0.3); f = 50 * (1 + 3 * np.exp(-tt * 40)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 12)
def clap():
    tt = t(0.2); return rng.uniform(-1, 1, len(tt)) * np.exp(-tt * 25)
def bell():
    tt = t(0.12); return (rng.uniform(-1, 1, len(tt)) * 0.4 + np.sin(2 * np.pi * 6200 * tt) * 0.5 + np.sin(2 * np.pi * 8100 * tt) * 0.3) * np.exp(-tt * 45)
def pluck(f, d=0.4):
    tt = t(d); return (np.sign(np.sin(2 * np.pi * f * tt)) * 0.3 + np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 9)
def bass(f, d):
    tt = t(d); return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.01) * np.exp(-tt * 2.5)
chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
bars = int(DUR / (4 * BEAT)) + 1
for b in range(bars):
    t0 = b * 4 * BEAT; ch = chords[b % 4]
    for k in range(4):
        place(kick(), t0 + k * BEAT, 0.9)
        if k in (1, 3): place(clap(), t0 + k * BEAT, 0.35)
    for k in range(8):
        place(bass(N(ch[0] - 24), BEAT / 2 * 0.95), t0 + k * BEAT / 2, 0.45)
        place(pluck(N(ch[k % 3] + 12), 0.3), t0 + k * BEAT / 2 + (BEAT / 4 if k % 2 else 0), 0.22)
    for k in range(16): place(bell(), t0 + k * BEAT / 4, 0.18 if k % 2 else 0.28)
fade = np.ones_like(buf); n = int(SR * 2); fade[-n:] = np.linspace(1, 0, n)
x = buf * fade; x = x / np.max(np.abs(x)) * 0.85
with wave.open(str(OUT), "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
print("ok")
