import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ChatScene, timeChat } from "../pound/Chat";
import { Icon } from "../pound/Icons";
import { grad, P } from "../pound/theme";
import { clamp, Kicker, Words } from "../pound/ui";
import { cs01 } from "./cs01";

const cs = cs01;

const Wrap: React.FC<{ dur: number; children: React.ReactNode; last?: boolean }> = ({ dur, children, last }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sq = width === height;
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), last ? 1 : interpolate(f, [dur - 8, dur], [1, 0], clamp));
  return (
    <AbsoluteFill
      style={{
        padding: sq ? "150px 70px 90px" : "330px 130px 480px 60px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", opacity: o,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sq = width === height;
  const head = spring({ frame: f, fps: 30, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: P.navy, fontFamily: P.font, color: "white", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -300, top: -300, width: 800, height: 800, borderRadius: "50%", background: P.navy2 }} />
      <div style={{ position: "absolute", left: -300, bottom: -350, width: 900, height: 900, borderRadius: "50%", background: P.navy2 }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 2px, transparent 2px)", backgroundSize: "54px 54px", backgroundPosition: `0 ${-f * 0.5}px` }} />
      <div style={{ position: "absolute", top: sq ? 50 : 196, left: sq ? 60 : 60, right: sq ? 60 : 130, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: head }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={staticFile(P.logo)} style={{ width: 64, height: 64, borderRadius: 14 }} />
          <div style={{ fontSize: 32, fontWeight: 800 }}>{P.name}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#ffd36e", padding: "10px 18px", borderRadius: 999, border: "2px solid #ffd36e88", background: "#ffd36e14" }}>
          {cs.status}
        </div>
      </div>
      {children}
    </AbsoluteFill>
  );
};

const Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sq = width === height;
  return (
    <>
      <Kicker text="How it works" />
      <div style={{ display: "flex", flexDirection: sq ? "row" : "column", alignItems: "center", gap: sq ? 10 : 6 }}>
        {cs.pipeline.map((s, i) => {
          const p = spring({ frame: f - 6 - i * 14, fps, config: { damping: 14 } });
          const lit = interpolate(f, [10 + i * 14, 20 + i * 14], [0, 1], clamp);
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{ width: sq ? 44 : 6, height: sq ? 6 : 44, borderRadius: 3, background: `rgba(255,255,255,0.15)`, overflow: "hidden" }}>
                  <div style={{ width: sq ? `${lit * 100}%` : "100%", height: sq ? "100%" : `${lit * 100}%`, background: P.mint }} />
                </div>
              )}
              <div style={{
                display: "flex", flexDirection: sq ? "column" : "row", alignItems: "center", gap: sq ? 14 : 24,
                width: sq ? 190 : 640, padding: sq ? "22px 10px" : "20px 30px", borderRadius: 28, background: P.card,
                border: `3px solid ${lit > 0.5 ? P.mint : "rgba(255,255,255,0.12)"}`, boxShadow: lit > 0.5 ? `0 0 30px ${P.mint}44` : "none",
                opacity: p, transform: `scale(${0.8 + 0.2 * p})`,
              }}>
                <div style={{ width: 76, height: 76, borderRadius: 20, background: "#111a2c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={s.icon} size={50} />
                </div>
                <div style={{ fontSize: sq ? 26 : 40, fontWeight: 750, textAlign: "center" }}>{s.label}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: sq ? 40 : 50, flexWrap: "wrap", justifyContent: "center" }}>
        {cs.buildFacts.map((b, i) => (
          <div key={b} style={{
            fontSize: sq ? 28 : 34, fontWeight: 800, color: P.navy, background: P.mint, padding: "12px 24px", borderRadius: 999,
            opacity: interpolate(f, [70 + i * 8, 80 + i * 8], [0, 1], clamp),
          }}>{b}</div>
        ))}
      </div>
    </>
  );
};

const Results: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Kicker text="Test results" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        {cs.results.map((r, i) => {
          const p = spring({ frame: f - 6 - i * 12, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ textAlign: "center", opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>
              <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: -4, ...grad() }}>{r.value}</div>
              <div style={{ fontSize: 38, fontWeight: 600 }}>{r.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 30, fontSize: 28, color: "#ffd36e", fontWeight: 700 }}>{cs.resultsNote}</div>
    </>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sq = width === height;
  const cta = spring({ frame: f - 40, fps, config: { damping: 13 } });
  return (
    <>
      <Words text={cs.outro} hl={cs.outroHl} size={sq ? 70 : 84} stagger={3} />
      {cs.quote && (
        <div style={{ marginTop: 30, fontSize: 36, fontStyle: "italic", textAlign: "center", opacity: 0.9 }}>
          “{cs.quote.text}” <span style={{ fontStyle: "normal", color: P.mint }}>— {cs.quote.who}</span>
        </div>
      )}
      <div style={{
        marginTop: sq ? 40 : 60, padding: "24px 40px", borderRadius: 999, background: P.mint, color: P.navy, fontSize: sq ? 34 : 38,
        fontWeight: 850, whiteSpace: "nowrap", opacity: Math.min(1, cta * 1.4), transform: `scale(${0.6 + 0.4 * cta})`,
      }}>
        {P.ctaComment}
      </div>
      <div style={{ marginTop: 24, fontSize: 30, color: P.muted, opacity: interpolate(f, [55, 70], [0, 1], clamp) }}>
        Follow {P.name} · linktr.ee/theaipound
      </div>
    </>
  );
};

export const CaseStudy01: React.FC = () => {
  const { width, height } = useVideoConfig();
  const sq = width === height;
  const has = cs.results.length > 0;
  const chat = timeChat(cs.chat);
  const d = has ? [75, 105, 165, 150, 135, 120] : [90, 120, 210, 180, 0, 150];
  const starts = d.map((_, i) => d.slice(0, i).reduce((a, b) => a + b, 0));
  const sc = (i: number, el: React.ReactNode, last = false) =>
    d[i] > 0 && (
      <Sequence from={starts[i]} durationInFrames={d[i]} layout="none">
        <Wrap dur={d[i]} last={last}>{el}</Wrap>
      </Sequence>
    );
  return (
    <Frame>
      {sc(0, <><Kicker text={`Case study #${cs.number}`} /><Words text={cs.hook} hl={cs.hookHl} size={sq ? 84 : 104} stagger={3} /></>)}
      {sc(1, <><Kicker text="The problem" /><Words text={cs.problem} hl={cs.problemHl} size={sq ? 68 : 84} stagger={2} weight={750} /></>)}
      {sc(2, <div style={{ transform: sq ? "scale(0.68)" : "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <ChatScene app="whatsapp" title="Your business" label="Example chat (sample data)" msgs={chat.msgs} />
      </div>)}
      {sc(3, <Pipeline />)}
      {sc(4, <Results />)}
      {sc(5, <Outro />, true)}
    </Frame>
  );
};
