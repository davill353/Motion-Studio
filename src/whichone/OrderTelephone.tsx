import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "ORDER TELEPHONE": an order gets passed along the kitchen and comes out as a single onion. Kitchen clips from Lunch Rush.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/lunch-rush/A.mp4", B = "whichone/lunch-rush/B.mp4";
const T = (f: string) => staticFile(`whichone/telephone/${f}`);
const BAND_TOP = 660, BAND_H = 608;
export const TELEPHONE_SECONDS = 34;

const STEPS = [
  { icon: "📞", who: "CUSTOMER", text: "2 chicken wraps (1 no onion), large chips, 2 Cokes", bad: 0 },
  { icon: "👨‍🍳", who: "CHEF (HEARD)", text: "2 chicken wraps… onion… chips… Coke?", bad: 1 },
  { icon: "📝", who: "THE NOTE", text: "2 chick… onion… ch…", bad: 2 },
  { icon: "🙋", who: "SERVER (READ)", text: "2 onions, no chicken?", bad: 3 },
  { icon: "🛍️", who: "IN THE BAG", text: "1 × onion", bad: 4 },
];
const STEP_AT = [2.6, 8.0, 11.8, 14.2, 16.6];

const Clip: React.FC<{ src: string; at: number; rate?: number; calm?: boolean }> = ({ src, at, rate = 0.9, calm }) => (
  <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden", borderTop: `6px solid ${calm ? P.mint : "#ff5d5d"}`, borderBottom: `6px solid ${calm ? P.mint : "#ff5d5d"}` }}>
    <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} volume={0.25} style={{ width: 1080, height: BAND_H, objectFit: "cover" }} />
  </div>
);

const Tracker: React.FC<{ step: number }> = ({ step }) => (
  <div style={{ position: "absolute", top: 300, left: 40, right: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    {STEPS.map((st, i) => {
      const active = i === step, done = i < step;
      return (
        <React.Fragment key={i}>
          <div style={{ width: 150, height: 150, borderRadius: 75, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 74,
            background: active ? "#fff" : done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)", transform: `scale(${active ? 1.12 : 0.9})`,
            boxShadow: active ? "0 0 0 8px #ffd27a" : "none", opacity: i > step ? 0.4 : 1 }}>{st.icon}</div>
          {i < STEPS.length - 1 && <div style={{ fontSize: 40, color: i < step ? "#ffd27a" : "rgba(255,255,255,0.25)", fontWeight: 900 }}>→</div>}
        </React.Fragment>
      );
    })}
  </div>
);

const Said: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const st = STEPS[i];
  const sc = spring({ frame, fps, config: { damping: 13 } });
  const blur = i === 2 ? 3 : 0;
  const colour = st.bad === 0 ? "#fff" : st.bad < 3 ? "#ffd27a" : "#ff8a7a";
  return (
    <div style={{ position: "absolute", top: BAND_TOP + BAND_H + 40, left: 60, right: 60, textAlign: "center", transform: `scale(${0.9 + 0.1 * sc})`, opacity: sc }}>
      <div style={{ fontFamily: P.font, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>{st.who}</div>
      <div style={{ display: "inline-block", fontFamily: i === 2 ? "'Comic Sans MS', 'Segoe Print', cursive" : P.font, fontWeight: 900, fontSize: 54, lineHeight: 1.2, color: colour,
        background: "rgba(0,0,0,0.35)", padding: "18px 26px", borderRadius: 22, filter: `blur(${blur}px)`, transform: i === 2 ? "rotate(-2deg)" : "none" }}>“{st.text}”</div>
    </div>
  );
};

const Onion: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 8, stiffness: 120 } });
  const stamp = spring({ frame: frame - 14, fps, config: { damping: 9, stiffness: 240 } });
  return (
    <>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", top: interpolate(drop, [0, 1], [-200, BAND_TOP + 140]), left: 0, right: 0, textAlign: "center", fontSize: 260, transform: `rotate(${(1 - drop) * 40}deg)` }}>🧅</div>
      <div style={{ position: "absolute", top: BAND_TOP + 440, left: 0, right: 0, textAlign: "center", transform: `scale(${stamp}) rotate(-6deg)` }}>
        <span style={{ fontFamily: P.font, fontWeight: 900, fontSize: 84, color: "#fff", background: "#ff3b3b", padding: "8px 30px", borderRadius: 14 }}>1 × ONION</span>
      </div>
    </>
  );
};

