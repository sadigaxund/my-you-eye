// Public entry point: `my-you-eye/motion`. MUST NOT import "remotion" or
// "@remotion/*" anywhere in this module's dependency graph (TODO.md D1/2b)
// — that is what keeps this subpath safe for a plain-UI consumer who never
// wants a video renderer pulled into their bundle. The sole module allowed
// to import remotion is `src/motion/remotion.tsx`, published separately as
// `my-you-eye/motion/remotion`.
export * from "./core";
export * from "./reveal";
export * from "./stagger";
export * from "./type-text";
export * from "./highlight";
export * from "./slide";
export * from "./camera";
export * from "./draw";
export * from "./trace";
export * from "./wipe";
export * from "./unmask";
export * from "./spotlight";
export * from "./pulse";
export * from "./shake";
export * from "./ripple";
export * from "./count-up";
export * from "./text-swap";
export * from "./caption";
export * from "./morph";
export * from "./cursor";
// Not a wildcard: `Beat` the no-op-hold component and `Beat` the semantic
// timing-unit type (core/types.ts) share a name by design (both required
// exactly this way in TODO.md) — tsc merges a same-named type + value
// re-export correctly (they're different namespaces), but tsup's .d.ts
// bundler can't resolve that merge across two separate `export *` targets.
// Per TS's own TS2308 guidance, an explicit re-export disambiguates it.
export { Beat } from "./beat";
export type { BeatProps } from "./beat";
