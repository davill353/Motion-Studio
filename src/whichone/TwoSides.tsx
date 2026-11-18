import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "Which one are you?" series: top = without AI (chaos), bottom = with The AI Pound (calm).
export type Beat = {
  seconds: number;        // length of this beat
  a: number; b: number;   // start time (seconds) inside the A / B source clips
  title: string;          // header line
  aNote?: string;         // sticker on the chaos side
  bNote?: string;         // sticker on the calm side
  chat?: { from: "them" | "ai"; text: string }[];  // chat card on the calm side
  notify?: string;        // notification card on the calm side (e.g. "2 bookings to approve")
  clock?: string;         // e.g. "9:04 PM"
};
export type TwoSidesProps = {
  aSrc: string; bSrc: string;  // files in public/
  hook: string;                // big opening line
  beats: Beat[];
  endTitle: string; endSub: string;
  aLabel: string; bLabel: string;
  aVolume: number; bVolume: number;
};
export const END_SEC = 3.5;
export const twoSidesSeconds = (p: TwoSidesProps) => p.beats.reduce((s, b) => s + b.seconds, 0) + END_SEC;

const PANEL_H = 600, A_TOP = 320, B_TOP = A_TOP + PANEL_H + 14;
const F = P.font;

const Panel: React.FC<{ src: string; startSec: number; top: number; volume: number; label: string; tone: "bad" | "good"; tint?: number }> = ({ src, startSec, top, volume, label, tone }) => {
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top, left: 0, width: 1080, height: PANEL_H, overflow: "hidden", background: "#0b1220" }}>
      {src ? <OffthreadVideo src={staticFile(src)} startFrom={Math.round(startSec * fps)} volume={volume} style={{ width: 1080, height: PANEL_H, objectFit: "cover" }} />
        : <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontFamily: F, fontSize: 40, fontWeight: 800 }}>calm side: clips coming</AbsoluteFill>}
      {tone === "bad" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,20,10,0.10), rgba(0,0,0,0.25))" }} />}
      <div style={{ position: "absolute", top: 22, left: 24, padding: "10px 20px", borderRadius: 999, fontFamily: F, fontWeight: 900, fontSize: 28, letterSpacing: 1.5,
        background: tone === "bad" ? "#ff5d5d" : P.mint, color: tone === "bad" ? "#fff" : P.navy, boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>{label}</div>
    </div>
  );
};

const Sticker: React.FC<{ text: string; top: number; tone: "bad" | "good"; delay?: number }> = ({ text, top, tone, delay = 8 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", top: top + PANEL_H - 120, left: 24, transform: `scale(${s}) rotate(${tone === "bad" ? -2 : 2}deg)`, transformOrigin: "left center",
      background: "#fff", color: tone === "bad" ? "#c0352b" : "#127a4a", fontFamily: F, fontWeight: 900, fontSize: 40, padding: "14px 24px", borderRadius: 18,
      boxShadow: "0 12px 30px rgba(0,0,0,0.4)", maxWidth: 640 }}>{text}</div>
  );
};

