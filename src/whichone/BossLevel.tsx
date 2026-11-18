import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

// "Boss Level: Saturday": the salon owner as a video-game character, DMs as enemies, The AI Pound as the power-up.
const fontFace = `@font-face { font-family: 'PS2P'; src: url('${staticFile("fonts/PressStart2P.woff2")}') format('woff2'); }`;
const PX = "'PS2P', monospace";
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

const SRC = "whichone/two-salons/A.mp4";
// video segments: [outStart, outEnd, srcStart]
const SEGS: [number, number, number][] = [[0, 3.5, 0.5], [3.5, 10, 3.0], [10, 15, 12.0], [15, 20.5, 20.6], [20.5, 30, 30.6]];
type Hit = { at: number; dmg: number; text: string; crit?: boolean };
const HITS: Hit[] = [
  { at: 4.4, dmg: 10, text: "how much is a facial?" },
  { at: 5.6, dmg: 10, text: "u open sunday??" },
  { at: 6.8, dmg: 10, text: "any space sat?" },
  { at: 8.0, dmg: 10, text: "price for brows pls" },
  { at: 9.1, dmg: 10, text: "hello???" },
  { at: 13.3, dmg: 20, text: "CRITICAL HIT", crit: true },
  { at: 16.4, dmg: 10, text: "📞 missed call" },
  { at: 18.0, dmg: 10, text: "walk-in waiting" },
  { at: 23.0, dmg: 5, text: "20 UNREAD DMs" },
];
const GAMEOVER = 24.2, POWER = 25.6, REFILL = [26.4, 27.4], COMPLETE = 30, END = 34.5;
export const BOSS_SECONDS = END;

const hpAt = (t: number) => {
  if (t >= REFILL[0]) return interpolate(t, REFILL, [5, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return 100 - HITS.filter((h) => t >= h.at).reduce((a, h) => a + h.dmg, 0);
};

const VIDEO_TOP = 520, VIDEO_H = 608;

const Bar: React.FC<{ value: number; max: number; colour: string; label: string; blink?: boolean }> = ({ value, max, colour, label, blink }) => {
  const frame = useCurrentFrame();
  const on = !blink || Math.floor(frame / 6) % 2 === 0;
  const cells = 20, filled = Math.round((value / max) * cells);
  return (
    <div style={{ fontFamily: PX, color: "#fff" }}>
      <div style={{ fontSize: 22, marginBottom: 10, opacity: on ? 1 : 0.35 }}>{label}</div>
      <div style={{ display: "flex", gap: 4, padding: 6, background: "#000", border: "4px solid #fff" }}>
        {Array.from({ length: cells }).map((_, i) => <div key={i} style={{ flex: 1, height: 30, background: i < filled ? colour : "#222", opacity: on ? 1 : 0.5 }} />)}
      </div>
    </div>
  );
};

const Bubble: React.FC<{ hit: Hit; i: number }> = ({ hit, i }) => {
  const frame = useCurrentFrame(); // local, 0 = 0.6 s before impact
  const travel = s(0.6);
  const x = interpolate(frame, [0, travel], [1100, 420 + (i % 3) * 40], { extrapolateRight: "clamp" });
  const y = VIDEO_TOP + 60 + (i * 97) % 380;
  const gone = frame > travel + 3;
  if (hit.crit) return null;
  return gone ? null : (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: PX, fontSize: 20, color: "#111", background: "#fff", padding: "12px 14px", border: "4px solid #111",
      boxShadow: "6px 6px 0 #ff5d5d", whiteSpace: "nowrap" }}>💬 {hit.text}</div>
  );
};

const Damage: React.FC<{ hit: Hit }> = ({ hit }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 24], [0, -90]);
  const o = interpolate(frame, [14, 26], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP + 220 + y, left: 0, right: 0, textAlign: "center", fontFamily: PX, opacity: o }}>
      {hit.crit && <div style={{ fontSize: 44, color: "#ffd27a", textShadow: "4px 4px 0 #000", marginBottom: 12 }}>CRITICAL HIT!</div>}
      <div style={{ fontSize: hit.crit ? 80 : 60, color: "#ff5d5d", textShadow: "5px 5px 0 #000" }}>-{hit.dmg} HP</div>
    </div>
  );
};

const Banner: React.FC<{ text: string; sub?: string; colour?: string; blink?: boolean }> = ({ text, sub, colour = "#fff", blink }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const sc = spring({ frame, fps, config: { damping: 9, stiffness: 180 } });
  const on = !blink || Math.floor(frame / 8) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP + VIDEO_H / 2 - 110, left: 0, right: 0, textAlign: "center", fontFamily: PX, transform: `scale(${sc})` }}>
      <div style={{ display: "inline-block", background: "rgba(0,0,0,0.82)", border: "6px solid #fff", padding: "26px 30px" }}>
        <div style={{ fontSize: 50, color: colour, textShadow: "5px 5px 0 #000", lineHeight: 1.3, opacity: on ? 1 : 0.2, whiteSpace: "pre-line" }}>{text}</div>
        {sub && <div style={{ fontSize: 22, color: "#fff", marginTop: 16, lineHeight: 1.6 }}>{sub}</div>}
      </div>
    </div>
  );
};

