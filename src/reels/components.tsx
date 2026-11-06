import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand, Theme } from "./brand";

const ThemeCtx = createContext<Theme>({ a: "#fff", b: "#fff", bg: "#000" });
export const useTheme = () => useContext(ThemeCtx);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONT = "Inter, 'Inter Display', Helvetica, Arial, sans-serif";

export const gradientText = (t: Theme): React.CSSProperties => ({
  background: `linear-gradient(90deg, ${t.a}, ${t.b})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

/** Animated background, brand pill, and story-safe padding. */
export const ReelFrame: React.FC<{ theme: Theme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blob = (color: string, x: number, y: number, r: number) => (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}66 0%, ${color}00 70%)`,
      }}
    />
  );
  const pill = spring({ frame: frame - 4, fps: 30, config: { damping: 200 } });
  return (
    <ThemeCtx.Provider value={theme}>
      <AbsoluteFill style={{ background: theme.bg, fontFamily: FONT, color: "white", overflow: "hidden" }}>
        {blob(theme.a, 200 + Math.sin(t * 0.7) * 120, 500 + Math.cos(t * 0.5) * 160, 700)}
        {blob(theme.b, 900 + Math.cos(t * 0.6) * 140, 1450 + Math.sin(t * 0.8) * 160, 750)}
        {blob(theme.a, 700 + Math.sin(t * 0.4) * 100, 1000 + Math.cos(t * 0.9) * 100, 400)}
        {/* subtle dot grid */}
        <AbsoluteFill
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 2px, transparent 2px)",
            backgroundSize: "54px 54px",
            backgroundPosition: `0 ${-frame * 0.6}px`,
          }}
        />
        {/* Brand pill, kept below Instagram's top story UI */}
        <div
          style={{
            position: "absolute",
            top: 250,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            opacity: pill,
            transform: `translateY(${(1 - pill) * -30}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 32px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${theme.a}, ${theme.b})`,
                opacity: 0.6 + 0.4 * Math.sin(t * 4),
              }}
            />
            {brand.summitName}
          </div>
        </div>
        {/* Content area: inside story safe zone */}
        <AbsoluteFill style={{ padding: "380px 80px 420px" }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};

/** A timed scene that fades/slides in and out. */
export const Scene: React.FC<{
  from: number;
  dur: number;
  children: React.ReactNode;
  exit?: boolean;
}> = ({ from, dur, children, exit = true }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <SceneInner dur={dur} exit={exit}>
      {children}
    </SceneInner>
  </Sequence>
);

