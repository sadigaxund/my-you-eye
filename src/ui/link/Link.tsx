import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const linkVariants = cva(
  "underline-offset-4 outline-none focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring rounded-ui-sm",
  {
    variants: {
      variant: {
        primary: "text-primary",
        muted: "text-muted hover:text-fg",
      },
      /**
       * The hover rule lives on its own axis rather than inside each
       * `variant` string because turning it off from a call site is
       * otherwise impossible: `no-underline` and `hover:underline` have
       * identical specificity, so which one wins comes down to the order
       * the two rules happen to sit in the generated stylesheet — and
       * `hover:underline`, being the more specific selector at match time,
       * wins on hover regardless. A variant removes the rule instead of
       * trying to out-shout it.
       */
      underline: {
        true: "hover:underline",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      underline: true,
    },
  },
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /** Underline the label on hover. Default true. Set false for links that
   * are already a card or a nav row, where the underline fights the box. */
  underline?: boolean;
}

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
  ({ className, variant, underline, ...props }, ref) => (
    <a ref={ref} className={cn(linkVariants({ variant, underline }), className)} {...props} />
  ),
);
Link.displayName = "Link";

export { Link, linkVariants };
