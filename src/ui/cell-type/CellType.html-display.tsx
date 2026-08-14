import { useMemo } from "react";
import DOMPurify from "dompurify";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { ScrollArea } from "../scroll-area";
import { useTruncated, ExpandIndicator, EXPAND_POPOVER_STYLE } from "./CellType.shared";

// The "html" cell type renders a fragment of HTML that arrived as DATA — an
// email body, a CMS field, a rich-text column. That input is untrusted by
// definition, so it is sanitised through DOMPurify on every render path
// before it ever reaches `dangerouslySetInnerHTML`.
//
// Sanitising only one of the two render paths would be worse than sanitising
// neither: it teaches the reader the content is safe, and then the popover —
// the path with room to actually exploit — is the unsafe one. Both go
// through `sanitize` below, which is the single policy for this component.

/**
 * A deliberately small allowlist rather than DOMPurify's (already sound, but
 * much broader) defaults. A table cell needs formatting and links; it has no
 * use for forms, media or embedded documents, and each of those is a class of
 * bug we simply opt out of having.
 */
const ALLOWED_TAGS = [
  "a", "b", "strong", "i", "em", "u", "s", "code", "pre", "kbd", "mark", "small", "sub", "sup",
  "br", "span", "p", "div", "blockquote",
  "ul", "ol", "li", "dl", "dt", "dd",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "h1", "h2", "h3", "h4", "h5", "h6", "hr",
];

/** No `style` (CSS can exfiltrate and can cover the page), no event handlers,
 * no `id` (collides with the host document). */
const ALLOWED_ATTR = ["href", "title", "colspan", "rowspan", "align", "lang", "dir"];

let hookInstalled = false;

function installHook() {
  if (hookInstalled) return;
  hookInstalled = true;
  // Applied AFTER attribute sanitisation, so it can't be undone by anything
  // DOMPurify does later. A regex over the serialised output could not do
  // this correctly — it would have to re-parse HTML to find the anchors.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/**
 * Sanitises `raw`, or returns `null` when there is no DOM to sanitise
 * against — DOMPurify needs one, and during SSR there isn't one. Callers
 * render the ESCAPED SOURCE in that case: failing closed to visible markup
 * is correct, whereas emitting unsanitised HTML because the sanitiser was
 * unavailable would turn a rendering limitation into a vulnerability.
 */
export function sanitizeHtml(raw: string): string | null {
  if (typeof window === "undefined" || typeof window.document === "undefined") return null;
  installHook();
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Belt-and-braces against the classic mutation-XSS and namespace-confusion
    // vectors; none of these can appear in a legitimate rich-text cell.
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "svg", "math", "template"],
    FORBID_ATTR: ["style", "srcset", "formaction", "xlink:href"],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Deliberately NOT `USE_PROFILES: { html: true }`. That option REPLACES
    // ALLOWED_TAGS rather than intersecting with it, so setting both silently
    // discards the allowlist above and falls back to the profile's much wider
    // set — verified here by an `<img onerror>` surviving into the DOM with
    // both options set, and being dropped once this one was removed.
  });
}

/** Plain-text rendering of the markup, used for the collapsed preview and as
 * the SSR fallback. Text content only — no tags, so nothing to sanitise. */
function toPlainText(raw: string): string {
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function HtmlDisplay({ value }: { value: unknown }) {
  const source = String(value);
  const clean = useMemo(() => sanitizeHtml(source), [source]);
  const [previewRef, isTruncated] = useTruncated<HTMLSpanElement>([value]);
  // Markup always carries structure the one-line text preview drops, so the
  // affordance isn't gated on clipping alone — same rule MarkdownDisplay and
  // CodeDisplay use.
  const hasMore = isTruncated || /<[a-z][\s\S]*>/i.test(source);

  return (
    <Popover>
      <PopoverTrigger className="text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        {/* Collapsed: text only. A cell is one line high, so rendering block
            markup into it would break the row rather than inform anyone. */}
        <span ref={previewRef} className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left">
          {toPlainText(source)}
        </span>
        {hasMore && <ExpandIndicator />}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="overflow-hidden" style={EXPAND_POPOVER_STYLE}>
        <ScrollArea className="max-h-72">
          {clean === null ? (
            <pre className="whitespace-pre-wrap break-all text-xs font-mono text-muted">{source}</pre>
          ) : (
            <div
              className="prose-cell text-xs [&_a]:text-primary [&_a]:underline [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-1 [&_th]:border [&_th]:border-border [&_th]:px-1"
              dangerouslySetInnerHTML={{ __html: clean }}
            />
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
