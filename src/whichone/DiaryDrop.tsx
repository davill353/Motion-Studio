import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "DIARY DROP": falling-block game parody (own name). Appointments + junk pile up, The AI Pound tidies the diary and clears the lines.
const FPS = 30, s = (x: number) => Math.round(x * FPS);
const PX = "'PS2P', monospace";
const fontFace = `@font-face { font-family: 'PS2P'; src: url('${staticFile("fonts/PressStart2P.woff2")}') format('woff2'); }`;
const D = (f: string) => staticFile(`whichone/diary/${f}`);
const SFX = (f: string) => staticFile(`whichone/sfx/${f}`);
const COLS = 8, ROWS = 12, CELL = 92, GX = (1080 - COLS * CELL) / 2, GY = 330;
export const DIARY_SECONDS = 30;

type Piece = { id: string; w: number; label: string; colour: string; m: [number, number]; t?: [number, number]; junk?: boolean; fixed?: string; removed?: boolean };
const PIECES: Piece[] = [
  { id: "cut", w: 4, label: "Cut & blow-dry", colour: "#6bb6ff", m: [0, 11], t: [0, 11] },
  { id: "lash", w: 2, label: "Lashes", colour: "#6ee7a8", m: [5, 11], t: [6, 10] },
  { id: "fac1", w: 3, label: "Facial", colour: "#ff8fb1", m: [0, 10], t: [0, 10] },
  { id: "noshow", w: 2, label: "No-show", colour: "#ff3b3b", m: [3, 10], junk: true, removed: true },
  { id: "brow1", w: 1, label: "Brows", colour: "#f9a8d4", m: [6, 10], t: [7, 9] },
  { id: "col", w: 4, label: "Colour", colour: "#b07cff", m: [1, 9], t: [4, 11] },
  { id: "wax", w: 1, label: "Wax", colour: "#fca5a5", m: [6, 9], t: [2, 8] },
  { id: "dm", w: 2, label: "DM: price?", colour: "#ff3b3b", m: [0, 8], t: [4, 8], junk: true, fixed: "✓ Booked" },
  { id: "mass", w: 3, label: "Massage", colour: "#ffb86b", m: [3, 8], t: [3, 10] },
  { id: "nail", w: 2, label: "Nails", colour: "#ffd23a", m: [6, 8], t: [3, 9] },
  { id: "dbl", w: 3, label: "Double-booked!", colour: "#ff3b3b", m: [2, 7], junk: true, removed: true },
  { id: "cons", w: 2, label: "Consult", colour: "#5eead4", m: [5, 7], t: [5, 9] },
  { id: "fac2", w: 3, label: "Facial", colour: "#ff8fb1", m: [0, 6], t: [0, 9] },
  { id: "miss", w: 2, label: "Missed call", colour: "#ff3b3b", m: [4, 6], t: [6, 8], junk: true, fixed: "✓ Booked" },
  { id: "brow2", w: 1, label: "Brows", colour: "#f9a8d4", m: [7, 6], t: [3, 8] },
  { id: "pedi", w: 2, label: "Pedi", colour: "#a3e635", m: [2, 5], t: [0, 8] },
];
const DROP0 = 2.8, DROP_GAP = 0.65, FALL = 0.45;
const OVER = 14.6, POWER = 16.6, FIX = 17.6, TIDY = [18.4, 19.6], FLASH = 19.8, CLEAR = 20.6;

