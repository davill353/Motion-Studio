import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "The Receptionist from 1995": animated 90s answering machine (VHS look) vs a 2026 AI reply. No footage needed.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const R = (f: string) => staticFile(`whichone/retro/${f}`);
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
export const RETRO_SECONDS = 39;
const T95_END = 27;

const VHS: React.FC = () => {
  const frame = useCurrentFrame();
  const band = (frame * 7) % 2400 - 200;
  const jitter = random(`j${frame}`) > 0.93 ? (random(`k${frame}`) - 0.5) * 16 : 0;
  const secs = 41 + Math.floor(frame / (FPS * 3));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 5px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: band, height: 60, background: "rgba(255,255,255,0.08)", filter: "blur(4px)", transform: `translateX(${jitter}px)` }} />
      <div style={{ position: "absolute", top: 190, left: 60, fontFamily: MONO, fontWeight: 800, fontSize: 44, color: "#fff", textShadow: "3px 0 0 rgba(255,0,0,0.6), -3px 0 0 rgba(0,200,255,0.6)" }}>PLAY ▶</div>
      <div style={{ position: "absolute", top: 1580, left: 60, fontFamily: MONO, fontWeight: 800, fontSize: 38, color: "#fff", textShadow: "3px 0 0 rgba(255,0,0,0.6), -3px 0 0 rgba(0,200,255,0.6)" }}>
        JAN 14 1995  09:{String(secs).padStart(2, "0")} AM</div>
    </AbsoluteFill>
  );
};

