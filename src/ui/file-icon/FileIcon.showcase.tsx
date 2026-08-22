import type { ShowcaseEntry } from "../../showcase/types";
import { FileIcon } from ".";
import type { FileIconResolver } from ".";

const entry: ShowcaseEntry = {
  title: "FileIcon",
  group: "display",
  description:
    "File/folder identity icon with a pluggable resolver — the library ships no icon pack; inject your own mapping and fall back to neutral glyphs.",
  demos: [
    {
      name: "Neutral defaults",
      description:
        "Without a resolver every row gets the built-in glyph set: generic file, closed folder, open folder.",
      render: () => (
        <div className="flex items-center justify-center gap-5 text-sm">
          <span className="flex items-center gap-2"><FileIcon name="notes.md" /> notes.md</span>
          <span className="flex items-center gap-2"><FileIcon name="guides" folder /> guides</span>
          <span className="flex items-center gap-2"><FileIcon name="guides" folder open /> guides</span>
        </div>
      ),
    },
    {
      name: "Custom resolver",
      description:
        "The implementer decides which icon a filename gets — here a tiny markdown-aware mapping; a full icon pack plugs in the same way.",
      render: () => {
        const mdResolver: FileIconResolver = ({ name }) => {
          if (name.endsWith(".md")) {
            return (
              <svg viewBox="0 0 16 16" className="size-full fill-none stroke-current text-primary" strokeWidth="1.3">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1" />
                <path d="M4 10V6l2.5 2.5L9 6v4M11.5 6v4M9.75 8.25L11.5 10l1.75-1.75" />
              </svg>
            );
          }
          if (name.endsWith(".json")) {
            return (
              <svg viewBox="0 0 16 16" className="size-full fill-none stroke-current text-warning" strokeWidth="1.3">
                <path d="M6 3c-1.5 0-1.5 2-3 2 1.5 0 1.5 2 3 2M6 7c-1.5 0-1.5 2-3 2 1.5 0 1.5 2 3 2" />
                <path d="M10 3c1.5 0 1.5 2 3 2-1.5 0-1.5 2-3 2m0 0c1.5 0 1.5 2 3 2-1.5 0-1.5 2-3 2" />
              </svg>
            );
          }
          return undefined;
        };
        return (
          <div className="flex flex-col items-start gap-2 text-sm">
            <span className="flex items-center gap-2"><FileIcon name="readme.md" resolve={mdResolver} /> readme.md</span>
            <span className="flex items-center gap-2"><FileIcon name="package.json" resolve={mdResolver} /> package.json</span>
            <span className="flex items-center gap-2"><FileIcon name="main.tsx" resolve={mdResolver} /> main.tsx (fallback)</span>
          </div>
        );
      },
    },
  ],
};
export default entry;
