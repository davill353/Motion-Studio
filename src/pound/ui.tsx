import React from "react";
import {
  AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { CONTENT_W, grad, P, SAFE } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Brand background + header. */
export const PoundFrame: React.FC<{ tag: string; children: React.ReactNode; aiVoice?: boolean }> = ({ tag, children, aiVoice }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const head = spring({ frame, fps: 30, config: { damping: 200 } });
  const circle = (x: number, y: number, r: number, c: string) => (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c }} />
  );
  return (
    <AbsoluteFill style={{ background: P.navy, fontFamily: P.font, color: "white", overflow: "hidden" }}>
      {circle(1000 + Math.sin(t * 0.3) * 40, 260 + Math.cos(t * 0.25) * 40, 420, P.navy2)}
      {circle(120 + Math.cos(t * 0.3) * 40, 1700 + Math.sin(t * 0.2) * 40, 520, P.navy2)}
      <div
        style={{
          position: "absolute", left: 540 - 600, top: 960 - 600, width: 1200, height: 1200, borderRadius: "50%",
          background: `radial-gradient(circle, ${P.mint}14 0%, ${P.mint}00 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 2px, transparent 2px)",
          backgroundSize: "54px 54px",
          backgroundPosition: `0 ${-frame * 0.5}px`,
        }}
      />
      {/* Header */}
      <div
        style={{
          position: "absolute", top: 196, left: SAFE.left, right: SAFE.right, display: "flex", alignItems: "center",
          justifyContent: "space-between", opacity: head, transform: `translateY(${(1 - head) * -20}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Img src={staticFile(P.logo)} style={{ width: 70, height: 70, borderRadius: 16 }} />
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>{P.name}</div>
        </div>
        <div
          style={{
            fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: P.mint,
            padding: "10px 20px", borderRadius: 999, border: `2px solid ${P.mint}55`, background: `${P.mint}12`,
          }}
        >
          {tag}
        </div>
      </div>
      {aiVoice && (
        <div style={{ position: "absolute", top: 282, right: SAFE.right, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", opacity: head }}>
          AI voiceover
        </div>
      )}
      {children}
    </AbsoluteFill>
  );
};

/** Fades/slides a scene in and out, positioned inside the safe area. */
export const SceneWrap: React.FC<{ dur: number; children: React.ReactNode; exit?: boolean; center?: boolean }> = ({
  dur, children, exit = true, center = true,
}) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 8], [0, 1], clamp);
  const out = exit ? interpolate(f, [dur - 8, dur], [1, 0], clamp) : 1;
  const y = exit ? interpolate(f, [dur - 8, dur], [0, -50], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill
      style={{
        paddingTop: SAFE.top, paddingBottom: SAFE.bottom, paddingLeft: SAFE.left, paddingRight: SAFE.right,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: center ? "center" : "flex-start",
        opacity: Math.min(inn, out), transform: `translateY(${y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Kinetic words. "\n" = line break. Words in hl get the brand gradient. */
export const Words: React.FC<{
  text: string; delay?: number; size?: number; hl?: string[]; stagger?: number; weight?: number; align?: "center" | "flex-start";
}> = ({ text, delay = 0, size = 110, hl = [], stagger = 3, weight = 800, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = text.replace(/\n/g, " \n ").split(" ").filter(Boolean);
  let i = 0;
  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", justifyContent: align, columnGap: size * 0.26, fontSize: size,
        fontWeight: weight, lineHeight: 1.12, letterSpacing: -size * 0.025, textAlign: align === "center" ? "center" : "left",
        maxWidth: CONTENT_W,
      }}
    >
      {tokens.map((w, k) => {
        if (w === "\n") return <div key={k} style={{ flexBasis: "100%", height: 0 }} />;
        const p = spring({ frame: frame - delay - i++ * stagger, fps, config: { damping: 14, stiffness: 140 } });
        const isHl = hl.some((h) => w.toLowerCase().replace(/[^\w£'’]/g, "") === h.toLowerCase());
        return (
          <span
            key={k}
            style={{
              display: "inline-block", opacity: Math.min(1, p * 1.4), paddingBottom: size * 0.06,
              transform: `translateY(${(1 - p) * 60}px) scale(${0.86 + p * 0.14})`, ...(isHl ? grad() : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{ text: string; delay?: number; mb?: number }> = ({ text, delay = 0, mb = 36 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 10], [0, 1], clamp);
  return (
    <div
      style={{
        fontSize: 30, fontWeight: 800, letterSpacing: 5, textTransform: "uppercase", color: P.mint,
        opacity: o, marginBottom: mb, textAlign: "center", transform: `translateY(${(1 - o) * 10}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const HookScene: React.FC<{ kicker: string; text: string; hl?: string[] }> = ({ kicker, text, hl }) => {
  const f = useCurrentFrame();
  const line = interpolate(f, [14, 36], [0, 260], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <>
      <Kicker text={kicker} />
      <Words text={text} hl={hl} size={124} stagger={4} />
      <div style={{ width: line, height: 10, borderRadius: 5, marginTop: 40, background: `linear-gradient(90deg, ${P.mint}, ${P.teal})` }} />
    </>
  );
};

export const TextScene: React.FC<{ kicker?: string; text: string; hl?: string[]; size?: number }> = ({ kicker, text, hl, size = 84 }) => (
  <>
    {kicker && <Kicker text={kicker} />}
    <Words text={text} hl={hl} size={size} stagger={2} weight={750} />
  </>
);

const Badge: React.FC<{ children: React.ReactNode; color?: string; bg?: string }> = ({ children, color = P.navy, bg }) => (
  <div
    style={{
      flexShrink: 0, width: 72, height: 72, borderRadius: 36, background: bg ?? `linear-gradient(135deg, ${P.mint}, ${P.teal})`,
      display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 36, fontWeight: 900,
    }}
  >
    {children}
  </div>
);

const Check: React.FC<{ color?: string; size?: number }> = ({ color = P.navy, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cross: React.FC<{ color?: string; size?: number }> = ({ color = "#ff8a8a", size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" /></svg>
);

export const ListScene: React.FC<{ title: string; items: string[]; numbered?: boolean }> = ({ title, items, numbered }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Words text={title} size={66} weight={800} stagger={2} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 44, width: CONTENT_W }}>
        {items.map((it, i) => {
          const p = spring({ frame: frame - 14 - i * 9, fps, config: { damping: 16, stiffness: 150 } });
          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 28, padding: "24px 32px", borderRadius: 30,
                background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.1)",
                opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * -100}px)`,
              }}
            >
              <Badge>{numbered ? i + 1 : <Check />}</Badge>
              <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{it}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const CompareScene: React.FC<{ without: string[]; withIt: string[] }> = ({ without, withIt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = (title: string, items: string[], good: boolean, delay: number) => {
    const p = spring({ frame: frame - delay, fps, config: { damping: 16 } });
    return (
      <div
        style={{
          width: CONTENT_W, padding: "34px 40px", borderRadius: 36, opacity: Math.min(1, p * 1.4),
          transform: `translateY(${(1 - p) * 60}px)`,
          background: good ? `${P.mint}14` : "rgba(255,255,255,0.05)",
          border: `2px solid ${good ? P.mint + "77" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase", color: good ? P.mint : "#ff9b9b", marginBottom: 24 }}>
          {title}
        </div>
        {items.map((it, i) => {
          const q = interpolate(frame, [delay + 10 + i * 7, delay + 20 + i * 7], [0, 1], clamp);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: i ? 18 : 0, opacity: q }}>
              {good ? <Check color={P.mint} size={44} /> : <Cross />}
              <div style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.25, color: good ? "white" : "rgba(255,255,255,0.75)" }}>{it}</div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      {card("Without automation", without, false, 0)}
      {card(`With ${P.name}`, withIt, true, 40)}
    </div>
  );
};

/** The real n8n screenshot, slowly panning. */
export const ShotScene: React.FC<{ src: string; label: string; dur: number; aspect: number }> = ({ src, label, dur, aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 16 } });
  const pan = interpolate(frame, [0, dur], [0, 1], clamp);
  const H = 640;
  return (
    <>
      <Kicker text={label} />
      <div
        style={{
          width: CONTENT_W, height: H, borderRadius: 32, overflow: "hidden", position: "relative", background: "#171717",
          border: `3px solid ${P.mint}66`, boxShadow: `0 30px 80px rgba(0,0,0,0.5)`,
          transform: `scale(${0.85 + 0.15 * p})`, opacity: p,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute", height: H * 1.05, top: -H * 0.025,
            left: -pan * Math.max(0, H * 1.05 * aspect - CONTENT_W),
          }}
        />
      </div>
      <div style={{ fontSize: 36, color: P.muted, marginTop: 30, fontWeight: 600, opacity: interpolate(frame, [15, 30], [0, 1], clamp) }}>
        Built in n8n. Here's how it works ↓
      </div>
    </>
  );
};

export const EndCard: React.FC<{ note?: string }> = ({ note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 120 } });
  const name = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const cta = spring({ frame: frame - 30, fps, config: { damping: 13 } });
  const pulse = 1 + 0.025 * Math.sin(frame / 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Img
        src={staticFile(P.logo)}
        style={{
          width: 300, height: 300, borderRadius: 64, boxShadow: `0 0 80px ${P.mint}44`,
          transform: `scale(${logo}) rotate(${(1 - logo) * -12}deg)`,
        }}
      />
      <div style={{ fontSize: 110, fontWeight: 900, letterSpacing: -4, marginTop: 40, opacity: name, transform: `translateY(${(1 - name) * 30}px)`, ...grad() }}>
        {P.name}
      </div>
      <div style={{ fontSize: 40, fontWeight: 600, marginTop: 14, opacity: name * 0.85 }}>{P.ctaFollow}</div>
      <div
        style={{
          marginTop: 50, padding: "26px 40px", borderRadius: 999, background: P.mint, color: P.navy, fontSize: 38, fontWeight: 850, whiteSpace: "nowrap",
          opacity: Math.min(1, cta * 1.4), transform: `scale(${(0.6 + 0.4 * cta) * pulse})`,
        }}
      >
        {P.ctaComment}
      </div>
      {note && (
        <div style={{ marginTop: 36, fontSize: 36, fontWeight: 700, color: P.mint, opacity: interpolate(frame, [45, 60], [0, 1], clamp) }}>
          {note}
        </div>
      )}
    </div>
  );
};
