// The root of the scene schema — TODO.md D5: "the scene schema IS the public
// API". Everything here is plain, JSON-serializable data made of closed
// unions. Deliberately absent, and never to be added:
//
//   - `className` / `style` / any escape hatch into styling
//   - colors (semantic accents only — the theme decides what they look like)
//   - frame numbers, durations in ms, easing names (pacing is derived from
//     content; `pace` is the only dial)
//   - pixel coordinates (diagram positions are grid units, walkthrough
//     positions are percentages)
//
// The rule that produces that list: a consuming project supplies *what to
// say*, never *how it looks*. Bumping the library version then changes the
// look everywhere with no call-site edits — which is the entire point of
// TODO.md §0 "stability over customizability".

import type { FontMode } from "../../lib/fonts";
import type { Scene } from "./scenes";

/**
 * Theme profile applied to the whole video, mirroring the files in
 * `src/styles/themes/`. "default" applies no `data-theme` attribute at all.
 */
export type VideoTheme =
  | "default"
  | "neon"
  | "contrast"
  | "brutal"
  | "stark"
  | "glass"
  | "comic"
  | "metallic";

/**
 * Output frame size. A closed union rather than free `width`/`height`
 * numbers: an arbitrary size silently breaks every layout that was designed
 * against a 16:9 grid, and "my text is tiny" is not a failure a consumer
 * should be able to author by hand.
 */
export type VideoSize =
  /** 1920×1080 — the default. */
  | "1080p"
  /** 2560×1440. */
  | "1440p"
  /** 3840×2160. */
  | "4k"
  /** 1080×1080, for feed posts. */
  | "square"
  /** 1080×1920, for shorts/reels. */
  | "vertical";

/** Pixel dimensions each `VideoSize` resolves to. */
export const VIDEO_SIZES: Record<VideoSize, { width: number; height: number }> = {
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "4k": { width: 3840, height: 2160 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
};

export interface VideoMeta {
  /** Frames per second. Default 30. */
  fps?: 24 | 30 | 60;
  /** Output dimensions. Default "1080p". */
  size?: VideoSize;
  /** Theme profile. Default "default". */
  theme?: VideoTheme;
  /** Light or dark rendering of the chosen theme. Default "dark" — video
   * content is watched on a bright screen in a dark room far more often
   * than the reverse. */
  appearance?: "light" | "dark";
  /** Typeface set, from the same list the showcase's font picker uses. Default "sans". */
  font?: FontMode;
  /** Video title. Used for the Remotion composition id and the presenter's
   * document title; never rendered into a frame (author a `title` scene for
   * that). */
  title?: string;
  /** Persistent corner handle/watermark, e.g. "@yourchannel". */
  watermark?: string;
  /** Thin progress bar along the bottom edge of every frame. Default true. */
  progressBar?: boolean;
  /** Chapter markers derived from `title` scenes. Default true. */
  chapters?: boolean;
}

/**
 * The single object a consuming project authors. `<VideoRoot video={…} />`
 * renders it to MP4; `<Presenter video={…} />` renders the same object as a
 * click-through presentation with identical pacing — both drive off
 * `buildSequence`, so the two can't drift.
 */
export interface Video {
  meta?: VideoMeta;
  scenes: Scene[];
}
