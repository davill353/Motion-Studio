import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, IconName } from "./Icons";
import { CONTENT_W, P } from "./theme";
import { clamp, Kicker } from "./ui";

export type FNode = { id: string; label: string; sub: string; icon: IconName; col: number; row: number };
export type FEdge = { from: string; to: string; label?: string; dashed?: boolean; via?: "right" };
export type FStep = { focus: string[]; title: string; body: string; dur: number };

const NW = 390, NH = 112, ROW = 168, TOPPAD = 70;
const VW = CONTENT_W, VH = 700;
const LANE = VW - 14;
const nx = (n: FNode) => 205 + n.col * 435;
const ny = (n: FNode) => TOPPAD + n.row * ROW;

const edgePath = (a: FNode, b: FNode, e: FEdge) => {
  const ax = nx(a), ay = ny(a), bx = nx(b), by = ny(b);
  if (e.via === "right") {
    const sx = ax + NW / 2, ex = bx + NW / 2;
    return `M ${sx} ${ay} H ${LANE} V ${by} H ${ex}`;
  }
  if (a.row === b.row) {
    const [l, r] = ax < bx ? [ax + NW / 2, bx - NW / 2] : [ax - NW / 2, bx + NW / 2];
    return `M ${l} ${ay} L ${r} ${by}`;
  }
  const y1 = ay + NH / 2, y2 = by - NH / 2, m = (y2 - y1) / 2;
  return `M ${ax} ${y1} C ${ax} ${y1 + m} ${bx} ${y2 - m} ${bx} ${y2}`;
};

