import { useState, useCallback } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { CommandPalette } from ".";
import type { CommandAction } from ".";
import { Button } from "../button";
import { Kbd } from "../kbd";

const actions: CommandAction[] = [
  { id: "new-file", label: "New File", keywords: ["create", "document"], shortcut: "⌘N" },
  { id: "open", label: "Open...", keywords: ["load", "file"], shortcut: "⌘O" },
  { id: "save", label: "Save", keywords: ["write", "store"], shortcut: "⌘S" },
  { id: "save-as", label: "Save As...", keywords: ["rename", "duplicate"], shortcut: "⇧⌘S" },
  { id: "find", label: "Find", keywords: ["search", "locate"], shortcut: "⌘F" },
  { id: "replace", label: "Replace", keywords: ["search", "swap"], shortcut: "⌘H" },
  { id: "run", label: "Run Pipeline", keywords: ["execute", "start"], shortcut: "⌘⏎" },
  { id: "deploy", label: "Deploy", keywords: ["publish", "release"] },
];

const groups = [
  { label: "File", actionIds: ["new-file", "open", "save", "save-as"] },
  { label: "Edit", actionIds: ["find", "replace"] },
  { label: "Run", actionIds: ["run", "deploy"] },
];

const entry: ShowcaseEntry = {
  title: "CommandPalette",
  group: "overlay",
  demos: [
    {
      name: "Basic",
      render: () => {
        const [open, setOpen] = useState(false);
        const [log, setLog] = useState("");
        const handleSelect = useCallback((a: CommandAction) => setLog(`Selected: ${a.label}`), []);

        return (
          <div className="flex flex-col gap-3 max-w-xs">
            <Button onClick={() => setOpen(true)}>
              Open Palette <Kbd>⌘K</Kbd>
            </Button>
            <CommandPalette
              open={open}
              onOpenChange={setOpen}
              actions={actions}
              onSelect={handleSelect}
            />
            {log && <p className="text-xs text-muted">{log}</p>}
          </div>
        );
      },
    },
    {
      name: "With groups",
      render: () => {
        const [open, setOpen] = useState(false);
        const [log, setLog] = useState("");
        const handleSelect = useCallback((a: CommandAction) => setLog(`Selected: ${a.label}`), []);

        return (
          <div className="flex flex-col gap-3 max-w-xs">
            <Button onClick={() => setOpen(true)} variant="secondary">
              Open Grouped <Kbd>⌘K</Kbd>
            </Button>
            <CommandPalette
              open={open}
              onOpenChange={setOpen}
              actions={actions}
              groups={groups}
              onSelect={handleSelect}
            />
            {log && <p className="text-xs text-muted">{log}</p>}
          </div>
        );
      },
    },
  ],
};
export default entry;
