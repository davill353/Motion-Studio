import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon } from "./Icons";
import { P } from "./theme";
import { clamp, Kicker } from "./ui";

export type App = "whatsapp" | "telegram" | "web";
export type Msg = { from: "user" | "bot"; text?: string; voice?: string; buttons?: string[]; pick?: number };
export type TimedMsg = Msg & { at: number; pickAt?: number; doneAt: number };

const SPEED = 2.2; // chars per frame for bot typing
const TYPING = 16;

/** Assigns timing to each message; returns timed messages and the total length needed. */
export const timeChat = (msgs: Msg[]): { msgs: TimedMsg[]; dur: number } => {
  let t = 12;
  const out: TimedMsg[] = [];
  for (const m of msgs) {
    const at = t;
    let done = at + (m.from === "bot" ? TYPING + Math.ceil((m.text?.length ?? 0) / SPEED) : 12);
    let pickAt: number | undefined;
    if (m.buttons && m.pick !== undefined) { pickAt = done + 30; done = pickAt + 12; }
    out.push({ ...m, at, pickAt, doneAt: done });
    t = done + Math.max(45, Math.round((m.text?.length ?? 10) * 0.6));
  }
  return { msgs: out, dur: t + 60 };
};

const appStyle: Record<App, { head: string; accent: string; icon: "whatsapp" | "telegram" | "http"; sub: string }> = {
  whatsapp: { head: "#1f2c34", accent: "#25d366", icon: "whatsapp", sub: "WhatsApp" },
  telegram: { head: "#1e2c3a", accent: "#2aabee", icon: "telegram", sub: "Telegram bot" },
  web: { head: "#1d2b45", accent: P.mint, icon: "http", sub: "Website chat" },
};

const Voice: React.FC<{ len: string; frame: number; color: string }> = ({ len, frame, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "6px 0" }}>
    <div style={{ width: 56, height: 56, borderRadius: 28, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={P.navy} /></svg>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 5, height: 50 }}>
      {Array.from({ length: 22 }).map((_, i) => {
        const h = 10 + Math.abs(Math.sin(i * 1.7 + 1)) * 30 * (0.6 + 0.4 * Math.abs(Math.sin(frame / 6 + i)));
        return <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: P.navy, opacity: 0.8 }} />;
      })}
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: P.navy }}>{len}</div>
  </div>
);

export const ChatScene: React.FC<{ app: App; title: string; label: string; msgs: TimedMsg[] }> = ({ app, title, label, msgs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = appStyle[app];
  const phone = spring({ frame, fps, config: { damping: 16 } });
  return (
    <>
      <Kicker text={label} mb={26} />
      <div
        style={{
          width: 800, height: 1000, borderRadius: 64, background: "#0d1525", border: "10px solid #2a3a5a",
          boxShadow: "0 40px 100px rgba(0,0,0,0.55)", overflow: "hidden", display: "flex", flexDirection: "column",
          transform: `translateY(${(1 - phone) * 120}px)`, opacity: phone,
        }}
      >
        <div style={{ background: st.head, padding: "34px 34px 26px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: "#0d1525", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={st.icon} size={50} />
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{title}</div>
            <div style={{ fontSize: 24, color: st.accent, fontWeight: 600 }}>{st.sub}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "26px 28px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 0, overflow: "hidden" }}>
          {msgs.map((m, i) => {
            const f = frame - m.at;
            if (f < 0) return null;
            const p = spring({ frame: f, fps, config: { damping: 15, stiffness: 170 } });
            const grow = interpolate(f, [0, 10], [0, 1], clamp);
            const isBot = m.from === "bot";
            const typing = isBot && f < TYPING && !!m.text;
            const chars = isBot ? Math.max(0, Math.floor((f - TYPING) * SPEED)) : 9999;
            const bubbleBg = isBot ? "#24324d" : st.accent;
            return (
              <div key={i} style={{ maxHeight: grow * 600, marginTop: grow * 20, display: "flex", flexDirection: "column", alignItems: isBot ? "flex-start" : "flex-end" }}>
                <div
                  style={{
                    maxWidth: 600, padding: "22px 28px", borderRadius: 34, fontSize: 34, lineHeight: 1.3, fontWeight: isBot ? 500 : 600,
                    borderBottomLeftRadius: isBot ? 8 : 34, borderBottomRightRadius: isBot ? 34 : 8,
                    background: bubbleBg, color: isBot ? "white" : P.navy, opacity: Math.min(1, p * 1.5),
                    transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: isBot ? "bottom left" : "bottom right",
                  }}
                >
                  {m.voice ? (
                    <Voice len={m.voice} frame={frame} color={P.navy === bubbleBg ? P.mint : "white"} />
                  ) : typing ? (
                    <span style={{ display: "flex", gap: 10, padding: "10px 4px" }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{ width: 14, height: 14, borderRadius: 7, background: "white", opacity: 0.3 + 0.7 * Math.abs(Math.sin((f + d * 4) / 4)) }} />
                      ))}
                    </span>
                  ) : (
                    <span style={{ position: "relative", display: "block" }}>
                      <span style={{ visibility: "hidden" }}>{m.text}</span>
                      <span style={{ position: "absolute", inset: 0 }}>{m.text!.slice(0, chars)}</span>
                    </span>
                  )}
                </div>
                {m.buttons && !typing && (
                  <div style={{ display: "flex", gap: 14, marginTop: 12, width: 600 }}>
                    {m.buttons.map((b, bi) => {
                      const picked = m.pickAt !== undefined && m.pick === bi && frame >= m.pickAt;
                      const tap = m.pickAt !== undefined && m.pick === bi ? interpolate(frame, [m.pickAt - 8, m.pickAt, m.pickAt + 12], [0, 1, 0], clamp) : 0;
                      return (
                        <div key={bi} style={{
                          flex: 1, textAlign: "center", padding: "18px 0", borderRadius: 22, fontSize: 32, fontWeight: 800,
                          background: picked ? P.mint : "rgba(255,255,255,0.1)", color: picked ? P.navy : "white",
                          transform: `scale(${1 - tap * 0.08})`, boxShadow: tap ? `0 0 0 ${tap * 14}px ${P.mint}55` : "none",
                          opacity: interpolate(f, [TYPING + 10, TYPING + 20], [0, 1], clamp),
                        }}>{b}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
