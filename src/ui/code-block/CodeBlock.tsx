import { forwardRef, useState, useCallback, useMemo } from "react";
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
  showLineNumbers?: boolean;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-muted">
      <path d="M3 1h6l2 2v6a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm0 1v7h7V3.5L8.5 2H3z" />
      <path d="M2 4H1v6a1 1 0 001 1h6v-1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-success">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, variant, code, language, header, wrap = true, showLineNumbers = false, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }, [code]);

    const lines = useMemo(() => code.split("\n"), [code]);

    return (
      <div className={cn(codeBlockVariants({ variant }), className)}>
        <div className="flex items-center justify-between gap-2 h-9 pl-panel pr-1.5 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            {header && <span className="text-xs font-medium text-fg truncate">{header}</span>}
            {language && (
              <span className="shrink-0 rounded-ui-sm bg-bg/60 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-muted">
                {language}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={copy}
            className={cn(
              "flex items-center gap-1 rounded-ui-sm px-1.5 h-6 shrink-0",
              "text-xs text-muted hover:text-fg hover:bg-bg/80 border border-transparent hover:border-border",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-[var(--duration-fast)]",
              "outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring cursor-pointer",
              copied && "opacity-100",
            )}
            title="Copy code"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className={cn(copied && "text-success")}>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <div className="flex">
          {showLineNumbers && (
            <div
              aria-hidden
              className="select-none shrink-0 py-panel pl-compact-x pr-compact-x text-right font-mono text-xs leading-relaxed text-muted border-r border-border"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre
            ref={ref}
            className={cn(
              "flex-1 min-w-0 p-panel font-mono text-xs leading-relaxed overflow-x-auto",
              wrap && "whitespace-pre-wrap break-words",
            )}
            {...props}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
