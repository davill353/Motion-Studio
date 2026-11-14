import { Composition, Folder } from "remotion";
import { HelloStudio, helloStudioSchemaDefaults } from "./compositions/HelloStudio";
import { REEL } from "./reels/brand";
import { reels } from "./reels/Reels";
import { makeReel } from "./pound/Reel";
import { poundReels } from "./pound/reels";
import { TOTAL } from "./pound/theme";
import { CaseStudy01 } from "./casestudy/CaseStudy";
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
      <Folder name="Case-Studies">
        <Composition id="CaseStudy01-Vertical" component={CaseStudy01} durationInFrames={750} fps={30} width={1080} height={1920} />
        <Composition id="CaseStudy01-Square" component={CaseStudy01} durationInFrames={750} fps={30} width={1080} height={1080} />
      </Folder>
    </>
  );
};
