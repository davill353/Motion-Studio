import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "THE DMs": horror-trailer parody. Salon clips, dark grade, slow motion, our own sound design.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const SRC = "whichone/two-salons/A.mp4";
const T = (f: string) => staticFile(`whichone/trailer/${f}`);
const SERIF = "'Times New Roman', Georgia, serif";
const BAND_TOP = 656, BAND_H = 608;
export const DMS_SECONDS = 31;

const Shot: React.FC<{ src: number; rate?: number; push?: boolean }> = ({ src, rate = 0.5, push }) => {
  const frame = useCurrentFrame();
  const flick = 0.9 + 0.1 * random(`f${frame}`);
  const z = push ? 1 + frame * 0.0025 : 1.04;
  return (
    <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden", opacity: flick }}>
      <OffthreadVideo src={staticFile(SRC)} startFrom={s(src)} playbackRate={rate} muted
        style={{ width: 1080, height: BAND_H, objectFit: "cover", transform: `scale(${z})`, filter: "grayscale(0.55) contrast(1.35) brightness(0.62)" }} />
      <AbsoluteFill style={{ background: "rgba(0,70,90,0.35)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)" }} />
    </div>
  );
};

const Card: React.FC<{ text: string; size?: number; colour?: string; top?: number; slam?: boolean; spacing?: number }> = ({ text, size = 54, colour = "#e8e8e8", top = 1330, slam, spacing = 14 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const o = slam ? 1 : interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const sc = slam ? interpolate(spring({ frame, fps, config: { damping: 12, stiffness: 300 } }), [0, 1], [1.6, 1]) : 1;
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", fontFamily: SERIF, fontSize: size, color: colour, letterSpacing: spacing,
      opacity: o, transform: `scale(${sc})`, textShadow: "0 0 30px rgba(0,0,0,0.9)", lineHeight: 1.2, whiteSpace: "pre-line" }}>{text}</div>
  );
};

const Typed: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const n = Math.min(text.length, Math.floor(frame / 1.6));
  return (
    <div style={{ position: "absolute", top: 860, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#1f2c34", color: "#e6e6e6", fontFamily: P.font, fontSize: 52, padding: "24px 34px", borderRadius: 28, boxShadow: "0 0 60px rgba(120,0,0,0.6)" }}>
        {text.slice(0, n)}<span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>|</span>
      </div>
    </div>
  );
};

const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const g = frame < 20 ? (random(`g${frame}`) - 0.5) * 30 : 0;
  const o = interpolate(frame, [0, 3, 60, 78], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: SERIF, fontSize: 200, color: "#d8d8d8", letterSpacing: 30, transform: `translateX(${g}px)`, textShadow: `${-g / 3}px 0 0 rgba(255,0,0,0.6), ${g / 3}px 0 0 rgba(0,255,255,0.5)` }}>THE DMs</div>
    </AbsoluteFill>
  );
};

