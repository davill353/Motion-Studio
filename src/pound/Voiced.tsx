import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { timeChat } from "./Chat";
import manifest from "./vo-manifest.json";
import { makeReelFromLayout, ReelDef, SceneDef } from "./Reel";

const FPS = 30;
const PAD = 8; // frames of breathing room after each line
const MUSIC = "pound/audio/music.mp3";
// Set to true once public/pound/audio/music.mp3 exists.
export const MUSIC_ON = true;

/** Minimum time each kind of scene needs for its animation to read well. */
const minFrames = (s: SceneDef): number => {
  switch (s.type) {
    case "chat": return timeChat(s.msgs).dur - 30; // shorter hold after the last message
    case "list": return 40 + s.items.length * 12;
    case "compare": return 105;
    case "end": return 120;
    default: return 60;
  }
};

export type Seg = { from: number; file: string };

/** Re-times a reel so every scene lasts as long as its voiceover line. */
export const voiced = (def: ReelDef) => {
  const durs: number[] = (manifest as Record<string, number[]>)[def.id];
  if (!durs) throw new Error(`No voiceover for ${def.id}; run scripts/generate_vo.py`);
  const vf = (i: number) => Math.ceil(durs[i] * FPS) + PAD;
  let k = 0, t = 0;
  const segs: Seg[] = [];
  const items = def.scenes.map((s) => {
    const from = t;
    let scene: SceneDef = s, dur: number;
    if (s.type === "flow") {
      let a = 0;
      const steps = s.steps.map((st) => {
        const d = Math.max(vf(k), 54);
        segs.push({ from: from + a + 6, file: `pound/vo-fast/${def.id}/${String(k).padStart(2, "0")}.mp3` });
        k++; a += d;
        return { ...st, dur: d };
      });
      scene = { ...s, steps }; dur = a;
    } else {
      dur = Math.max(vf(k) + (s.type === "end" ? 30 : 0), minFrames(s));
      segs.push({ from: from + 6, file: `pound/vo-fast/${def.id}/${String(k).padStart(2, "0")}.mp3` });
      k++;
    }
    t += dur;
    return { s: scene, from, dur };
  });
  return { items, segs, total: t };
};

const Music: React.FC<{ total: number }> = ({ total }) => (
  <Audio
    src={staticFile(MUSIC)}
    loop
    volume={(f) => 0.2 * interpolate(f, [0, 30, total - 45, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  />
);

export const makeVoicedReel = (def: ReelDef, withMusic: boolean): React.FC => {
  const v = voiced(def);
  const Body = makeReelFromLayout(def, v.items, true);
  const C: React.FC = () => {
    return (
      <>
        <Body />
        {v.segs.map((sg, i) => (
          <Sequence key={i} from={sg.from} layout="none">
            <Audio src={staticFile(sg.file)} volume={1} />
          </Sequence>
        ))}
        {withMusic && <Music total={v.total} />}
      </>
    );
  };
  return C;
};
