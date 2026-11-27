import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "THE ORDER BOOK: a love story": romance parody. The chef's messy paper order book vs the tablet that finally understands him.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/lunch-rush/A.mp4", B = "whichone/lunch-rush/B.mp4";
const R = (f: string) => staticFile(`whichone/romance/${f}`);
const SERIF = "'PlayfairI', Georgia, serif";
const fontFace = `@font-face { font-family: 'PlayfairI'; font-style: italic; font-weight: 400; src: url('${staticFile("fonts/PlayfairItalic.woff2")}') format('woff2'); }
@font-face { font-family: 'PlayfairI'; font-style: italic; font-weight: 700; src: url('${staticFile("fonts/PlayfairBoldItalic.woff2")}') format('woff2'); }`;
const BAND_TOP = 656, BAND_H = 608;
const ROSE = "#ff8fb1";
export const ORDERBOOK_SECONDS = 31;

const Shot: React.FC<{ src: string; at: number; rate?: number; dream?: boolean }> = ({ src, at, rate = 0.6, dream }) => {
  const frame = useCurrentFrame();
  const z = 1.04 + frame * 0.0025;
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden", opacity: fadeIn }}>
      <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} muted
        style={{ width: 1080, height: BAND_H, objectFit: "cover", transform: `scale(${z})`,
          filter: dream ? "brightness(1.12) saturate(1.1) contrast(0.95)" : "sepia(0.45) contrast(1.05) brightness(0.85) saturate(0.8)" }} />
      {dream && <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} muted
        style={{ position: "absolute", inset: 0, width: 1080, height: BAND_H, objectFit: "cover", transform: `scale(${z})`, filter: "blur(18px) brightness(1.4)", mixBlendMode: "screen", opacity: 0.55 }} />}
      <AbsoluteFill style={{ background: dream ? "radial-gradient(ellipse at 60% 40%, rgba(255,200,220,0.25), transparent 60%)" : "rgba(60,30,10,0.15)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)" }} />
    </div>
  );
};

const Words: React.FC<{ text: string; top?: number; size?: number; colour?: string; weight?: number }> = ({ text, top = 1330, size = 64, colour = "#f3e6da", weight = 400 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: weight, fontSize: size,
    color: colour, opacity: o, lineHeight: 1.25, whiteSpace: "pre-line", textShadow: "0 4px 24px rgba(0,0,0,0.8)" }}>{text}</div>;
};

const Heart: React.FC<{ size: number; colour: string }> = ({ size, colour }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.6 2 5 5.6 5c2 0 3.4 1.1 4.4 2.5C11 6.1 12.4 5 14.4 5 18 5 19.6 8.6 18 11.7 15.5 16.4 12 21 12 21z" transform="translate(2 0)" fill={colour} /></svg>
);

const Hearts: React.FC<{ n?: number; burst?: boolean }> = ({ n = 14, burst }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x0 = burst ? 540 : 60 + random(`hx${i}`) * 960;
        const dx = burst ? (random(`bx${i}`) - 0.5) * 900 : (random(`dx${i}`) - 0.5) * 80;
        const delay = burst ? 0 : random(`d${i}`) * 60;
        const f = Math.max(0, frame - delay);
        const prog = Math.min(1, f / (burst ? 40 : 110));
        const y = burst ? BAND_TOP + 300 - prog * (300 + random(`by${i}`) * 500) : BAND_TOP + BAND_H - prog * (BAND_H + 200);
        const o = frame < delay ? 0 : interpolate(prog, [0, 0.15, 0.8, 1], [0, 1, 1, 0]);
        const size = 30 + random(`s${i}`) * 50;
        return <div key={i} style={{ position: "absolute", left: x0 + dx * prog - size / 2, top: y, opacity: o, transform: `rotate(${(random(`r${i}`) - 0.5) * 40}deg)` }}>
          <Heart size={size} colour={i % 3 === 0 ? P.mint : ROSE} /></div>;
      })}
    </>
  );
};

