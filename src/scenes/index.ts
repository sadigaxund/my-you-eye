// Public entry point: `my-you-eye/scenes`.
//
// Tier rules (AGENTS.md §9b, TODO.md D1): this tier MAY import `src/ui/**`
// and `src/motion/**` — it is the wiring layer where a static component
// meets a timeline. It must NOT import `remotion`; `VideoRoot` (Phase G)
// supplies the driver from `my-you-eye/motion/remotion`, so a consumer who
// only wants the live presenter never pulls a video renderer into their
// bundle.
export * from "./schema";

// The shared timing spine (TODO.md D1/D5) — sceneSteps/sceneDuration are
// what VideoRoot (Phase G) and the Presenter (Phase F) both call to derive
// a scene's frame length, so MP4 pacing and presenter pacing cannot drift.
export { sceneSteps, sceneDuration, stepName } from "./timing";

// The five content scenes (TODO.md Phase E, first half).
export { TitleScene } from "./title-scene";
export type { TitleSceneProps } from "./title-scene";
export { BulletScene } from "./bullet-scene";
export type { BulletSceneProps } from "./bullet-scene";
export { CodeScene } from "./code-scene";
export type { CodeSceneProps } from "./code-scene";
export { TerminalScene } from "./terminal-scene";
export type { TerminalSceneProps } from "./terminal-scene";
export { OutroScene } from "./outro-scene";
export type { OutroSceneProps } from "./outro-scene";

// The scenes-tier CodeDiff component (TODO.md D4/Phase E §6) — animates
// between two full sources; CodeScene renders it for any step whose `code`
// differs from what was on screen before it. Also usable standalone.
export { CodeDiff } from "./code-diff";
export type { CodeDiffProps } from "./code-diff";

// Scene -> rendered frame. The single switch consumers never touch.
export { SceneRenderer } from "./scene-renderer";
export type { SceneRendererProps } from "./scene-renderer";