const Block: React.FC<{ p: Piece; i: number }> = ({ p, i }) => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const land = DROP0 + i * DROP_GAP;
  if (t < land - FALL) return null;
  const fallP = interpolate(t, [land - FALL, land], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let x = p.m[0], y = -2 + (p.m[1] + 2) * fallP * fallP;
  if (p.t && t >= TIDY[0]) {
    const k = interpolate(t, TIDY, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); const e = k * k * (3 - 2 * k);
    x = p.m[0] + (p.t[0] - p.m[0]) * e; y = p.m[1] + (p.t[1] - p.m[1]) * e;
  }
  const fixedNow = p.fixed && t >= FIX;
  const removing = p.removed && t >= FIX;
  const goneP = removing ? interpolate(t, [FIX, FIX + 0.6], [1, 0], { extrapolateRight: "clamp" }) : 1;
  if (removing && goneP <= 0) return null;
  const inCleared = p.t && p.t[1] >= 8 && t >= CLEAR;
  const clearP = inCleared ? interpolate(t, [CLEAR, CLEAR + 0.4], [1, 0], { extrapolateRight: "clamp" }) : 1;
  if (inCleared && clearP <= 0) return null;
  const flash = p.t && p.t[1] >= 8 && t >= FLASH && t < CLEAR ? (Math.floor(frame / 3) % 2 ? 1 : 0) : 0;
  const colour = fixedNow ? P.mint : p.colour;
  const grey = t >= OVER && t < POWER + 0.5 ? 1 : 0;
  return (
    <div style={{ position: "absolute", left: GX + x * CELL + 3, top: GY + y * CELL + 3, width: p.w * CELL - 6, height: CELL - 6, borderRadius: 12,
      background: flash ? "#fff" : p.junk && !fixedNow ? `repeating-linear-gradient(45deg, ${colour}, ${colour} 14px, #c41f1f 14px, #c41f1f 28px)` : colour,
      boxShadow: "inset 0 -8px 0 rgba(0,0,0,0.22), inset 0 6px 0 rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: P.font, fontWeight: 900, fontSize: p.w === 1 ? 17 : 24, color: p.junk && !fixedNow ? "#fff" : "#10172a", textAlign: "center", lineHeight: 1.05,
      opacity: goneP, transform: `scale(${removing ? 0.6 + 0.4 * goneP : 1}, ${clearP})`, filter: `grayscale(${grey})`, padding: 4 }}>
      {removing ? "✕" : fixedNow ? p.fixed : p.label}
    </div>
  );
};

const Banner: React.FC<{ text: string; colour: string; sub?: string; top?: number }> = ({ text, colour, sub, top = GY + 260 }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame, fps, config: { damping: 9, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", transform: `scale(${sc})` }}>
      <div style={{ display: "inline-block", background: "rgba(0,0,0,0.85)", border: "6px solid #fff", padding: "26px 30px" }}>
        <div style={{ fontFamily: PX, fontSize: 52, color: colour, lineHeight: 1.35, whiteSpace: "pre-line" }}>{text}</div>
        {sub && <div style={{ fontFamily: PX, fontSize: 22, color: "#fff", marginTop: 14 }}>{sub}</div>}
      </div>
    </div>
  );
};

const End: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 12 } });
  const cta = spring({ frame: frame - 26, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: P.navy, alignItems: "center", textAlign: "center", paddingTop: 430, color: "#fff", fontFamily: P.font }}>
      <div style={{ fontFamily: PX, fontSize: 44, color: P.mint, lineHeight: 1.5 }}>CLEAR YOUR<br />DIARY CHAOS</div>
      <Img src={staticFile(P.logo)} style={{ width: 170, height: 170, borderRadius: 38, marginTop: 50, transform: `scale(${logo})` }} />
      <div style={{ fontWeight: 900, fontSize: 56, color: P.mint, marginTop: 40, transform: `scale(${cta})` }}>Comment AUTOMATE</div>
      <div style={{ position: "absolute", bottom: 500, fontSize: 22, opacity: 0.5, letterSpacing: 2 }}>A PARODY · DEMO DIARY · THE AI POUND</div>
    </AbsoluteFill>
  );
};

const Snd: React.FC<{ at: number; src: string; v?: number; dur?: number; loop?: boolean; rate?: number }> = ({ at, src, v = 1, dur = 5, loop, rate }) => (
  <Sequence from={s(at)} durationInFrames={s(dur)}><Audio src={src} volume={v} loop={loop} playbackRate={rate} /></Sequence>
);

