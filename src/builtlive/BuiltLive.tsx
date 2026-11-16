import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";
import { Bug, Captions, EndCard, Word } from "../talking/TalkingHead";

// One piece of the timelapse: recording time [srcStart, srcEnd] plays from outStart at `speed`x.
export type Seg = { srcStart: number; srcEnd: number; outStart: number; speed: number };
export type Chapter = { at: number; label: string };          // `at` = seconds into the recording
export type Zoom = { from: number; to: number; x: number; y: number; scale: number }; // recording seconds; x,y = 0..1 focus point

export type BuiltLiveProps = {
  video: string;            // timelapse in public/, e.g. "builtlive/ep01.mp4" (16:9, already sped up)
  segments: Seg[];
  videoSeconds: number;     // length of the timelapse
  timerMinutes: number;     // the challenge, e.g. 30
  finishedAt: number;       // recording second when the build was done
  chapters: Chapter[];
  hook: string;
  words: Word[];
  keywords: string[];
  endTitle: string;
  endSub?: string;
  label?: string;           // e.g. "Demo build"
  zooms?: Zoom[];
};
export const BL_END_SECONDS = 3;
export const builtLiveDefaults: BuiltLiveProps = {
  video: "", segments: [{ srcStart: 0, srcEnd: 1800, outStart: 0, speed: 36 }], videoSeconds: 50, timerMinutes: 30, finishedAt: 1620,
  chapters: [{ at: 0, label: "Webhook" }, { at: 600, label: "AI brain" }, { at: 1200, label: "Telegram approval" }],
  hook: "30 minutes to build an AI receptionist", words: [], keywords: [], endTitle: "Comment AUTOMATE",
};

const MONO = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace";
const VIDEO_TOP = 600, VIDEO_H = 608;

const srcAt = (segs: Seg[], t: number) => {
  let s = segs[0];
  for (const x of segs) if (t >= x.outStart) s = x;
  return { src: Math.min(s.srcEnd, s.srcStart + (t - s.outStart) * s.speed), speed: s.speed };
};
const fmt = (sec: number) => {
  const a = Math.max(0, Math.floor(Math.abs(sec)));
  return `${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
};

const Timer: React.FC<{ src: number; speed: number; total: number; finishedAt: number }> = ({ src, speed, total, finishedAt }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const done = src >= finishedAt;
  const shown = done ? finishedAt : src;
  const remaining = total - shown;
  const over = remaining < 0;
  const colour = done ? P.mint : over ? "#ff8a7a" : remaining < 300 ? "#ffd27a" : "#fff";
  const pct = Math.min(1, shown / total);
  const blink = Math.floor(frame / (fps / 2)) % 2 === 0;
  return (
    <div style={{ position: "absolute", top: 330, left: 60, right: 60, height: 230, background: P.card, borderRadius: 32, padding: "22px 34px",
      boxShadow: "0 18px 40px rgba(0,0,0,0.35)", fontFamily: P.font, color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 4, opacity: 0.75 }}>{total / 60}-MINUTE BUILD</div>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, padding: "6px 16px", borderRadius: 999,
          background: done ? P.mint : speed > 1.05 ? "rgba(255,255,255,0.12)" : "#ff5d5d", color: done ? P.navy : "#fff" }}>
          {done ? "DONE ✓" : speed > 1.05 ? `▶▶ ${Math.round(speed)}×` : `${blink ? "●" : "○"} REAL TIME`}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 4 }}>
        <div style={{ fontFamily: MONO, fontSize: 118, fontWeight: 800, color: colour, letterSpacing: -2, lineHeight: 1.05 }}>
          {over && !done ? "+" : ""}{fmt(done ? shown : remaining)}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, opacity: 0.7 }}>{done ? "to build it" : over ? "over time" : "left"}</div>
      </div>
      <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", marginTop: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: done ? P.mint : `linear-gradient(90deg, ${P.mint}, ${P.teal})` }} />
      </div>
    </div>
  );
};

const zoomAt = (zooms: Zoom[] | undefined, src: number) => {
  const none = { x: 0.5, y: 0.5, scale: 1 };
  if (!zooms?.length) return none;
  for (const z of zooms) {
    const ramp = Math.min(20, (z.to - z.from) / 4); // ease in/out over up to 20 recording seconds
    if (src >= z.from && src <= z.to) {
      const k = Math.min(1, (src - z.from) / ramp, (z.to - src) / ramp);
      const e = k * k * (3 - 2 * k);
      return { x: 0.5 + (z.x - 0.5) * e, y: 0.5 + (z.y - 0.5) * e, scale: 1 + (z.scale - 1) * e };
    }
  }
  return none;
};

const Screen: React.FC<{ video: string; src: number; zooms?: Zoom[] }> = ({ video, src, zooms }) => {
  const z = zoomAt(zooms, src);
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP, left: 0, width: 1080, height: VIDEO_H, overflow: "hidden", background: "#0b1220",
      borderTop: `4px solid ${P.mint}`, borderBottom: `4px solid ${P.mint}` }}>
      {video && <OffthreadVideo src={staticFile(video)} muted style={{ width: 1080, height: VIDEO_H, objectFit: "contain",
        transformOrigin: `${z.x * 100}% ${z.y * 100}%`, transform: `scale(${z.scale})` }} />}
    </div>
  );
};

const Chapters: React.FC<{ chapters: Chapter[]; src: number; finishedAt: number }> = ({ chapters, src, finishedAt }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  if (!chapters.length) return null;
  let cur = -1;
  chapters.forEach((c, i) => { if (src >= c.at) cur = i; });
  const done = src >= finishedAt;
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP + VIDEO_H + 22, left: 60, right: 60, display: "flex", gap: 10, fontFamily: P.font }}>
      {chapters.map((c, i) => {
        const complete = i < cur || done;
        const active = i === cur && !done;
        const pulse = active ? 0.75 + 0.25 * Math.sin((frame / fps) * 6) : 1;
        return (
          <div key={i} style={{ flex: active ? 2.2 : 1, minWidth: 0, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "0 12px", background: complete ? "rgba(110,231,168,0.18)" : active ? P.mint : "rgba(255,255,255,0.07)",
            color: complete ? P.mint : active ? P.navy : "rgba(255,255,255,0.45)", opacity: pulse, fontWeight: 800, fontSize: 25, whiteSpace: "nowrap", overflow: "hidden" }}>
            <span>{complete ? "✓" : active ? "⚙" : i + 1}</span>
            {(active || chapters.length <= 3) && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</span>}
          </div>
        );
      })}
    </div>
  );
};

const DoneStamp: React.FC<{ finishedAt: number }> = ({ finishedAt }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });
  const out = interpolate(frame, [2.2 * fps, 2.6 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP + VIDEO_H / 2 - 90, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ background: P.mint, color: P.navy, fontFamily: P.font, fontWeight: 900, fontSize: 72, padding: "24px 44px", borderRadius: 28,
        transform: `scale(${s}) rotate(-3deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.45)" }}>BUILT IN {fmt(finishedAt)} ✓</div>
    </div>
  );
};

