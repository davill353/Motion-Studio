import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "INBOX ZERO: a nature documentary": calm narrator observes two species of salon owner. Salon clips from Two Salons.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/two-salons/A.mp4", B = "whichone/two-salons/B.mp4";
const N = (f: string) => staticFile(`whichone/nature/${f}`);
const SERIF = "'PlayfairI', Georgia, serif";
const fontFace = `@font-face { font-family: 'PlayfairI'; font-style: italic; font-weight: 400; src: url('${staticFile("fonts/PlayfairItalic.woff2")}') format('woff2'); }
@font-face { font-family: 'PlayfairI'; font-style: italic; font-weight: 700; src: url('${staticFile("fonts/PlayfairBoldItalic.woff2")}') format('woff2'); }`;
const BAND_TOP = 600, BAND_H = 608;
export const INBOXZERO_SECONDS = 34;

const Shot: React.FC<{ src: string; at: number; rate?: number }> = ({ src, at, rate = 0.75 }) => {
  const frame = useCurrentFrame();
  const z = 1.08 + frame * 0.0018; // slow telephoto creep
  return (
    <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} muted
        style={{ width: 1080, height: BAND_H, objectFit: "cover", transform: `scale(${z})`, filter: "saturate(0.9) contrast(1.05)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </div>
  );
};

const Species: React.FC<{ latin: string; common: string }> = ({ latin, common }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const o = interpolate(frame, [8, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: BAND_TOP + BAND_H - 150, left: 50 }}>
      <div style={{ height: 4, width: 420 * w, background: "#ffd27a", marginBottom: 12 }} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 52, color: "#fff", opacity: o, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>{latin}</div>
      <div style={{ fontFamily: P.font, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: "#ffd27a", opacity: o, textShadow: "0 3px 14px rgba(0,0,0,0.8)" }}>{common}</div>
    </div>
  );
};

const FieldNote: React.FC<{ text: string; top?: number }> = ({ text, top = 1260 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", top, left: 90, right: 90, display: "flex", justifyContent: "center", transform: `scale(${sc}) rotate(-1.5deg)` }}>
      <div style={{ background: "#f6efdf", color: "#3b2f20", fontFamily: SERIF, fontStyle: "italic", fontSize: 44, padding: "18px 28px", borderRadius: 6,
        boxShadow: "0 12px 30px rgba(0,0,0,0.45)", borderLeft: "8px solid #c9a35c", lineHeight: 1.3, textAlign: "center" }}>
        <span style={{ fontFamily: P.font, fontStyle: "normal", fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#8a6a2c", display: "block", marginBottom: 4 }}>FIELD NOTES</span>{text}
      </div>
    </div>
  );
};

const Header: React.FC = () => (
  <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", color: "#fff" }}>
    <div style={{ fontFamily: P.font, fontWeight: 800, fontSize: 40, letterSpacing: 12, opacity: 0.9 }}>INBOX ZERO</div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: "#ffd27a", marginTop: 6 }}>Episode 1 · The Salon</div>
  </div>
);

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 15, 85, 105], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: BAND_TOP + 170, left: 0, right: 0, textAlign: "center", opacity: o }}>
      <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 104, letterSpacing: 8, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>INBOX ZERO</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 52, color: "#ffd27a", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>a nature documentary</div>
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - s(1.8), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1e3a2c, #0b1712 75%)", opacity: a, alignItems: "center", textAlign: "center", paddingTop: 420, color: "#fff" }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: "#ffd27a" }}>Which species are you?</div>
      <Img src={staticFile(P.logo)} style={{ width: 180, height: 180, borderRadius: 40, marginTop: 50, transform: `scale(${logo})` }} />
      <div style={{ fontFamily: P.font, fontWeight: 800, fontSize: 40, marginTop: 30 }}>The AI Pound: your symbiotic helper</div>
      <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 54, color: P.mint, marginTop: 36, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontFamily: P.font, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>A PARODY · AI-GENERATED SCENES · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number }> = ({ at, f, v = 1, dur = 5 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={N(f)} volume={v} /></Sequence>
);

export const InboxZero: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0f0d" }}>
    <style>{fontFace}</style>
    <Sequence durationInFrames={s(29.6)}><Header /></Sequence>
    <Sequence from={0} durationInFrames={s(4.0)}><Shot src={A} at={1.0} /><TitleCard /></Sequence>
    <Sequence from={s(4.0)} durationInFrames={s(2.2)}><Shot src={A} at={4.0} /><Species latin="Salonus exhaustus" common="THE BUSY SALON OWNER" /></Sequence>
    <Sequence from={s(6.2)} durationInFrames={s(3.8)}><Shot src={A} at={6.5} /><FieldNote text="Messages answered while holding a hairdryer: 14" /></Sequence>
    <Sequence from={s(10.0)} durationInFrames={s(3.4)}><Shot src={A} at={13.0} /><FieldNote text="Comb dropped. Client still waiting." /></Sequence>
    <Sequence from={s(13.4)} durationInFrames={s(4.8)}><Shot src={A} at={31} rate={0.6} /><FieldNote text="21:04 · Nocturnal replying observed" /></Sequence>
    <Sequence from={s(18.2)} durationInFrames={s(3.2)}><Shot src={B} at={6.0} /><Species latin="Salonus serenus" common="THE CALM SALON OWNER" /></Sequence>
    <Sequence from={s(21.4)} durationInFrames={s(2.0)}><Shot src={B} at={0.5} /><FieldNote text="Symbiotic helper detected: The AI Pound" /></Sequence>
    <Sequence from={s(23.4)} durationInFrames={s(3.2)}><Shot src={B} at={24.0} /><FieldNote text="Messages answered while resting: all" /></Sequence>
    <Sequence from={s(26.6)} durationInFrames={s(3.0)}><Shot src={B} at={13.0} /></Sequence>
    <Sequence from={s(29.6)}><End /></Sequence>

    {/* sound */}
    <Sequence durationInFrames={s(18.4)}><Audio src={N("curious.wav")} volume={(f) => 0.45 * Math.min(1, f / 15) * Math.min(1, (s(18.4) - f) / 25)} /></Sequence>
    <Sequence from={s(18.0)} durationInFrames={s(16)}><Audio src={N("calm.wav")} volume={(f) => 0.45 * Math.min(1, f / 25) * Math.min(1, (s(16) - f) / 30)} /></Sequence>
    <Snd at={0} f="birds.wav" v={0.35} dur={12} /><Snd at={18.2} f="birds.wav" v={0.3} dur={11} />
    <Snd at={0.5} f="n1.wav" /><Snd at={4.2} f="n2.wav" /><Snd at={6.4} f="n3.wav" /><Snd at={10.2} f="n4.wav" />
    <Snd at={13.6} f="n5.wav" /><Snd at={18.4} f="n6.wav" /><Snd at={21.6} f="n7.wav" /><Snd at={23.6} f="n8.wav" /><Snd at={26.9} f="n9.wav" />
  </AbsoluteFill>
);
