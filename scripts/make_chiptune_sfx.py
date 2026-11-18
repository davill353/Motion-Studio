"""Generate 8-bit sound effects + two short chiptune loops for the Boss Level video (public/whichone/sfx/)."""
import numpy as np, wave, pathlib
SR = 44100
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "whichone" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
def sq(f, d, duty=0.5, vol=0.3):
    t = np.arange(int(SR * d)) / SR
    return vol * np.where((t * f) % 1 < duty, 1.0, -1.0)
def env(x, a=0.005, r=0.08):
    n = len(x); e = np.ones(n); ai = int(a * SR); ri = min(n, int(r * SR))
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return x * e
def sweep(f0, f1, d, vol=0.3, duty=0.5):
    t = np.arange(int(SR * d)) / SR
    f = np.linspace(f0, f1, len(t)); ph = np.cumsum(f) / SR
    return vol * np.where(ph % 1 < duty, 1.0, -1.0)
def noise(d, vol=0.25):
    return vol * np.random.uniform(-1, 1, int(SR * d))
def notes(seq, step, vol=0.22, duty=0.5):
    return np.concatenate([env(sq(f, step * l, duty, vol), r=0.03) if f else np.zeros(int(SR * step * l)) for f, l in seq])
def save(name, x):
    x = np.clip(x, -1, 1); d = (x * 32767).astype(np.int16)
    with wave.open(str(OUT / f"{name}.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
N = lambda n: 440 * 2 ** ((n - 69) / 12)  # midi -> Hz
np.random.seed(3)
save("start", notes([(N(76), 1), (N(83), 2)], 0.08))
save("hit", env(sweep(900, 150, 0.18, 0.35) + np.pad(env(noise(0.12, 0.2), r=0.1), (0, int(SR * 0.18) - int(SR * 0.12)))))
save("crit", env(np.concatenate([sweep(1200, 80, 0.35, 0.4, 0.25)]) + np.pad(env(noise(0.3, 0.3), r=0.2), (0, int(SR * 0.35) - int(SR * 0.3)))))
save("alarm", np.concatenate([notes([(N(84), 1), (0, 1)], 0.12, 0.18)] * 6))
save("boss", np.concatenate([env(sweep(60, 220, 0.6, 0.35, 0.3)), notes([(N(40), 2), (N(39), 2), (N(38), 4)], 0.12, 0.3, 0.3)]))
save("gameover", notes([(N(67), 2), (N(63), 2), (N(60), 2), (N(55), 6)], 0.12, 0.25))
save("coin", notes([(N(83), 1), (N(88), 4)], 0.07, 0.25, 0.25))
save("powerup", np.concatenate([notes([(N(n), 1) for n in [60, 64, 67, 72, 76, 79, 84, 88]], 0.05, 0.25, 0.25), env(sweep(400, 1600, 0.5, 0.2, 0.25))]))
save("tick", notes([(N(91), 1)], 0.05, 0.2, 0.25))
save("complete", notes([(N(72), 1), (N(76), 1), (N(79), 1), (N(84), 3), (N(79), 1), (N(84), 6)], 0.11, 0.25, 0.25))
# loops (8 bars each, 150 bpm, 8th notes)
step = 60 / 150 / 2
bass = [45, 45, 57, 45, 48, 48, 60, 48, 43, 43, 55, 43, 44, 44, 56, 44]
lead = [69, 0, 72, 0, 76, 75, 0, 72, 67, 0, 71, 0, 74, 73, 0, 71]
t = np.concatenate([notes([(N(b), 1)], step, 0.18, 0.5) + np.pad(notes([(N(l) if l else 0, 1)], step, 0.09, 0.125), (0, 0)) for b, l in zip(bass * 4, lead * 4)])
drum = np.zeros_like(t); k = int(SR * step)
for i in range(0, len(bass) * 4, 2): s = i * k; drum[s:s + 1500] += env(noise(1500 / SR, 0.12), r=0.03)[:len(drum[s:s + 1500])]
save("tension", t + drum)
vb = [48, 48, 55, 55, 53, 53, 55, 55]; vl = [72, 76, 79, 76, 77, 81, 79, 76]
save("victory", np.concatenate([notes([(N(b), 1)], step, 0.16) + notes([(N(l), 1)], step, 0.1, 0.25) for b, l in zip(vb * 6, vl * 6)]))
print(sorted(p.name for p in OUT.iterdir()))
