import { Composition } from "remotion";
import type { AnyZodObject } from "remotion";
import { VideoRoot, computeVideoDuration } from "my-you-eye/video";
import type { VideoRootProps } from "my-you-eye/video";
import { VIDEO_SIZES } from "my-you-eye/scenes";
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
import { referenceVideo } from "./data/video";
import "my-you-eye/styles.compiled.css";

// The reference video (TODO.md Phase G acceptance check) — one `Video` data
// object (./data/video.ts) rendered through `VideoRoot`. Duration and frame
// size are computed from the data itself (`computeVideoDuration`,
// `VIDEO_SIZES`) — never a hand-picked number, so this composition's frame
// count can't drift from what `computeVideoDuration` (and, transitively,
// the Presenter's `useSteps`) would say for the exact same object.
const referenceVideoFps = referenceVideo.meta?.fps ?? 30;
const referenceVideoSize = VIDEO_SIZES[referenceVideo.meta?.size ?? "1080p"];
const referenceVideoDuration = computeVideoDuration(referenceVideo, referenceVideoFps);

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
    {/* Explicit generic type args: Remotion's <Composition> infers its Props
        type parameter from BOTH `component` and `defaultProps` at once, and
        for a component whose props interface has a required field (VideoRoot's
        `video`), that dual inference falls back to the unhelpful
        `Record<string, unknown>` constraint instead of the specific
        VideoRootProps — a plain interface also doesn't itself satisfy that
        constraint (no index signature), hence the `& Record<string, unknown>`.
        Purely a TS-inference workaround; VideoRoot's own public type stays
        exactly `{ video: Video }` (VideoRootProps, see my-you-eye/video). */}
    <Composition<AnyZodObject, VideoRootProps & Record<string, unknown>>
      id="ReferenceVideo"
      component={VideoRoot}
      durationInFrames={referenceVideoDuration}
      fps={referenceVideoFps}
      width={referenceVideoSize.width}
      height={referenceVideoSize.height}
      defaultProps={{ video: referenceVideo }}
    />
  </>
);
