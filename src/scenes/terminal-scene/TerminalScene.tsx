import { useSequence, useTimeline } from "../../motion/core";
import { Terminal } from "../../ui/terminal";
// Deep import: the braille frame set is Terminal's internal constant, not
// part of the package's public surface, but it IS the one source of those
// glyphs — the scene steps through the same array the static component's
// default comes from, so the paused and animated spinners can't drift apart.
import { SPINNER_FRAMES } from "../../ui/terminal/Terminal";
import type { TerminalEntry } from "../../ui/terminal";
import { sceneSteps, stepName } from "../timing";
import type { TerminalScene as TerminalSceneData, TerminalStep } from "../schema";
import { clamp01 } from "../../lib/math";

export interface TerminalSceneProps {
  scene: TerminalSceneData;
}

/** Visible height, in lines, when a scene doesn't state one. A scene renders
 * into a fixed video frame, so a terminal that grows as it types makes the
 * whole composition jump — this default means every TerminalScene holds still
 * and scrolls, and `scene.rows` only tunes how tall it holds. */
const DEFAULT_ROWS = 12;

type PhaseKey = "command" | "spinner" | "output" | "exit";
type PhaseWindows = Partial<Record<PhaseKey, { start: number; end: number }>>;

/** Splits one entry's local 0→1 progress into ordered sub-phases — command
 * types in, then the spinner (if any) holds, then output appears, then the
 * exit status lands — weighted so a longer command gets proportionally
 * more of the window than that brief final beat. */
function phaseWindows(entry: TerminalStep): PhaseWindows {
  const segments: { key: PhaseKey; weight: number }[] = [];
  if (entry.command != null) segments.push({ key: "command", weight: 2 });
  if (entry.spinner != null) segments.push({ key: "spinner", weight: 1 });
  if (entry.output != null) segments.push({ key: "output", weight: 1 });
  if (entry.exitCode != null) segments.push({ key: "exit", weight: 0.5 });

  const total = segments.reduce((sum, s) => sum + s.weight, 0) || 1;
  const windows: PhaseWindows = {};
  let acc = 0;
  for (const seg of segments) {
    const start = acc / total;
    acc += seg.weight;
    windows[seg.key] = { start, end: acc / total };
  }
  return windows;
}

/** Frames each braille spinner glyph is held for. 3 at 30fps is ~10 glyphs a
 * second — the pace a real CLI spinner runs at; one glyph per frame reads as
 * a flicker. */
const SPINNER_FRAME_HOLD = 3;

/** Which braille glyph a running spinner shows on `frame`. A pure function of
 * the frame (never a timer — AGENTS.md §9c), so the same frame renders the
 * same glyph in the live preview and in the MP4. */
function spinnerGlyphAt(frame: number): string {
  return SPINNER_FRAMES[Math.floor(frame / SPINNER_FRAME_HOLD) % SPINNER_FRAMES.length];
}

/** Builds the partially-revealed `TerminalEntry` for whichever entry is
 * currently running, from its own phase windows and local progress. */
function currentEntryView(entry: TerminalStep, localProgress: number, frame: number): TerminalEntry {
  const windows = phaseWindows(entry);

  const command = entry.command != null && windows.command
    ? entry.command.slice(0, Math.floor(entry.command.length * clamp01((localProgress - windows.command.start) / (windows.command.end - windows.command.start))))
    : entry.command;

  const spinnerVisible = windows.spinner != null && localProgress >= windows.spinner.start && localProgress < windows.spinner.end;
  const outputVisible = windows.output != null && localProgress >= windows.output.start;
  const exitVisible = windows.exit != null && localProgress >= windows.exit.start;

  return {
    command,
    spinner: spinnerVisible ? entry.spinner : undefined,
    spinnerGlyph: spinnerVisible ? spinnerGlyphAt(frame) : undefined,
    output: outputVisible ? entry.output : undefined,
    language: entry.language,
    exitCode: exitVisible ? entry.exitCode : undefined,
    cwd: entry.cwd,
    user: entry.user,
    host: entry.host,
    promptGlyph: entry.promptGlyph,
  };
}

/**
 * Wraps `Terminal`, revealing one entry per step (TODO.md Phase E): the
 * command types in, then the spinner (if set) holds — its braille glyph
 * cycling as a pure function of the frame — then output appears, then the
 * exit status lands — all within that entry's own
 * `SequenceRange` from `useSequence(sceneSteps(scene), ...)`. Entries before
 * the current step render fully settled (spinner cleared — it's a transient
 * "this is running" cue, not a permanent part of the transcript); entries
 * after it aren't rendered yet. `Terminal` itself owns every visual (prompt
 * chrome, exit status line, output syntax highlighting) — this scene only decides
 * how much of each entry to hand it on a given frame.
 */
export function TerminalScene({ scene }: TerminalSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();

  let currentIndex = 0;
  scene.entries.forEach((entry, i) => {
    if (frame >= ranges[stepName(entry.id, i)].startFrame) currentIndex = i;
  });

  const visible: TerminalEntry[] = [];
  for (let i = 0; i <= currentIndex; i++) {
    const entry = scene.entries[i];
    if (i < currentIndex) {
      visible.push({
        command: entry.command,
        output: entry.output,
        language: entry.language,
        exitCode: entry.exitCode,
        cwd: entry.cwd,
        user: entry.user,
        host: entry.host,
        promptGlyph: entry.promptGlyph,
      });
      continue;
    }
    const range = ranges[stepName(entry.id, i)];
    const span = Math.max(1, range.endFrame - range.startFrame);
    visible.push(currentEntryView(entry, clamp01((frame - range.startFrame) / span), frame));
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg px-panel-xl text-fg">
      <Terminal
        className="w-full max-w-3xl"
        entries={visible}
        prompt={scene.prompt}
        cwd={scene.cwd}
        user={scene.user}
        host={scene.host}
        title={scene.title}
        scheme={scene.scheme}
        chrome={scene.chrome}
        rows={scene.rows ?? DEFAULT_ROWS}
      />
    </div>
  );
}
