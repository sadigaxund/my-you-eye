// Single source of truth for the theme/profile list — extracted from what
// used to be `THEME_GROUPS` inlined in `src/showcase/App.tsx` (TODO.md Phase
// E §7). The showcase's theme picker AND the scene schema's `VideoTheme`
// union both derive from this module so the two can never drift: adding a
// tenth theme file means updating exactly one array here, not two places
// that happen to have to agree.
//
// Mirrors `src/lib/fonts.ts`'s `fontOptions` -> `FontMode` pattern.

export const themeGroups = [
  {
    label: "Simple",
    options: [
      { value: "default", label: "Default" },
      { value: "neon", label: "Neon" },
      { value: "contrast", label: "Contrast" },
      { value: "brutal", label: "Brutal" },
      { value: "stark", label: "Stark" },
    ],
  },
  {
    label: "Textured",
    options: [
      { value: "glass", label: "Glass" },
      { value: "comic", label: "Comic" },
      { value: "metallic", label: "Metallic" },
    ],
  },
] as const;

/** Every theme profile value, e.g. for `VideoTheme` in the scene schema. */
export type ThemeProfile = (typeof themeGroups)[number]["options"][number]["value"];
