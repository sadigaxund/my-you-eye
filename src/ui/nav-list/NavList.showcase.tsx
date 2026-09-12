import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { NavList, NavListItem, NavListGroup } from ".";

const AppearanceIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="10" cy="10" r="7" />
    <path d="M10 3a7 7 0 000 14z" fill="currentColor" stroke="none" />
  </svg>
);
const EditorIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="14" height="12" rx="1" />
    <path d="M3 8h14" />
  </svg>
);
const RenderedIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
    <circle cx="10" cy="10" r="2" />
  </svg>
);
const GitIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6" cy="5" r="2" />
    <circle cx="6" cy="15" r="2" />
    <circle cx="14" cy="8" r="2" />
    <path d="M6 7v6M14 10c0 3-4 2-6 4" />
  </svg>
);
const SharingIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="5" cy="10" r="2" />
    <circle cx="15" cy="5" r="2" />
    <circle cx="15" cy="15" r="2" />
    <path d="M6.8 9l6.4-3M6.8 11l6.4 3" />
  </svg>
);
const StorageIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6c0-1.1 3.1-2 7-2s7 .9 7 2-3.1 2-7 2-7-.9-7-2z" />
    <path d="M3 6v8c0 1.1 3.1 2 7 2s7-.9 7-2V6" />
  </svg>
);

function SettingsRail() {
  const [current, setCurrent] = useState("appearance");
  return (
    <div className="w-56">
      <NavList aria-label="Settings" orientation="vertical">
        <NavListItem icon={AppearanceIcon} current={current === "appearance"} onSelect={() => setCurrent("appearance")}>
          Appearance
        </NavListItem>
        <NavListItem icon={EditorIcon} current={current === "editor"} onSelect={() => setCurrent("editor")}>
          Editor
        </NavListItem>
        <NavListItem icon={RenderedIcon} current={current === "rendered"} onSelect={() => setCurrent("rendered")}>
          Rendered
        </NavListItem>
        <NavListItem icon={GitIcon} current={current === "git"} onSelect={() => setCurrent("git")}>
          Git and sync
        </NavListItem>
        <NavListItem icon={SharingIcon} disabled>
          Sharing
        </NavListItem>
        <NavListItem icon={StorageIcon} current={current === "storage"} onSelect={() => setCurrent("storage")}>
          Storage
        </NavListItem>
      </NavList>
    </div>
  );
}

function HorizontalNav() {
  const [current, setCurrent] = useState("files");
  return (
    <NavList aria-label="Repository sections" orientation="horizontal">
      <NavListItem current={current === "overview"} onSelect={() => setCurrent("overview")}>
        Overview
      </NavListItem>
      <NavListItem current={current === "files"} onSelect={() => setCurrent("files")}>
        Files
      </NavListItem>
      <NavListItem current={current === "commits"} onSelect={() => setCurrent("commits")}>
        Commits
      </NavListItem>
      <NavListItem current={current === "settings"} onSelect={() => setCurrent("settings")}>
        Settings
      </NavListItem>
    </NavList>
  );
}

function GroupedNav() {
  const [current, setCurrent] = useState("projects");
  return (
    <div className="w-56">
      <NavList aria-label="Workspace navigation">
        <NavListGroup label="Workspace">
          <NavListItem current={current === "projects"} onSelect={() => setCurrent("projects")}>
            Projects
          </NavListItem>
          <NavListItem current={current === "members"} onSelect={() => setCurrent("members")}>
            Members
          </NavListItem>
        </NavListGroup>
        <NavListGroup label="Account">
          <NavListItem current={current === "profile"} onSelect={() => setCurrent("profile")}>
            Profile
          </NavListItem>
          <NavListItem current={current === "billing"} onSelect={() => setCurrent("billing")}>
            Billing
          </NavListItem>
        </NavListGroup>
      </NavList>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "NavList",
  group: "navigation",
  description:
    "Unfilled navigation list for sidebars, settings rails and tables of contents — aria-current, not tabs.",
  demos: [
    {
      name: "Settings rail",
      description: "Vertical rail with icons, one current item, one disabled item.",
      render: () => <SettingsRail />,
    },
    {
      name: "Horizontal",
      description: "orientation=\"horizontal\" lays items out as a row with a bottom accent bar.",
      render: () => <HorizontalNav />,
    },
    {
      name: "With groups",
      description: "NavListGroup clusters items under a heading, e.g. Workspace / Account.",
      render: () => <GroupedNav />,
    },
    {
      name: "Links",
      description: "href renders a Link — a real navigable destination, aria-current=\"page\".",
      render: () => (
        <div className="w-56">
          <NavList aria-label="Documentation">
            <NavListItem href="#introduction" current currentType="page">
              Introduction
            </NavListItem>
            <NavListItem href="#installation">Installation</NavListItem>
            <NavListItem href="#configuration">Configuration</NavListItem>
            <NavListItem href="#api-reference">API reference</NavListItem>
          </NavList>
        </div>
      ),
    },
    {
      name: "Disabled & states",
      description: "Disabled, current with icon, and a plain unstyled row side by side.",
      render: () => (
        <div className="w-56">
          <NavList aria-label="Item states">
            <NavListItem icon={AppearanceIcon} current currentType="true">
              Current with icon
            </NavListItem>
            <NavListItem>Plain item</NavListItem>
            <NavListItem disabled>Disabled item</NavListItem>
          </NavList>
        </div>
      ),
    },
  ],
};
export default entry;