export const FlowScene: React.FC<{ label: string; nodes: FNode[]; edges: FEdge[]; steps: FStep[] }> = ({
  label, nodes, edges, steps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const H = TOPPAD * 2 + Math.max(...nodes.map((n) => n.row)) * ROW;

  // which step are we on
  const starts: number[] = [];
  let acc = 0;
  for (const s of steps) { starts.push(acc); acc += s.dur; }
  let si = 0;
  for (let i = 0; i < steps.length; i++) if (frame >= starts[i]) si = i;
  const local = frame - starts[si];
  const step = steps[si];
  const isAll = (s: FStep) => s.focus[0] === "*";

  const focusSet = new Set(isAll(step) ? nodes.map((n) => n.id) : step.focus);
  const visited = new Set<string>();
  for (let i = 0; i <= si; i++) (isAll(steps[i]) ? [] : steps[i].focus).forEach((id) => visited.add(id));

  // camera per step
  const cam = (s: FStep) => {
    if (isAll(s)) return { s: Math.min(1, (VH - 20) / H, VW / (VW + 20)), cy: H / 2 };
    const ys = s.focus.map((id) => ny(byId[id]));
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const span = Math.max(...ys) - Math.min(...ys) + NH + 80;
    const sc = Math.min(1, VH / span);
    const half = VH / 2 / sc;
    return { s: sc, cy: H * sc <= VH ? H / 2 : Math.max(half, Math.min(H - half, cy)) };
  };
  const c1 = cam(step), c0 = cam(steps[Math.max(0, si - 1)]);
  const t = si === 0 ? 1 : spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 26 });
  const sc = c0.s + (c1.s - c0.s) * t;
  const cy = c0.cy + (c1.cy - c0.cy) * t;

  const cap = spring({ frame: local - 4, fps, config: { damping: 18 } });
  const numbered = steps.filter((s) => !isAll(s));
  const stepNo = isAll(step) ? 0 : numbered.indexOf(step) + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: VW }}>
      <Kicker text={label} mb={20} />
      <div
        style={{
          width: VW, height: VH, position: "relative", overflow: "hidden", borderRadius: 36,
          background: "rgba(10,18,32,0.55)", border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute", left: 0, top: 0, width: VW, height: H, transformOrigin: "0 0",
            transform: `translate(${VW / 2}px, ${VH / 2}px) scale(${sc}) translate(${-VW / 2}px, ${-cy}px)`,
          }}
        >
          <svg width={VW} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {edges.map((e, i) => {
              const a = byId[e.from], b = byId[e.to];
              const d = edgePath(a, b, e);
              const lit = (visited.has(e.from) && visited.has(e.to)) || isAll(step);
              const entering = !isAll(step) && focusSet.has(e.to) && visited.has(e.from) && !focusSet.has(e.from) || (focusSet.has(e.to) && focusSet.has(e.from) && !isAll(step));
              const draw = entering ? interpolate(local, [0, 18], [0, 1], clamp) : 1;
              const pulse = entering ? interpolate(local, [4, 34], [0, 1], clamp) : -1;
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={4} strokeDasharray={e.dashed ? "10 10" : undefined} />
                  {lit && (
                    <path
                      d={d} fill="none" stroke={P.mint} strokeWidth={5} pathLength={1}
                      strokeDasharray={e.dashed ? "0.02 0.02" : `${draw} 1`} opacity={e.dashed ? draw : 0.9}
                    />
                  )}
                  {pulse > 0 && pulse < 1 && !e.dashed && (
                    <path d={d} fill="none" stroke="white" strokeWidth={10} strokeLinecap="round" pathLength={100}
                      strokeDasharray="6 200" strokeDashoffset={6 - pulse * 106} />
                  )}
                </g>
              );
            })}
          </svg>
          {edges.filter((e) => e.label).map((e, i) => {
            const a = byId[e.from], b = byId[e.to];
            let x = (nx(a) + nx(b)) / 2, y = (ny(a) + NH / 2 + ny(b) - NH / 2) / 2;
            if (e.via === "right") { x = LANE - 40; y = (ny(a) + ny(b)) / 2; }
            if (a.row === b.row) y = ny(a) - 26;
            const lit = (visited.has(e.from) && visited.has(e.to)) || isAll(step);
            return (
              <div key={i} style={{
                position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", fontSize: 22, fontWeight: 700,
                padding: "4px 14px", borderRadius: 999, background: P.navy, border: `2px solid ${lit ? P.mint : "rgba(255,255,255,0.2)"}`,
                color: lit ? P.mint : "rgba(255,255,255,0.5)", whiteSpace: "nowrap",
              }}>{e.label}</div>
            );
          })}
          {nodes.map((n) => {
            const f = focusSet.has(n.id) && !isAll(step);
            const v = visited.has(n.id) || isAll(step);
            const pop = f ? spring({ frame: local - 6, fps, config: { damping: 12 } }) : 0;
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute", left: nx(n) - NW / 2, top: ny(n) - NH / 2, width: NW, height: NH, borderRadius: 26,
                  display: "flex", alignItems: "center", gap: 18, padding: "0 20px", boxSizing: "border-box",
                  background: f ? "#23365a" : P.card,
                  border: `3px solid ${f ? P.mint : "rgba(255,255,255,0.12)"}`,
                  boxShadow: f ? `0 0 ${30 + 20 * pop}px ${P.mint}66` : "none",
                  opacity: f || v ? 1 : 0.35,
                  transform: `scale(${1 + 0.05 * pop})`,
                }}
              >
                <div style={{ width: 70, height: 70, flexShrink: 0, borderRadius: 18, background: "#111a2c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={n.icon} size={46} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 29, fontWeight: 750, lineHeight: 1.12, letterSpacing: -0.4 }}>{n.label}</div>
                  <div style={{ fontSize: 21, color: P.muted, marginTop: 4, fontWeight: 500 }}>{n.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Caption */}
      <div
        style={{
          width: VW, marginTop: 24, padding: "28px 36px", borderRadius: 32, boxSizing: "border-box", height: 300, overflow: "hidden",
          background: "rgba(255,255,255,0.06)", border: `2px solid ${P.mint}44`,
          opacity: Math.min(1, cap * 1.3), transform: `translateY(${(1 - cap) * 30}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3, color: P.navy, background: P.mint, padding: "6px 16px", borderRadius: 999 }}>
            {stepNo ? `STEP ${stepNo}/${numbered.length}` : "OVERVIEW"}
          </div>
          <div style={{ fontSize: 42, fontWeight: 850, letterSpacing: -0.8 }}>{step.title}</div>
        </div>
        <div style={{ fontSize: 37, lineHeight: 1.3, marginTop: 16, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{step.body}</div>
      </div>
    </div>
  );
};
