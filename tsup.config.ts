import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: { tsconfig: "tsconfig.app.json" },
  tsconfig: "tsconfig.app.json",
  external: ["react", "react-dom"],
  clean: true,
});
