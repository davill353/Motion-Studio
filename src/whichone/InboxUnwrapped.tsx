import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "YOUR 2026 INBOX, UNWRAPPED": year-in-review story slides (own design). Illustrative stats for a busy salon owner.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const U = (f: string) => staticFile(`whichone/unwrapped/${f}`);
const BIG = "'AntonF', 'Arial Black', sans-serif";
const fontFace = `@font-face { font-family: 'AntonF'; src: url('${staticFile("fonts/Anton.woff2")}') format('woff2'); }`;

type Slide = { at: number; end: number; bg: [string, string]; vo: string };
const SLIDES: Slide[] = [
  { at: 0, end: 2.4, bg: ["#16233b", "#3b1d6e"], vo: "u0" },
  { at: 2.4, end: 7.4, bg: ["#ff4f8b", "#ff9d5c"], vo: "u1" },
  { at: 7.4, end: 11.6, bg: ["#2b2bff", "#8a5cff"], vo: "u2" },
  { at: 11.6, end: 14.8, bg: ["#0f3d2e", "#1f8a5b"], vo: "u3" },
  { at: 14.8, end: 19.4, bg: ["#1a1a1a", "#c4161c"], vo: "u4" },
  { at: 19.4, end: 24.6, bg: ["#ffb800", "#ff6a00"], vo: "u5" },
  { at: 24.6, end: 28.2, bg: ["#3b0a5c", "#c13584"], vo: "u6" },
  { at: 28.2, end: 32.0, bg: ["#0b2e4a", "#2aa7d8"], vo: "u7" },
  { at: 32.0, end: 36.2, bg: ["#16233b", "#0f5e4a"], vo: "u8" },
  { at: 36.2, end: 40.2, bg: ["#7a0f1d", "#16233b"], vo: "u9" },
];
export const UNWRAPPED_SECONDS = 40.2;

const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 180 } });
  return <div style={{ transform: `scale(${sc})`, opacity: Math.min(1, sc * 1.5), ...style }}>{children}</div>;
};

const Count: React.FC<{ to: number; delay?: number; dur?: number; size?: number; colour?: string }> = ({ to, delay = 6, dur = 40, size = 260, colour = "#fff" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
  return <div style={{ fontFamily: BIG, fontSize: size, color: colour, lineHeight: 1, letterSpacing: 2 }}>{v.toLocaleString("en-GB")}</div>;
};

const Shapes: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const size = 260 + random(`sz${seed}${i}`) * 420;
        const x = random(`x${seed}${i}`) * 1080 - size / 2, y = random(`y${seed}${i}`) * 1920 - size / 2;
        const rot = frame * (0.4 + random(`r${seed}${i}`)) * (i % 2 ? 1 : -1);
        const kind = i % 3;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, transform: `rotate(${rot}deg) scale(${1 + 0.06 * Math.sin(frame / 12 + i)})`,
          borderRadius: kind === 0 ? "50%" : kind === 1 ? "38% 62% 55% 45% / 45% 40% 60% 55%" : 40, background: "rgba(255,255,255,0.10)", border: kind === 2 ? "14px solid rgba(255,255,255,0.12)" : "none" }} />;
      })}
    </>
  );
};

const Sparkle: React.FC = () => {
  const frame = useCurrentFrame();
  return <>{Array.from({ length: 30 }).map((_, i) => {
    const x = random(`sx${i}`) * 1080, y = (random(`sy${i}`) * 1920 + frame * (1.5 + random(`sv${i}`) * 2)) % 1920;
    return <div key={i} style={{ position: "absolute", left: x, top: y, width: 6, height: 6, borderRadius: 3, background: "#fff", opacity: 0.35 + 0.4 * Math.abs(Math.sin(frame / 10 + i)) }} />;
  })}</>;
};

const Label: React.FC<{ text: string; top?: number }> = ({ text, top = 470 }) => (
  <Pop style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
    <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 52, color: "#fff", lineHeight: 1.15 }}>{text}</div>
  </Pop>
);

