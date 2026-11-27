import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "POV: you're the phone in a busy salon": the phone narrates its life. Salon clips from Two Salons.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/two-salons/A.mp4", B = "whichone/two-salons/B.mp4";
const V = (f: string) => staticFile(`whichone/pov/${f}`);
const BAND_TOP = 520, BAND_H = 608;
export const POV_SECONDS = 32;

// when the phone character is talking: [start, end] seconds
const TALK: [number, number][] = [[2.5, 4.1], [4.6, 7.1], [7.7, 9.0], [9.6, 10.7], [11.2, 13.1], [13.8, 18.9]];
const COUSIN_TALK: [number, number][] = [[19.4, 21.7], [22.1, 25.5], [25.8, 27.3]];
const BUZZ = [3.0, 4.2, 5.0, 5.8, 6.6, 8.2, 11.6, 12.4, 14.2];
const LINES: [number, number, string][] = [
  [2.4, 4.4, "Hi. I'm the salon phone."], [4.4, 7.6, "4 new messages. She hasn't even looked at me."],
  [7.6, 9.5, "Wait… she's reaching for me!"], [9.5, 11.0, "…She picked up the comb."], [11.0, 13.6, "Now she's on the OTHER phone. Rude."],
  [13.6, 19.2, "9pm. Finally, she picks me up. 47 messages. She looks so tired."],
  [19.2, 22.0, "My cousin works at the salon down the road."], [22.0, 25.6, "Her messages get answered by AI. She just… chills."], [25.6, 27.6, "Honestly? I'm jealous."],
];

const Clip: React.FC<{ src: string; at: number; rate?: number }> = ({ src, at, rate = 1 }) => (
  <div style={{ position: "absolute", top: BAND_TOP, left: 0, width: 1080, height: BAND_H, overflow: "hidden", borderRadius: 0 }}>
    <OffthreadVideo src={staticFile(src)} startFrom={s(at)} playbackRate={rate} volume={0.25} style={{ width: 1080, height: BAND_H, objectFit: "cover" }} />
  </div>
);

