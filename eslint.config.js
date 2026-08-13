import tseslint from "typescript-eslint";

const RESTRICTED_ELEMENTS = /^(button|input|select|textarea|table)$/;

export default tseslint.config(
  { ignores: ["dist/", "node_modules/"] },
  tseslint.configs.recommended,
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXOpeningElement[name.name=/${RESTRICTED_ELEMENTS.source}/]`,
          message:
            "Styled native elements must be inside src/ui/. See AGENTS.md §0.1",
        },
        {
          selector:
            'JSXAttribute[name.name="className"] Literal[value=/bg-\\[#/], JSXAttribute[name.name="className"] Literal[value=/text-\\[#/], JSXAttribute[name.name="className"] Literal[value=/border-\\[#/]',
          message:
            "Arbitrary color values are forbidden. Use design tokens mapped via Tailwind theme. See AGENTS.md §0.2",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "class-variance-authority", message: "Import only inside src/ui/ or src/lib/" },
            { name: "tailwind-merge", message: "Import only inside src/ui/ or src/lib/" },
          ],
          patterns: [
            {
              group: ["@radix-ui/*"],
              message: "@radix-ui imports only inside src/ui/ or src/lib/",
            },
          ],
        },
      ],
      "max-lines": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ["src/ui/**", "src/lib/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["src/ui/**", "src/showcase/**"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  // Tier boundary (AGENTS.md §9b): src/ui/ is the static design-system tier and
  // must never depend on the emerging motion/scenes/present animation layer.
  // This block is declared AFTER the "no-restricted-imports": "off" block above
  // for src/ui/** — in a typescript-eslint config array, later blocks win for a
  // given rule key on matching files, so this re-enables no-restricted-imports
  // for src/ui/** scoped to only the remotion/motion/scenes/present boundary
  // (the CVA/tailwind-merge/@radix-ui restriction stays off, since src/ui/ is
  // exactly where those are allowed).
  {
    files: ["src/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "remotion",
              message: "src/ui/ must not import remotion — AGENTS.md §9b tier separation",
            },
          ],
          patterns: [
            {
              group: ["@remotion/*"],
              message: "src/ui/ must not import remotion — AGENTS.md §9b tier separation",
            },
            {
              group: [
                "**/motion",
                "**/motion/**",
                "**/scenes",
                "**/scenes/**",
                "**/present",
                "**/present/**",
                "**/video",
                "**/video/**",
              ],
              message:
                "src/ui/ must not import from src/motion, src/scenes, src/present, or src/video — AGENTS.md §9b tier separation",
            },
          ],
        },
      ],
    },
  },
  // src/motion/ must stay child-agnostic — it may never depend on src/ui/ or
  // the published package name (AGENTS.md §9c rule 3). No files match this yet
  // (src/motion/ doesn't exist), which is fine — the block is inert until it does.
  {
    files: ["src/motion/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "my-you-eye",
              message: "src/motion/ must stay child-agnostic — AGENTS.md §9c rule 3",
            },
          ],
          patterns: [
            {
              group: ["**/ui", "**/ui/**", "**/video", "**/video/**"],
              message: "src/motion/ must stay child-agnostic — AGENTS.md §9c rule 3",
            },
          ],
        },
      ],
    },
  },
);