const Gift: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const lid = interpolate(frame, [26, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inS = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", top: 640, left: 340, width: 400, height: 380, transform: `scale(${inS})` }}>
      <div style={{ position: "absolute", top: 120, left: 20, width: 360, height: 260, background: "#ff3b5c", borderRadius: 18 }} />
      <div style={{ position: "absolute", top: 120, left: 175, width: 50, height: 260, background: P.mint }} />
      <div style={{ position: "absolute", top: 70 - lid * 260, left: 0, width: 400, height: 70, background: "#ff5a76", borderRadius: 16, transform: `rotate(${-lid * 25}deg)` }}>
        <div style={{ position: "absolute", left: 175, width: 50, height: 70, background: P.mint }} /></div>
      {lid > 0.5 && <div style={{ position: "absolute", top: -120, left: 0, right: 0, textAlign: "center", fontSize: 120, opacity: lid }}>💬</div>}
    </div>
  );
};

const Top5: React.FC = () => {
  const items: [string, string][] = [["how much?", "1,207"], ["u open tmrw?", "844"], ["any space sat?", "613"], ["hello??", "498"], ["nvm", "214"]];
  return (
    <div style={{ position: "absolute", top: 610, left: 90, right: 90 }}>
      {items.map(([m, n], i) => (
        <Pop key={i} delay={10 + i * 9} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 22 }}>
          <div style={{ fontFamily: BIG, fontSize: 96, color: "#ffd23a", width: 70 }}>{i + 1}</div>
          <div style={{ flex: 1, fontFamily: P.font, fontWeight: 900, fontSize: 56, color: "#fff" }}>“{m}”</div>
          <div style={{ fontFamily: P.font, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.75)" }}>{n}×</div>
        </Pop>
      ))}
    </div>
  );
};

const Progress: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 120, left: 40, right: 40, display: "flex", gap: 8 }}>
    {SLIDES.map((sl, i) => {
      const p = interpolate(t, [sl.at, sl.end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.3)", overflow: "hidden" }}><div style={{ width: `${p * 100}%`, height: "100%", background: "#fff" }} /></div>;
    })}
  </div>
);

