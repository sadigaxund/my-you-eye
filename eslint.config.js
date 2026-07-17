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
);
