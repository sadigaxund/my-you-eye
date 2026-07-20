import { Composition } from "remotion";
import { SmokeTest } from "./SmokeTest";
import { RevealDemo } from "./compositions/RevealDemo";
import { TypeTextDemo } from "./compositions/TypeTextDemo";
import { HighlightDemo } from "./compositions/HighlightDemo";
import { StaggerDemo } from "./compositions/StaggerDemo";
import { SlideTransitionDemo } from "./compositions/SlideTransitionDemo";
import "my-you-eye/styles.compiled.css";

export const RemotionRoot = () => (
  <>
    <Composition id="SmokeTest" component={SmokeTest} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="RevealDemo" component={RevealDemo} durationInFrames={90} fps={30} width={1920} height={1080} />
    <Composition id="TypeTextDemo" component={TypeTextDemo} durationInFrames={240} fps={30} width={1920} height={1080} />
    <Composition id="HighlightDemo" component={HighlightDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="StaggerDemo" component={StaggerDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="SlideTransitionDemo" component={SlideTransitionDemo} durationInFrames={180} fps={30} width={1920} height={1080} />
  </>
);
