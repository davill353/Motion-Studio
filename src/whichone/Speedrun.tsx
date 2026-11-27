import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "ANY% INBOX ZERO": speedrun-stream parody. Run 1 = the salon owner, run 2 = The AI Pound (world record). Salon clips.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/two-salons/A.mp4", B = "whichone/two-salons/B.mp4";
const SR = (f: string) => staticFile(`whichone/speedrun/${f}`);
const SFX = (f: string) => staticFile(`whichone/sfx/${f}`);
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const BAND_TOP = 520, BAND_H = 608;
export const SPEEDRUN_SECONDS = 34;

const SPLITS = ["Prices ×12", "Bookings ×15", "Opening times ×9", "Parking ×6", "Aftercare ×8"];
const COUNTS = [12, 27, 36, 42, 50];
const RUN1 = [3500, 6761, 9065, 10964, 13632]; // seconds (0:58:20 … 3:47:12)
const RUN2 = [11.2, 25.8, 33.9, 39.6, 47.3];
const R1 = [3.8, 14.2], R2 = [17.2, 22.4];

const fmtLong = (x: number) => { const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), sec = Math.floor(x % 60); return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`; };
const fmtShort = (x: number) => { const d = Math.round(x * 10); return `0:${String(Math.floor(d / 10)).padStart(2, "0")}.${d % 10}`; };

const runTime = (t: number, run: 1 | 2) => {
  const [a, b] = run === 1 ? R1 : R2; const total = run === 1 ? RUN1[4] : RUN2[4];
  const p = interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return total * (run === 1 ? Math.pow(p, 1.15) : p);
};

const Splits: React.FC<{ run: 1 | 2; t: number }> = ({ run, t }) => {
  const cur = runTime(t, run); const times = run === 1 ? RUN1 : RUN2;
  return (
    <div style={{ position: "absolute", top: BAND_TOP + BAND_H + 24, left: 50, right: 50, background: "rgba(8,10,20,0.92)", border: "3px solid #2c3550", borderRadius: 14, padding: "10px 22px", fontFamily: MONO }}>
      {SPLITS.map((name, i) => {
        const done = cur >= times[i];
        const active = !done && (i === 0 || cur >= times[i - 1]);
        const colour = !done ? "#8a93a8" : run === 2 ? "#ffd23a" : "#ff6b5b";
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 800, padding: "5px 6px", color: active ? "#fff" : colour,
            background: active ? "rgba(70,110,255,0.35)" : "transparent", borderRadius: 6 }}>
            <span>{name}</span><span>{done ? (run === 1 ? fmtLong(times[i]) : fmtShort(times[i])) : "-"}</span>
          </div>
        );
      })}
    </div>
  );
};

const Timer: React.FC<{ run: 1 | 2; t: number }> = ({ run, t }) => {
  const x = runTime(t, run); const done = x >= (run === 1 ? RUN1[4] : RUN2[4]);
  const colour = run === 2 ? (done ? "#ffd23a" : "#4cff8a") : done ? "#ff6b5b" : "#4cff8a";
  return (
    <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: colour, textShadow: `0 0 30px ${colour}66`, letterSpacing: -4 }}>{run === 1 ? fmtLong(x) : fmtShort(x)}</div>
    </div>
  );
};

const Counter: React.FC<{ run: 1 | 2; t: number }> = ({ run, t }) => {
  const x = runTime(t, run); const times = run === 1 ? RUN1 : RUN2;
  let n = 0; for (let i = 0; i < 5; i++) { const start = i ? times[i - 1] : 0; if (x >= start) n = Math.round((i ? COUNTS[i - 1] : 0) + (COUNTS[i] - (i ? COUNTS[i - 1] : 0)) * Math.min(1, (x - start) / (times[i] - start))); }
  return <div style={{ position: "absolute", top: BAND_TOP + 20, left: 24, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: "#fff", background: "rgba(0,0,0,0.65)", padding: "8px 16px", borderRadius: 10 }}>
    💬 {n}/50 {run === 2 && n > 0 ? "✓" : ""}</div>;
};

const Chat: React.FC<{ msgs: string[] }> = ({ msgs }) => {
  const frame = useCurrentFrame();
  const shown = msgs.slice(0, Math.min(msgs.length, Math.floor(frame / 6) + 1)).slice(-6);
  const names = ["inboxgoblin", "salonqueen", "dm_slayer", "chef_dan", "nailz4days", "pt_mike", "builderbob"];
  return (
    <div style={{ position: "absolute", top: BAND_TOP + 90, right: 20, width: 380, display: "flex", flexDirection: "column", gap: 8 }}>
      {shown.map((m, i) => (
        <div key={i} style={{ background: "rgba(14,14,24,0.85)", borderRadius: 10, padding: "8px 12px", fontFamily: P.font, fontSize: 24, color: "#fff" }}>
          <b style={{ color: ["#ff6bd6", "#6bd0ff", "#ffd23a", "#7dff6b"][i % 4] }}>{names[Math.floor(random(m) * names.length)]}:</b> {m}</div>
      ))}
    </div>
  );
};

const Stamp: React.FC<{ text: string; colour: string; sub?: string }> = ({ text, colour, sub }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = interpolate(spring({ frame, fps, config: { damping: 9, stiffness: 260 } }), [0, 1], [2.4, 1]);
  return (
    <div style={{ position: "absolute", top: BAND_TOP + 180, left: 0, right: 0, textAlign: "center", transform: `scale(${sc}) rotate(-5deg)` }}>
      <div style={{ display: "inline-block", fontFamily: P.font, fontWeight: 900, fontSize: 96, color: colour, border: `10px solid ${colour}`, padding: "10px 30px", background: "rgba(0,0,0,0.6)" }}>{text}</div>
      {sub && <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: "#fff", marginTop: 14 }}>{sub}</div>}
    </div>
  );
};

const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  return <>{Array.from({ length: 70 }).map((_, i) => {
    const x = random(`cx${i}`) * 1080, sp = 6 + random(`cs${i}`) * 10, y = -40 + frame * sp - random(`cy${i}`) * 400;
    return <div key={i} style={{ position: "absolute", left: x + Math.sin(frame / 5 + i) * 20, top: y, width: 16, height: 26, background: ["#ffd23a", P.mint, "#ff6bd6", "#6bd0ff"][i % 4], transform: `rotate(${frame * 8 + i * 30}deg)` }} />;
  })}</>;
};

const Board: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const row = (i: number) => spring({ frame: frame - 8 - i * 10, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: "#0a0d1a", alignItems: "center", paddingTop: 380, fontFamily: MONO }}>
      <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 70, color: "#fff" }}>🏆 LEADERBOARD</div>
      <div style={{ fontSize: 34, color: "#8a93a8", marginTop: 6 }}>Any% Inbox Zero · 50 messages</div>
      {[["1", "The AI Pound", "0:47.3", "#ffd23a", "WR"], ["2", "Salon owner", "3:47:12", "#c9ced9", ""]].map(([pos, name, time, col, tag], i) => (
        <div key={i} style={{ marginTop: i ? 20 : 60, width: 920, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.06)",
          border: `3px solid ${col}`, borderRadius: 16, padding: "22px 30px", fontSize: 46, fontWeight: 800, color: col, transform: `translateX(${(1 - row(i)) * 700}px)` }}>
          <span>{pos}. {name} {tag && <span style={{ fontSize: 30, background: col, color: "#000", padding: "2px 10px", borderRadius: 6, marginLeft: 8 }}>{tag}</span>}</span><span>{time}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 26, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 430, color: "#fff", fontFamily: P.font }}>
      <div style={{ fontSize: 110 }}>🏆</div>
      <div style={{ fontWeight: 900, fontSize: 72, lineHeight: 1.1, marginTop: 10 }}>Want the world record<br /><span style={{ color: "#ffd23a" }}>for your inbox?</span></div>
      <Img src={staticFile(P.logo)} style={{ width: 160, height: 160, borderRadius: 36, marginTop: 44, transform: `scale(${logo})` }} />
      <div style={{ fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 36, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>A PARODY · DEMO TIMES · AI-GENERATED SCENES</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; src: string; v?: number; dur?: number; loop?: boolean }> = ({ at, src, v = 1, dur = 5, loop }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={src} volume={v} loop={loop} /></Sequence>
);

export const Speedrun: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const run: 1 | 2 = t < 15.4 ? 1 : 2;
  const inRun = t >= 3.8 && t < 26;
  return (
    <AbsoluteFill style={{ background: "#0a0d1a" }}>
      {/* splash */}
      <Sequence durationInFrames={s(3.8)}><AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "radial-gradient(circle, #1d2a6b, #0a0d1a 70%)" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: "#8a93a8", letterSpacing: 6 }}>SPEEDRUN</div>
        <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 118, color: "#fff", textAlign: "center", lineHeight: 1.0, marginTop: 10 }}>ANY%<br /><span style={{ color: "#4cff8a" }}>INBOX ZERO</span></div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: "#ffd23a", marginTop: 26 }}>50 messages · no resets</div>
      </AbsoluteFill></Sequence>
      {inRun && <>
        <div style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: "#fff" }}>
          RUNNER: <span style={{ color: run === 1 ? "#ff9a8a" : P.mint }}>{run === 1 ? "SALON OWNER" : "THE AI POUND"}</span></div>
        <Timer run={run} t={t} />
        <Splits run={run} t={t} />
      </>}
      <Sequence from={s(3.8)} durationInFrames={s(11.6)}>
        <OffthreadVideo src={staticFile(A)} startFrom={0} playbackRate={3.4} muted style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: BAND_TOP + 20, right: 24, fontFamily: MONO, fontWeight: 800, fontSize: 34, color: "#fff", background: "rgba(0,0,0,0.65)", padding: "6px 14px", borderRadius: 10 }}>▶▶ ×800</div>
      </Sequence>
      <Sequence from={s(15.4)} durationInFrames={s(10.6)}>
        <OffthreadVideo src={staticFile(B)} startFrom={s(20.5)} muted style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} />
        <Sequence from={s(1.8)} durationInFrames={s(8.8)}><Chat msgs={["here we go", "AI% lets gooo", "its not even trying", "PRICES DONE", "bookings in 14s??", "she's drinking TEA", "GG", "WR PACE", "WR WR WR", "🏆🏆🏆", "inbox zero speedrun any%", "she didnt even look"]} /></Sequence>
      </Sequence>
      {inRun && <Counter run={run} t={t} />}
      <Sequence from={s(14.2)} durationInFrames={s(1.2)}><Stamp text="FINISHED" colour="#ff6b5b" sub="3:47:12" /></Sequence>
      <Sequence from={s(22.4)} durationInFrames={s(3.6)}><Confetti /><Stamp text="WORLD RECORD" colour="#ffd23a" sub="0:47.3" /></Sequence>
      <Sequence from={s(26)} durationInFrames={s(4)}><Board /></Sequence>
      <Sequence from={s(30)}><End /></Sequence>

      {/* sound */}
      <Snd at={0} src={SFX("start.wav")} v={0.6} dur={0.6} /><Snd at={0.2} src={SR("s1.wav")} />
      <Snd at={3.8} src={SFX("tension.wav")} v={0.25} dur={10.4} loop />
      <Snd at={4.0} src={SR("s2.wav")} /><Snd at={8.0} src={SR("s3.wav")} /><Snd at={12.2} src={SR("s4.wav")} /><Snd at={14.2} src={SFX("gameover.wav")} v={0.4} dur={1.5} />
      <Snd at={15.6} src={SR("s5.wav")} /><Snd at={17.2} src={SFX("victory.wav")} v={0.25} dur={9} /><Snd at={17.3} src={SR("s6.wav")} />
      {RUN2.map((x, i) => <Snd key={i} at={17.2 + (x / 47.3) * 5.2} src={SFX("coin.wav")} v={0.45} dur={0.5} />)}
      <Snd at={22.4} src={SFX("complete.wav")} v={0.55} dur={1.6} /><Snd at={22.5} src={SR("s7.wav")} />
      <Snd at={26} src={SFX("powerup.wav")} v={0.35} dur={1.2} /><Snd at={30.3} src={SR("n1.wav")} />
    </AbsoluteFill>
  );
};
