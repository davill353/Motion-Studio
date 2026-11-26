import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "MISSION: LUNCH RUSH": action-trailer parody (own title, own music). Kitchen clips from Lunch Rush.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/lunch-rush/A.mp4", B = "whichone/lunch-rush/B.mp4";
const S = (f: string) => staticFile(`whichone/action/${f}`);
const IMPACT = "'AntonF', 'Arial Black', sans-serif";
const fontFace = `@font-face { font-family: 'AntonF'; src: url('${staticFile("fonts/Anton.woff2")}') format('woff2'); }`;
const BAND_TOP = 656, BAND_H = 608;
export const MISSION_SECONDS = 31;

const Shot: React.FC<{ src: string; at: number; rate?: number; calm?: boolean; zoom?: boolean }> = ({ src, at, rate = 0.6, calm, zoom }) => {
  const frame = useCurrentFrame();
  const z = zoom ? 1.05 + frame * 0.004 : 1.05;
  return (
    <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} muted
        style={{ width: 1080, height: BAND_H, objectFit: "cover", transform: `scale(${z})`,
          filter: calm ? "contrast(1.1) saturate(1.15) brightness(1.05)" : "contrast(1.3) saturate(1.35) brightness(0.88)" }} />
      {!calm && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,95,115,0.35), rgba(255,120,30,0.18))", mixBlendMode: "overlay" }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
    </div>
  );
};

const Slam: React.FC<{ text: string; top?: number; size?: number; colour?: string; rotate?: number; box?: boolean }> = ({ text, top = 1320, size = 96, colour = "#fff", rotate = 0, box }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = interpolate(spring({ frame, fps, config: { damping: 11, stiffness: 320 } }), [0, 1], [2.2, 1]);
  const o = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: IMPACT, fontSize: size, color: colour, letterSpacing: 4, lineHeight: 1.0, textAlign: "center", whiteSpace: "pre-line",
        transform: `scale(${sc}) rotate(${rotate}deg)`, textShadow: box ? "none" : "0 6px 30px rgba(0,0,0,0.9)",
        border: box ? `10px solid ${colour}` : "none", padding: box ? "14px 34px" : 0, background: box ? "rgba(0,0,0,0.35)" : "none" }}>{text}</div>
    </div>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = interpolate(spring({ frame, fps, config: { damping: 14, stiffness: 200 } }), [0, 1], [1.8, 1]);
  const shine = interpolate(frame, [6, 40], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${sc})`, textAlign: "center", fontFamily: IMPACT, lineHeight: 0.95,
        background: `linear-gradient(100deg, #9aa4ad ${shine - 20}%, #ffffff ${shine}%, #9aa4ad ${shine + 20}%)`, WebkitBackgroundClip: "text", color: "transparent" }}>
        <div style={{ fontSize: 110, letterSpacing: 12 }}>MISSION:</div>
        <div style={{ fontSize: 170, letterSpacing: 6 }}>LUNCH RUSH</div>
      </div>
    </AbsoluteFill>
  );
};

