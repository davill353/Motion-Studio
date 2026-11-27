import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "THINGS CUSTOMERS TEXT AT 11PM": late-night messages read like a movie trailer, then answered by AI.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const L = (f: string) => staticFile(`whichone/latenight/${f}`);
const TR = (f: string) => staticFile(`whichone/trailer/${f}`);
const SERIF = "'Times New Roman', Georgia, serif";
export const LATENIGHT_SECONDS = 33;

const MSGS = [
  { at: 3.6, time: "23:02", text: "u open tmrw?" },
  { at: 5.8, time: "23:04", text: "how much 4 nails" },
  { at: 8.0, time: "23:05", text: "hello??" },
  { at: 9.4, time: "23:07", text: "can i bring my dog" },
  { at: 11.6, time: "23:11", text: "??" },
  { at: 14.6, time: "23:14", text: "nvm" },
  { at: 16.4, time: "23:15", text: "booked somewhere else x" },
];

const BgClip: React.FC<{ src: string; at: number; dark?: boolean }> = ({ src, at, dark }) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={0.5} muted
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: dark ? "blur(14px) brightness(0.35) saturate(0.6)" : "blur(12px) brightness(0.75)", transform: "scale(1.15)" }} />
    <AbsoluteFill style={{ background: dark ? "radial-gradient(circle at 50% 45%, rgba(20,30,60,0.2), rgba(0,0,0,0.85))" : "rgba(22,35,59,0.55)" }} />
  </AbsoluteFill>
);