const SceneInner: React.FC<{ dur: number; exit: boolean; children: React.ReactNode }> = ({
  dur,
  exit,
  children,
}) => {
  const f = useCurrentFrame();
  const out = exit ? interpolate(f, [dur - 10, dur], [1, 0], clamp) : 1;
  const outY = exit ? interpolate(f, [dur - 10, dur], [0, -60], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  return (
    <AbsoluteFill
      style={{
        padding: "380px 80px 420px",
        justifyContent: "center",
        alignItems: "center",
        opacity: out,
        transform: `translateY(${outY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Kinetic headline. Use "\n" for a line break; words in `hl` get the gradient. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  hl?: string[];
  stagger?: number;
  weight?: number;
  opacity?: number;
}> = ({ text, delay = 0, size = 120, hl = [], stagger = 4, weight = 800, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const tokens = text.replace(/\n/g, " \n ").split(" ").filter(Boolean);
  let i = 0;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.26,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.1,
        letterSpacing: -size * 0.025,
        textAlign: "center",
        opacity,
      }}
    >
      {tokens.map((w, k) => {
        if (w === "\n") return <div key={k} style={{ flexBasis: "100%", height: 0 }} />;
        const p = spring({ frame: frame - delay - i++ * stagger, fps, config: { damping: 14, stiffness: 140 } });
        const isHl = hl.some((h) => w.toLowerCase().replace(/[^\w$']/g, "") === h.toLowerCase());
        return (
          <span
            key={k}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p * 1.4),
              transform: `translateY(${(1 - p) * 70}px) scale(${0.85 + p * 0.15})`,
              ...(isHl ? gradientText(theme) : {}),
              paddingBottom: size * 0.08,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** A chat bubble. AI bubbles show typing dots, then type the text out. */
export const ChatBubble: React.FC<{ role: "user" | "ai"; text: string; delay: number; speed?: number }> = ({
  role,
  text,
  delay,
  speed = 1.6,
}) => {
  const frame = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const p = spring({ frame, fps, config: { damping: 15, stiffness: 160 } });
  const isAi = role === "ai";
  const typingFrames = isAi ? 14 : 0;
  const chars = isAi ? Math.max(0, Math.floor((frame - typingFrames) * speed)) : text.length;
  const showDots = isAi && frame < typingFrames;
  return (
    <div
      style={{
        alignSelf: isAi ? "flex-start" : "flex-end",
        display: "flex",
        gap: 20,
        alignItems: "flex-end",
        opacity: frame < 0 ? 0 : Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`,
        transformOrigin: isAi ? "bottom left" : "bottom right",
        maxWidth: 860,
      }}
    >
      {isAi && (
        <div
          style={{
            flexShrink: 0,
            width: 76,
            height: 76,
            borderRadius: 38,
            background: `linear-gradient(135deg, ${theme.a}, ${theme.b})`,
            color: theme.bg,
            fontWeight: 900,
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          AI
        </div>
      )}
      <div
        style={{
          padding: "30px 40px",
          borderRadius: 44,
          borderBottomLeftRadius: isAi ? 10 : 44,
          borderBottomRightRadius: isAi ? 44 : 10,
          fontSize: 44,
          lineHeight: 1.3,
          background: isAi ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${theme.a}, ${theme.b})`,
          color: isAi ? "white" : theme.bg,
          border: isAi ? "2px solid rgba(255,255,255,0.14)" : "none",
          fontWeight: isAi ? 500 : 650,
        } as React.CSSProperties}
      >
        {showDots ? (
          <span style={{ display: "flex", gap: 12, padding: "14px 4px" }}>
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: "white",
                  opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame + d * 4) / 4)),
                }}
              />
            ))}
          </span>
        ) : (
          // Render full text invisibly so the bubble doesn't resize while typing.
          <span style={{ position: "relative", display: "block" }}>
            <span style={{ visibility: "hidden" }}>{text}</span>
            <span style={{ position: "absolute", inset: 0 }}>{text.slice(0, chars)}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export const SmallLabel: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 12], [0, 1], clamp);
  return (
    <div
      style={{
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: 6,
        textTransform: "uppercase",
        opacity: o * 0.7,
        marginBottom: 40,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};

/** Row with a numbered/check badge sliding in. */
export const ListRow: React.FC<{ text: string; delay: number; badge?: string }> = ({ text, delay, badge }) => {
  const frame = useCurrentFrame() - delay;
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 150 } });
  const check = interpolate(frame, [6, 16], [0, 1], clamp);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 34,
        padding: "30px 40px",
        width: 900,
        borderRadius: 36,
        background: "rgba(255,255,255,0.08)",
        border: "2px solid rgba(255,255,255,0.12)",
        opacity: Math.min(1, p * 1.4),
        transform: `translateX(${(1 - p) * -120}px)`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 84,
          height: 84,
          borderRadius: 42,
          background: `linear-gradient(135deg, ${theme.a}, ${theme.b})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.bg,
          fontSize: 42,
          fontWeight: 900,
        }}
      >
        {badge ?? (
          <svg width="46" height="46" viewBox="0 0 24 24">
            <path
              d="M4 12.5l5 5L20 6.5"
              fill="none"
              stroke={theme.bg}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              strokeDashoffset={30 * (1 - check)}
            />
          </svg>
        )}
      </div>
      <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: -1 }}>{text}</div>
    </div>
  );
};

/** Closing card shared by every reel. */
export const EndCard: React.FC<{ kicker: string }> = ({ kicker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const big = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 110 } });
  const line = interpolate(frame, [18, 40], [0, 600], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sub = interpolate(frame, [28, 42], [0, 1], clamp);
  const cta = spring({ frame: frame - 40, fps, config: { damping: 13 } });
  const pulse = 1 + 0.03 * Math.sin(frame / 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Words text={kicker} size={56} weight={600} stagger={2} opacity={0.85} />
      <div
        style={{
          fontSize: 150,
          fontWeight: 900,
          lineHeight: 0.98,
          letterSpacing: -5,
          marginTop: 30,
          transform: `scale(${0.7 + 0.3 * big})`,
          opacity: Math.min(1, big * 1.5),
          ...gradientText(theme),
          paddingBottom: 10,
        }}
      >
        {brand.summitName.split(" ").map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>
      <div
        style={{
          width: line,
          height: 10,
          borderRadius: 5,
          marginTop: 34,
          background: `linear-gradient(90deg, ${theme.a}, ${theme.b})`,
        }}
      />
      <div style={{ fontSize: 50, fontWeight: 600, marginTop: 40, opacity: sub }}>{brand.endTagline}</div>
      <div
        style={{
          marginTop: 70,
          padding: "30px 56px",
          borderRadius: 999,
          background: "white",
          color: theme.bg,
          fontSize: 46,
          fontWeight: 800,
          opacity: Math.min(1, cta * 1.4),
          transform: `scale(${(0.6 + 0.4 * cta) * pulse})`,
        }}
      >
        {brand.cta}
      </div>
      <div style={{ fontSize: 38, marginTop: 30, opacity: interpolate(frame, [55, 70], [0, 0.75], clamp) }}>
        {brand.ctaSub}
      </div>
    </div>
  );
};
