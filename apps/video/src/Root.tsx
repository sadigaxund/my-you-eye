import { Composition } from "remotion";
import { SmokeTest } from "./SmokeTest";
import "my-you-eye/styles.compiled.css";

export const RemotionRoot = () => (
  <>
    <Composition
      id="SmokeTest"
      component={SmokeTest}
      durationInFrames={30}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
