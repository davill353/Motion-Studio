import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "MESSAGE FIGHTER": fighting-game parody (own name/style). Personal trainer vs THE DMs, The AI Pound tags in. Gym clips.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const A = "whichone/gym/A.mp4", B = "whichone/gym/B.mp4";
const F = (f: string) => staticFile(`whichone/fighter/${f}`);
const SFX = (f: string) => staticFile(`whichone/sfx/${f}`);
const BIG = "'AntonF', 'Arial Black', sans-serif";
const fontFace = `@font-face { font-family: 'AntonF'; src: url('${staticFile("fonts/Anton.woff2")}') format('woff2'); }`;
const BAND_TOP = 560, BAND_H = 608;
export const FIGHTER_SECONDS = 34;

type Hit = { at: number; dmg: number; label: string; who: "dm" | "ai" };
const HITS: Hit[] = [
  { at: 6.0, dmg: 10, label: "how much is membership?", who: "dm" }, { at: 6.6, dmg: 10, label: "free trial??", who: "dm" },
  { at: 7.2, dmg: 10, label: "is 6pm full?", who: "dm" }, { at: 7.8, dmg: 10, label: "hello???", who: "dm" },
  { at: 12.0, dmg: 15, label: "CLIENT LEFT WAITING", who: "dm" }, { at: 14.5, dmg: 20, label: "MISSED CALL KICK", who: "dm" },
  { at: 18.4, dmg: 15, label: "11PM UPPERCUT", who: "dm" },
];
const AI_COMBO_START = 24.0, AI_COMBO_END = 27.0, KO = 27.0;

const p1Hp = (t: number) => (t >= 22 ? interpolate(t, [22, 23.2], [10, 100], { extrapolateRight: "clamp" }) : 100 - HITS.filter((h) => t >= h.at).reduce((a, h) => a + h.dmg, 0));
const dmHp = (t: number) => interpolate(t, [AI_COMBO_START, AI_COMBO_END], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Bar: React.FC<{ hp: number; flip?: boolean; name: string; colour: string }> = ({ hp, flip, name, colour }) => (
  <div style={{ width: 430, display: "flex", flexDirection: "column", alignItems: flip ? "flex-end" : "flex-start" }}>
    <div style={{ width: 430, height: 46, background: "#3a0a0a", border: "5px solid #fff", transform: `skewX(${flip ? 15 : -15}deg)`, display: "flex", justifyContent: flip ? "flex-start" : "flex-end", overflow: "hidden" }}>
      <div style={{ width: `${hp}%`, height: "100%", background: hp > 30 ? `linear-gradient(180deg, #ffe066, ${colour})` : "linear-gradient(180deg, #ff9a7a, #e02a1a)" }} />
    </div>
    <div style={{ fontFamily: BIG, fontSize: 38, color: "#fff", marginTop: 6, letterSpacing: 2, textShadow: "3px 3px 0 #000" }}>{name}</div>
  </div>
);

const Announce: React.FC<{ text: string; colour?: string; size?: number; top?: number }> = ({ text, colour = "#ffd23a", size = 170, top = BAND_TOP + 170 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = interpolate(spring({ frame, fps, config: { damping: 9, stiffness: 260 } }), [0, 1], [3, 1]);
  return <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontSize: size, color: colour, fontStyle: "italic",
    letterSpacing: 4, transform: `scale(${sc})`, WebkitTextStroke: "6px #000", paintOrder: "stroke fill", textShadow: "8px 8px 0 rgba(0,0,0,0.6)", whiteSpace: "pre-line", lineHeight: 0.95 }}>{text}</div>;
};

