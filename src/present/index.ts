// Public entry point: `my-you-eye/present` (TODO.md Phase F).
//
// Tier rules:
// - `src/present/` MAY import `src/ui/**`, `src/motion/**` and
//   `src/scenes/**` — it is the live, reactive tier sitting on top of all
//   three.
// - `src/present/` must NEVER import `remotion` or `@remotion/*` — with
//   exactly one named exception: `player.tsx` (`PlayerEmbed`), published
//   separately as its own subpath `my-you-eye/present/player` (TODO.md
//   Phase H), NOT re-exported from this file. That split is what keeps
//   THIS entry (`my-you-eye/present`) free of a video renderer — a consumer
//   who only wants the live click-through (`Presenter`) never bundles
//   Remotion; only a consumer who explicitly imports
//   `my-you-eye/present/player` to scrub the exact MP4 timeline does.
//   `scripts/check-motion.mjs`'s `PLAYER_ENTRY` is the enforcement.
// - Nothing in `src/ui/`, `src/motion/` or `src/scenes/` may import
//   `src/present/` — this is the top of the tier stack; nothing else may
//   depend on it.
// - Every file here is checked by `scripts/check-motion.mjs` the same way
//   `src/motion/` and `src/scenes/` are: no wall-clock APIs, no CSS
//   transitions/keyframes, no remotion import, no `src/video/` import — with
//   exactly two named, narrowly-scoped exceptions: `speaker-view/
//   SpeakerView.useElapsed.ts`'s elapsed-time timer (UI chrome, never part
//   of a rendered scene/frame — see that file's own docblock and the guard
//   script's `PRESENT_TIMER_EXCEPTION` constant) and `player.tsx` (see
//   above — the guard script's `PLAYER_ENTRY` constant).

export { useSteps } from "./use-steps";
export type { UseStepsResult, UseStepsOptions, PresentStep, SceneTiming } from "./use-steps";

export { Presenter } from "./presenter";
export type { PresenterProps, PresenterStepInfo } from "./presenter";

export { SpeakerView } from "./speaker-view";
export type { SpeakerViewProps } from "./speaker-view";

// Re-exported for convenience: the live-only diagram interactivity context
// (TODO.md D2) is DEFINED in src/scenes/ (so a scene can read it without
// importing src/present/), but a consumer building their own Presenter
// chrome will most likely want it alongside everything else in this entry.
// `LiveInteractionContext` is mounted with a real value only inside
// `Presenter`'s own stage (`presenter/Presenter.Stage.tsx`).
export { useLiveInteraction, LiveInteractionContext } from "../scenes";
export type { LiveInteractionValue } from "../scenes";