export const DiaryDrop: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const danger = t >= 12.4 && t < OVER;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #120f2a, #0a0d1a)" }}>
      <style>{fontFace}</style>
      <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontFamily: PX, fontSize: 40, color: "#fff" }}>DIARY DROP</div>
      <div style={{ position: "absolute", top: 240, left: 0, right: 0, textAlign: "center", fontFamily: PX, fontSize: 20, color: "#ffd23a" }}>LEVEL: SATURDAY</div>
      {/* well */}
      <div style={{ position: "absolute", left: GX - 10, top: GY - 10, width: COLS * CELL + 20, height: ROWS * CELL + 20, border: "8px solid #e6e8f0", borderTop: "none", background: "rgba(255,255,255,0.03)",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: `${CELL}px ${CELL}px`, backgroundPosition: "10px 10px" }} />
      {danger && <div style={{ position: "absolute", left: GX, top: GY + 4 * CELL, width: COLS * CELL, height: 8, background: "#ff3b3b", opacity: Math.floor(frame / 5) % 2 ? 1 : 0.2 }} />}
      {PIECES.map((p, i) => <Block key={p.id} p={p} i={i} />)}
      <Sequence durationInFrames={s(2.8)}><Banner text={"DIARY\nDROP"} colour="#ffd23a" sub="PRESS START" /></Sequence>
      <Sequence from={s(OVER)} durationInFrames={s(POWER - OVER)}><Banner text={"DIARY\nOVERLOAD"} colour="#ff3b3b" sub="GAME OVER?" /></Sequence>
      <Sequence from={s(POWER)} durationInFrames={s(1.6)}><Banner text={"POWER-UP!"} colour={P.mint} sub="THE AI POUND" top={GY + 80} /></Sequence>
      <Sequence from={s(CLEAR)} durationInFrames={s(2.2)}><Banner text={"LINE CLEAR\n×4!"} colour="#ffd23a" sub="DIARY FULL · GAPS 0" top={GY + 380} /></Sequence>
      <Sequence from={s(22.8)} durationInFrames={s(2.4)}>
        <div style={{ position: "absolute", top: GY + 300, left: 0, right: 0, textAlign: "center", fontFamily: PX, fontSize: 30, color: "#fff", lineHeight: 2 }}>
          BOOKINGS 32<br />DOUBLE-BOOKED 0<br /><span style={{ color: P.mint }}>ALL DMs ANSWERED</span></div></Sequence>
      <Sequence from={s(25.2)}><End /></Sequence>

      {/* sound */}
      <Snd at={0} src={SFX("start.wav")} v={0.6} dur={0.6} /><Snd at={0.4} src={D("t1.wav")} />
      <Snd at={2.8} src={SFX("tension.wav")} v={0.28} dur={9.6} loop /><Snd at={12.4} src={SFX("tension.wav")} v={0.3} dur={2.2} rate={1.35} />
      {PIECES.map((p, i) => <Snd key={p.id} at={DROP0 + i * DROP_GAP} src={SFX(p.junk ? "crit.wav" : "hit.wav")} v={p.junk ? 0.35 : 0.3} dur={0.4} />)}
      <Snd at={6.0} src={D("t2.wav")} /><Snd at={12.4} src={SFX("alarm.wav")} v={0.3} dur={2.2} />
      <Snd at={OVER} src={SFX("gameover.wav")} v={0.5} dur={1.5} /><Snd at={14.9} src={D("t3.wav")} />
      <Snd at={POWER} src={SFX("coin.wav")} v={0.5} dur={0.6} /><Snd at={POWER + 0.3} src={SFX("powerup.wav")} v={0.5} dur={1.2} /><Snd at={16.9} src={D("t4.wav")} />
      <Snd at={TIDY[0]} src={SFX("victory.wav")} v={0.25} dur={6.8} />
      <Snd at={CLEAR} src={SFX("complete.wav")} v={0.6} dur={1.6} /><Snd at={20.9} src={D("t5.wav")} />
      <Snd at={25.5} src={D("n1.wav")} />
    </AbsoluteFill>
  );
};
