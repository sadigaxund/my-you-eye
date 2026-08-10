import { defineConfig } from "tsup";

// Multi-entry build (TODO.md D1/2c): one package, three published entry
// points. "motion" must never pull in remotion (it's the entry static-UI
// consumers also load); "motion-remotion" is the sole module allowed to
// import it. See src/motion/index.ts / src/motion/remotion.tsx for the
// corresponding source-side split.
export default defineConfig({
  entry: {
    index: "src/index.ts",
    motion: "src/motion/index.ts",
    "motion-remotion": "src/motion/remotion.tsx",
    scenes: "src/scenes/index.ts",
    present: "src/present/index.ts",
  },
  format: ["esm"],
  dts: { tsconfig: "tsconfig.app.json" },
  tsconfig: "tsconfig.app.json",
  external: ["react", "react-dom", "remotion"],
  clean: true,
});
