// Public entry point: `my-you-eye/present` (TODO.md Phase F).
//
// Tier rules:
// - `src/present/` MAY import `src/ui/**`, `src/motion/**` and
//   `src/scenes/**` — it is the live, reactive tier sitting on top of all
//   three.
// - `src/present/` must NEVER import `remotion` or `@remotion/*`. The live
//   path is covered entirely by `MotionRoot mode="live"` (`DomDriver`);
//   `PlayerEmbed`/`@remotion/player` (scrubbing the exact MP4 timeline in a
//   browser) is explicitly out of scope for this batch — see TODO.md Phase
//   F's own note.
// - Nothing in `src/ui/`, `src/motion/` or `src/scenes/` may import
//   `src/present/` — this is the top of the tier stack; nothing else may
//   depend on it.
// - Every file here is checked by `scripts/check-motion.mjs` the same way
//   `src/motion/` and `src/scenes/` are: no wall-clock APIs, no CSS
//   transitions/keyframes, no remotion import — with exactly one named,
//   narrowly-scoped exception (`speaker-view/SpeakerView.useElapsed.ts`'s
//   elapsed-time timer, which is UI chrome, never part of a rendered
//   scene/frame — see that file's own docblock and the guard script's
//   `PRESENT_TIMER_EXCEPTION` constant).

export { useSteps } from "./use-steps";
export type { UseStepsResult, UseStepsOptions, PresentStep, SceneTiming } from "./use-steps";

export { SpeakerView } from "./speaker-view";
export type { SpeakerViewProps } from "./speaker-view";
