import { Composition } from "remotion";
import { SmokeTest } from "./SmokeTest";
import { RevealDemo } from "./compositions/RevealDemo";
import { TypeTextDemo } from "./compositions/TypeTextDemo";
import { HighlightDemo } from "./compositions/HighlightDemo";
import { StaggerDemo } from "./compositions/StaggerDemo";
import { SlideDemo } from "./compositions/SlideDemo";
import { EntranceDemo } from "./compositions/EntranceDemo";
import { AttentionDemo } from "./compositions/AttentionDemo";
import { TextDemo } from "./compositions/TextDemo";
import { StructuralDemo } from "./compositions/StructuralDemo";
import "my-you-eye/styles.compiled.css";

// One composition per rewritten primitive (Reveal/Stagger/TypeText/
// Highlight/Slide), plus a few grouped compositions covering the 20 new
// primitives (TODO.md 5a explicitly allows "a composition per primitive,
// or a few grouped compositions"). Every composition is wrapped in
// RemotionDriver via MotionRoot mode="video" inside its own file.
export const RemotionRoot = () => (
  <>
    <Composition id="SmokeTest" component={SmokeTest} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="RevealDemo" component={RevealDemo} durationInFrames={90} fps={30} width={1920} height={1080} />
    <Composition id="TypeTextDemo" component={TypeTextDemo} durationInFrames={240} fps={30} width={1920} height={1080} />
    <Composition id="HighlightDemo" component={HighlightDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="StaggerDemo" component={StaggerDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="SlideDemo" component={SlideDemo} durationInFrames={180} fps={30} width={1920} height={1080} />
    <Composition id="EntranceDemo" component={EntranceDemo} durationInFrames={180} fps={30} width={1920} height={1080} />
    <Composition id="AttentionDemo" component={AttentionDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="TextDemo" component={TextDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="StructuralDemo" component={StructuralDemo} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
