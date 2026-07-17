import { useMemo } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface MarkdownProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string): string {
  const codeInline = text.replace(/`([^`]+)`/g, "<code class=\"rounded-ui-sm bg-secondary px-1 py-0.5 text-xs font-mono\">$1</code>");
  const bold = codeInline.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const italic = bold.replace(/\*(.+?)\*/g, "<em>$1</em>");
  const links = italic.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href=\"$2\" class=\"text-primary hover:underline\">$1</a>");
  return links;
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      if (inList) { html.push("</ul>"); inList = false; }
      const level = heading[1].length;
      const text = renderInline(escapeHtml(heading[2]));
      html.push(`<h${level} class="text-${["base", "lg", "base", "sm", "xs", "xs"][level - 1]} font-semibold mt-3 mb-1">${text}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)/);
    if (listItem) {
      if (!inList) { html.push("<ul class=\"list-disc pl-5 space-y-0.5 my-1\">"); inList = true; }
      html.push(`<li class="text-sm">${renderInline(escapeHtml(listItem[1]))}</li>`);
      continue;
    }

    if (line.startsWith("```")) {
      if (inList) { html.push("</ul>"); inList = false; }
      html.push("<pre class=\"overflow-x-auto rounded-ui bg-secondary p-3 my-2\"><code class=\"text-xs leading-relaxed\">");
      continue;
    }

    if (html.length > 0 && html[html.length - 1]?.startsWith("<pre")) {
      if (line.startsWith("```")) {
        html.push("</code></pre>");
      } else {
        html.push(escapeHtml(line) + "\n");
      }
      continue;
    }

    if (inList) { html.push("</ul>"); inList = false; }

    if (line === "") {
      html.push("");
      continue;
    }

    html.push(`<p class="text-sm my-1">${renderInline(escapeHtml(line))}</p>`);
  }

  if (inList) html.push("</ul>");
  return html.join("\n");
}

export function Markdown({ content, className, ...props }: MarkdownProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}
