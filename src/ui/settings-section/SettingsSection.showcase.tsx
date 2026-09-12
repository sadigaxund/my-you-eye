import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { SettingsSection } from ".";
import { SettingsRow } from "../settings-row";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../select";
import { Switch } from "../switch";
import { Input } from "../input";
import { Textarea } from "../textarea";

function AppearanceDemo() {
  const [reduceMotion, setReduceMotion] = useState(false);
  return (
    <SettingsSection title="Appearance" description="How the editor looks.">
      <SettingsRow label="Theme" description="Applies to the editor and the preview pane." htmlFor="theme">
        <Select defaultValue="system">
          <SelectTrigger id="theme">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">Match system</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow
        label="Reduce motion"
        description="Turns off transitions and the cursor-trail effect."
        htmlFor="reduce-motion"
        controlWidth="auto"
      >
        <Switch id="reduce-motion" checked={reduceMotion} onCheckedChange={setReduceMotion} />
      </SettingsRow>
      <SettingsRow label="Font size" controlWidth="xs">
        <Input type="number" defaultValue={14} trailing={<span className="text-xs text-muted">px</span>} aria-label="Font size in pixels" />
      </SettingsRow>
      <SettingsRow label="Line width" controlWidth="xs">
        <Input type="number" defaultValue={80} aria-label="Line width in characters" />
      </SettingsRow>
      <SettingsRow label="Custom CSS" description="Applied after the theme's own stylesheet." htmlFor="custom-css" controlWidth="full" stackAt="md">
        <Textarea id="custom-css" placeholder=".cm-editor { font-variant-ligatures: none; }" />
      </SettingsRow>
    </SettingsSection>
  );
}

const entry: ShowcaseEntry = {
  title: "SettingsSection",
  group: "inputs",
  parent: "Settings",
  description:
    "Titled group of settings rows whose controls share one column width so they line up.",
  demos: [
    {
      name: "Appearance",
      render: () => <AppearanceDemo />,
    },
    {
      name: "Shared control width",
      description: "controlWidth set on the section applies to every row that does not override it.",
      render: () => (
        <SettingsSection title="Editor" description="Text editing defaults." controlWidth="lg">
          <SettingsRow label="Default language" htmlFor="default-language">
            <Select defaultValue="plaintext">
              <SelectTrigger id="default-language">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plaintext">Plain text</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow label="Tab size" htmlFor="tab-size">
            <Select defaultValue="2">
              <SelectTrigger id="tab-size">
                <SelectValue placeholder="Tab size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow label="Word wrap column">
            <Input defaultValue="100" aria-label="Word wrap column" />
          </SettingsRow>
        </SettingsSection>
      ),
    },
  ],
};
export default entry;
