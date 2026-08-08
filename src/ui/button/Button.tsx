import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Spinner } from "../spinner";

const buttonVariants = cva(
  // Focus ring: ring-inset consistently (see AGENTS.md §Step-B / TODO.md A5
  // "focus rings: some components use ring-inset, some don't" — this batch
  // standardizes on ring-inset for the components it touches, since an inset
  // ring never gets clipped by an ancestor's overflow-hidden, unlike an
  // outside ring). Transition timing is explicit token duration/ease rather
  // than Tailwind's un-tokenized `transition-colors` default.
  "inline-flex items-center justify-center gap-inline rounded-ui font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-fg hover:bg-secondary/80",
        ghost: "text-fg hover:bg-secondary",
        danger: "bg-danger text-primary-fg hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        // Compact icon-only control (no text label) — for inline, dense
        // contexts like a table-cell audio player's play/pause toggle,
        // where the text-sized "sm" button's horizontal padding reads as
        // too wide around a single glyph.
        "icon-sm": "size-control p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      style={{ backdropFilter: "blur(var(--backdrop-blur))" }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
