import { Composition } from "remotion";
import { HelloStudio, helloStudioSchemaDefaults } from "./compositions/HelloStudio";

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
    </>
  );
};
