import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Consumer-supplied icon resolution (#10). Return any renderable icon —
 * a Material Icon Theme SVG, a lucide glyph, an emoji, anything — or
 * undefined to fall back to the built-in neutral glyph. The library ships
 * NO icon pack: which identities exist is the implementer's decision.
 */
export type FileIconResolver = (
  file: { name: string; folder: boolean; open: boolean },
) => ReactNode | undefined;

export interface FileIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Basename handed to the resolver (e.g. "notes.md", "guides"). */
  name?: string;
  /** True renders as a folder (open/closed states); false as a file. */
  folder?: boolean;
  /** Folder expanded state; meaningful when `folder` is true. */
  open?: boolean;
  /** Square icon size in px (default 16). */
  size?: number;
  resolve?: FileIconResolver;
}

const DefaultFileGlyph = () => (
  <svg viewBox="0 0 16 16" className="size-full fill-none stroke-current" strokeWidth="1.3" strokeLinejoin="round">
    <path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
    <path d="M9 2v3h3" />
  </svg>
);

const DefaultFolderGlyph = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className="size-full fill-none stroke-current"
    strokeWidth="1.3"
    strokeLinejoin="round"
    // Open folders read via the raised flap, VSCode-style.
    {...(open ? {} : {})}
  >
    {open ? (
      <>
        <path d="M2 4a1 1 0 011-1h3l1.5 1.5H12a1 1 0 011 1V7H5.5L4 12H3a1 1 0 01-1-1V4z" />
        <path d="M5.5 7H14l-1.6 4.6a1 1 0 01-.95.65H4.4a.5.5 0 01-.47-.66L5.5 7z" />
      </>
    ) : (
      <path d="M2 4a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
    )}
  </svg>
);

// File/folder identity icon (#10) — deliberately generalized: this component
// owns ONLY the layout contract (square box, open/closed folder states,
// neutral fallback). Which icon a given filename gets is the implementer's
// choice, injected via `resolve`; return undefined to use the neutral
// built-ins. Resolver output renders AS-IS — full-color third-party icons
// are never tinted or resized beyond the box.
const FileIcon = forwardRef<HTMLSpanElement, FileIconProps>(
  ({ className, name, folder = false, open = false, size = 16, resolve, ...props }, ref) => {
    const custom = resolve?.({ name: name ?? "", folder, open });
    return (
      <span
        ref={ref}
        role="img"
        aria-hidden="true"
        className={cn("flex shrink-0 items-center justify-center [&>svg]:size-full", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        {custom ?? (folder ? <DefaultFolderGlyph open={open} /> : <DefaultFileGlyph />)}
      </span>
    );
  },
);
FileIcon.displayName = "FileIcon";

export { FileIcon };