const SlideBody: React.FC<{ i: number }> = ({ i }) => {
  const C = { position: "absolute" as const, left: 0, right: 0, textAlign: "center" as const };
  switch (i) {
    case 0: return <><Gift /><Pop delay={4} style={{ ...C, top: 1080 }}><div style={{ fontFamily: BIG, fontSize: 150, color: "#fff", lineHeight: 0.95 }}>YOUR INBOX</div>
      <div style={{ fontFamily: BIG, fontSize: 150, color: P.mint, lineHeight: 0.95 }}>UNWRAPPED</div><div style={{ fontFamily: P.font, fontWeight: 800, fontSize: 40, color: "#fff", marginTop: 16 }}>2026 🎁</div></Pop></>;
    case 1: return <><Label text="This year, you answered" /><div style={{ ...C, top: 640 }}><Count to={4382} /></div><Pop delay={50} style={{ ...C, top: 940 }}><div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 64, color: "#fff" }}>messages 💬</div></Pop></>;
    case 2: return <><Label text="Your most asked question" /><Pop delay={10} style={{ ...C, top: 650 }}><div style={{ fontFamily: BIG, fontSize: 210, color: "#fff", lineHeight: 1 }}>“HOW<br />MUCH?”</div></Pop>
      <Pop delay={40} style={{ ...C, top: 1110 }}><div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 56, color: "#ffd23a" }}>asked 1,207 times</div></Pop></>;
    case 3: return <><Label text="Your busiest reply time" /><Pop delay={8} style={{ ...C, top: 650 }}><div style={{ fontSize: 150 }}>🌙</div><div style={{ fontFamily: BIG, fontSize: 250, color: "#fff", lineHeight: 1 }}>23:07</div></Pop>
      <Pop delay={36} style={{ ...C, top: 1150 }}><div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 52, color: P.mint }}>prime time: in bed</div></Pop></>;
    case 4: return <><Label text="Your top 5 messages of 2026" /><Top5 /></>;
    case 5: return <><Label text="You spent" /><div style={{ ...C, top: 600 }}><Count to={312} size={300} /></div><Pop delay={40} style={{ ...C, top: 930 }}><div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 64, color: "#fff" }}>hours replying</div></Pop>
      <Pop delay={75} style={{ ...C, top: 1070 }}><div style={{ display: "inline-block", fontFamily: P.font, fontWeight: 900, fontSize: 52, color: "#16233b", background: "#fff", padding: "14px 28px", borderRadius: 20 }}>That's 13 full days 😮</div></Pop></>;
    case 6: return <><Label text="Your inbox personality" /><Pop delay={10} style={{ ...C, top: 620 }}>
      <div style={{ display: "inline-block", width: 760, padding: "50px 40px", borderRadius: 50, background: "rgba(255,255,255,0.14)", border: "6px solid rgba(255,255,255,0.5)" }}>
        <div style={{ fontSize: 170 }}>🦉</div><div style={{ fontFamily: BIG, fontSize: 110, color: "#fff", lineHeight: 1 }}>THE 11PM<br />REPLIER</div>
        <div style={{ fontFamily: P.font, fontWeight: 700, fontSize: 38, color: "#fff", marginTop: 18, opacity: 0.9 }}>You reply when everyone else is asleep.</div></div></Pop></>;
    case 7: return <><Label text="Messages that ended in" /><Pop delay={8} style={{ ...C, top: 620 }}><div style={{ fontFamily: BIG, fontSize: 220, color: "#fff", lineHeight: 1 }}>“NVM”</div></Pop>
      <div style={{ ...C, top: 880 }}><Count to={214} delay={24} dur={30} size={200} colour="#ffd23a" /></div>
      <Pop delay={60} style={{ ...C, top: 1110 }}><div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 48, color: "#fff" }}>bookings that went elsewhere</div></Pop></>;
    case 8: return <><Pop style={{ ...C, top: 470 }}><div style={{ fontFamily: BIG, fontSize: 200, color: P.mint, lineHeight: 1 }}>2027</div></Pop>
      <Pop delay={10} style={{ ...C, top: 700 }}><div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 60, color: "#fff", lineHeight: 1.2 }}>let <span style={{ color: P.mint }}>The AI Pound</span><br />do the replying</div></Pop>
      {["⚡ Replies in seconds", "🌙 Even at 11pm", "✅ You approve everything"].map((x, k) => (
        <Pop key={k} delay={30 + k * 10} style={{ ...C, top: 920 + k * 100 }}><div style={{ display: "inline-block", fontFamily: P.font, fontWeight: 800, fontSize: 46, color: "#16233b", background: "#fff", padding: "12px 26px", borderRadius: 18 }}>{x}</div></Pop>))}</>;
    default: return <><Sparkle /><Pop style={{ ...C, top: 450 }}><div style={{ fontSize: 120 }}>🎁</div>
      <div style={{ fontFamily: BIG, fontSize: 104, color: "#fff", lineHeight: 1.02 }}>WANT YOUR OWN<br /><span style={{ color: "#ffd23a" }}>INBOX UNWRAPPED?</span></div></Pop>
      <Pop delay={20} style={{ ...C, top: 900 }}><div style={{ display: "inline-block", fontFamily: P.font, fontWeight: 900, fontSize: 56, color: "#16233b", background: P.mint, padding: "18px 34px", borderRadius: 24 }}>Comment your business 👇</div></Pop>
      <Pop delay={34} style={{ ...C, top: 1060 }}><Img src={staticFile(P.logo)} style={{ width: 150, height: 150, borderRadius: 34 }} /><div style={{ fontFamily: P.font, fontWeight: 800, fontSize: 36, color: "#fff", marginTop: 10 }}>The AI Pound</div></Pop></>;
  }
};

export const InboxUnwrapped: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{fontFace}</style>
      {SLIDES.map((sl, i) => (
        <Sequence key={i} from={s(sl.at)} durationInFrames={s(sl.end - sl.at)}>
          <AbsoluteFill style={{ background: `linear-gradient(160deg, ${sl.bg[0]}, ${sl.bg[1]})` }}>
            <Shapes seed={i} /><SlideBody i={i} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Progress t={t} />
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.85)" }}>YOUR 2026 INBOX · UNWRAPPED</div>
      {t >= 2.4 && t < 32 && <div style={{ position: "absolute", top: 1415, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontSize: 24, color: "rgba(255,255,255,0.7)" }}>Illustrative stats for a busy salon owner</div>}
      <Audio src={U("beat.wav")} volume={(f) => 0.32 * Math.min(1, f / 10) * (f > s(39) ? Math.max(0, (s(40.2) - f) / s(1.2)) : 1)} />
      {SLIDES.map((sl, i) => <Sequence key={i} from={s(sl.at + (i === 0 ? 0.5 : 0.2))} durationInFrames={s(5)}><Audio src={U(`${sl.vo}.wav`)} /></Sequence>)}
    </AbsoluteFill>
  );
};
