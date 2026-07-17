import { forwardRef, useRef, useEffect, useCallback } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const textareaVariants = cva(
  "flex w-full rounded-ui border bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border",
        filled: "border-transparent bg-secondary",
      },
      invalid: {
        true: "border-danger ring-danger/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, invalid, autoResize, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useEffect(() => {
      if (!autoResize || !internalRef.current) return;
      const el = internalRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    return (
      <textarea
        ref={setRef}
        className={cn(textareaVariants({ variant, invalid }), "min-h-[80px]", className)}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
