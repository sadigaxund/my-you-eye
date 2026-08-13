// Public entry point: `my-you-eye/present/player` (TODO.md Phase H).
//
// This is a single file, not a folder, deliberately — same reasoning as
// `src/motion/remotion.tsx`: `scripts/check-showcase.mjs` only requires a
// showcase for a *directory* under `src/present/` that contains a component
// file, and `PlayerEmbed` has no meaningful standalone browser showcase
// story beyond "it's a `<Player>`" (proven instead by scrubbing it
// side-by-side with `Presenter` at the same step boundaries — see the batch
// report).
//
// `PlayerEmbed` is the ONE file inside `src/present/` allowed to import
// `remotion`/`@remotion/*` and `src/video/` (enforced by
// `scripts/check-motion.mjs`'s `PLAYER_ENTRY`/`isPlayerEntry` exception —
// extended for exactly this file, no wider). It is published as its own
// subpath specifically so `my-you-eye/present` (the default entry —
// `Presenter`, `SpeakerView`, `useSteps`) stays free of a video renderer: a
// consumer who only wants the live click-through never bundles Remotion.
// `PlayerEmbed` complements `Presenter`, it does not replace it — the two
// read the exact same `Video` object but scrub two different runtimes (a
// real Remotion composition vs. `MotionRoot mode="live"`'s DomDriver).
import { forwardRef } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import { VideoRoot } from "../video";
import { VIDEO_SIZES } from "../scenes";
import type { Video } from "../scenes";
import { computeVideoDuration } from "../video";

export interface PlayerEmbedProps {
  video: Video;
  className?: string;
  /** Show the built-in scrub bar / play-pause / fullscreen controls. Default true. */
  controls?: boolean;
  /** Default false. */
  autoPlay?: boolean;
  /** Default false. */
  loop?: boolean;
  /** Passed straight through to `<Player>`. Remotion's own license terms
   * govern when this is appropriate to set — `PlayerEmbed` never sets it on
   * a consumer's behalf. See https://remotion.dev/license. */
  acknowledgeRemotionLicense?: boolean;
}

/**
 * `<PlayerEmbed video={video} />` — scrubs the exact video timeline (the
 * same `VideoRoot` composition `apps/video` renders to MP4) inside a
 * `<Player>` in the browser. Sizing (`durationInFrames`,
 * `compositionWidth`/`Height`, `fps`) is computed from `video.meta` the same
 * way `VideoRoot` itself reads it — `computeVideoDuration` and
 * `VIDEO_SIZES` are the exact functions/table `VideoRoot` and `Presenter`
 * both key off, so this can never size the player differently than the MP4
 * actually renders. Forwards a `PlayerRef` for callers that want
 * imperative `play()`/`pause()`/`seekTo()`.
 */
export const PlayerEmbed = forwardRef<PlayerRef, PlayerEmbedProps>(function PlayerEmbed(
  { video, className, controls = true, autoPlay = false, loop = false, acknowledgeRemotionLicense },
  ref,
) {
  const fps = video.meta?.fps ?? 30;
  const { width, height } = VIDEO_SIZES[video.meta?.size ?? "1080p"];
  const durationInFrames = computeVideoDuration(video, fps);

  return (
    <Player
      ref={ref}
      component={VideoRoot}
      inputProps={{ video }}
      durationInFrames={durationInFrames}
      compositionWidth={width}
      compositionHeight={height}
      fps={fps}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      className={className}
      acknowledgeRemotionLicense={acknowledgeRemotionLicense}
    />
  );
});
