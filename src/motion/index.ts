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
