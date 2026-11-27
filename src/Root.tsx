import { Composition, Folder } from "remotion";
import { HelloStudio, helloStudioSchemaDefaults } from "./compositions/HelloStudio";
import { REEL } from "./reels/brand";
import { reels } from "./reels/Reels";
import { makeReel } from "./pound/Reel";
import { poundReels } from "./pound/reels";
import { TOTAL } from "./pound/theme";
import { CaseStudy01 } from "./casestudy/CaseStudy";
import { Speedrun, SPEEDRUN_SECONDS } from "./whichone/Speedrun";
import { FIGHTER_SECONDS, MessageFighter } from "./whichone/MessageFighter";
import { POV_SECONDS, PhonePOV } from "./whichone/PhonePOV";
import { LATENIGHT_SECONDS, LateNightTexts } from "./whichone/LateNightTexts";
import { OrderTelephone, TELEPHONE_SECONDS } from "./whichone/OrderTelephone";
import { Receptionist1995, RETRO_SECONDS } from "./whichone/Receptionist1995";
import { EPIC_SECONDS, TheBuilderEpic } from "./whichone/TheBuilderEpic";
import { INBOXZERO_SECONDS, InboxZero } from "./whichone/InboxZero";
import { ORDERBOOK_SECONDS, OrderBook } from "./whichone/OrderBook";
import { MISSION_SECONDS, MissionLunchRush } from "./whichone/MissionLunchRush";
import { DMS_SECONDS, TheDMs } from "./whichone/TheDMs";
import { BOSS_SECONDS, BossLevel, builderBoss, gymBoss, kitchenBoss, salonBoss } from "./whichone/BossLevel";
import { lunchRush, twoBuilders, twoGyms, TwoSides, twoSalons, twoSidesSeconds, TwoSidesProps } from "./whichone/TwoSides";
import { BL_END_SECONDS, BuiltLive, builtLiveDefaults, BuiltLiveProps } from "./builtlive/BuiltLive";
import { END_SECONDS, TalkingHead, talkingDefaults, TalkingProps } from "./talking/TalkingHead";
import { makeVoicedReel, MUSIC_ON, voiced } from "./pound/Voiced";

const poundComps = poundReels.map((d) => ({ id: d.id, component: makeReel(d) }));
const voicedComps = poundReels.map((d) => ({ id: `${d.id}-VO`, component: makeVoicedReel(d, MUSIC_ON), total: voiced(d).total }));

