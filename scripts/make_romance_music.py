"""Soft piano + strings for "THE ORDER BOOK: a love story" (public/whichone/romance/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "romance"
def save(name, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    st = np.stack([x, np.roll(x, 300)], 1)  # tiny stereo width
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
N = lambda n: 440 * 2 ** ((n - 69) / 12)
def piano(f, d=2.5, v=1.0):
    t = np.arange(int(SR * d)) / SR
    return v * sum(a * np.sin(2 * np.pi * f * k * t) for k, a in ((1, 1), (2, 0.4), (3, 0.15), (4, 0.06))) * np.exp(-t * 2.2) * (1 - np.exp(-t * 300))
def place(buf, x, at):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n]
def reverb(x):
    y = x.copy()
    for d, g in ((0.031, 0.5), (0.047, 0.4), (0.071, 0.3), (0.113, 0.22), (0.17, 0.15), (0.26, 0.1)):
        i = int(d * SR); y[i:] += g * x[:-i]
    return y
# sad piano 16 s: Am F C G, arpeggiated, 1 chord per 2 s
sad = np.zeros(int(SR * 16))
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]] * 2
for c, ch in enumerate(chords):
    for k, n in enumerate(ch + [ch[2] + 12]): place(sad, piano(N(n), 2.5, 0.5 if k else 0.8), c * 2 + k * 0.33)
melody = [(76, 0), (74, 1), (72, 2), (71, 3.3), (72, 4), (69, 6), (67, 8), (69, 9), (72, 10), (71, 11.5), (67, 12), (72, 14)]
for n, at in melody: place(sad, piano(N(n), 2.0, 0.55), at)
save("piano_sad", reverb(sad), 0.6)
# strings swell 14 s: F G C Am C with long pads + piano sparkle on top
t = np.arange(int(SR * 14)) / SR; strings = np.zeros_like(t)
prog = [([53, 57, 60, 65, 69], 0, 3.5), ([55, 59, 62, 67, 71], 3.5, 3.5), ([48, 52, 55, 60, 64, 72], 7, 7)]
for notes, st, d in prog:
    i0, i1 = int(st * SR), int((st + d) * SR); tt = t[i0:i1] - st
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (d - tt) / 0.8 + 0.2)
    for n in notes:
        f = N(n); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt)
        ph = 2 * np.pi * f * np.cumsum(vib) / SR
        strings[i0:i1] += env * (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * 0.25
strings *= np.minimum(1, t / 2.0)
for n, at in [(72, 0.5), (76, 1.5), (79, 2.5), (77, 3.8), (79, 5), (83, 6), (84, 7.2), (88, 8.5), (91, 10)]: place(strings, piano(N(n), 2.5, 0.6), at)
save("strings", reverb(strings), 0.7)
# sparkle chime glissando
sp = np.zeros(int(SR * 2.5))
for k, n in enumerate([84, 88, 91, 96, 100, 103]): place(sp, piano(N(n), 1.5, 0.5), k * 0.07)
save("sparkle", reverb(sp), 0.6)
print("ok")