const Coin: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const y = interpolate(spring({ frame, fps, config: { damping: 8, stiffness: 90 } }), [0, 1], [-300, VIDEO_TOP + 150]);
  const spin = Math.abs(Math.cos(frame / 4));
  const glow = 30 + 20 * Math.sin(frame / 3);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Img src={staticFile(P.logo)} style={{ width: 260, height: 260, borderRadius: 60, transform: `scaleX(${0.25 + 0.75 * spin})`, boxShadow: `0 0 ${glow}px ${glow / 2}px ${P.mint}` }} />
    </div>
  );
};

const AutoReplies: React.FC = () => {
  const frame = useCurrentFrame();
  const items = ["how much is a facial?", "u open sunday??", "any space sat?", "price for brows pls", "hello???"];
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP + 40, left: 40, right: 40, display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((t, i) => {
        const at = i * 9;
        if (frame < at) return null;
        const done = frame > at + 10;
        return (
          <div key={i} style={{ alignSelf: i % 2 ? "flex-end" : "flex-start", fontFamily: PX, fontSize: 20, padding: "12px 14px", border: "4px solid #111",
            background: done ? P.mint : "#fff", color: "#111", boxShadow: "6px 6px 0 #111" }}>{done ? "✓ AUTO-REPLIED" : `💬 ${t}`}</div>
        );
      })}
    </div>
  );
};

const Complete: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const row = (i: number) => interpolate(frame, [12 + i * 10, 18 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stats: [string, string][] = [["MESSAGES ANSWERED", "ALL"], ["BOOKINGS TO APPROVE", "3 ✓"], ["DMS AT 9PM", "0"], ["STRESS", "LOW"]];
  const cta = spring({ frame: frame - 60, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: "#0a0f1e", fontFamily: PX, color: "#fff", alignItems: "center", paddingTop: 330 }}>
      <div style={{ fontSize: 62, color: P.mint, textShadow: "6px 6px 0 #000", textAlign: "center", lineHeight: 1.3 }}>LEVEL<br />COMPLETE!</div>
      <div style={{ marginTop: 60, width: 900 }}>
        {stats.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 26, padding: "16px 0", borderBottom: "3px dashed #334", opacity: row(i) }}>
            <span>{k}</span><span style={{ color: "#ffd27a" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 70, fontSize: 30, textAlign: "center", lineHeight: 1.7, transform: `scale(${cta})` }}>
        COMMENT <span style={{ color: P.mint }}>AUTOMATE</span><br />TO UNLOCK
      </div>
      <div style={{ position: "absolute", bottom: 520, fontSize: 14, opacity: 0.5, letterSpacing: 1 }}>AI-GENERATED SCENES · DEMO · THE AI POUND</div>
    </AbsoluteFill>
  );
};