const ExactCard: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const inS = spring({ frame: frame - 6, fps, config: { damping: 15 } });
  const ok = frame > 70;
  const lines = ["2× chicken wrap (1 no onion)", "1× large chips", "2× Coke"];
  return (
    <div style={{ position: "absolute", top: BAND_TOP + BAND_H + 40, left: 110, right: 110, background: "#fff", borderRadius: 26, padding: "24px 32px", fontFamily: P.font, color: P.navy,
      transform: `translateY(${(1 - inS) * 80}px)`, opacity: inS, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 30, color: "#127a4a" }}>AI · written exactly as sent</div>
        <div style={{ fontWeight: 900, fontSize: 28, padding: "6px 16px", borderRadius: 999, background: ok ? P.mint : "#e8edf3" }}>{ok ? "✓ APPROVED" : "approve?"}</div>
      </div>
      {lines.map((l, i) => <div key={i} style={{ fontSize: 38, fontWeight: 800, marginTop: 10 }}>{l}</div>)}
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 26, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 430, color: "#fff", fontFamily: P.font }}>
      <div style={{ fontSize: 120 }}>🧅</div>
      <div style={{ fontWeight: 900, fontSize: 72, lineHeight: 1.1, marginTop: 10 }}>Stop playing<br /><span style={{ color: "#ffd27a" }}>order telephone.</span></div>
      <Img src={staticFile(P.logo)} style={{ width: 160, height: 160, borderRadius: 36, marginTop: 44, transform: `scale(${logo})` }} />
      <div style={{ fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 36, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>AI-GENERATED SCENES · DEMO ORDER · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number }> = ({ at, f, v = 1, dur = 7 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={T(f)} volume={v} /></Sequence>
);

export const OrderTelephone: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const step = STEP_AT.filter((a) => t >= a).length - 1;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2b1a14, #16233b)" }}>
      <Sequence durationInFrames={s(2.6)}><Clip src={A} at={1} />
        <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: P.font, color: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 104, letterSpacing: 2 }}>ORDER<br />TELEPHONE</div>
          <div style={{ fontWeight: 700, fontSize: 38, color: "#ffd27a", marginTop: 6 }}>how one order goes wrong</div>
        </div></Sequence>
      <Sequence from={s(2.6)} durationInFrames={s(5.4)}><Clip src={A} at={3} /></Sequence>
      <Sequence from={s(8.0)} durationInFrames={s(3.8)}><Clip src={A} at={11} /></Sequence>
      <Sequence from={s(11.8)} durationInFrames={s(2.4)}><Clip src={A} at={15} /></Sequence>
      <Sequence from={s(14.2)} durationInFrames={s(2.4)}><Clip src={A} at={31} /></Sequence>
      <Sequence from={s(16.6)} durationInFrames={s(3.8)}><Clip src={A} at={22} rate={0.8} /><Sequence from={s(1.9)}><Onion /></Sequence></Sequence>
      {t >= 2.6 && t < 20.4 && <Tracker step={Math.max(0, step)} />}
      {STEP_AT.map((a, i) => i < 4 && <Sequence key={i} from={s(a)} durationInFrames={s((STEP_AT[i + 1] ?? 20.4) - a)}><Said i={i} /></Sequence>)}
      <Sequence from={s(20.4)} durationInFrames={s(3.8)}><Clip src={B} at={10.6} calm /><ExactCard /></Sequence>
      <Sequence from={s(24.2)} durationInFrames={s(5.4)}><Clip src={B} at={21} calm />
        <div style={{ position: "absolute", top: BAND_TOP + BAND_H + 60, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontWeight: 900, fontSize: 64, color: P.mint }}>✅ Exactly what they ordered</div></Sequence>
      <Sequence from={s(20.4)} durationInFrames={s(9.2)}>
        <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontFamily: P.font, fontWeight: 900, fontSize: 70, color: "#fff", lineHeight: 1.1 }}>With <span style={{ color: P.mint }}>The AI Pound</span></div>
      </Sequence>
      <Sequence from={s(29.6)}><End /></Sequence>

      {/* sound */}
      <Snd at={0} f="sizzle.wav" v={0.5} dur={20.4} />
      {STEP_AT.map((a, i) => <Snd key={i} at={a} f="pop.wav" v={0.5} dur={0.3} />)}
      <Snd at={2.8} f="c1.wav" /><Snd at={8.1} f="c2.wav" /><Snd at={14.4} f="c3.wav" />
      <Snd at={17.0} f="c4.wav" /><Snd at={18.6} f="trombone.wav" v={0.8} dur={3} />
      <Sequence from={s(20.4)} durationInFrames={s(13.6)}><Audio src={staticFile("pound/audio/music.mp3")} volume={(f) => 0.2 * Math.min(1, f / 15)} /></Sequence>
      <Snd at={20.6} f="n1.wav" /><Snd at={23.8} f="n2.wav" /><Snd at={29.9} f="n3.wav" />
    </AbsoluteFill>
  );
};
