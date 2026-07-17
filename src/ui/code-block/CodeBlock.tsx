import { forwardRef, useState, useCallback } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const codeBlockVariants = cva(
  "group relative overflow-hidden rounded-ui border border-border bg-secondary text-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CodeBlockProps
  extends HTMLAttributes<HTMLPreElement>,
    VariantProps<typeof codeBlockVariants> {
  code: string;
  language?: string;
  header?: string;
  wrap?: boolean;
}

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, variant, code, language, header, wrap = true, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }, [code]);

    return (
      <div className={cn(codeBlockVariants({ variant }), className)}>
        {(header || language) && (
          <div className="flex items-center justify-between px-compact-x py-compact-y border-b border-border text-xs text-muted">
            <span>{header}</span>
            {language && <span className="font-mono uppercase">{language}</span>}
          </div>
        )}
        <button
          type="button"
          onClick={copy}
          className="absolute top-1.5 right-1.5 z-10 size-7 rounded-ui-sm flex items-center justify-center bg-bg/80 hover:bg-bg border border-border opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <svg viewBox="0 0 12 12" className="size-3.5 fill-success"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
          ) : (
            <svg viewBox="0 0 12 12" className="size-3.5 fill-muted"><path d="M3 1h6l2 2v6a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm0 1v7h7V3.5L8.5 2H3z" /><path d="M2 4H1v6a1 1 0 001 1h6v-1" /></svg>
          )}
        </button>
          <pre
            ref={ref}
            className={cn("p-panel text-xs leading-relaxed overflow-x-auto", wrap && "whitespace-pre-wrap")}
          {...props}
        >
          <code>{code}</code>
        </pre>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