// Register every video in the studio here. Each <Composition> becomes
// selectable in `npm run dev` and renderable via `npx remotion render <id>`.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloStudio"
        component={HelloStudio}
        durationInFrames={90} // 3 seconds @ 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={helloStudioSchemaDefaults}
      />
      <Folder name="AI-Summit-Stories">
        {reels.map((r) => (
          <Composition
            key={r.id}
            id={r.id}
            component={r.component}
            durationInFrames={r.seconds * REEL.fps}
            fps={REEL.fps}
            width={REEL.width}
            height={REEL.height}
          />
        ))}
      </Folder>
      <Folder name="AI-Pound-Shorts">
        {poundComps.map((r) => (
          <Composition key={r.id} id={r.id} component={r.component} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
        ))}
      </Folder>
      <Folder name="AI-Pound-Shorts-Voiceover">
        {voicedComps.map((r) => (
          <Composition key={r.id} id={r.id} component={r.component} durationInFrames={r.total} fps={30} width={1080} height={1920} />
        ))}
      </Folder>
      <Composition
        id="TalkingHead"
        component={TalkingHead}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={150}
        defaultProps={talkingDefaults}
        calculateMetadata={({ props }: { props: TalkingProps }) => ({ durationInFrames: Math.round((props.videoSeconds + END_SECONDS) * 30) })}
      />
      <Composition
        id="BuiltLive"
        component={BuiltLive}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={150}
        defaultProps={builtLiveDefaults}
        calculateMetadata={({ props }: { props: BuiltLiveProps }) => ({ durationInFrames: Math.round((props.videoSeconds + BL_END_SECONDS) * 30) })}
      />
      <Folder name="Which-One-Are-You">
        <Composition id="Speedrun-InboxZero" component={Speedrun} fps={30} width={1080} height={1920} durationInFrames={Math.round(SPEEDRUN_SECONDS * 30)} />
        <Composition id="Message-Fighter" component={MessageFighter} fps={30} width={1080} height={1920} durationInFrames={Math.round(FIGHTER_SECONDS * 30)} />
        <Composition id="Phone-POV" component={PhonePOV} fps={30} width={1080} height={1920} durationInFrames={Math.round(POV_SECONDS * 30)} />
        <Composition id="LateNight-Texts" component={LateNightTexts} fps={30} width={1080} height={1920} durationInFrames={Math.round(LATENIGHT_SECONDS * 30)} />
        <Composition id="Order-Telephone" component={OrderTelephone} fps={30} width={1080} height={1920} durationInFrames={Math.round(TELEPHONE_SECONDS * 30)} />
        <Composition id="Receptionist-1995" component={Receptionist1995} fps={30} width={1080} height={1920} durationInFrames={Math.round(RETRO_SECONDS * 30)} />
        <Composition id="TheBuilder-Epic" component={TheBuilderEpic} fps={30} width={1080} height={1920} durationInFrames={Math.round(EPIC_SECONDS * 30)} />
        <Composition id="InboxZero-Nature" component={InboxZero} fps={30} width={1080} height={1920} durationInFrames={Math.round(INBOXZERO_SECONDS * 30)} />
        <Composition id="OrderBook-Romance" component={OrderBook} fps={30} width={1080} height={1920} durationInFrames={Math.round(ORDERBOOK_SECONDS * 30)} />
        <Composition id="Mission-LunchRush" component={MissionLunchRush} fps={30} width={1080} height={1920} durationInFrames={Math.round(MISSION_SECONDS * 30)} />
        <Composition id="TheDMs-Trailer" component={TheDMs} fps={30} width={1080} height={1920} durationInFrames={Math.round(DMS_SECONDS * 30)} />
        <Composition id="BossLevel-Salon" component={BossLevel} fps={30} width={1080} height={1920} durationInFrames={Math.round(BOSS_SECONDS * 30)} defaultProps={salonBoss} />
        <Composition id="BossLevel-Kitchen" component={BossLevel} fps={30} width={1080} height={1920} durationInFrames={Math.round(BOSS_SECONDS * 30)} defaultProps={kitchenBoss} />
        <Composition id="BossLevel-Builder" component={BossLevel} fps={30} width={1080} height={1920} durationInFrames={Math.round(BOSS_SECONDS * 30)} defaultProps={builderBoss} />
        <Composition id="BossLevel-Gym" component={BossLevel} fps={30} width={1080} height={1920} durationInFrames={Math.round(BOSS_SECONDS * 30)} defaultProps={gymBoss} />
        <Composition id="LunchRush" component={TwoSides} fps={30} width={1080} height={1920} durationInFrames={900} defaultProps={lunchRush}
          calculateMetadata={({ props }: { props: TwoSidesProps }) => ({ durationInFrames: Math.round(twoSidesSeconds(props) * 30) })} />
        <Composition id="TwoBuilders" component={TwoSides} fps={30} width={1080} height={1920} durationInFrames={900} defaultProps={twoBuilders}
          calculateMetadata={({ props }: { props: TwoSidesProps }) => ({ durationInFrames: Math.round(twoSidesSeconds(props) * 30) })} />
        <Composition id="TwoGyms" component={TwoSides} fps={30} width={1080} height={1920} durationInFrames={900} defaultProps={twoGyms}
          calculateMetadata={({ props }: { props: TwoSidesProps }) => ({ durationInFrames: Math.round(twoSidesSeconds(props) * 30) })} />
        <Composition id="TwoSalons" component={TwoSides} fps={30} width={1080} height={1920} durationInFrames={900} defaultProps={twoSalons}
          calculateMetadata={({ props }: { props: TwoSidesProps }) => ({ durationInFrames: Math.round(twoSidesSeconds(props) * 30) })} />
      </Folder>
      <Folder name="Case-Studies">
        <Composition id="CaseStudy01-Vertical" component={CaseStudy01} durationInFrames={750} fps={30} width={1080} height={1920} />
        <Composition id="CaseStudy01-Square" component={CaseStudy01} durationInFrames={750} fps={30} width={1080} height={1080} />
      </Folder>
    </>
  );
};
