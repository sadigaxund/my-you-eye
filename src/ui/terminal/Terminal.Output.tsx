import { useMemo } from "react";
// Deep import, the same one `DiffBlock` uses for the same reason: the
// tokenizer is a shared primitive of the code-block folder, not part of
// CodeBlock's public component surface, and routing it through
// `code-block/index.ts` would push three functions into the package's
// permanent public API to save one path segment.
import { tokenize, splitTokensByLine, renderHighlightedLine } from "../code-block/CodeBlock.highlight";

export interface TerminalOutputProps {
  text: string;
  /** Syntax language. Omitted, the output renders as plain terminal text. */
  language?: string;
}

/**
 * A command's output, rendered as text the shell wrote to the tty.
 *
 * This used to mount a whole `CodeBlock` per output entry, which gave every
 * `ls` result its own rounded border, its own header bar and language badge,
 * its own hover copy button and its own nested scroll region — a boxed code
 * sample sitting inside a terminal, one frame inside another, with a second
 * scrollbar inside the terminal's own. Real terminal output has no frame. It
 * is just the next lines on the screen, in the same typeface as the prompt
 * above it, and it wraps rather than scrolling sideways.
 *
 * The one thing worth keeping from `CodeBlock` was the tokenizer, so that is
 * all this borrows: colors when `language` is set, ambient terminal color
 * (inherited, so the `scheme` variant's matrix/amber retint carries through)
 * when it isn't.
 */
export function TerminalOutput({ text, language }: TerminalOutputProps) {
  const tokenLines = useMemo(() => {
    if (!language) return null;
    const tokens = tokenize(text, language);
    return tokens ? splitTokensByLine(tokens) : null;
  }, [text, language]);
  const plainLines = useMemo(() => text.split("\n"), [text]);

  return (
    <div className="whitespace-pre-wrap break-words">
      {tokenLines
        ? tokenLines.map((line, i) => <div key={i}>{line.length > 0 ? renderHighlightedLine(line) : " "}</div>)
        : plainLines.map((line, i) => <div key={i}>{line || " "}</div>)}
    </div>
  );
}
