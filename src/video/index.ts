// Public entry point: `my-you-eye/video` (TODO.md Phase G).
//
// This is the tier that actually assembles a `Video` object into a Remotion
// `<TransitionSeries>`. Together with `src/motion/remotion.tsx` and
// `src/present/player.tsx`, `VideoRoot.tsx`/`VideoRoot.Chrome.tsx` are the
// only modules in the package allowed to import `remotion` /
// `@remotion/transitions` — that boundary is what keeps `my-you-eye/scenes`
// and the default `my-you-eye/present` entry free of a video renderer.
//
// Tier rules: this module MAY import `src/ui/**`, `src/motion/**` (via the
// remotion-free `../motion` entry AND `../motion/remotion`) and
// `src/scenes/**`. Nothing in `src/ui/`, `src/motion/`, `src/scenes/` or
// `my-you-eye/present`'s default entry may import from here — `src/video/`
// sits beside `src/present/` at the top of the tier stack, not below it.
// `src/present/player.tsx` is the one documented exception: embedding the
// exact video timeline in a `<Player>` means rendering this exact
// composition, so it imports `VideoRoot` directly.
export { VideoRoot } from "./VideoRoot";
export type { VideoRootProps } from "./VideoRoot";

export {
  computeVideoDuration,
  computeChapters,
  sceneOffsets,
  transitionOverlapFrames,
} from "./VideoRoot.duration";
export type { SceneOffset, VideoChapter } from "./VideoRoot.duration";

export { sceneTransitionNode } from "./VideoRoot.transitions";