const LS_START = 3.4;
const LockScreen: React.FC = () => {
  const frame = useCurrentFrame() + s(LS_START); const { fps } = useVideoConfig(); const t = frame / FPS;
  const shown = MSGS.filter((m) => t >= m.at);
  const clock = shown.length ? shown[shown.length - 1].time : "23:00";
  return (
    <div style={{ position: "absolute", top: 330, left: 140, width: 800, height: 1120, borderRadius: 70, background: "linear-gradient(180deg, #1a2140, #0b0e1c)",
      border: "10px solid #262c44", boxShadow: "0 30px 90px rgba(0,0,0,0.7)", overflow: "hidden", fontFamily: P.font }}>
      <div style={{ textAlign: "center", color: "#fff", marginTop: 70 }}>
        <div style={{ fontSize: 30, opacity: 0.7 }}>Tuesday</div>
        <div style={{ fontSize: 150, fontWeight: 300, letterSpacing: -4, lineHeight: 1 }}>{clock}</div>
      </div>
      <div style={{ position: "absolute", top: 330, left: 26, right: 26, display: "flex", flexDirection: "column-reverse", gap: 14 }}>
        {shown.map((m, i) => {
          const sc = spring({ frame: frame - s(m.at), fps, config: { damping: 14 } });
          const last = i === shown.length - 1;
          const lost = m.text.startsWith("booked");
          return (
            <div key={i} style={{ background: lost ? "rgba(255,80,70,0.9)" : "rgba(255,255,255,0.88)", borderRadius: 24, padding: "16px 22px", transform: `scale(${0.85 + 0.15 * sc})`,
              opacity: sc * (last ? 1 : 0.78), color: lost ? "#fff" : "#111" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700, opacity: 0.6 }}><span>💬 WhatsApp · Customer</span><span>{m.time}</span></div>
              <div style={{ fontSize: 46, fontWeight: 800, marginTop: 4 }}>{m.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dramatic: React.FC<{ text: string; top?: number; size?: number; colour?: string }> = ({ text, top = 1500, size = 60, colour = "#e8e8e8" }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", fontFamily: SERIF, fontSize: size, letterSpacing: 8, color: colour,
    opacity: o, textShadow: "0 0 30px rgba(0,0,0,0.9)", whiteSpace: "pre-line" }}>{text}</div>;
};

const Stamp: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = interpolate(spring({ frame, fps, config: { damping: 10, stiffness: 300 } }), [0, 1], [2, 1]);
  return <div style={{ position: "absolute", top: 1480, left: 0, right: 0, textAlign: "center", transform: `scale(${sc}) rotate(-5deg)` }}>
    <span style={{ fontFamily: P.font, fontWeight: 900, fontSize: 80, color: "#ff3b3b", border: "8px solid #ff3b3b", padding: "6px 26px", background: "rgba(0,0,0,0.5)" }}>{text}</span></div>;
};

const Chat: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 16 } });
  const items: { from: "them" | "ai"; text: string; at: number; meta?: string }[] = [
    { from: "them", text: "u open tmrw?", at: 12 },
    { from: "ai", text: "Hi! Yes, we're open 9am–6pm tomorrow 😊 Shall I check a time for you?", at: 40, meta: "23:02 · replied in 3s" },
    { from: "them", text: "yes pls 10am?", at: 110 },
    { from: "ai", text: "Lovely! I've passed 10am to the team to confirm ✓ Sleep well!", at: 140 },
  ];
  return (
    <div style={{ position: "absolute", top: 380, left: 140, width: 800, height: 1040, borderRadius: 64, background: "#0d1525", border: "10px solid #2a3a5a", overflow: "hidden",
      transform: `translateY(${(1 - inS) * 300}px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", fontFamily: P.font }}>
      <div style={{ background: "#1f2c34", padding: "22px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={staticFile(P.logo)} style={{ width: 60, height: 60, borderRadius: 14 }} />
        <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 30 }}>Your business · AI assistant</div><div style={{ color: "#8aa0b6", fontSize: 22 }}>online · 11pm</div></div>
      </div>
      <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((m, i) => {
          if (frame < m.at - (m.from === "ai" ? 16 : 0)) return null;
          const typing = m.from === "ai" && frame < m.at;
          const sc = spring({ frame: frame - m.at, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ alignSelf: m.from === "them" ? "flex-start" : "flex-end", maxWidth: "84%" }}>
              <div style={{ padding: "16px 20px", borderRadius: 22, fontSize: 32, lineHeight: 1.3, background: m.from === "them" ? "#24323f" : "#005c4b", color: "#fff",
                transform: `scale(${typing ? 1 : 0.9 + 0.1 * sc})`, opacity: typing ? 0.7 : 1 }}>{typing ? "typing…" : m.text}</div>
              {m.meta && !typing && <div style={{ color: P.mint, fontSize: 22, fontWeight: 800, textAlign: "right", marginTop: 6 }}>{m.meta}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 430, color: "#fff", fontFamily: P.font }}>
      <div style={{ fontSize: 100 }}>🌙</div>
      <div style={{ fontWeight: 900, fontSize: 74, lineHeight: 1.1, marginTop: 10 }}>Who's answering your<br /><span style={{ color: "#ffd27a" }}>11pm texts?</span></div>
      <Img src={staticFile(P.logo)} style={{ width: 160, height: 160, borderRadius: 36, marginTop: 44, transform: `scale(${logo})` }} />
      <div style={{ fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 36, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>FICTIONAL MESSAGES · DEMO CONVERSATION · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; src: string; v?: number; dur?: number }> = ({ at, src, v = 1, dur = 4 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={src} volume={v} /></Sequence>
);

export const LateNightTexts: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence durationInFrames={s(19.4)}><BgClip src="whichone/two-salons/A.mp4" at={30.5} dark />
      <Sequence durationInFrames={s(3.5)}><Dramatic text={"THINGS CUSTOMERS\nTEXT AT 11PM"} top={820} size={72} colour="#fff" /></Sequence>
      <Sequence from={s(LS_START)} durationInFrames={s(16)}><LockScreen /></Sequence>
      <Sequence from={s(16.6)} durationInFrames={s(2.8)}><Stamp text="BOOKING LOST" /></Sequence>
    </Sequence>
    <Sequence from={s(19.6)} durationInFrames={s(8.4)}><BgClip src="whichone/two-salons/B.mp4" at={21} /><Chat />
      <Dramatic text="Answered at 11pm. While you slept." top={1500} size={44} colour={P.mint} /></Sequence>
    <Sequence from={s(28)}><End /></Sequence>

    {/* sound */}
    <Snd at={0} src={TR("drone.wav")} v={0.5} dur={18.8} />
    <Snd at={0.4} src={L("v1.wav")} /><Snd at={2.6} src={L("v2.wav")} />
    {MSGS.map((m, i) => <Snd key={i} at={m.at} src={TR("ping_dark.wav")} v={0.45} dur={1.5} />)}
    <Snd at={3.8} src={L("m1.wav")} /><Snd at={6.0} src={L("m2.wav")} /><Snd at={8.2} src={L("m3.wav")} /><Snd at={8.0} src={TR("heartbeat.wav")} v={0.6} dur={1.6} />
    <Snd at={9.6} src={L("m4.wav")} /><Snd at={11.8} src={L("m5.wav")} />
    <Snd at={14.8} src={L("m6.wav")} /><Snd at={16.6} src={L("m7.wav")} /><Snd at={16.6} src={TR("braam.wav")} v={0.9} dur={2.6} />
    <Snd at={19.2} src={TR("ping.wav")} v={0.8} dur={0.6} />
    <Sequence from={s(19.6)} durationInFrames={s(13.4)}><Audio src={staticFile("pound/audio/music.mp3")} volume={(f) => 0.22 * Math.min(1, f / 15)} /></Sequence>
    <Snd at={20.0} src={L("n1.wav")} /><Snd at={22.6} src={L("n2.wav")} /><Snd at={28.3} src={L("n3.wav")} />
  </AbsoluteFill>
);
