import type { ShowcaseEntry } from "../../showcase/types";
import { Terminal } from ".";
import type { TerminalEntry } from ".";

const npmInstall: TerminalEntry[] = [
  { command: "npm install my-you-eye", output: "added 42 packages in 3s", exitCode: 0 },
  { command: "npm run build", spinner: "Building…" },
];

const gitFlow: TerminalEntry[] = [
  { command: "git status" },
  { output: "On branch main\nnothing to commit, working tree clean" },
  { command: "git push origin main" },
  { output: "! [rejected]  main -> main (fetch first)", exitCode: 1 },
];

const jsonOutput: TerminalEntry[] = [
  { command: "curl -s https://api.example.com/health", output: '{\n  "status": "ok",\n  "uptime": 12345\n}', language: "json", exitCode: 0 },
];

const rootShell: TerminalEntry[] = [
  { command: "systemctl restart nginx", exitCode: 0 },
];

const entry: ShowcaseEntry = {
  title: "Terminal",
  group: "display",
  description: "Prompt, command, output and exit-status sequences, driven by a typed entries array. Output renders as plain terminal text, colorized by the shared code tokenizer when an entry names a language.",
  demos: [
    {
      name: "Prompt glyphs",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal prompt="$" user="dev" host="build" cwd="~/project" entries={npmInstall} />
          <Terminal prompt=">" cwd="C:\\project" entries={gitFlow} />
          <Terminal prompt="❯" entries={jsonOutput} />
          <Terminal prompt="#" user="root" host="prod" entries={rootShell} />
        </div>
      ),
    },
    {
      name: "Title bar",
      description: "An optional title-bar caption (defaults to `cwd` when `title` is omitted) renders macOS-style window chrome above the entries.",
      render: () => (
        <div className="max-w-lg mx-auto">
          <Terminal
            title="deploy.sh — zsh"
            user="ci"
            host="runner-42"
            cwd="/srv/app"
            entries={[
              { command: "./deploy.sh --env production" },
              { spinner: "Uploading build artifacts…" },
              { output: "Deployed to production in 8.2s", exitCode: 0 },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Exit status & spinner",
      description: "Everything inside the frame is text a shell could have printed, so the exit line and the braille spinner glyph are plain glyphs rather than pills or widgets.",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal
            cwd="~/project"
            entries={[
              { command: "npm test", output: "42 passed, 0 failed", exitCode: 0 },
              { command: "npm run lint", output: "3 problems (3 errors, 0 warnings)", exitCode: 1 },
              { command: "npm run deploy", spinner: "Uploading assets…" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Variant",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal variant="default" entries={[{ command: "echo hello", output: "hello" }]} />
          <Terminal variant="elevated" entries={[{ command: "echo hello", output: "hello" }]} />
        </div>
      ),
    },
    {
      name: "Color schemes",
      description: "scheme: \"default\" | \"matrix\" | \"amber\" retints the command line and border from the existing success and warning tokens rather than from new ones.",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal scheme="default" prompt="$" entries={[{ command: "uptime", output: "up 14 days, load average: 0.08" }]} />
          <Terminal scheme="matrix" prompt="❯" entries={[{ command: "whoami", output: "neo" }]} />
          <Terminal scheme="amber" prompt=">" entries={[{ command: "dir", output: "AUTOEXEC.BAT" }]} />
        </div>
      ),
    },
    {
      name: "Chrome decorator",
      description: "chrome: \"dots\" (default macOS traffic lights) | \"none\" (flat caption bar, no dots).",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal chrome="dots" title="session — bash" entries={[{ command: "echo hi", output: "hi" }]} />
          <Terminal chrome="none" title="session — bash" entries={[{ command: "echo hi", output: "hi" }]} />
        </div>
      ),
    },
    {
      name: "Fixed height, scrolls as content grows",
      description: "rows fixes the box at that many lines' worth of height, measured rather than hardcoded, so the frame never grows with content: new entries scroll into view and older ones scroll up out of the fixed frame, the way a real terminal behaves.",
      render: () => (
        <div className="max-w-lg mx-auto">
          <Terminal
            title="build.log"
            rows={6}
            entries={[
              { command: "npm run build" },
              { output: "compiling src/index.ts" },
              { output: "compiling src/ui/button.tsx" },
              { output: "compiling src/ui/card.tsx" },
              { output: "compiling src/ui/terminal.tsx" },
              { output: "bundling dist/index.js" },
              { output: "bundling dist/index.mjs" },
              { output: "writing dist/index.d.ts" },
              { output: "done in 4.8s", exitCode: 0 },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Prompt segments, changed mid-session",
      description: "user, host, cwd and promptGlyph are each settable per entry, and like a real shell's cd they persist to every following entry until something overrides them again.",
      render: () => (
        <div className="max-w-lg mx-auto">
          <Terminal
            title="ssh session"
            entries={[
              { user: "dev", host: "laptop", cwd: "~", promptGlyph: "$", command: "ssh deploy@prod-1" },
              { output: "Welcome to prod-1 (Ubuntu 22.04)" },
              // The next entry's overrides — different user/host/glyph — now
              // apply to it AND every entry after it, exactly like a real
              // `ssh` login changing who "you are" for the rest of the
              // session.
              { user: "deploy", host: "prod-1", cwd: "~", promptGlyph: "#", command: "cd /var/www/app" },
              // The `cd` command's own line still shows the OLD cwd (you
              // type `cd` from where you currently are) — this next entry
              // is the first one that's actually IN the new directory, so
              // it's the one that sets cwd: "/var/www/app", which then
              // persists to every entry after it too.
              { cwd: "/var/www/app", command: "ls", output: "index.html  app.js  package.json" },
              // Only cwd changes this time — user/host/glyph all persist
              // unchanged, exactly like typing `cd` alone in a real shell.
              { cwd: "/var/www/app/dist", command: "cd dist && ls", output: "bundle.js  bundle.js.map" },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
