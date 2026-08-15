/**
 * An inline SVG data URI standing in for a real screenshot — used by showcase
 * demos that need an `image` pane / walkthrough background (`CompareScene`,
 * `WalkthroughScene`) without shipping a binary asset.
 *
 * It draws a recognisable product UI (top bar with a title and actions, a
 * sidebar with nav items and one active row, a settings form with labelled
 * fields and a primary button) rather than abstract grey blocks. That matters
 * for `WalkthroughScene`: a cursor clicking, a spotlight lighting a region and
 * a callout pointing at something only read as a walkthrough if there is
 * actually a control at those coordinates. Text is drawn as rounded bars —
 * this is schematic, not a mock of any real product — but every element the
 * demos target is a distinct, visible shape.
 *
 * Literal hex colors here are not a token-system violation: a data URI is
 * rasterized in total isolation from the host document, so it cannot read
 * `var(--color-*)` even if it wanted to — this is fake content standing in
 * for an arbitrary *external* screenshot (some other app's UI), the same
 * role a photo would play, never this library's own themed surface. Lives
 * in `src/showcase/`, not `src/ui/` or `src/scenes/`, because of that: it
 * is demo fixture data, not a component.
 *
 * Coordinates are a 640×400 viewBox. The demos address it in PERCENT, so the
 * two conversions worth keeping in view: x% = x/6.4, y% = y/4.
 */

/** Which layout to draw. "after" is the same app one redesign later — the
 * three stacked form fields consolidated into a single two-column panel — so
 * a before/after `CompareScene` wipe actually has something to reveal. */
export type PlaceholderVariant = "before" | "after";

const INK = "#3c3c46";
const MUTED = "#9a9aa8";
const LINE = "#e2e2ea";
const FIELD = "#fbfbfd";
const FIELD_LINE = "#dcdce4";
const BAR = "#d8d8e2";
const BRAND = "#6d5ef8";

function chrome(): string {
  return `
    <rect width="640" height="400" fill="#f4f4f7"/>
    <rect x="0" y="0" width="640" height="48" fill="#ffffff"/>
    <rect x="0" y="47" width="640" height="1" fill="${LINE}"/>
    <rect x="16" y="14" width="20" height="20" rx="6" fill="${BRAND}"/>
    <rect x="44" y="19" width="92" height="10" rx="3" fill="${INK}"/>
    <rect x="504" y="12" width="80" height="24" rx="6" fill="${BRAND}"/>
    <rect x="520" y="20" width="48" height="8" rx="3" fill="#ffffff" fill-opacity="0.85"/>
    <circle cx="612" cy="24" r="12" fill="${BAR}"/>

    <rect x="0" y="48" width="160" height="352" fill="#ffffff"/>
    <rect x="159" y="48" width="1" height="352" fill="${LINE}"/>
    <rect x="8" y="98" width="144" height="24" rx="6" fill="#edeaff"/>
    <rect x="16" y="72" width="12" height="12" rx="3" fill="#c9c9d4"/>
    <rect x="36" y="74" width="76" height="8" rx="3" fill="${BAR}"/>
    <rect x="16" y="104" width="12" height="12" rx="3" fill="${BRAND}"/>
    <rect x="36" y="106" width="88" height="8" rx="3" fill="${BRAND}"/>
    <rect x="16" y="136" width="12" height="12" rx="3" fill="#c9c9d4"/>
    <rect x="36" y="138" width="60" height="8" rx="3" fill="${BAR}"/>
    <rect x="16" y="168" width="12" height="12" rx="3" fill="#c9c9d4"/>
    <rect x="36" y="170" width="80" height="8" rx="3" fill="${BAR}"/>

    <rect x="188" y="70" width="168" height="14" rx="4" fill="${INK}"/>`;
}

function field(x: number, y: number, width: number, labelWidth: number, valueWidth: number): string {
  return `
    <rect x="${x}" y="${y}" width="${labelWidth}" height="8" rx="3" fill="${MUTED}"/>
    <rect x="${x}" y="${y + 14}" width="${width}" height="28" rx="6" fill="${FIELD}" stroke="${FIELD_LINE}"/>
    <rect x="${x + 12}" y="${y + 24}" width="${valueWidth}" height="8" rx="3" fill="#c9c9d4"/>`;
}

/** A cancel/save pair sitting on one baseline, right-aligned to `rightEdge`.
 * The primary button is the WalkthroughScene demo's final click target — its
 * center is (rightEdge - primaryWidth/2, 310) in viewBox units. */
function buttons(rightEdge: number, primaryWidth: number, secondaryWidth: number): string {
  const primaryX = rightEdge - primaryWidth;
  const secondaryX = primaryX - 12 - secondaryWidth;
  return `
    <rect x="${secondaryX}" y="296" width="${secondaryWidth}" height="28" rx="6" fill="#ffffff" stroke="${FIELD_LINE}"/>
    <rect x="${secondaryX + 20}" y="306" width="${secondaryWidth - 40}" height="8" rx="3" fill="${MUTED}"/>
    <rect x="${primaryX}" y="296" width="${primaryWidth}" height="28" rx="6" fill="${BRAND}"/>
    <rect x="${primaryX + 24}" y="306" width="${primaryWidth - 48}" height="8" rx="3" fill="#ffffff" fill-opacity="0.85"/>`;
}

export function placeholderScreenshot(variant: PlaceholderVariant = "before"): string {
  const body = variant === "before"
    ? `
      <rect x="188" y="104" width="424" height="232" rx="10" fill="#ffffff" stroke="${LINE}"/>
      ${field(212, 128, 376, 80, 120)}
      ${field(212, 186, 376, 64, 156)}
      ${field(212, 244, 180, 72, 84)}
      ${buttons(588, 112, 92)}`
    : `
      <rect x="188" y="104" width="204" height="232" rx="10" fill="#ffffff" stroke="${LINE}"/>
      <rect x="408" y="104" width="204" height="232" rx="10" fill="#ffffff" stroke="${LINE}"/>
      ${field(212, 128, 156, 80, 96)}
      ${field(212, 186, 156, 64, 112)}
      ${field(432, 128, 156, 72, 84)}
      <rect x="432" y="186" width="156" height="70" rx="6" fill="${FIELD}" stroke="${FIELD_LINE}"/>
      ${buttons(588, 92, 72)}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">${chrome()}${body}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