const ChatCard: React.FC<{ msgs: { from: "them" | "ai"; text: string }[] }> = ({ msgs }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 15 } });
  let t = 6;
  return (
    <div style={{ position: "absolute", top: B_TOP + 28, right: 24, width: 470, borderRadius: 30, background: "#0d1525", border: "5px solid #2a3a5a", overflow: "hidden",
      transform: `translateX(${(1 - inS) * 560}px)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", fontFamily: F }}>
      <div style={{ background: "#1f2c34", padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", color: P.navy, fontWeight: 900, fontSize: 18 }}>✿</div>
        <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>Salon</div><div style={{ color: "#8aa0b6", fontSize: 16 }}>WhatsApp · replies instantly</div></div>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
        {msgs.map((m, i) => {
          const at = t; t += m.from === "ai" ? 28 + Math.ceil(m.text.length / 3) : 22;
          const vis = frame >= at;
          const typing = m.from === "ai" && frame >= at - 18 && frame < at;
          if (!vis && !typing) return null;
          const pop = spring({ frame: frame - at, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ alignSelf: m.from === "them" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "10px 14px", borderRadius: 16, fontSize: 21, lineHeight: 1.3,
              background: m.from === "them" ? "#24323f" : "#005c4b", color: "#fff", transform: `scale(${typing ? 1 : 0.9 + 0.1 * pop})`, opacity: typing ? 0.7 : 1 }}>
              {typing ? "typing…" : m.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Notify: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 10, fps, config: { damping: 13 } });
  const tapped = frame > 60;
  return (
    <div style={{ position: "absolute", top: B_TOP + 30, right: 24, width: 500, transform: `translateY(${(1 - s) * -120}px)`, opacity: s, fontFamily: F,
      background: "rgba(255,255,255,0.96)", borderRadius: 24, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
      <Img src={staticFile(P.logo)} style={{ width: 54, height: 54, borderRadius: 12 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, color: "#667", fontWeight: 700 }}>THE AI POUND · now</div>
        <div style={{ fontSize: 24, color: P.navy, fontWeight: 800, lineHeight: 1.2 }}>{text}</div>
      </div>
      <div style={{ width: 66, height: 66, borderRadius: 33, background: tapped ? P.mint : "#e8edf3", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, color: P.navy, fontWeight: 900, transform: `scale(${tapped ? 1.1 : 1})` }}>✓</div>
    </div>
  );
};

const Header: React.FC<{ text: string; clock?: string; big?: boolean }> = ({ text, clock, big }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", top: big ? 150 : 180, left: 50, right: 50, textAlign: "center", fontFamily: F, color: "#fff", opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
      {clock && <div style={{ display: "inline-block", fontSize: 30, fontWeight: 800, color: P.navy, background: "#ffd27a", borderRadius: 12, padding: "4px 14px", marginBottom: 8 }}>🕘 {clock}</div>}
      <div style={{ fontSize: big ? 72 : 56, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1 }}>{text}</div>
    </div>
  );
};

const End: React.FC<{ title: string; sub: string }> = ({ title, sub }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const s = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: P.navy, opacity: a, alignItems: "center", justifyContent: "center", fontFamily: F, color: "#fff", textAlign: "center", padding: "0 80px" }}>
      <Img src={staticFile(P.logo)} style={{ width: 200, height: 200, borderRadius: 44, transform: `scale(${s})` }} />
      <div style={{ fontSize: 88, fontWeight: 900, marginTop: 40, lineHeight: 1.05 }}>{title}</div>
      <div style={{ fontSize: 48, fontWeight: 800, marginTop: 26, color: P.mint }}>{sub}</div>
      <div style={{ position: "absolute", bottom: 520, fontSize: 24, opacity: 0.6, letterSpacing: 2 }}>AI-GENERATED SCENES · DEMO CONVERSATION</div>
    </AbsoluteFill>
  );
};

export const TwoSides: React.FC<TwoSidesProps> = (p) => {
  const { fps } = useVideoConfig();
  let from = 0;
  const total = p.beats.reduce((s, b) => s + b.seconds, 0);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${P.navy}, ${P.navy2})` }}>
      {p.beats.map((b, i) => {
        const dur = Math.round(b.seconds * fps); const st = from; from += dur;
        return (
          <Sequence key={i} from={st} durationInFrames={dur}>
            <Panel src={p.aSrc} startSec={b.a} top={A_TOP} volume={p.aVolume} label={p.aLabel} tone="bad" />
            <Panel src={p.bSrc} startSec={b.b} top={B_TOP} volume={p.bVolume} label={p.bLabel} tone="good" />
            <Header text={i === 0 ? p.hook : b.title} clock={b.clock} big={i === 0} />
            {b.aNote && <Sticker text={b.aNote} top={A_TOP} tone="bad" />}
            {b.bNote && <Sticker text={b.bNote} top={B_TOP} tone="good" delay={20} />}
            {b.chat && <ChatCard msgs={b.chat} />}
            {b.notify && <Notify text={b.notify} />}
          </Sequence>
        );
      })}
      <Sequence from={Math.round(total * fps)}><End title={p.endTitle} sub={p.endSub} /></Sequence>
    </AbsoluteFill>
  );
};

export const twoSalons: TwoSidesProps = {
  aSrc: "whichone/two-salons/A.mp4", bSrc: "",
  hook: "Two salons. Same Saturday.",
  aLabel: "WITHOUT AI", bLabel: "WITH THE AI POUND", aVolume: 0.8, bVolume: 0.5,
  endTitle: "Which salon are you?", endSub: "Comment AUTOMATE",
  beats: [
    { seconds: 3.5, a: 0.5, b: 0.5, title: "" },
    { seconds: 6, a: 4.0, b: 4.0, title: "The messages keep coming…", aNote: "📱 4 unread messages", bNote: "✅ Replied in seconds" },
    { seconds: 6.5, a: 10.4, b: 10.4, title: "Stop mid-blow-dry to answer?", aNote: "Client left waiting",
      chat: [{ from: "them", text: "Hi! Any cut & blow-dry this Saturday? How much?" }, { from: "ai", text: "Hi! Yes, 2pm or 3:30pm. Cut & blow-dry is £45. Shall I hold 2pm for you?" }, { from: "them", text: "2pm please 😊" }] },
    { seconds: 6, a: 20.6, b: 20.6, title: "Front desk chaos", aNote: "⏱ Customer waiting", bNote: "😊 Full attention on her client" },
    { seconds: 6.5, a: 30.6, b: 30.6, title: "Then 9pm comes…", clock: "9:04 PM", aNote: "Still answering DMs", notify: "2 bookings to approve" },
  ],
};