const OrderCard: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const lines = ["2× chicken wrap (1 no onion)", "1× large chips", "2× Coke", "£21.40 · collection 6:30pm"];
  const inS = spring({ frame: frame - 10, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", top: 1300, left: 140, right: 140, background: "rgba(255,250,245,0.95)", borderRadius: 28, padding: "26px 34px",
      transform: `translateY(${(1 - inS) * 60}px)`, opacity: inS, boxShadow: "0 20px 60px rgba(255,143,177,0.35)", fontFamily: P.font, color: P.navy }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 36, color: "#c2477a", marginBottom: 10 }}>New order ♡</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 30, fontWeight: i === 3 ? 900 : 600, padding: "4px 0", opacity: interpolate(frame, [25 + i * 12, 33 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{l}</div>
      ))}
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const t2 = interpolate(frame, [s(1.6), s(2.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - s(2.2), fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - s(3.6), fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #3a1f33, #120b16 75%)", opacity: a, alignItems: "center", textAlign: "center", paddingTop: 330 }}>
      <Hearts n={10} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 112, color: "#f7e7dc", lineHeight: 1.05 }}>The Order Book</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: ROSE, marginTop: 10 }}>a love story</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: "#f7e7dc", marginTop: 90, opacity: t2 }}>Find your perfect match.</div>
      <Img src={staticFile(P.logo)} style={{ width: 150, height: 150, borderRadius: 34, marginTop: 34, transform: `scale(${logo})` }} />
      <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 52, color: P.mint, marginTop: 34, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontFamily: P.font, fontSize: 22, color: "#fff", opacity: 0.5, letterSpacing: 2 }}>A PARODY · AI-GENERATED SCENES · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; f: string; v?: number; dur?: number }> = ({ at, f, v = 1, dur = 4 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={R(f)} volume={v} /></Sequence>
);

export const OrderBook: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0a0c" }}>
    <style>{fontFace}</style>
    <Sequence from={s(0.3)} durationInFrames={s(2.7)}><Words text="This winter…" top={820} size={58} /></Sequence>
    <Sequence from={s(1.3)} durationInFrames={s(1.7)}><Words text="a love story" top={920} size={80} colour={ROSE} weight={700} /></Sequence>
    <Sequence from={s(3.0)} durationInFrames={s(3.2)}><Shot src={A} at={11.0} /><Words text="Together for years…" /></Sequence>
    <Sequence from={s(6.2)} durationInFrames={s(3.2)}><Shot src={A} at={15.0} /><Words text={"…but she never really\nunderstood him."} /></Sequence>
    <Sequence from={s(9.4)} durationInFrames={s(3.2)}><Shot src={A} at={22.5} /><Words text="And the customers noticed." /></Sequence>
    <Sequence from={s(12.6)} durationInFrames={s(1.6)}><Words text="Then…" top={900} size={84} colour={ROSE} /></Sequence>
    <Sequence from={s(14.2)} durationInFrames={s(4.4)}><Shot src={B} at={10.4} rate={0.5} dream /><Hearts n={12} /><OrderCard /></Sequence>
    <Sequence from={s(18.6)} durationInFrames={s(3.2)}><Shot src={B} at={12.0} rate={0.55} dream /><Sequence from={s(1.0)}><Hearts n={22} burst /></Sequence>
      <Words text="And for the first time…" /></Sequence>
    <Sequence from={s(21.8)} durationInFrames={s(2.8)}><Shot src={B} at={21.5} rate={0.7} dream /><Hearts n={10} /><Words text="…and the order was right." colour={ROSE} /></Sequence>
    <Sequence from={s(24.6)}><End /></Sequence>

    {/* sound */}
    <Sequence from={0} durationInFrames={s(14.2)}><Audio src={R("piano_sad.wav")} volume={(f) => 0.5 * Math.min(1, f / 15) * Math.min(1, (s(14.2) - f) / 20)} /></Sequence>
    <Sequence from={s(13.8)} durationInFrames={s(17.2)}><Audio src={R("strings.wav")} volume={(f) => 0.55 * Math.min(1, f / 20) * Math.min(1, (s(17.2) - f) / 30)} /></Sequence>
    <Snd at={0.3} f="r1.wav" /><Snd at={3.4} f="r2.wav" /><Snd at={6.5} f="r3.wav" /><Snd at={9.7} f="r4.wav" />
    <Snd at={12.8} f="r5.wav" /><Snd at={14.6} f="sparkle.wav" v={0.5} dur={2.5} /><Snd at={15.6} f="r6.wav" />
    <Snd at={19.6} f="sparkle.wav" v={0.6} dur={2.5} /><Snd at={19.2} f="r7.wav" />
    <Snd at={26.0} f="r8.wav" />
  </AbsoluteFill>
);
