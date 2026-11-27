import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "Give us 7 days": premium direct-response ad. Black, serif, mint highlights. Honest proof only (live demo + real workflow).
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const K = (f: string) => staticFile(`whichone/sevendays/${f}`);
const SERIF = "'PlayfairR', Georgia, serif";
const fontFace = `@font-face { font-family: 'PlayfairR'; font-weight: 400; src: url('${staticFile("fonts/Playfair400.woff2")}') format('woff2'); }
@font-face { font-family: 'PlayfairR'; font-weight: 600; src: url('${staticFile("fonts/Playfair600.woff2")}') format('woff2'); }`;
const MINT = P.mint, GREY = "rgba(255,255,255,0.62)";
export const SEVENDAYS_SECONDS = 39.5;

const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = 1 - Math.pow(1 - p, 3);
  return <div style={{ opacity: e, transform: `translateY(${(1 - e) * 26}px)`, filter: `blur(${(1 - e) * 6}px)`, ...style }}>{children}</div>;
};

const Centre: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 560 }) => (
  <div style={{ position: "absolute", top, left: 80, right: 80, textAlign: "center", color: "#fff" }}>{children}</div>
);
const Serif: React.FC<{ size?: number; children: React.ReactNode; weight?: number }> = ({ size = 76, children, weight = 400 }) => (
  <div style={{ fontFamily: SERIF, fontWeight: weight, fontSize: size, lineHeight: 1.12, letterSpacing: -1 }}>{children}</div>
);
const Sub: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 38 }) => (
  <div style={{ fontFamily: P.font, fontSize: size, color: GREY, lineHeight: 1.35, marginTop: 22 }}>{children}</div>
);
const G: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: MINT }}>{children}</span>;

const Phone: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 860 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const inS = spring({ frame: frame - 6, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", top, left: 220, width: 640, borderRadius: 48, background: "#0f1420", border: "8px solid #232a3a", overflow: "hidden",
      transform: `translateY(${(1 - inS) * 120}px)`, opacity: inS, boxShadow: `0 30px 90px rgba(110,231,168,0.12)`, fontFamily: P.font }}>{children}</div>
  );
};
const Bubble: React.FC<{ me?: boolean; text: string; delay: number; flag?: boolean }> = ({ me, text, delay, flag }) => (
  <Rise delay={delay} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "86%" }}>
    <div style={{ padding: "14px 18px", borderRadius: 18, fontSize: 27, lineHeight: 1.3, color: "#fff", background: me ? "#24323f" : "#0f5e4a" }}>{text}</div>
    {flag && <div style={{ color: "#ff8a7a", fontSize: 22, fontWeight: 800, marginTop: 6 }}>🚩 Flagged to clinician</div>}
  </Rise>
);

const S1: React.FC = () => (
  <>
    <Centre top={600}>
      <Rise><div style={{ fontFamily: P.font, fontSize: 40, color: GREY }}>Give us</div></Rise>
      <Rise delay={6}><div style={{ fontFamily: SERIF, fontSize: 300, color: MINT, lineHeight: 1, letterSpacing: -6 }}>7 days</div></Rise>
      <Rise delay={s(1.8)}><Sub size={44}>and your business will have an <span style={{ color: "#fff" }}>AI assistant</span><br />answering your messages.</Sub></Rise>
    </Centre>
  </>
);

const S2: React.FC = () => (
  <Centre top={560}>
    <Rise><Serif size={110}>Prices.</Serif></Rise>
    <Rise delay={12}><Serif size={110}>Bookings.</Serif></Rise>
    <Rise delay={24}><Serif size={110}>Opening times.</Serif></Rise>
    <Rise delay={s(2.0)}><Serif size={64}>Answered in <G>seconds</G>,</Serif><Sub size={40}>in your words, day or night.</Sub></Rise>
  </Centre>
);

