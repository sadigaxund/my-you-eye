// `VideoRoot` — `Video` data → a real `<TransitionSeries>` (TODO.md Phase
// G). This file (together with `VideoRoot.Chrome.tsx`) is, alongside
// `src/motion/remotion.tsx` and `src/present/player.tsx`, one of the only
// three modules in the whole package allowed to import `remotion` /
// `@remotion/transitions`. It lives in its own top-level tier (`src/video/`,
// a sibling of `src/ui/`, `src/motion/`, `src/scenes/` and `src/present/`),
// published as its own subpath (`my-you-eye/video`) specifically so that
// neither the plain-UI entry, `my-you-eye/motion`, `my-you-eye/scenes`, nor
// the default `my-you-eye/present` entry ever pulls a video renderer into a
// consumer's bundle — only a project that actually renders MP4s (an
// `apps/video`-style Remotion project), or one that embeds the exact video
// timeline via `my-you-eye/present/player`, imports this one.
//
// Every scene mounts under its own `<TransitionSeries.Sequence
// durationInFrames={sceneDuration(scene, fps)}>`, wrapped in `MotionRoot
// mode="video" driver={RemotionDriver}` — a Remotion `<Sequence>` resets
// `useCurrentFrame()` to 0 at its own start for everything it contains, so
// `SceneRenderer`/every scene component sees frame 0 as ITS OWN start, the
// same assumption the showcase's `MotionPreview`/`PinnedFrame` (live driver)
// already hold them to. `sceneDuration` — never a hand-picked frame count —
// is the exact spine the Presenter (`useSteps`) uses for the same scene, so
// a scene is always exactly as long in the MP4 as it is in the live
// click-through.
import { Fragment } from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { cn } from "../lib/cn";
import { MotionRoot } from "../motion/core";
import { RemotionDriver } from "../motion/remotion";
import { SceneRenderer, sceneDuration } from "../scenes";
import type { Video } from "../scenes";
import { transitionOverlapFrames } from "./VideoRoot.duration";
import { sceneTransitionNode } from "./VideoRoot.transitions";
import { VideoChrome } from "./VideoRoot.Chrome";

export interface VideoRootProps {
  video: Video;
}

/**
 * `<VideoRoot video={video} />` — the Remotion composition component for a
 * whole `Video`. Takes `{ video }` and nothing else: no `className`, no
 * `style` (TODO.md Phase H "escape hatches stay closed" extends to
 * `VideoRoot` itself, not just individual scenes) — every visual decision
 * (theme, appearance, font, chrome) comes out of `video.meta`, the same
 * object the Presenter reads.
 */
export function VideoRoot({ video }: VideoRootProps) {
  const fps = video.meta?.fps ?? 30;
  const theme = video.meta?.theme ?? "default";
  const appearance = video.meta?.appearance ?? "dark";
  const font = video.meta?.font ?? "sans";

  return (
    <AbsoluteFill
      data-theme={theme === "default" ? undefined : theme}
      data-font={font}
      className={cn("bg-bg text-fg", appearance === "dark" && "dark")}
    >
      <TransitionSeries>
        {video.scenes.map((scene, index) => (
          <Fragment key={scene.id ?? index}>
            {/* The very first scene never gets a transition regardless of
                what it names — there is nothing before it to transition
                from. Called as a plain function (not JSX) so the returned
                <TransitionSeries.Transition> element lands directly in
                this Fragment's children — see VideoRoot.transitions.tsx's
                docblock for why that matters. */}
            {index > 0 && sceneTransitionNode(scene.transition, transitionOverlapFrames(scene.transition, fps))}
            <TransitionSeries.Sequence durationInFrames={sceneDuration(scene, fps)}>
              <MotionRoot mode="video" driver={RemotionDriver}>
                <SceneRenderer scene={scene} />
              </MotionRoot>
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <VideoChrome video={video} fps={fps} />
    </AbsoluteFill>
  );
}
