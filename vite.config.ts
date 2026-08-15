import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  // GH_PAGES_BASE is set by .github/workflows/pages.yml so the showcase can
  // be served from https://<user>.github.io/my-you-eye/ — local dev stays "/".
  base: process.env.GH_PAGES_BASE ?? "/",
  plugins: [tailwindcss(), react()],
  build: {
    emptyOutDir: false,
  },
})
