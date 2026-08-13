import { defineConfig } from "tsup";

// Multi-entry build (TODO.md D1/2c, extended by Phase G/H): one package,
// several published entry points. "motion" and "scenes" and the default
// "present" entry must never pull in remotion — "motion-remotion" is the
// sole module allowed to import it for the motion tier; "video" (VideoRoot,
// TODO.md Phase G) is the module that assembles a Video into a
// <TransitionSeries> and is its own entry for the same reason; "present-
// player" (PlayerEmbed, TODO.md Phase H) is the one deliberate hole in the
// present tier's remotion-free rule, split out exactly the way
// "motion-remotion" is. See src/motion/index.ts, src/motion/remotion.tsx,
// src/video/index.ts and src/present/player.tsx for the corresponding
// source-side splits.
export default defineConfig({
  entry: {
    index: "src/index.ts",
    motion: "src/motion/index.ts",
    "motion-remotion": "src/motion/remotion.tsx",
    scenes: "src/scenes/index.ts",
    present: "src/present/index.ts",
    "present-player": "src/present/player.tsx",
    video: "src/video/index.ts",
  },
  format: ["esm"],
  dts: { tsconfig: "tsconfig.app.json" },
  tsconfig: "tsconfig.app.json",
  // Every remotion package stays external and is declared an *optional* peer
  // (package.json): a consumer who only wants the static UI, or only the
  // live presenter, never has a video renderer pulled into their bundle.
  // "@remotion/transitions/*" covers its per-presentation subpath exports
  // (fade/slide/wipe/... aren't re-exported from the package root — esbuild
  // supports a single "*" wildcard per external pattern).
  external: [
    "react",
    "react-dom",
    "remotion",
    "@remotion/player",
    "@remotion/transitions",
    "@remotion/transitions/*",
  ],
  clean: true,
});