const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const srcs = [22, 33, 13.5, 24.5, 35, 4, 36.5, 26, 31, 15];
  const cuts: number[] = []; let f = 0, len = 16;
  while (f < s(5)) { cuts.push(f); f += len; len = Math.max(6, len - 2); }
  const idx = cuts.filter((c) => frame >= c).length - 1;
  const shake = (random(`m${frame}`) - 0.5) * 14;
  return (
    <div style={{ transform: `translate(${shake}px, ${shake / 2}px)` }}>
      <Sequence from={cuts[idx]} durationInFrames={60} key={idx}><Shot src={A} at={srcs[idx % srcs.length]} rate={1.3} /></Sequence>
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const l2 = interpolate(frame, [s(1.6), s(2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l3 = spring({ frame: frame - s(3), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${P.navy2}, ${P.navy})`, opacity: a, alignItems: "center", textAlign: "center", color: "#fff", paddingTop: 440, fontFamily: P.font }}>
      <Img src={staticFile(P.logo)} style={{ width: 210, height: 210, borderRadius: 48, transform: `scale(${logo})` }} />
      <div style={{ fontFamily: IMPACT, fontSize: 96, letterSpacing: 4, marginTop: 34, color: P.mint }}>MISSION POSSIBLE</div>
      <div style={{ fontSize: 46, fontWeight: 800, marginTop: 30, opacity: l2, lineHeight: 1.25 }}>Your kitchen cooks.<br />Your AI takes the orders.</div>
      <div style={{ marginTop: 56, fontSize: 54, fontWeight: 900, color: P.mint, transform: `scale(${l3})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.55, letterSpacing: 2 }}>A PARODY · AI-GENERATED SCENES · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number; loop?: boolean }> = ({ at, f, v = 1, dur = 4, loop }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={S(f)} volume={v} loop={loop} /></Sequence>
);

export const MissionLunchRush: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <style>{fontFace}</style>
    <Sequence from={s(0.2)} durationInFrames={s(2)}><Slam text="THIS FRIDAY…" size={64} top={900} /></Sequence>
    <Sequence from={s(2.2)} durationInFrames={s(2.2)}><Shot src={A} at={1.0} zoom /><Slam text="ONE CHEF." /></Sequence>
    <Sequence from={s(4.4)} durationInFrames={s(2)}><Shot src={A} at={5.0} zoom /><Slam text="ONE PHONE." /></Sequence>
    <Sequence from={s(6.4)} durationInFrames={s(2)}><Shot src={A} at={11.0} zoom /><Slam text="40 ORDERS." colour="#ffb347" /></Sequence>
    <Sequence from={s(8.4)} durationInFrames={s(2.4)}><Title /></Sequence>
    <Sequence from={s(10.8)} durationInFrames={s(5)}><Montage /></Sequence>
    <Sequence from={s(11.2)} durationInFrames={s(1.4)}><Slam text={"EVERY ORDER."} top={300} size={110} /></Sequence>
    <Sequence from={s(12.8)} durationInFrames={s(1.4)}><Slam text={"ONE HAND."} top={300} size={110} colour="#ffb347" /></Sequence>
    <Sequence from={s(15.8)} durationInFrames={s(1.8)}><Shot src={A} at={24.5} rate={0.02} /><Slam text="MISSION FAILED" top={880} size={120} colour="#ff3b3b" rotate={-6} box /></Sequence>
    <Sequence from={s(18.8)} durationInFrames={s(2.2)}><Shot src={B} at={11.4} rate={0.8} calm /></Sequence>
    <Sequence from={s(21.0)} durationInFrames={s(2)}><Shot src={B} at={21.5} rate={0.8} calm /></Sequence>
    <Sequence from={s(23.0)} durationInFrames={s(1.8)}><Shot src={B} at={32} rate={0.8} calm /></Sequence>
    <Sequence from={s(21.6)} durationInFrames={s(3.2)}><Slam text={"MISSION\nPOSSIBLE"} top={300} size={120} colour={P.mint} rotate={-4} box /></Sequence>
    <Sequence from={s(24.8)}><End /></Sequence>

    {/* sound */}
    <Snd at={0} f="tick.wav" v={0.7} dur={8.4} loop />
    <Snd at={0.3} f="v1.wav" /><Snd at={2.2} f="whoosh.wav" v={0.6} dur={1} /><Snd at={2.5} f="v2.wav" />
    <Snd at={4.4} f="whoosh.wav" v={0.6} dur={1} /><Snd at={4.6} f="v3.wav" /><Snd at={6.4} f="whoosh.wav" v={0.6} dur={1} /><Snd at={6.6} f="v4.wav" />
    <Snd at={8.4} f="impact.wav" /><Snd at={9.0} f="drums.wav" v={0.7} dur={1.8} />
    <Snd at={10.8} f="drums_fast.wav" v={0.8} dur={5} /><Snd at={11.0} f="v5.wav" />
    <Snd at={11.2} f="impact.wav" v={0.5} dur={1} /><Snd at={12.8} f="impact.wav" v={0.5} dur={1} />
    <Snd at={15.8} f="scratch.wav" v={0.9} dur={0.6} /><Snd at={16.0} f="impact.wav" v={0.8} dur={1.6} />
    <Snd at={17.8} f="v6.wav" />
    <Snd at={18.9} f="v7.wav" /><Snd at={20.4} f="stinger.wav" v={0.8} dur={5} />
    <Snd at={24.8} f="drums.wav" v={0.35} dur={6} /><Snd at={25.2} f="v8.wav" />
  </AbsoluteFill>
);