const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  // cuts get faster: 14, 12, 10, 8, 6, 5, 4, 4, 3, 3... frames
  const cuts: number[] = []; let f = 0, len = 14;
  while (f < s(4)) { cuts.push(f); f += len; len = Math.max(3, len - 2); }
  const idx = cuts.filter((c) => frame >= c).length - 1;
  const srcs = [2, 13, 21.5, 31, 6, 15, 24, 33, 8, 26, 35, 4, 17, 28, 37, 10];
  const red = random(`r${idx}`) > 0.6 ? 0.25 : 0;
  return (
    <>
      <Sequence from={cuts[idx]} durationInFrames={60} key={idx}><Shot src={srcs[idx % srcs.length]} rate={1.2} /></Sequence>
      <AbsoluteFill style={{ background: "#a00", opacity: red, mixBlendMode: "multiply" }} />
    </>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const l2 = interpolate(frame, [s(2.8), s(3.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l3 = spring({ frame: frame - s(4.4), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${P.navy2}, ${P.navy})`, opacity: a, alignItems: "center", fontFamily: P.font, color: "#fff", textAlign: "center", paddingTop: 420 }}>
      <Img src={staticFile(P.logo)} style={{ width: 220, height: 220, borderRadius: 50, transform: `scale(${logo})` }} />
      <div style={{ fontSize: 64, fontWeight: 900, marginTop: 36 }}>Or… let <span style={{ color: P.mint }}>The AI Pound</span><br />answer them.</div>
      <div style={{ fontFamily: SERIF, fontSize: 40, letterSpacing: 8, marginTop: 70, opacity: l2, lineHeight: 1.5 }}>IN CINEMAS NEVER.<br />ON YOUR PHONE NOW.</div>
      <div style={{ marginTop: 60, fontSize: 52, fontWeight: 900, color: P.mint, transform: `scale(${l3})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.55, letterSpacing: 2 }}>A PARODY · AI-GENERATED SCENES</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number; loop?: boolean }> = ({ at, f, v = 1, dur = 4, loop }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={T(f)} volume={v} loop={loop} /></Sequence>
);

export const TheDMs: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* 0 – 2.6 cold open */}
    <Sequence from={s(0.3)} durationInFrames={s(2.2)}><Card text={"FROM THE STUDIO\nTHAT BROUGHT YOU"} size={34} top={820} spacing={8} /></Sequence>
    <Sequence from={s(1.3)} durationInFrames={s(1.2)}><Card text={"“MISSED CALLS”"} size={58} top={960} spacing={6} /></Sequence>
    {/* shots */}
    <Sequence from={s(2.6)} durationInFrames={s(3)}><Shot src={1} /><Card text="EVERY SATURDAY…" /></Sequence>
    <Sequence from={s(5.6)} durationInFrames={s(2.8)}><Shot src={12.2} rate={0.55} /><Card text="THEY MESSAGE." /></Sequence>
    <Sequence from={s(9.0)} durationInFrames={s(3.6)}><Shot src={31} rate={0.6} push /><Card text="AT 9PM…" /><Card text="🕘 9:04 PM" size={34} top={520} spacing={4} colour="#ffd27a" /></Sequence>
    <Sequence from={s(12.6)} durationInFrames={s(2)}><Typed text="how much is a facial?" /></Sequence>
    <Sequence from={s(14.6)} durationInFrames={s(2.7)}><Title /></Sequence>
    <Sequence from={s(15.6)} durationInFrames={s(1.7)}><Card text={"THIS WINTER\nNO SALON IS SAFE"} size={40} top={1240} spacing={8} /></Sequence>
    <Sequence from={s(17.3)} durationInFrames={s(4)}><Montage /></Sequence>
    <Sequence from={s(18.4)} durationInFrames={s(0.9)}><Card text="THEY." size={150} top={250} slam colour="#ff3b3b" spacing={10} /></Sequence>
    <Sequence from={s(19.4)} durationInFrames={s(0.9)}><Card text="NEVER." size={150} top={250} slam colour="#ff3b3b" spacing={10} /></Sequence>
    <Sequence from={s(20.4)} durationInFrames={s(0.9)}><Card text="STOP." size={150} top={250} slam colour="#ff3b3b" spacing={10} /></Sequence>
    <Sequence from={s(23)}><End /></Sequence>

    {/* sound */}
    <Snd at={0} f="drone.wav" v={0.55} dur={14.6} loop />
    <Snd at={2.9} f="v1.wav" /><Snd at={5.9} f="v2.wav" /><Snd at={7.3} f="ping_dark.wav" v={0.6} />
    <Snd at={8.3} f="heartbeat.wav" v={0.9} /><Snd at={9.3} f="v3.wav" /><Snd at={11.0} f="v4.wav" />
    <Snd at={12.7} f="v5.wav" /><Snd at={13.9} f="swell.wav" v={0.7} />
    <Snd at={14.6} f="braam.wav" v={1} /><Snd at={15.7} f="v6.wav" />
    {Array.from({ length: 14 }).map((_, i) => <Snd key={i} at={17.3 + 4 * (1 - Math.pow(1 - i / 14, 1.6))} f="ping.wav" v={0.35} dur={0.5} />)}
    <Snd at={17.6} f="riser.wav" v={0.7} dur={3} /><Snd at={18.4} f="heartbeat.wav" v={0.8} />
    <Snd at={20.4} f="braam.wav" v={1} />
    <Snd at={22.2} f="ping.wav" v={0.8} dur={0.6} />
    <Snd at={23} f="pad.wav" v={0.6} dur={8} /><Snd at={23.4} f="v7.wav" />
  </AbsoluteFill>
);