const Machine: React.FC<{ count: number; spinning: boolean; blink: boolean }> = ({ count, spinning, blink }) => {
  const frame = useCurrentFrame();
  const rot = spinning ? frame * 9 : 0;
  const led = blink ? Math.floor(frame / 10) % 2 === 0 : count > 0;
  const Reel = () => (
    <div style={{ width: 110, height: 110, borderRadius: 55, background: "#2b2b2b", border: "6px solid #555", position: "relative", transform: `rotate(${rot}deg)` }}>
      {[0, 60, 120].map((a) => <div key={a} style={{ position: "absolute", left: 50, top: 8, width: 10, height: 94, background: "#888", transform: `rotate(${a}deg)` }} />)}
      <div style={{ position: "absolute", left: 38, top: 38, width: 34, height: 34, borderRadius: 17, background: "#ddd" }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", top: 640, left: 140, width: 800, height: 460, background: "linear-gradient(180deg, #e8dcc2, #cdbf9f)", borderRadius: 30,
      boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 -10px 0 rgba(0,0,0,0.12)", border: "4px solid #b3a585" }}>
      <div style={{ position: "absolute", top: 40, left: 40, width: 430, height: 200, background: "#1b1b1b", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-around", border: "6px solid #9c8f70" }}>
        <Reel /><Reel />
      </div>
      <div style={{ position: "absolute", top: 50, right: 50, width: 220, height: 110, background: "#1a0606", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: MONO, fontWeight: 800, fontSize: 84, color: "#ff3b2f", textShadow: "0 0 18px rgba(255,40,30,0.9)" }}>{String(count).padStart(2, "0")}</div>
      <div style={{ position: "absolute", top: 185, right: 120, width: 40, height: 40, borderRadius: 20, background: led ? "#ff2a1a" : "#5a1410", boxShadow: led ? "0 0 26px 8px rgba(255,40,20,0.8)" : "none" }} />
      <div style={{ position: "absolute", top: 188, right: 172, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: "#5c5242" }}>MSG</div>
      <div style={{ position: "absolute", bottom: 40, left: 40, right: 40, display: "flex", gap: 18 }}>
        {["◀◀", "PLAY", "■", "▶▶", "OGM"].map((b) => (
          <div key={b} style={{ flex: 1, height: 90, background: "#3a3a3a", borderRadius: 12, color: "#eee", fontFamily: MONO, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -6px 0 #222" }}>{b}</div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 262, left: 46, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: "#6d624f", letterSpacing: 4 }}>PHONEMATE 2000 · DIGITAL COUNTER</div>
    </div>
  );
};

const Sub: React.FC<{ who: string; text: string; colour?: string }> = ({ who, text, colour = "#ffe14d" }) => {
  const frame = useCurrentFrame();
  const n = Math.min(text.length, Math.floor(frame * 1.4));
  return (
    <div style={{ position: "absolute", top: 1170, left: 70, right: 70, textAlign: "center", fontFamily: MONO, fontWeight: 800 }}>
      <div style={{ fontSize: 26, color: "#fff", opacity: 0.8, letterSpacing: 3, marginBottom: 10 }}>{who}</div>
      <div style={{ fontSize: 44, color: colour, lineHeight: 1.3, textShadow: "0 3px 0 #000, 0 0 14px rgba(0,0,0,0.9)" }}>{text.slice(0, n)}</div>
    </div>
  );
};

const Pop: React.FC<{ text: string; top: number; colour?: string; size?: number; rotate?: number }> = ({ text, top, colour = "#fff", size = 70, rotate = -4 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });
  return <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontWeight: 900, fontSize: size, color: colour,
    transform: `scale(${sc}) rotate(${rotate}deg)`, textShadow: "0 6px 0 rgba(0,0,0,0.5)", whiteSpace: "pre-line", lineHeight: 1.1 }}>{text}</div>;
};

const Scene1995: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const count = t < 21.6 ? 3 : t < 22.4 ? Math.round(interpolate(t, [21.6, 22.4], [3, 47])) : 47;
  const spinning = (t > 4.6 && t < 12.6) || (t > 13.4 && t < 21);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #d9c9a3 0%, #c8b48a 55%, #6b4a2b 55%, #4e341d 100%)", filter: "saturate(0.85) contrast(1.05)" }}>
      <Machine count={count} spinning={spinning} blink={t > 21.2} />
      <Sequence from={0} durationInFrames={s(2.5)}>
        <AbsoluteFill style={{ background: "#1a3cff", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>THE RECEPTIONIST<br />FROM 1995</div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={s(2.5)} durationInFrames={s(2)}><Pop text="RING RING ☎" top={420} colour="#c0392b" /></Sequence>
      <Sequence from={s(4.6)} durationInFrames={s(2.2)}><Sub who="ANSWERPHONE" text="Hiya! You've reached Glamour Salon." /></Sequence>
      <Sequence from={s(6.8)} durationInFrames={s(3.4)}><Sub who="ANSWERPHONE" text="We're a bit busy right now, so leave a message after the beep…" /></Sequence>
      <Sequence from={s(10.2)} durationInFrames={s(2.4)}><Sub who="ANSWERPHONE" text="…and we'll get back to you… at some point!" /></Sequence>
      <Sequence from={s(12.6)} durationInFrames={s(0.8)}><Pop text="BEEEEP" top={420} /></Sequence>
      <Sequence from={s(13.4)} durationInFrames={s(3.4)}><Sub who="CUSTOMER" text="Hi! I wanted to book a cut and blow-dry for Saturday. How much is a—" colour="#9fe3ff" /></Sequence>
      <Sequence from={s(16.8)} durationInFrames={s(1.2)}><Pop text="BEEP" top={420} /><Sub who="" text="*message cut off*" colour="#ff8a7a" /></Sequence>
      <Sequence from={s(18.0)} durationInFrames={s(3.6)}><Sub who="CUSTOMER" text="Hello? Is anyone there? I'll just… try somewhere else." colour="#9fe3ff" /></Sequence>
      <Sequence from={s(21.6)} durationInFrames={s(2.2)}><Sub who="ANSWERPHONE" text="You have… 47… new messages." colour="#ff3b2f" /></Sequence>
      <Sequence from={s(23.6)} durationInFrames={s(3.4)}><Pop text={"Some businesses still\nanswer like it's 1995."} top={1170} size={62} rotate={0} /></Sequence>
      <VHS />
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ from: "them" | "ai"; text: string; at: number }> = ({ from, text, at }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  if (frame < at - (from === "ai" ? 14 : 0)) return null;
  const typing = from === "ai" && frame < at;
  const sc = spring({ frame: frame - at, fps, config: { damping: 14 } });
  return (
    <div style={{ alignSelf: from === "them" ? "flex-start" : "flex-end", maxWidth: "82%", padding: "16px 20px", borderRadius: 22, fontFamily: P.font, fontSize: 30, lineHeight: 1.3,
      background: from === "them" ? "#24323f" : "#005c4b", color: "#fff", transform: `scale(${typing ? 1 : 0.9 + 0.1 * sc})`, opacity: typing ? 0.7 : 1 }}>{typing ? "typing…" : text}</div>
  );
};

const Scene2026: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 16 } });
  const glitch = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, ${P.navy2}, ${P.navy})` }}>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontWeight: 900, fontSize: 96, color: P.mint }}>2026</div>
      <div style={{ position: "absolute", top: 320, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontWeight: 700, fontSize: 40, color: "#fff", opacity: 0.85 }}>Same question. Different answer.</div>
      <div style={{ position: "absolute", top: 420, left: 150, width: 780, height: 980, borderRadius: 60, background: "#0d1525", border: "10px solid #2a3a5a", overflow: "hidden",
        transform: `translateY(${(1 - inS) * 300}px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ background: "#1f2c34", padding: "22px 28px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>✂︎</div>
          <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 32, fontFamily: P.font }}>Glamour Salon</div><div style={{ color: "#8aa0b6", fontSize: 22, fontFamily: P.font }}>replies instantly</div></div>
        </div>
        <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
          <Bubble from="them" text="Hi! Can I book a cut & blow-dry this Saturday? How much is it?" at={20} />
          <Bubble from="ai" text="Hi! Yes, we have 2pm or 3:30pm on Saturday 😊 Here's our price list. Which time suits you?" at={55} />
          <Bubble from="them" text="2pm please!" at={110} />
          <Bubble from="ai" text="Lovely! I've passed 2pm to the team to confirm ✓" at={140} />
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: glitch * 0.6 }} />
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 440, color: "#fff", fontFamily: P.font }}>
      <div style={{ fontWeight: 900, fontSize: 76, lineHeight: 1.1 }}>Is your business<br />stuck in <span style={{ color: "#ff8a7a" }}>1995</span>?</div>
      <Img src={staticFile(P.logo)} style={{ width: 180, height: 180, borderRadius: 40, marginTop: 50, transform: `scale(${logo})` }} />
      <div style={{ fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 40, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>FICTIONAL SALON · DEMO CONVERSATION · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number }> = ({ at, f, v = 1, dur = 9 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={R(f)} volume={v} /></Sequence>
);

export const Receptionist1995: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={s(T95_END)}><Scene1995 /></Sequence>
    <Sequence from={s(T95_END)} durationInFrames={s(8)}><Scene2026 /></Sequence>
    <Sequence from={s(35)}><End /></Sequence>
    {/* sound */}
    <Snd at={0} f="static.wav" v={0.6} dur={0.6} />
    <Snd at={0.6} f="muzak.wav" v={0.35} dur={1.9} />
    <Snd at={2.5} f="ring.wav" v={0.8} dur={2.1} /><Snd at={4.5} f="click.wav" dur={0.2} />
    <Snd at={4.6} f="whir.wav" v={0.6} dur={8} /><Snd at={4.6} f="owner.wav" />
    <Snd at={12.6} f="beep.wav" v={0.8} dur={0.8} /><Snd at={13.4} f="cust1.wav" />
    <Snd at={16.8} f="beep.wav" v={0.8} dur={0.8} /><Snd at={18.0} f="cust2.wav" />
    <Snd at={21.4} f="click.wav" dur={0.2} /><Snd at={21.6} f="robot.wav" />
    <Snd at={23.6} f="nar1.wav" /><Snd at={26.6} f="rewind.wav" v={0.7} dur={1.2} />
    <Snd at={27} f="bed2026.wav" v={0.5} dur={12} /><Snd at={27.6} f="nar2.wav" />
    {[20, 55, 110, 140].map((f, i) => <Sequence key={i} from={s(T95_END) + f} durationInFrames={18}><Audio src={R("chime.wav")} volume={0.45} /></Sequence>)}
    <Snd at={35.3} f="nar3.wav" />
  </AbsoluteFill>
);