export const BossLevel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const hp = hpAt(t);
  const lastHit = [...HITS].reverse().find((h) => t >= h.at);
  const since = lastHit ? t - lastHit.at : 99;
  const shake = since < 0.25 ? (lastHit?.crit ? 22 : 10) * Math.sin(frame * 3) : 0;
  const flash = since < 0.12 ? 0.45 : 0;
  const grey = t >= GAMEOVER && t < POWER + 0.6 ? interpolate(t, [GAMEOVER, GAMEOVER + 0.4, POWER, POWER + 0.6], [0, 1, 1, 0]) : 0;
  const boss = t >= 20.5 && t < REFILL[0];
  const powered = t >= POWER;
  return (
    <AbsoluteFill style={{ background: "#0a0f1e" }}>
      <style>{fontFace}</style>
      {/* game screen */}
      <div style={{ position: "absolute", top: VIDEO_TOP, left: 0, width: 1080, height: VIDEO_H, overflow: "hidden", transform: `translateX(${shake}px)`, border: "0", filter: `grayscale(${grey})` }}>
        {SEGS.map(([a, b, src], i) => (
          <Sequence key={i} from={s(a)} durationInFrames={s(b) - s(a)}>
            <OffthreadVideo src={staticFile(SRC)} startFrom={s(src)} volume={0.35} style={{ width: 1080, height: VIDEO_H, objectFit: "cover" }} />
          </Sequence>
        ))}
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 5px)" }} />
        <AbsoluteFill style={{ background: "#ff2a2a", opacity: flash }} />
        {powered && t < COMPLETE && <AbsoluteFill style={{ background: P.mint, opacity: interpolate(t, [POWER + 0.6, POWER + 0.8, POWER + 1.2], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />}
      </div>
      <div style={{ position: "absolute", top: VIDEO_TOP - 6, left: 0, right: 0, height: VIDEO_H + 12, border: "6px solid #fff", pointerEvents: "none" }} />

      {/* HUD */}
      <div style={{ position: "absolute", top: 160, left: 50, right: 50, display: "flex", justifyContent: "space-between", fontFamily: PX, color: "#fff", fontSize: 22 }}>
        <span>PLAYER 1: SALON OWNER</span><span style={{ color: "#ffd27a" }}>LVL SAT</span>
      </div>
      <div style={{ position: "absolute", top: 230, left: 50, right: 50 }}>
        <Bar value={hp} max={100} colour={hp > 50 ? P.mint : hp > 20 ? "#ffd27a" : "#ff5d5d"} label={`HP ${Math.round(hp)}/100${hp <= 20 && !powered ? "  LOW HEALTH!" : ""}`} blink={hp <= 20 && !powered} />
      </div>
      {boss && (
        <div style={{ position: "absolute", top: VIDEO_TOP + VIDEO_H + 40, left: 50, right: 50 }}>
          <Bar value={20} max={20} colour="#b04bff" label="⚠ FINAL BOSS: 9PM DMs" blink />
        </div>
      )}
      {!boss && !powered && t > 3.5 && (
        <div style={{ position: "absolute", top: VIDEO_TOP + VIDEO_H + 40, left: 50, right: 50, fontFamily: PX, color: "#fff", fontSize: 24, lineHeight: 1.8 }}>
          UNREAD: <span style={{ color: "#ff5d5d" }}>{HITS.filter((h) => t >= h.at && !h.crit).length * 3 + 1}</span>
        </div>
      )}

      {/* events */}
      <Sequence durationInFrames={s(3.5)}><Banner text={"LEVEL 1-1\nSATURDAY"} sub="PRESS START" colour="#ffd27a" /></Sequence>
      {HITS.map((h, i) => (
        <React.Fragment key={i}>
          <Sequence from={s(h.at - 0.6)} durationInFrames={s(0.8)}><Bubble hit={h} i={i} /></Sequence>
          <Sequence from={s(h.at)} durationInFrames={s(0.9)}><Damage hit={h} /></Sequence>
          <Sequence from={s(h.at)} durationInFrames={s(0.5)}><Audio src={staticFile(h.crit ? "whichone/sfx/crit.wav" : "whichone/sfx/hit.wav")} volume={0.55} /></Sequence>
        </React.Fragment>
      ))}
      <Sequence from={s(20.5)} durationInFrames={s(1.6)}><Banner text="FINAL BOSS" sub="9PM · 20 UNREAD DMs" colour="#b04bff" blink /></Sequence>
      <Sequence from={s(GAMEOVER)} durationInFrames={s(POWER - GAMEOVER)}><Banner text="GAME OVER?" colour="#ff5d5d" /></Sequence>
      <Sequence from={s(POWER)} durationInFrames={s(1.8)}><Coin /></Sequence>
      <Sequence from={s(POWER + 1.0)} durationInFrames={s(1.4)}><Banner text="POWER-UP!" sub="THE AI POUND" colour={P.mint} /></Sequence>
      <Sequence from={s(28.0)} durationInFrames={s(COMPLETE - 28.0)}><AutoReplies /></Sequence>
      <Sequence from={s(COMPLETE)}><Complete /></Sequence>

      {/* sound */}
      <Sequence from={0} durationInFrames={s(0.6)}><Audio src={staticFile("whichone/sfx/start.wav")} volume={0.5} /></Sequence>
      <Sequence from={s(1)} durationInFrames={s(GAMEOVER - 1)}><Audio src={staticFile("whichone/sfx/tension.wav")} loop volume={0.28} /></Sequence>
      <Sequence from={s(18.2)} durationInFrames={s(2.3)}><Audio src={staticFile("whichone/sfx/alarm.wav")} volume={0.3} /></Sequence>
      <Sequence from={s(20.5)} durationInFrames={s(1.5)}><Audio src={staticFile("whichone/sfx/boss.wav")} volume={0.5} /></Sequence>
      <Sequence from={s(GAMEOVER)} durationInFrames={s(1.5)}><Audio src={staticFile("whichone/sfx/gameover.wav")} volume={0.45} /></Sequence>
      <Sequence from={s(POWER)} durationInFrames={s(0.6)}><Audio src={staticFile("whichone/sfx/coin.wav")} volume={0.5} /></Sequence>
      <Sequence from={s(POWER + 0.6)} durationInFrames={s(1)}><Audio src={staticFile("whichone/sfx/powerup.wav")} volume={0.5} /></Sequence>
      {[0, 9, 18, 27, 36].map((f, i) => <Sequence key={i} from={s(28.0) + f + 10} durationInFrames={5}><Audio src={staticFile("whichone/sfx/tick.wav")} volume={0.4} /></Sequence>)}
      <Sequence from={s(27.4)} durationInFrames={s(COMPLETE - 27.4)}><Audio src={staticFile("whichone/sfx/victory.wav")} volume={0.25} /></Sequence>
      <Sequence from={s(COMPLETE)} durationInFrames={s(1.5)}><Audio src={staticFile("whichone/sfx/complete.wav")} volume={0.5} /></Sequence>
      <Sequence from={s(COMPLETE + 1.2)}><Audio src={staticFile("whichone/sfx/victory.wav")} volume={0.22} /></Sequence>
    </AbsoluteFill>
  );
};
