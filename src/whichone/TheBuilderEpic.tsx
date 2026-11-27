import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "THE BUILDER: an epic": epic-film parody (own title, own score). Builder clips from Two Builders.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/builder/A.mp4", B = "whichone/builder/B.mp4";
const E = (f: string) => staticFile(`whichone/epic/${f}`);
const STONE = "'CinzelF', 'Times New Roman', serif";
const fontFace = `@font-face { font-family: 'CinzelF'; font-weight: 700; src: url('${staticFile("fonts/Cinzel700.woff2")}') format('woff2'); }`;
const BAND_TOP = 656, BAND_H = 608, GOLD = "#f0c36a";
export const EPIC_SECONDS = 34;

const Embers: React.FC<{ n?: number }> = ({ n = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const speed = 2 + random(`sp${i}`) * 4;
        const y = 1920 - ((frame * speed + random(`y${i}`) * 1920) % 2100);
        const x = random(`x${i}`) * 1080 + Math.sin((frame + i * 20) / 25) * 30;
        const size = 3 + random(`z${i}`) * 6;
        const flick = 0.5 + 0.5 * Math.sin(frame / 4 + i);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size, background: "#ffb347",
          boxShadow: `0 0 ${size * 3}px ${size}px rgba(255,140,40,0.7)`, opacity: 0.35 + 0.5 * flick }} />;
      })}
    </>
  );
};

const Shot: React.FC<{ src: string; at: number; rate?: number; hero?: boolean }> = ({ src, at, rate = 0.6, hero }) => {
  const frame = useCurrentFrame();
  const z = 1.05 + frame * 0.003;
  const fade = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden", opacity: fade }}>
      <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} muted
        style={{ width: 1080, height: BAND_H, objectFit: "cover", transform: `scale(${z})`,
          filter: hero ? "sepia(0.25) saturate(1.3) contrast(1.15) brightness(1.05)" : "sepia(0.55) saturate(1.25) contrast(1.3) brightness(0.78)" }} />
      <AbsoluteFill style={{ background: hero ? "linear-gradient(180deg, rgba(255,190,90,0.18), transparent)" : "linear-gradient(180deg, rgba(40,20,0,0.25), rgba(255,120,30,0.15))", mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)" }} />
    </div>
  );
};

const Carved: React.FC<{ text: string; top?: number; size?: number; colour?: string }> = ({ text, top = 1320, size = 70, colour = GOLD }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const sp = interpolate(frame, [0, 40], [24, 10], { extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", top, left: 30, right: 30, textAlign: "center", fontFamily: STONE, fontWeight: 700, fontSize: size, color: colour,
    letterSpacing: sp, opacity: o, textShadow: "0 0 30px rgba(255,150,50,0.45), 0 4px 18px rgba(0,0,0,0.9)", whiteSpace: "pre-line", lineHeight: 1.15 }}>{text}</div>;
};

const Title: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = interpolate(spring({ frame, fps, config: { damping: 20, stiffness: 60 } }), [0, 1], [1.25, 1]);
  const o = interpolate(frame, [0, 6, 70, 84], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <Embers n={60} />
      <div style={{ transform: `scale(${sc})`, textAlign: "center" }}>
        <div style={{ fontFamily: STONE, fontWeight: 700, fontSize: 150, letterSpacing: 14, color: GOLD, textShadow: "0 0 50px rgba(255,150,40,0.6), 0 6px 24px #000" }}>THE BUILDER</div>
        <div style={{ fontFamily: STONE, fontWeight: 700, fontSize: 44, letterSpacing: 20, color: "#e9dcc0", marginTop: 10 }}>AN EPIC</div>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 8, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - s(2.2), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #3a2410, #0e0904 75%)", opacity: a, alignItems: "center", textAlign: "center", paddingTop: 400 }}>
      <Embers n={30} />
      <div style={{ fontFamily: STONE, fontWeight: 700, fontSize: 64, letterSpacing: 8, color: GOLD }}>WIN THE JOBS<br />YOU USED TO MISS</div>
      <Img src={staticFile(P.logo)} style={{ width: 180, height: 180, borderRadius: 40, marginTop: 50, transform: `scale(${logo})`, boxShadow: "0 0 40px rgba(255,170,60,0.5)" }} />
      <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 54, color: P.mint, marginTop: 44, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontFamily: P.font, fontSize: 22, color: "#fff", opacity: 0.5, letterSpacing: 2 }}>A PARODY · AI-GENERATED SCENES · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number }> = ({ at, f, v = 1, dur = 5 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={E(f)} volume={v} /></Sequence>
);

export const TheBuilderEpic: React.FC = () => (
  <AbsoluteFill style={{ background: "#070503" }}>
    <style>{fontFace}</style>
    <Sequence durationInFrames={s(2.4)}><Embers n={30} /><Carved text={"HE WAS\nA BUILDER."} top={860} size={76} /></Sequence>
    <Sequence from={s(2.4)} durationInFrames={s(3.0)}><Shot src={A} at={1.0} /><Embers n={18} /></Sequence>
    <Sequence from={s(5.4)} durationInFrames={s(2.2)}><Shot src={A} at={15.0} /><Carved text="ONE MISSED CALL" /></Sequence>
    <Sequence from={s(7.6)} durationInFrames={s(3.0)}><Shot src={A} at={21.5} /><Carved text="TWELVE JOBS LOST" colour="#ff9a6a" /></Sequence>
    <Sequence from={s(10.6)} durationInFrames={s(3.8)}><Shot src={A} at={31} /><Embers n={18} /></Sequence>
    <Sequence from={s(14.4)} durationInFrames={s(3.2)}><Shot src={A} at={36} rate={0.4} /><Sequence from={s(1.8)}><Carved text="NEVER AGAIN." size={90} /></Sequence></Sequence>
    <Sequence from={s(17.6)} durationInFrames={s(2.8)}><Title /></Sequence>
    <Sequence from={s(20.4)} durationInFrames={s(3.0)}><Shot src={B} at={11.0} rate={0.7} hero /><Carved text="EVERY MESSAGE ANSWERED" size={58} colour={P.mint} /></Sequence>
    <Sequence from={s(23.4)} durationInFrames={s(3.2)}><Shot src={B} at={21.0} rate={0.7} hero /><Carved text="EVERY VISIT WON" size={64} colour={P.mint} /></Sequence>
    <Sequence from={s(26.6)} durationInFrames={s(2.4)}><Shot src={B} at={4.0} rate={0.8} hero /><Embers n={25} /><Carved text="VICTORY." size={110} /></Sequence>
    <Sequence from={s(29)}><End /></Sequence>

    {/* sound */}
    <Sequence durationInFrames={s(17.8)}><Audio src={E("dark.wav")} volume={(f) => 0.6 * Math.min(1, f / 10) * Math.min(1, (s(17.8) - f) / 10)} /></Sequence>
    <Snd at={17.6} f="boom.wav" v={1} dur={2.6} />
    <Sequence from={s(20.0)} durationInFrames={s(14)}><Audio src={E("hero.wav")} volume={(f) => 0.6 * Math.min(1, f / 15) * Math.min(1, (s(14) - f) / 30)} /></Sequence>
    <Snd at={0.5} f="e1.wav" /><Snd at={2.6} f="e2.wav" /><Snd at={5.6} f="e3.wav" /><Snd at={7.8} f="e4.wav" />
    <Snd at={10.8} f="e5.wav" /><Snd at={14.6} f="e6.wav" /><Snd at={20.6} f="e7.wav" /><Snd at={23.6} f="e8.wav" /><Snd at={29.5} f="e9.wav" />
  </AbsoluteFill>
);
