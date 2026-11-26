"""Action-trailer sound design for "MISSION: LUNCH RUSH" (public/whichone/action/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "action"
rng = np.random.default_rng(11)
def save(name, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def t(d): return np.arange(int(SR * d)) / SR
def tom(f=70, d=0.35, v=1.0):
    tt = t(d); fr = f * (1 + 1.5 * np.exp(-tt * 30)); ph = np.cumsum(fr) / SR
    return v * np.sin(2 * np.pi * ph) * np.exp(-tt * 9) + 0.15 * v * rng.uniform(-1, 1, len(tt)) * np.exp(-tt * 40)
def place(buf, x, at):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n]
# tick-tock 4 s
tk = np.zeros(int(SR * 4))
for k in range(8): tt = t(0.03); place(tk, np.sin(2 * np.pi * (2400 if k % 2 == 0 else 1800) * tt) * np.exp(-tt * 200), k * 0.5)
save("tick", tk, 0.6)
# action drum loop, 120 bpm, 8 s: tom pattern + low pulse
dr = np.zeros(int(SR * 8)); beat = 0.5
pattern = [1, 0, 0.6, 0, 1, 0.5, 0.6, 0.4] * 2
for k, v in enumerate(pattern):
    if v: place(dr, tom(65 if k % 4 == 0 else 90, 0.35, v), k * beat / 2 * 2)
tt = t(8); pulse = 0.25 * np.sin(2 * np.pi * 55 * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 4 * tt)))
save("drums", dr + pulse, 0.85)
# fast drums for montage (double time) 6 s
df = np.zeros(int(SR * 6))
for k in range(24): place(df, tom(70 if k % 2 == 0 else 100, 0.25, 1 if k % 4 == 0 else 0.6), k * 0.25)
save("drums_fast", df, 0.9)
# impact hit
tt = t(1.8); hit = np.tanh(3 * (sum(np.sin(2 * np.pi * f * tt) for f in (40, 41, 80.5)) * np.exp(-tt * 2.5))) + 0.4 * rng.uniform(-1, 1, len(tt)) * np.exp(-tt * 12)
save("impact", hit, 0.95)
# whoosh 0.6 s
tt = t(0.6); n = rng.uniform(-1, 1, len(tt)); env = np.sin(np.pi * tt / 0.6) ** 2
y = np.zeros_like(n); acc = 0.0
for i, v in enumerate(n): a = 0.02 + 0.3 * env[i]; acc += a * (v - acc); y[i] = acc
save("whoosh", y * env, 0.7)
# record scratch 0.5 s
tt = t(0.5); f = 300 + 900 * np.abs(np.sin(2 * np.pi * 6 * tt)); ph = np.cumsum(f) / SR
save("scratch", np.sign(np.sin(2 * np.pi * ph)) * 0.5 * np.exp(-tt * 3) + 0.3 * rng.uniform(-1, 1, len(tt)) * np.exp(-tt * 6), 0.7)
# triumphant stinger: major chord swell + timpani
tt = t(5); chord = sum(np.sin(2 * np.pi * fr * tt) + 0.3 * np.sin(4 * np.pi * fr * tt) for fr in (130.8, 196.0, 261.6, 329.6, 392.0))
chord *= (1 - np.exp(-tt * 4)) * np.exp(-tt * 0.35); st = chord.copy(); place(st, tom(55, 0.8, 2.5), 0)
save("stinger", st, 0.85)
print("ok")
