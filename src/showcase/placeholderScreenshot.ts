/**
 * A tiny inline SVG data URI standing in for a real screenshot — used by
 * showcase demos that need an `image` pane / walkthrough background
 * (`CompareScene`, `WalkthroughScene`) without shipping a binary asset.
 *
 * Literal hex colors here are not a token-system violation: a data URI is
 * rasterized in total isolation from the host document, so it cannot read
 * `var(--color-*)` even if it wanted to — this is fake content standing in
 * for an arbitrary *external* screenshot (some other app's UI), the same
 * role a photo would play, never this library's own themed surface. Lives
 * in `src/showcase/`, not `src/ui/` or `src/scenes/`, because of that: it
 * is demo fixture data, not a component.
 */
export function placeholderScreenshot(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <rect width="640" height="400" fill="#f4f4f7"/>
    <rect x="0" y="0" width="640" height="56" fill="#ffffff"/>
    <rect x="24" y="20" width="120" height="16" rx="4" fill="#6d5ef8"/>
    <rect x="480" y="20" width="88" height="16" rx="4" fill="#d8d8e2"/>
    <rect x="24" y="88" width="592" height="120" rx="8" fill="#ffffff" stroke="#e2e2ea"/>
    <rect x="24" y="224" width="280" height="140" rx="8" fill="#ffffff" stroke="#e2e2ea"/>
    <rect x="320" y="224" width="296" height="140" rx="8" fill="#ffffff" stroke="#e2e2ea"/>
    <rect x="48" y="112" width="200" height="14" rx="4" fill="#d8d8e2"/>
    <rect x="48" y="140" width="320" height="10" rx="4" fill="#eaeaef"/>
    <rect x="48" y="248" width="140" height="14" rx="4" fill="#d8d8e2"/>
    <rect x="344" y="248" width="140" height="14" rx="4" fill="#d8d8e2"/>
    <circle cx="588" cy="304" r="34" fill="#6d5ef8" fill-opacity="0.15"/>
    <circle cx="588" cy="304" r="14" fill="#6d5ef8"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
