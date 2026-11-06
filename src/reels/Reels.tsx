import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { themes } from "./brand";
import { ChatBubble, EndCard, gradientText, ListRow, ReelFrame, Scene, SmallLabel, useTheme, Words } from "./components";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- Reel 1: AI is for your life (12s) ---------- */
const StruckWord: React.FC<{ word: string; strikeAt: number }> = ({ word, strikeAt }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const w = interpolate(frame, [strikeAt, strikeAt + 10], [0, 105], clamp);
  return (
    <span style={{ position: "relative", display: "inline-block", opacity: interpolate(frame, [strikeAt, strikeAt + 14], [1, 0.45], clamp) }}>
      {word}
      <span
        style={{
          position: "absolute",
          left: "-2.5%",
          top: "52%",
          width: `${w}%`,
          height: 14,
          borderRadius: 7,
          background: `linear-gradient(90deg, ${theme.a}, ${theme.b})`,
          transform: "rotate(-4deg)",
        }}
      />
    </span>
  );
};

export const ReelAIForLife: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 16, fps, config: { damping: 14 } });
  return (
    <ReelFrame theme={themes.violet}>
      <Scene from={0} dur={80}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Words text={"AI isn't just\nfor"} size={130} />
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              letterSpacing: -3,
              opacity: pop,
              transform: `scale(${0.8 + 0.2 * pop})`,
            }}
          >
            <StruckWord word="business." strikeAt={42} />
          </div>
        </div>
      </Scene>
      <Scene from={80} dur={85}>
        <Words text={"It's for your\nlife."} size={150} hl={["life"]} stagger={6} />
      </Scene>
      <Scene from={165} dur={115}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <SmallLabel text="Learn how AI can help you" />
          <ListRow text="Save money" delay={10} />
          <ListRow text="Start a side hustle" delay={22} />
          <ListRow text="Manage family finances" delay={34} />
        </div>
      </Scene>
      <Scene from={280} dur={80} exit={false}>
        <EndCard kicker="Join me at the next" />
      </Scene>
    </ReelFrame>
  );
};

/* ---------- Reel 2: Save money (14s) ---------- */
export const ReelSaveMoney: React.FC = () => (
  <ReelFrame theme={themes.money}>
    <Scene from={0} dur={80}>
      <Words text={"Where does your\nmoney go\nevery month?"} size={120} hl={["money"]} />
    </Scene>
    <Scene from={80} dur={160}>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
        <SmallLabel text="Try asking AI" />
        <ChatBubble role="user" delay={6} text="Here's my spending from last month. Where can I cut back?" />
        <ChatBubble
          role="ai"
          delay={40}
          speed={2}
          text="Three easy wins: unused subscriptions, takeout on weeknights, and a cheaper phone plan."
        />
      </div>
    </Scene>
    <Scene from={240} dur={85}>
      <Words text={"Ask better\nquestions.\nKeep more\nmoney."} size={130} hl={["more", "money"]} />
    </Scene>
    <Scene from={325} dur={95} exit={false}>
      <EndCard kicker={"Learn to save money\nwith AI at the"} />
    </Scene>
  </ReelFrame>
);

/* ---------- Reel 3: Side hustle (14s) ---------- */
export const ReelSideHustle: React.FC = () => (
  <ReelFrame theme={themes.hustle}>
    <Scene from={0} dur={75}>
      <Words text={"Got a\nside hustle\nidea?"} size={140} hl={["side", "hustle"]} />
    </Scene>
    <Scene from={75} dur={160}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <SmallLabel text="AI can help you" />
        <ListRow badge="1" text="Shape the idea" delay={8} />
        <ListRow badge="2" text="Name & brand it" delay={22} />
        <ListRow badge="3" text="Price your offer" delay={36} />
        <ListRow badge="4" text="Write your first post" delay={50} />
      </div>
    </Scene>
    <Scene from={235} dur={90}>
      <Words text={"From idea to\nfirst customer,\nfaster."} size={120} hl={["faster"]} />
    </Scene>
    <Scene from={325} dur={95} exit={false}>
      <EndCard kicker={"Start your side hustle\nwith AI at the"} />
    </Scene>
  </ReelFrame>
);

/* ---------- Reel 4: Family finances (14s) ---------- */
export const ReelFamilyFinances: React.FC = () => (
  <ReelFrame theme={themes.family}>
    <Scene from={0} dur={80}>
      <Words text={"Family budget\nfeeling\noverwhelming?"} size={115} hl={["overwhelming"]} />
    </Scene>
    <Scene from={80} dur={160}>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
        <SmallLabel text="Try asking AI" />
        <ChatBubble role="user" delay={6} text="Plan a week of dinners for a family of 4 on a tight budget." />
        <ChatBubble
          role="ai"
          delay={40}
          speed={2}
          text="Here's a 7-day meal plan, a shopping list, and leftovers ideas to stretch every meal."
        />
      </div>
    </Scene>
    <Scene from={240} dur={85}>
      <Words text={"Less stress.\nMore family\ntime."} size={135} hl={["family", "time"]} stagger={5} />
    </Scene>
    <Scene from={325} dur={95} exit={false}>
      <EndCard kicker={"Manage family money\nwith AI at the"} />
    </Scene>
  </ReelFrame>
);

/* ---------- Reel 5: No tech skills needed (12s) ---------- */
const Rotator: React.FC<{ words: string[]; each: number; delay: number }> = ({ words, each, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  return (
    <div style={{ position: "relative", height: 200, width: 920 }}>
      {words.map((w, i) => {
        const start = delay + i * each;
        const isLast = i === words.length - 1;
        const pIn = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 160 } });
        const out = isLast ? 0 : interpolate(frame, [start + each - 6, start + each], [0, 1], clamp);
        return (
          <div
            key={w}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: Math.min(160, 1650 / w.length),
              whiteSpace: "nowrap",
              fontWeight: 900,
              letterSpacing: -4,
              opacity: frame < start ? 0 : Math.min(1, pIn * 1.4) * (1 - out),
              transform: `translateY(${(1 - pIn) * 120 - out * 120}px)`,
              ...gradientText(theme),
            }}
          >
            {w}
          </div>
        );
      })}
    </div>
  );
};

export const ReelNoTechSkills: React.FC = () => (
  <ReelFrame theme={themes.bold}>
    <Scene from={0} dur={80}>
      <Words text={"Think AI is\ntoo complicated?"} size={125} hl={["complicated"]} />
    </Scene>
    <Scene from={80} dur={125}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <SmallLabel text="This summit is for" />
        <Rotator words={["Parents.", "Students.", "Employees.", "Retirees.", "Business owners."]} each={22} delay={6} />
      </div>
    </Scene>
    <Scene from={205} dur={80}>
      <Words text={"If you can\nask a question,\nyou can use AI."} size={110} hl={["use", "AI"]} />
    </Scene>
    <Scene from={285} dur={75} exit={false}>
      <EndCard kicker="See you at the" />
    </Scene>
  </ReelFrame>
);

export const reels = [
  { id: "Reel1-AIForYourLife", component: ReelAIForLife, seconds: 12 },
  { id: "Reel2-SaveMoney", component: ReelSaveMoney, seconds: 14 },
  { id: "Reel3-SideHustle", component: ReelSideHustle, seconds: 14 },
  { id: "Reel4-FamilyFinances", component: ReelFamilyFinances, seconds: 14 },
  { id: "Reel5-NoTechSkills", component: ReelNoTechSkills, seconds: 12 },
];