const HitFx: React.FC<{ h: Hit; i: number }> = ({ h, i }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 2, 16, 22], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const x = 120 + random(`hx${i}`) * 520, y = BAND_TOP + 60 + random(`hy${i}`) * 360;
  const big = h.dmg >= 15;
  return (
    <div style={{ position: "absolute", left: big ? 0 : x, right: big ? 0 : undefined, top: big ? BAND_TOP + 220 : y, opacity: o, textAlign: "center", transform: `rotate(${big ? -4 : (random(`r${i}`) - 0.5) * 20}deg)` }}>
      <span style={{ fontFamily: big ? BIG : P.font, fontWeight: 900, fontSize: big ? 84 : 34, color: big ? "#ffd23a" : "#111", background: big ? "transparent" : "#fff",
        padding: big ? 0 : "10px 16px", borderRadius: 14, border: big ? "none" : "4px solid #111", WebkitTextStroke: big ? "4px #000" : undefined, paintOrder: "stroke fill", fontStyle: big ? "italic" : "normal" }}>
        {big ? h.label + "!" : `💬 ${h.label}`}</span>
    </div>
  );
};

const VS: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const l = spring({ frame, fps, config: { damping: 14 } }), r = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const v = spring({ frame: frame - 12, fps, config: { damping: 8, stiffness: 260 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #1b2a8f 50%, #8f1b1b 50%)" }}>
      <div style={{ position: "absolute", top: 520, left: 40, width: 470, height: 620, overflow: "hidden", border: "8px solid #fff", transform: `translateX(${(1 - l) * -600}px) skewY(-4deg)` }}>
        <OffthreadVideo src={staticFile(A)} startFrom={s(2)} muted style={{ width: 1080, height: 620, objectFit: "cover", marginLeft: -300 }} /></div>
      <div style={{ position: "absolute", top: 520, right: 40, width: 470, height: 620, border: "8px solid #fff", background: "#220", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 300, transform: `translateX(${(1 - r) * 600}px) skewY(-4deg)` }}>💬</div>
      <div style={{ position: "absolute", top: 1170, left: 40, width: 470, textAlign: "center", fontFamily: BIG, fontSize: 64, color: "#fff" }}>THE TRAINER</div>
      <div style={{ position: "absolute", top: 1170, right: 40, width: 470, textAlign: "center", fontFamily: BIG, fontSize: 64, color: "#fff" }}>THE DMs</div>
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontSize: 220, color: "#ffd23a", fontStyle: "italic", transform: `scale(${v})`,
        WebkitTextStroke: "8px #000", paintOrder: "stroke fill" }}>VS</div>
    </AbsoluteFill>
  );
};

