import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { CodeBlock } from "../code-block";
import { Badge } from "../badge";
import { Spinner } from "../spinner";
import { ScrollArea } from "../scroll-area";

const terminalVariants = cva(
  "w-full overflow-clip rounded-ui border border-border bg-code-bg text-code-fg flex flex-col",
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

/** Prompt glyph shown before each command. "#" reads as a root shell —
 * added for `my-you-eye/scenes`' `TerminalScene`, whose schema's `prompt`
 * field always included it (additive: the other three glyphs render
 * unchanged). */
export type TerminalPromptGlyph = "$" | ">" | "#" | "❯";

export interface TerminalEntry {
  /** Command text shown after the prompt. Omit for an output-only entry (banner text, log lines). */
  command?: string;
  /** Output body rendered below the command, composed via CodeBlock. */
  output?: string;
  /** Syntax language for `output` — enables CodeBlock's tokenizer for that entry. */
  language?: string;
  /** Process exit code for this command. Renders a small badge (0 reads success, non-zero danger). */
  exitCode?: number;
  /** In-progress line: a spinner + label in place of output, for a still-frame of a running step. */
  spinner?: string;
  /** Per-entry override of the prompt's cwd chrome. Falls back to the Terminal-level `cwd`. */
  cwd?: string;
}

export interface TerminalProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof terminalVariants> {
  entries: TerminalEntry[];
  /** Prompt glyph before each command. Default "$". */
  prompt?: TerminalPromptGlyph;
  /** Working directory shown in the prompt chrome (and the title bar, if no `title` is given). */
  cwd?: string;
  /** Username shown before an "@host" segment in the prompt chrome. */
  user?: string;
  /** Hostname shown after "user@" in the prompt chrome. */
  host?: string;
  /** Caption for an optional window-style title bar above the entries. */
  title?: string;
}

function PromptChrome({
  glyph, user, host, cwd,
}: { glyph: TerminalPromptGlyph; user?: string; host?: string; cwd?: string }) {
  const hasIdentity = Boolean(user || host);
  return (
    <span className="shrink-0 select-none whitespace-nowrap">
      {hasIdentity && (
        <span className="text-success">
          {user}
          {user && host && "@"}
          {host}
          {" "}
        </span>
      )}
      {cwd && <span className="text-primary">{cwd} </span>}
      <span className="text-code-muted">{glyph}</span>
    </span>
  );
}

function ExitBadge({ code }: { code: number }) {
  return (
    <Badge variant={code === 0 ? "success" : "danger"} style="soft" className="font-mono">
      exit {code}
    </Badge>
  );
}

const Terminal = forwardRef<HTMLDivElement, TerminalProps>(
  (
    {
      className, variant, entries, prompt = "$", cwd, user, host, title, ...props
    },
    ref,
  ) => {
    const titleBarCaption = title ?? cwd;
    return (
      <div ref={ref} className={cn(terminalVariants({ variant }), className)} {...props}>
        {titleBarCaption && (
          <div className="flex items-center gap-inline h-9 px-panel border-b border-border shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
            </span>
            <span className="flex-1 text-center text-xs text-code-muted truncate font-mono">
              {titleBarCaption}
            </span>
            <span className="w-[3.75rem]" aria-hidden />
          </div>
        )}
        <ScrollArea orientation="both" className="flex-1 min-h-0">
          <div className="flex flex-col gap-stack p-panel font-mono text-sm">
            {entries.map((entry, i) => (
              <div key={i} className="flex flex-col gap-tight">
                {entry.command != null && (
                  <div className="flex items-start gap-inline">
                    <PromptChrome glyph={prompt} user={user} host={host} cwd={entry.cwd ?? cwd} />
                    <span className="text-code-fg break-all">{entry.command}</span>
                  </div>
                )}
                {entry.spinner != null && (
                  <div className="flex items-center gap-inline text-code-muted">
                    <Spinner size="sm" className="size-3.5" />
                    <span>{entry.spinner}</span>
                  </div>
                )}
                {entry.output != null && (
                  <CodeBlock
                    code={entry.output}
                    language={entry.language}
                    highlight={Boolean(entry.language)}
                    wrap
                  />
                )}
                {entry.exitCode != null && <ExitBadge code={entry.exitCode} />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  },
);
Terminal.displayName = "Terminal";

export { Terminal, terminalVariants };
