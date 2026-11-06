import React from "react";
import { Sequence } from "remotion";
import { ChatScene, Msg, timeChat, App } from "./Chat";
import { FEdge, FlowScene, FNode, FStep } from "./Flow";
import { TOTAL } from "./theme";
import { CompareScene, EndCard, HookScene, ListScene, PoundFrame, SceneWrap, ShotScene, TextScene } from "./ui";

export type SceneDef =
  | { type: "hook"; kicker: string; text: string; hl?: string[]; dur: number }
  | { type: "text"; kicker?: string; text: string; hl?: string[]; size?: number; dur: number }
  | { type: "list"; title: string; items: string[]; numbered?: boolean; dur: number }
  | { type: "compare"; without: string[]; withIt: string[]; dur: number }
  | { type: "chat"; app: App; title: string; label: string; msgs: Msg[] }
  | { type: "flow"; label: string; nodes: FNode[]; edges: FEdge[]; steps: FStep[] }
  | { type: "shot"; src: string; aspect: number; label: string; dur: number }
  | { type: "end"; note?: string };

export type ReelDef = { id: string; tag: string; scenes: SceneDef[] };

export const sceneDur = (s: SceneDef): number => {
  switch (s.type) {
    case "chat": return timeChat(s.msgs).dur;
    case "flow": return s.steps.reduce((a, b) => a + b.dur, 0);
    case "end": return 0;
    default: return s.dur;
  }
};

/** Lays out scenes back to back; the end card fills whatever is left of 60s. */
export const layout = (def: ReelDef) => {
  let t = 0;
  return def.scenes.map((s) => {
    const from = t;
    const dur = s.type === "end" ? TOTAL - t : sceneDur(s);
    t += dur;
    return { s, from, dur };
  });
};

export const makeReel = (def: ReelDef): React.FC => {
  const C: React.FC = () => (
    <PoundFrame tag={def.tag}>
      {layout(def).map(({ s, from, dur }, i) => (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <SceneWrap dur={dur} exit={s.type !== "end"}>
            {s.type === "hook" && <HookScene kicker={s.kicker} text={s.text} hl={s.hl} />}
            {s.type === "text" && <TextScene kicker={s.kicker} text={s.text} hl={s.hl} size={s.size} />}
            {s.type === "list" && <ListScene title={s.title} items={s.items} numbered={s.numbered} />}
            {s.type === "compare" && <CompareScene without={s.without} withIt={s.withIt} />}
            {s.type === "chat" && <ChatScene app={s.app} title={s.title} label={s.label} msgs={timeChat(s.msgs).msgs} />}
            {s.type === "flow" && <FlowScene label={s.label} nodes={s.nodes} edges={s.edges} steps={s.steps} />}
            {s.type === "shot" && <ShotScene src={s.src} aspect={s.aspect} label={s.label} dur={dur} />}
            {s.type === "end" && <EndCard note={s.note} />}
          </SceneWrap>
        </Sequence>
      ))}
    </PoundFrame>
  );
  return C;
};