const TagIn: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const flash = interpolate(frame, [0, 6], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle, ${P.mint} 0%, ${P.navy} 70%)`, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <Img src={staticFile(P.logo)} style={{ width: 340, height: 340, borderRadius: 70, transform: `scale(${sc}) rotate(${(1 - sc) * 180}deg)`, boxShadow: `0 0 80px 20px ${P.mint}` }} />
      <div style={{ fontFamily: BIG, fontSize: 92, color: "#fff", marginTop: 40, fontStyle: "italic", WebkitTextStroke: "5px #000", paintOrder: "stroke fill" }}>THE AI POUND</div>
      <div style={{ fontFamily: BIG, fontSize: 58, color: "#ffd23a", fontStyle: "italic" }}>JOINS THE FIGHT!</div>
    </AbsoluteFill>
  );
};

const Combo: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.min(40, Math.floor(frame / 2) + 1);
  return (
    <>
      <div style={{ position: "absolute", top: BAND_TOP + 40, right: 40, textAlign: "right", fontFamily: BIG, fontStyle: "italic", color: P.mint, WebkitTextStroke: "5px #000", paintOrder: "stroke fill" }}>
        <div style={{ fontSize: 120, lineHeight: 1 }}>{n} HITS</div><div style={{ fontSize: 50, color: "#fff" }}>AUTO-REPLY COMBO!</div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => {
        const f = (frame + i * 5) % 30;
        return <div key={i} style={{ position: "absolute", left: 80 + (i % 3) * 300, top: BAND_TOP + 260 + Math.floor(i / 3) * 150, opacity: interpolate(f, [0, 4, 20, 28], [0, 1, 1, 0]),
          fontFamily: P.font, fontWeight: 900, fontSize: 30, background: P.mint, color: P.navy, padding: "10px 16px", borderRadius: 14, border: "4px solid #111" }}>✓ replied</div>;
      })}
    </>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 26, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 440, color: "#fff" }}>
      <div style={{ fontFamily: BIG, fontSize: 96, fontStyle: "italic", lineHeight: 1.05 }}>DON'T FIGHT<br /><span style={{ color: P.mint }}>YOUR DMs ALONE</span></div>
      <Img src={staticFile(P.logo)} style={{ width: 160, height: 160, borderRadius: 36, marginTop: 44, transform: `scale(${logo})` }} />
      <div style={{ fontFamily: P.font, fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 36, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontFamily: P.font, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>A PARODY · AI-GENERATED SCENES · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; src: string; v?: number; dur?: number; loop?: boolean }> = ({ at, src, v = 1, dur = 3, loop }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={src} volume={v} loop={loop} /></Sequence>
);

export const MessageFighter: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const last = [...HITS].reverse().find((h) => t >= h.at);
  const since = last ? t - last.at : 99;
  const shake = since < 0.2 ? (last!.dmg >= 15 ? 24 : 10) * Math.sin(frame * 3) : t >= AI_COMBO_START && t < AI_COMBO_END ? 8 * Math.sin(frame * 2.5) : 0;
  const hud = t >= 3.5 && t < 30 && !(t >= 21.5 && t < 23.5);
  const timer = Math.max(0, 99 - Math.floor(Math.max(0, t - 3.5) * 3));
  return (
    <AbsoluteFill style={{ background: "#0b0b14" }}>
      <style>{fontFace}</style>
      {/* title + VS */}
      <Sequence durationInFrames={s(2)}><AbsoluteFill style={{ background: "#0b0b14" }}>
        <OffthreadVideo src={staticFile(A)} startFrom={s(0.5)} muted style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover", filter: "grayscale(0.6) brightness(0.6)" }} />
        <Announce text={"MESSAGE\nFIGHTER"} colour="#ff4a3a" size={180} top={BAND_TOP + 90} />
        <div style={{ position: "absolute", top: BAND_TOP + BAND_H + 60, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontSize: 54, color: "#fff", opacity: Math.floor(frame / 8) % 2 ? 0.3 : 1 }}>PRESS START</div>
      </AbsoluteFill></Sequence>
      <Sequence from={s(2)} durationInFrames={s(1.5)}><VS /></Sequence>
      {/* fight footage */}
      <div style={{ transform: `translate(${shake}px, ${shake / 2}px)` }}>
        <Sequence from={s(3.5)} durationInFrames={s(6.5)}><OffthreadVideo src={staticFile(A)} startFrom={s(2.5)} volume={0.2} style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} /></Sequence>
        <Sequence from={s(10)} durationInFrames={s(4)}><OffthreadVideo src={staticFile(A)} startFrom={s(11)} volume={0.2} style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} /></Sequence>
        <Sequence from={s(14)} durationInFrames={s(4)}><OffthreadVideo src={staticFile(A)} startFrom={s(20.5)} volume={0.2} style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} /></Sequence>
        <Sequence from={s(18)} durationInFrames={s(3.5)}><OffthreadVideo src={staticFile(A)} startFrom={s(31)} volume={0.2} style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover",
          filter: t >= 20 ? `saturate(${0.4 + 0.6 * (Math.floor(frame / 6) % 2)})` : "none" }} /></Sequence>
        <Sequence from={s(23.5)} durationInFrames={s(2.5)}><OffthreadVideo src={staticFile(B)} startFrom={s(0.5)} volume={0.2} style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} /></Sequence>
        <Sequence from={s(26)} durationInFrames={s(4)}><OffthreadVideo src={staticFile(B)} startFrom={s(20.3)} volume={0.2} style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, objectFit: "cover" }} /></Sequence>
        {since < 0.12 && <div style={{ position: "absolute", top: BAND_TOP, width: 1080, height: BAND_H, background: "#ff2a2a", opacity: 0.4 }} />}
        {hud && <div style={{ position: "absolute", top: BAND_TOP - 6, left: 0, right: 0, height: BAND_H + 12, border: "6px solid #fff" }} />}
      </div>
      {/* HUD */}
      {hud && (
        <div style={{ position: "absolute", top: 250, left: 40, right: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Bar hp={p1Hp(t)} name={t >= 23.5 ? "TRAINER + AI" : "THE TRAINER"} colour="#ffa31a" />
          <div style={{ fontFamily: BIG, fontSize: 84, color: "#fff", WebkitTextStroke: "4px #000", paintOrder: "stroke fill", marginTop: -8 }}>{timer}</div>
          <Bar hp={dmHp(t)} flip name="THE DMs" colour="#ffa31a" />
        </div>
      )}
      <Sequence from={s(3.5)} durationInFrames={s(0.8)}><Announce text="ROUND 1" colour="#fff" /></Sequence>
      <Sequence from={s(4.3)} durationInFrames={s(0.9)}><Announce text="FIGHT!" colour="#ff4a3a" /></Sequence>
      {HITS.map((h, i) => <Sequence key={i} from={s(h.at)} durationInFrames={24}><HitFx h={h} i={i} /></Sequence>)}
      <Sequence from={s(6.0)} durationInFrames={s(2.4)}><div style={{ position: "absolute", top: BAND_TOP + BAND_H + 40, left: 0, right: 0, textAlign: "center", fontFamily: BIG, fontStyle: "italic", fontSize: 80, color: "#ff4a3a", WebkitTextStroke: "4px #000", paintOrder: "stroke fill" }}>DM BARRAGE x4</div></Sequence>
      <Sequence from={s(20.0)} durationInFrames={s(1.5)}><Announce text="DANGER!" colour="#ff2a1a" size={150} top={BAND_TOP + BAND_H + 30} /></Sequence>
      <Sequence from={s(21.5)} durationInFrames={s(2)}><TagIn /></Sequence>
      <Sequence from={s(AI_COMBO_START)} durationInFrames={s(AI_COMBO_END - AI_COMBO_START)}><Combo /></Sequence>
      <Sequence from={s(KO)} durationInFrames={s(1.6)}><Announce text="K.O.!" colour="#ff4a3a" size={240} /></Sequence>
      <Sequence from={s(28.6)} durationInFrames={s(1.4)}><Announce text={"WINNER!"} colour={P.mint} size={170} /></Sequence>
      <Sequence from={s(30)}><End /></Sequence>

      {/* sound */}
      <Snd at={0} src={SFX("start.wav")} v={0.6} dur={0.6} />
      <Snd at={2} src={staticFile("whichone/action/impact.wav")} v={0.7} dur={1.5} />
      <Snd at={3.5} src={SFX("tension.wav")} v={0.3} dur={18} loop />
      <Snd at={3.6} src={F("a1.wav")} />
      {HITS.map((h, i) => <Snd key={i} at={h.at} src={SFX(h.dmg >= 15 ? "crit.wav" : "hit.wav")} v={0.6} dur={0.5} />)}
      <Snd at={6.1} src={F("a2.wav")} /><Snd at={14.6} src={F("a3.wav")} /><Snd at={18.5} src={F("a4.wav")} />
      <Snd at={20.0} src={F("a5.wav")} /><Snd at={20.0} src={SFX("alarm.wav")} v={0.35} dur={1.5} />
      <Snd at={21.5} src={SFX("powerup.wav")} v={0.6} dur={1.2} /><Snd at={21.8} src={F("a6.wav")} />
      {Array.from({ length: 20 }).map((_, i) => <Snd key={i} at={AI_COMBO_START + i * 0.15} src={SFX("hit.wav")} v={0.3} dur={0.2} />)}
      <Snd at={24.1} src={F("a7.wav")} /><Snd at={KO} src={staticFile("whichone/action/impact.wav")} v={0.9} dur={1.5} /><Snd at={KO + 0.1} src={F("a8.wav")} />
      <Snd at={23.5} src={SFX("victory.wav")} v={0.25} dur={6.5} /><Snd at={28.6} src={SFX("complete.wav")} v={0.5} dur={1.5} /><Snd at={28.8} src={F("a9.wav")} />
      <Snd at={30.4} src={F("n1.wav")} />
    </AbsoluteFill>
  );
};
