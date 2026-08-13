#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL = join(ROOT, "SKILL.md");
const COMPONENTS_JSON = join(ROOT, "components.json");
const REFERENCES_DIR = join(ROOT, "references");

function usage(exitCode = 0) {
  console.log(`my-you-eye v0.2.0 — UI Component Toolkit

Usage:
  my-you-eye init [--force]    Copy SKILL.md + references/ + components.json to skills/
  my-you-eye list              List all components with groups and variants
  my-you-eye sync              Re-copy SKILL.md + references/ + components.json (overwrite)

Options:
  --help                       Show this help
  --force                      Overwrite existing files (init only)`);
  process.exit(exitCode);
}

// SKILL.md's decision table routes to files under references/ by relative
// path (e.g. "references/diagrams.md") — those files must land next to
// wherever SKILL.md itself is copied, or the routing table points at
// nothing in the consuming project. Flat directory of *.md files, no
// subdirectories, so a plain readdir is enough (no recursive walk needed).
function cmdInit(force) {
  const targetDir = join(process.cwd(), "skills");
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  function copyOne(src, targetPath, label) {
    if (existsSync(targetPath) && !force) {
      console.log(`  skipped  ${label} (already exists, use --force to overwrite)`);
      return;
    }
    const content = readFileSync(src, "utf-8");
    writeFileSync(targetPath, content, "utf-8");
    console.log(`  written  ${targetPath}`);
  }

  copyOne(SKILL, join(targetDir, "SKILL.md"), "SKILL.md");
  copyOne(COMPONENTS_JSON, join(targetDir, "components.json"), "components.json");

  const referencesTargetDir = join(targetDir, "references");
  if (!existsSync(referencesTargetDir)) {
    mkdirSync(referencesTargetDir, { recursive: true });
  }
  for (const name of readdirSync(REFERENCES_DIR)) {
    copyOne(join(REFERENCES_DIR, name), join(referencesTargetDir, name), `references/${name}`);
  }
}

function cmdList() {
  const raw = readFileSync(COMPONENTS_JSON, "utf-8");
  const { components } = JSON.parse(raw);

  const groups = {};
  for (const c of components) {
    (groups[c.group] ??= []).push(c);
  }

  const groupOrder = ["inputs", "display", "feedback", "overlay", "navigation", "canvas", "data", "patterns", "typography"];

  for (const group of groupOrder) {
    if (!groups[group]) continue;
    console.log(`\n  ${group}`);
    console.log(`  ${"-".repeat(group.length)}`);
    for (const c of groups[group]) {
      const variants = Object.entries(c.props)
        .map(([k, v]) => `${k}: ${v.join(" | ")}`)
        .join(", ");
      console.log(`    ${c.name}${variants ? `  (${variants})` : ""}`);
    }
  }
}

function cmdSync() {
  cmdInit(true);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const cmd = args.find((a) => a !== "--force");

if (!cmd || cmd === "--help") {
  usage(cmd === "--help" ? 0 : 1);
}

switch (cmd) {
  case "init":
    await cmdInit(force);
    break;
  case "list":
    cmdList();
    break;
  case "sync":
    cmdSync();
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    usage(1);
}
