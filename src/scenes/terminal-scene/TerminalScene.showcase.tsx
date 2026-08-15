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

const sshScene: TerminalSceneData = {
  kind: "terminal",
  cwd: "~",
  user: "dev",
  host: "laptop",
  title: "deploy session",
  scheme: "matrix",
  rows: 8,
  entries: [
    { command: "ssh deploy@prod-1", say: "SSH into the production host." },
    { output: "Welcome to prod-1 (Ubuntu 22.04)" },
    // Every following entry inherits user/host/cwd/promptGlyph from
    // whichever entry last set them — the scene forwards this straight
    // through to Terminal's own carry-forward resolution (TODO.md D4/
    // owner feedback: "a cd changing the directory for subsequent
    // lines"), it isn't reimplemented here.
    { user: "deploy", host: "prod-1", promptGlyph: "#", cwd: "/var/www/app", command: "cd /var/www/app && ls", output: "index.html  app.js  package.json", say: "Once logged in, the prompt switches to the deploy user on prod-1." },
    { command: "pm2 restart app", output: "app restarted", exitCode: 0, say: "Restart the app — still deploy@prod-1, still /var/www/app." },
  ],
};

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "TerminalScene",
  group: "scenes",
  description: "Wraps Terminal, revealing one entry per step: command types in, spinner holds, output and badge land.",
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
      description: "\"npm install my-you-eye\" is partway typed; entries 2 and 3 haven't started.",
      render: () => (
        <PinnedFrame frame={12} durationInFrames={160}>
          <Frame><TerminalScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned on entry 2's spinner (frame 72/160)",
      description: "Entry 1 is settled with its exit-0 badge; entry 2's spinner is showing in place of output.",
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
    {
      name: "Prompt change (rows + scheme)",
      description: "scene.rows fixes the height, scheme=\"matrix\" retints it, and entry 3 changes the prompt onward.",
      render: () => (
        <PinnedFrame frame={220} durationInFrames={220}>
          <Frame><TerminalScene scene={sshScene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