const PhoneChar: React.FC<{ t: number; talk: [number, number][]; badge: number; sad: boolean; cool?: boolean; x: number }> = ({ t, talk, badge, sad, cool, x }) => {
  const frame = useCurrentFrame();
  const talking = talk.some(([a, b]) => t >= a && t <= b);
  const mouth = talking ? 10 + 18 * Math.abs(Math.sin(frame / 2.6)) : 6;
  const buzz = !cool && BUZZ.some((b) => t >= b && t < b + 0.35) ? Math.sin(frame * 4) * 10 : 0;
  const blink = frame % 90 < 4;
  return (
    <div style={{ position: "absolute", top: 1200, left: x, width: 210, height: 360, transform: `translateX(${buzz}px) rotate(${buzz / 3}deg)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: cool ? "linear-gradient(180deg, #2a8f6a, #1c5e47)" : "linear-gradient(180deg, #34405c, #1f2740)",
        border: "8px solid #11162a", boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }} />
      {/* eyes */}
      {[60, 130].map((ex) => (
        <div key={ex} style={{ position: "absolute", top: 110, left: ex - 14, width: 28, height: blink ? 4 : 34, borderRadius: 14, background: "#fff", marginTop: blink ? 15 : 0 }} />
      ))}
      {cool && <div style={{ position: "absolute", top: 100, left: 30, width: 150, height: 44, borderRadius: 12, background: "#111" }} />}
      {sad && !cool && [40, 116].map((ex, i) => <div key={ex} style={{ position: "absolute", top: 88, left: ex, width: 56, height: 8, borderRadius: 4, background: "#fff", transform: `rotate(${i ? -18 : 18}deg)` }} />)}
      {/* mouth */}
      <div style={{ position: "absolute", top: 200, left: 105 - 32, width: 64, height: mouth, borderRadius: sad && !talking ? "30px 30px 6px 6px" : "6px 6px 30px 30px", background: "#ff8fb1" }} />
      {badge > 0 && <div style={{ position: "absolute", top: -26, right: -26, minWidth: 74, height: 74, borderRadius: 37, background: "#ff3b30", color: "#fff", fontFamily: P.font,
        fontWeight: 900, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px", border: "5px solid #fff" }}>{badge}</div>}
      {cool && <div style={{ position: "absolute", top: -30, right: -20, fontSize: 64 }}>😎</div>}
    </div>
  );
};

const Speech: React.FC<{ text: string; left: number }> = ({ text, left }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", top: 1230, left, width: 1080 - left - 50, transform: `scale(${sc})`, transformOrigin: "left center" }}>
      <div style={{ background: "#fff", color: P.navy, fontFamily: P.font, fontWeight: 800, fontSize: 44, lineHeight: 1.22, padding: "22px 28px", borderRadius: 30, boxShadow: "0 14px 34px rgba(0,0,0,0.4)" }}>{text}</div>
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 26, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 440, color: "#fff", fontFamily: P.font }}>
      <div style={{ fontSize: 110 }}>📱😴</div>
      <div style={{ fontWeight: 900, fontSize: 80, lineHeight: 1.1, marginTop: 10 }}>Give your phone<br /><span style={{ color: P.mint }}>a break.</span></div>
      <Img src={staticFile(P.logo)} style={{ width: 160, height: 160, borderRadius: 36, marginTop: 44, transform: `scale(${logo})` }} />
      <div style={{ fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 36, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>AI-GENERATED SCENES · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; src: string; v?: number; dur?: number }> = ({ at, src, v = 1, dur = 6 }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={src} volume={v} /></Sequence>
);

export const PhonePOV: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const badge = t < 2.4 ? 1 : t < 7.6 ? 4 : t < 11 ? 9 : t < 13.6 ? 23 : 47;
  const cousin = t >= 19.2;
  return (
    <AbsoluteFill style={{ background: cousin ? `linear-gradient(180deg, ${P.navy}, #12382c)` : "linear-gradient(180deg, #2a1c2c, #16233b)" }}>
      <div style={{ position: "absolute", top: 250, left: 50, right: 50, textAlign: "center", fontFamily: P.font, fontWeight: 900, fontSize: 52, color: "#fff", lineHeight: 1.15 }}>
        POV: you're the phone<br /><span style={{ color: "#ffd27a" }}>in a busy salon</span></div>
      <Sequence durationInFrames={s(4.4)}><Clip src={A} at={0.5} /></Sequence>
      <Sequence from={s(4.4)} durationInFrames={s(3.2)}><Clip src={A} at={4.5} /></Sequence>
      <Sequence from={s(7.6)} durationInFrames={s(3.4)}><Clip src={A} at={13.2} /></Sequence>
      <Sequence from={s(11.0)} durationInFrames={s(2.6)}><Clip src={A} at={20.6} /></Sequence>
      <Sequence from={s(13.6)} durationInFrames={s(5.6)}><Clip src={A} at={31} rate={0.8} />
        <div style={{ position: "absolute", top: BAND_TOP + 24, right: 30, fontFamily: P.font, fontWeight: 900, fontSize: 36, color: P.navy, background: "#ffd27a", borderRadius: 12, padding: "4px 14px" }}>🕘 9:04 PM</div></Sequence>
      <Sequence from={s(19.2)} durationInFrames={s(2.8)}><Clip src={B} at={6} /></Sequence>
      <Sequence from={s(22.0)} durationInFrames={s(3.6)}><Clip src={B} at={0} /></Sequence>
      <Sequence from={s(25.6)} durationInFrames={s(2.0)}><Clip src={B} at={22} /></Sequence>
      {!cousin && <PhoneChar t={t} talk={TALK} badge={badge} sad={t >= 13.6} x={50} />}
      {cousin && t < 27.6 && <PhoneChar t={t} talk={COUSIN_TALK} badge={0} sad={false} cool x={50} />}
      {LINES.map(([a, b, txt], i) => <Sequence key={i} from={s(a)} durationInFrames={s(b - a)}><Speech text={txt} left={300} /></Sequence>)}
      <Sequence from={s(27.6)}><End /></Sequence>

      {/* sound */}
      <Sequence durationInFrames={s(27.6)}><Audio src={staticFile("pound/audio/music.mp3")} volume={0.12} /></Sequence>
      {BUZZ.map((b, i) => <Snd key={i} at={b} src={staticFile("whichone/trailer/ping.wav")} v={0.3} dur={0.5} />)}
      <Snd at={2.5} src={V("p1.wav")} /><Snd at={4.6} src={V("p2.wav")} /><Snd at={7.7} src={V("p3.wav")} /><Snd at={9.6} src={V("p4.wav")} />
      <Snd at={11.2} src={V("p5.wav")} /><Snd at={13.8} src={V("p6.wav")} /><Snd at={19.4} src={V("p7.wav")} /><Snd at={22.1} src={V("p8.wav")} />
      <Snd at={25.8} src={V("p9.wav")} /><Snd at={28.0} src={V("n1.wav")} />
    </AbsoluteFill>
  );
};
