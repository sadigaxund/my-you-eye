// Public entry point: `my-you-eye/scenes`.
//
// Tier rules (AGENTS.md §9b, TODO.md D1): this tier MAY import `src/ui/**`
// and `src/motion/**` — it is the wiring layer where a static component
// meets a timeline. It must NOT import `remotion`; `VideoRoot` (Phase G)
// supplies the driver from `my-you-eye/motion/remotion`, so a consumer who
// only wants the live presenter never pulls a video renderer into their
// bundle.
export * from "./schema";
