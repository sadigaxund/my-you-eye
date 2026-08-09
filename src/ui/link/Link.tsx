import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const linkVariants = cva(
  "underline-offset-4 outline-none focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring rounded-ui-sm",
  {
    variants: {
      variant: {
        primary: "text-primary hover:underline",
        muted: "text-muted hover:text-fg hover:underline",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {}

/**
 * A styled `<a>` — the one primitive missing before this batch. AGENTS.md §0
 * rule 1 forbids a hand-rolled styled native element anywhere outside
 * `src/ui/`; `OutroScene` (TODO.md Phase E) needs a real, navigable link for
 * its `links` list, and none of the existing display primitives own that
 * element (a few `src/ui/**` components render a bare styled `<a>` inline —
 * `Breadcrumbs`, `CellType`'s url/email cells, `Markdown` — but none expose
 * it as a standalone, reusable component).
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, ...props }, ref) => (
    <a ref={ref} className={cn(linkVariants({ variant }), className)} {...props} />
  ),
);
Link.displayName = "Link";

export { Link, linkVariants };