const S3: React.FC = () => (
  <>
    <Img src={staticFile("pound/wf-clinic.png")} style={{ position: "absolute", top: 420, left: 60, width: 960, opacity: 0.18, filter: "grayscale(1)" }} />
    <Centre top={430}>
      <Rise><Serif size={68}>Anything medical or tricky<br />comes <G>straight to you.</G></Serif></Rise>
    </Centre>
    <Phone top={760}>
      <div style={{ background: "#182233", padding: "16px 22px", color: "#fff", fontWeight: 800, fontSize: 26 }}>Glow Skin Clinic · <span style={{ color: MINT }}>AI assistant</span></div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <Bubble me text="Is Botox safe if I'm pregnant?" delay={10} />
        <Bubble text="That's one for our clinician. I've flagged it and they'll get back to you." delay={28} flag />
      </div>
    </Phone>
    <Rise delay={s(2.4)} style={{ position: "absolute", top: 1240, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-flex", gap: 18, alignItems: "center", background: "#141a26", border: "2px solid #2a3346", borderRadius: 18, padding: "16px 24px", fontFamily: P.font, color: "#fff", fontSize: 30 }}>
        You approve every reply <span style={{ background: MINT, color: "#0a0a0a", fontWeight: 900, borderRadius: 10, padding: "6px 14px" }}>✓ Approve</span></div>
    </Rise>
  </>
);

const S4: React.FC = () => (
  <>
    <Centre top={420}><Rise><Serif size={70}>Don't take my word for it.</Serif></Rise><Rise delay={14}><Serif size={84}><G>Try it yourself.</G></Serif></Rise></Centre>
    <Phone top={720}>
      <div style={{ background: "#182233", padding: "16px 22px", color: "#fff", fontWeight: 800, fontSize: 26 }}>Live demo</div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <Bubble me text="How much is a Hydrafacial?" delay={8} />
        <Bubble text="A Hydrafacial is £95 and takes 60 minutes. Shall I pass a time to the team?" delay={24} />
      </div>
    </Phone>
    <Rise delay={30} style={{ position: "absolute", top: 1140, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, color: MINT }}>clinic-chat-showcase.lovable.app</div>
      <div style={{ fontFamily: P.font, fontSize: 24, color: GREY, marginTop: 8 }}>demo clinic · real working assistant</div>
    </Rise>
  </>
);

const S5: React.FC = () => (
  <Centre top={560}>
    <Rise><div style={{ fontFamily: P.font, fontSize: 40, color: GREY }}>The first</div></Rise>
    <Rise delay={6}><div style={{ fontFamily: SERIF, fontSize: 200, color: MINT, lineHeight: 1, letterSpacing: -4 }}>2 weeks</div></Rise>
    <Rise delay={12}><Serif size={90}>are free.</Serif></Rise>
    <Rise delay={s(1.8)}><Sub size={42}>If it doesn't save you time,<br />I switch it off.</Sub></Rise>
    <Rise delay={s(3.6)}><div style={{ marginTop: 30, fontFamily: P.font, fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: 2 }}>NO CARD · NO CONTRACT</div></Rise>
  </Centre>
);

const S6: React.FC = () => (
  <Centre top={620}>
    <Rise><Serif size={96}>I'm David.</Serif></Rise>
    <Rise delay={14}><Serif size={96}>I'm <G>local.</G></Serif></Rise>
    <Rise delay={s(1.7)}><Sub size={42}>And I only take <span style={{ color: "#fff" }}>a few businesses</span> at a time.</Sub></Rise>
    <Rise delay={s(2.6)}><div style={{ marginTop: 26, fontFamily: P.font, fontSize: 30, color: GREY, letterSpacing: 3 }}>BEDFORDSHIRE · HERTFORDSHIRE</div></Rise>
  </Centre>
);

const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.03 * Math.sin(frame / 6);
  return (
    <Centre top={520}>
      <Rise><div style={{ fontFamily: P.font, fontSize: 40, color: GREY }}>If it's a fit,</div></Rise>
      <Rise delay={8}><Serif size={110}>live in <G>7 days.</G></Serif></Rise>
      <Rise delay={s(2.0)} style={{ marginTop: 60 }}>
        <div style={{ display: "inline-block", transform: `scale(${pulse})`, background: MINT, color: "#0a0a0a", fontFamily: P.font, fontWeight: 900, fontSize: 46, padding: "26px 46px", borderRadius: 999 }}>Book a free 10-minute demo →</div>
        <div style={{ fontFamily: P.font, fontSize: 32, color: GREY, marginTop: 22 }}>theaipound.co.uk/book</div>
      </Rise>
      <Rise delay={s(3.2)} style={{ marginTop: 50 }}><Img src={staticFile(P.logo)} style={{ width: 110, height: 110, borderRadius: 26 }} /><div style={{ fontFamily: P.font, fontWeight: 800, fontSize: 30, color: "#fff", marginTop: 8 }}>The AI Pound</div></Rise>
    </Centre>
  );
};

const SCENES: [number, number, React.FC][] = [[0, 6.9, S1], [6.9, 12.8, S2], [12.8, 18.0, S3], [18.0, 21.2, S4], [21.2, 27.0, S5], [27.0, 32.2, S6], [32.2, 39.5, S7]];

export const SevenDaysAd: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      <style>{fontFace}</style>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${40 + 6 * Math.sin(frame / 90)}%, rgba(110,231,168,0.08), transparent 60%)` }} />
      {SCENES.map(([a, b, C], i) => (
        <Sequence key={i} from={s(a)} durationInFrames={s(b - a)}>
          <AbsoluteFill style={{ opacity: interpolate(frame - s(a), [s(b - a) - 8, s(b - a)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}><C /></AbsoluteFill>
        </Sequence>
      ))}
      <Sequence durationInFrames={s(39.5)}><Audio src={staticFile("whichone/retro/bed2026.wav")} loop volume={(f) => 0.22 * Math.min(1, f / 30) * Math.min(1, (s(39.5) - f) / 40)} /></Sequence>
      {[["k1", 0.4], ["k2", 2.1], ["k3", 7.1], ["k4", 13.0], ["k5", 18.2], ["k6", 21.4], ["k7", 27.2], ["k8", 32.4]].map(([k, at]) => (
        <Sequence key={k as string} from={s(at as number)} durationInFrames={s(6)}><Audio src={K(`${k}.wav`)} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