const Hook: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14 } });
  const out = interpolate(frame, [2.7 * fps, 3.1 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: VIDEO_TOP + 60, left: 60, right: 60, display: "flex", justifyContent: "center", opacity: Math.min(p, out),
      transform: `scale(${0.85 + 0.15 * p})` }}>
      <div style={{ background: "#fff", color: P.navy, fontFamily: P.font, fontWeight: 900, fontSize: 64, lineHeight: 1.1, textAlign: "center",
        padding: "26px 34px", borderRadius: 28, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" }}>{text}</div>
    </div>
  );
};

export const BuiltLive: React.FC<BuiltLiveProps> = (p) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const vf = Math.round(p.videoSeconds * fps);
  const t = Math.min(frame, vf - 1) / fps;
  const { src, speed } = srcAt(p.segments, t);
  // output second at which the build finishes (for the stamp)
  const fin = p.segments.find((s) => p.finishedAt >= s.srcStart && p.finishedAt <= s.srcEnd);
  const finOut = fin ? fin.outStart + (p.finishedAt - fin.srcStart) / fin.speed : p.videoSeconds;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${P.navy2}, ${P.navy} 70%)` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "54px 54px" }} />
      <Sequence durationInFrames={vf}>
        <Screen video={p.video} src={src} zooms={p.zooms} />
        <Bug label={p.label} top={200} />
        <Timer src={src} speed={speed} total={p.timerMinutes * 60} finishedAt={p.finishedAt} />
        <Chapters chapters={p.chapters} src={src} finishedAt={p.finishedAt} />
        <Captions words={p.words} keywords={p.keywords} top={VIDEO_TOP + VIDEO_H + 96} maxSize={72} />
      </Sequence>
      {p.hook && <Sequence durationInFrames={Math.round(3.2 * fps)}><Hook text={p.hook} /></Sequence>}
      {finOut < p.videoSeconds && <Sequence from={Math.round(finOut * fps)} durationInFrames={Math.round(2.6 * fps)}><DoneStamp finishedAt={p.finishedAt} /></Sequence>}
      <Sequence from={vf}><EndCard title={p.endTitle} sub={p.endSub ?? "Free guide: theaipound.co.uk"} /></Sequence>
    </AbsoluteFill>
  );
};
