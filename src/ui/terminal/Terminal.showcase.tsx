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

const entry: ShowcaseEntry = {
  title: "Terminal",
  group: "display",
  description: "Prompt/command/output/exit-code sequences, composing CodeBlock for output bodies. Data-driven via a typed entries array.",
  demos: [
    {
      name: "Prompt glyphs",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal prompt="$" user="dev" host="build" cwd="~/project" entries={npmInstall} />
          <Terminal prompt=">" cwd="C:\\project" entries={gitFlow} />
          <Terminal prompt="❯" entries={jsonOutput} />
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
      name: "Variant",
      render: () => (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <Terminal variant="default" entries={[{ command: "echo hello", output: "hello" }]} />
          <Terminal variant="elevated" entries={[{ command: "echo hello", output: "hello" }]} />
        </div>
      ),
    },
  ],
};
export default entry;
