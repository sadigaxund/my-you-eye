import { useMemo } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { CodeBlock } from "../code-block";

export interface MarkdownProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string }
  | { type: "empty" };

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    if (match[1]) {
      parts.push(<code key={match.index} className="rounded-ui-sm bg-secondary px-1 py-0.5 text-xs font-mono">{match[1].slice(1, -1)}</code>);
    } else if (match[3]) {
      parts.push(<strong key={match.index}>{escapeHtml(match[3])}</strong>);
    } else if (match[5]) {
      parts.push(<em key={match.index}>{escapeHtml(match[5])}</em>);
    } else if (match[7]) {
      parts.push(<a key={match.index} href={match[8]} className="text-primary hover:underline">{escapeHtml(match[7])}</a>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts.length === 1 ? parts[0] : parts.length > 1 ? <>{parts}</> : "";
}

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line === "") {
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", code: codeLines.join("\n") });
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)/);
    if (listItem) {
      const items: string[] = [listItem[1]];
      i++;
      while (i < lines.length) {
        const next = lines[i].match(/^[-*]\s+(.+)/);
        if (next) { items.push(next[1]); i++; }
        else break;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paraLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i] !== "") {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

export function Markdown({ content, className, ...props }: MarkdownProps) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={cn("space-y-3", className)} {...props}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const sizes = ["", "text-lg", "text-base", "text-sm", "text-xs", "text-xs"];
            const cls = cn(sizes[block.level - 1] ?? "text-base", "font-semibold text-fg");
            const h = block.level;
            return h === 1 ? <h1 key={i} className={cls}>{renderInline(block.text)}</h1>
                 : h === 2 ? <h2 key={i} className={cls}>{renderInline(block.text)}</h2>
                 : h === 3 ? <h3 key={i} className={cls}>{renderInline(block.text)}</h3>
                 : h === 4 ? <h4 key={i} className={cls}>{renderInline(block.text)}</h4>
                 : h === 5 ? <h5 key={i} className={cls}>{renderInline(block.text)}</h5>
                 : <h6 key={i} className={cls}>{renderInline(block.text)}</h6>;
          }
          case "paragraph":
            return <p key={i} className="text-sm leading-relaxed text-fg">{renderInline(block.text)}</p>;
          case "list":
            return (
              <ul key={i} className="list-disc pl-5 space-y-0.5">
                {block.items.map((item, j) => (
                  <li key={j} className="text-sm text-fg">{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "code":
            return <CodeBlock key={i} code={block.code} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
