import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { P } from "../pound/theme";

export type Word = { text: string; start: number; end: number };
export type TalkingProps = {
  video: string;          // file in public/, e.g. "talking/plan01.mp4"
  words: Word[];          // word timings in seconds
  hook: string;           // title shown for the first 3 seconds
  keywords: string[];     // words highlighted in mint
  endTitle: string;       // e.g. "Follow for Day 1"
  videoSeconds: number;
};
export const END_SECONDS = 2.5;
export const talkingDefaults: TalkingProps = { video: "", words: [], hook: "", keywords: [], endTitle: "Follow for more", videoSeconds: 5 };

const FILLERS = /^(um+|uh+|erm+|er|ah+|hmm+)[.,!?]?$/i;
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9£']/g, "");

type Chunk = { words: Word[]; start: number; end: number };
const chunk = (words: Word[]): Chunk[] => {
  const ws = words.filter((w) => !FILLERS.test(w.text.trim()));
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const push = () => { if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end }); cur = []; };
  for (const w of ws) {
    const len = cur.map((x) => x.text).join(" ").length + w.text.length;
    const gap = cur.length ? w.start - cur[cur.length - 1].end : 0;
    if (cur.length && (cur.length >= 3 || len > 18 || gap > 0.6 || /[.!?]$/.test(cur[cur.length - 1].text))) push();
    cur.push(w);
  }
  push();
  for (let i = 0; i < out.length - 1; i++) if (out[i + 1].start - out[i].end < 0.4) out[i].end = out[i + 1].start;
  return out;
};

const Captions: React.FC<{ words: Word[]; keywords: string[] }> = ({ words, keywords }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const chunks = React.useMemo(() => chunk(words), [words]);
  const kw = new Set(keywords.map(norm));
  const c = chunks.find((x) => t >= x.start - 0.05 && t <= x.end + 0.15);
  if (!c) return null;
  const pop = spring({ frame: frame - Math.round(c.start * fps), fps, config: { damping: 14, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", left: 70, right: 140, top: 1060, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 22,
      transform: `scale(${0.9 + 0.1 * pop})` }}>
      {c.words.map((w, i) => {
        const active = t >= w.start - 0.03 && t <= w.end + 0.05;
        const isKw = kw.has(norm(w.text));
        return (
          <span key={i} style={{ fontFamily: P.font, fontWeight: 900, fontSize: 92, lineHeight: 1.1, letterSpacing: -1.5, textTransform: "uppercase",
            color: active || isKw ? P.mint : "#ffffff", WebkitTextStroke: "3px rgba(10,16,30,0.9)", paintOrder: "stroke fill",
            textShadow: "0 6px 18px rgba(0,0,0,0.55)", transform: active ? "scale(1.08)" : "none", display: "inline-block" }}>
            {w.text.replace(/[,]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

const Hook: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14 } });
  const out = interpolate(frame, [2.6 * fps, 3 * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (!text) return null;
  return (
    <div style={{ position: "absolute", top: 330, left: 60, right: 140, display: "flex", justifyContent: "center", opacity: Math.min(p, out), transform: `translateY(${(1 - p) * -30}px)` }}>
      <div style={{ background: "#fff", color: P.navy, fontFamily: P.font, fontWeight: 900, fontSize: 58, lineHeight: 1.12, textAlign: "center",
        padding: "22px 30px", borderRadius: 26, boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>{text}</div>
    </div>
  );
};

const Bug: React.FC = () => (
  <div style={{ position: "absolute", top: 200, left: 60, display: "flex", alignItems: "center", gap: 14, background: "rgba(22,35,59,0.72)", padding: "10px 18px 10px 10px", borderRadius: 999 }}>
    <Img src={staticFile(P.logo)} style={{ width: 52, height: 52, borderRadius: 12 }} />
    <span style={{ color: "#fff", fontFamily: P.font, fontWeight: 800, fontSize: 28 }}>The AI Pound</span>
  </div>
);

const EndCard: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const s = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: P.navy, opacity: a, alignItems: "center", justifyContent: "center", fontFamily: P.font, color: "#fff", textAlign: "center", padding: "0 90px" }}>
      <Img src={staticFile(P.logo)} style={{ width: 220, height: 220, borderRadius: 48, transform: `scale(${s})` }} />
      <div style={{ fontSize: 84, fontWeight: 900, marginTop: 40, color: P.mint }}>{title}</div>
      <div style={{ fontSize: 40, marginTop: 20, opacity: 0.85 }}>Free guide: theaipound.co.uk</div>
    </AbsoluteFill>
  );
};

export const TalkingHead: React.FC<TalkingProps> = ({ video, words, hook, keywords, endTitle, videoSeconds }) => {
  const { fps } = useVideoConfig();
  const vf = Math.round(videoSeconds * fps);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {video && <Sequence durationInFrames={vf}><OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Sequence>}
      <Sequence durationInFrames={vf}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 100%)" }} />
        <Bug /><Hook text={hook} /><Captions words={words} keywords={keywords} />
      </Sequence>
      <Sequence from={vf}><EndCard title={endTitle} /></Sequence>
    </AbsoluteFill>
  );
};
