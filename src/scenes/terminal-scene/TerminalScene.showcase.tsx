import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { TerminalScene } from ".";
import type { TerminalScene as TerminalSceneData } from "../schema";

const scene: TerminalSceneData = {
  kind: "terminal",
  cwd: "~/project",
  user: "dev",
  host: "build",
  entries: [
    { command: "npm install my-you-eye", output: "added 42 packages in 3s", exitCode: 0, say: "Install the package from npm." },
    { command: "npm run build", spinner: "Building…", output: "Build complete in 1.2s", exitCode: 0, say: "Run the build step — it takes a couple seconds." },
    { command: "npm test", output: "42 passed, 0 failed", exitCode: 0, say: "And run the test suite." },
  ],
};

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "TerminalScene",
  group: "scenes",
  description: "Wraps Terminal, revealing one entry per step: the command types in, the spinner (if set) holds, then output appears, then the exit-code badge lands — all inside that entry's own step range.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={160}>
          <Frame><TerminalScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-typing, entry 1 (frame 12/160)",
      description: "\"npm install my-you-eye\" is partway typed after the prompt; nothing else is visible yet — entries 2 and 3 haven't started.",
      render: () => (
        <PinnedFrame frame={12} durationInFrames={160}>
          <Frame><TerminalScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned on entry 2's spinner (frame 72/160)",
      description: "Entry 1 (install) is fully settled with its exit-0 badge. Entry 2's full command \"npm run build\" is typed, and its spinner (\"Building…\") is showing in place of output — the output and badge haven't appeared yet.",
      render: () => (
        <PinnedFrame frame={72} durationInFrames={160}>
          <Frame><TerminalScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 160/160)",
      description: "All three entries fully settled: three commands, their outputs, and three exit-0 badges — no spinners.",
      render: () => (
        <PinnedFrame frame={160} durationInFrames={160}>
          <Frame><TerminalScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
