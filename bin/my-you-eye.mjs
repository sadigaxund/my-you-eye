#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKILL = join(ROOT, "SKILL.md");
const COMPONENTS_JSON = join(ROOT, "components.json");

function usage(exitCode = 0) {
  console.log(`my-you-eye v0.2.0 — UI Component Toolkit

Usage:
  my-you-eye init [--force]    Copy SKILL.md + components.json to skills/
  my-you-eye list              List all components with groups and variants
  my-you-eye sync              Re-copy SKILL.md + components.json (overwrite)

Options:
  --help                       Show this help
  --force                      Overwrite existing files (init only)`);
  process.exit(exitCode);
}

async function cmdInit(force) {
  const sourceFiles = [
    { src: SKILL, name: "SKILL.md" },
    { src: COMPONENTS_JSON, name: "components.json" },
  ];

  const targetDir = join(process.cwd(), "skills");
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  for (const file of sourceFiles) {
    const target = join(targetDir, file.name);
    if (existsSync(target) && !force) {
      console.log(`  skipped  ${file.name} (already exists, use --force to overwrite)`);
      continue;
    }
    const content = readFileSync(file.src, "utf-8");
    writeFileSync(target, content, "utf-8");
    console.log(`  written  ${target}`);
  }
}

function cmdList() {
  const raw = readFileSync(COMPONENTS_JSON, "utf-8");
  const { components } = JSON.parse(raw);

  const groups = {};
  for (const c of components) {
    (groups[c.group] ??= []).push(c);
  }

  const groupOrder = ["inputs", "display", "feedback", "overlay", "navigation", "canvas", "data", "patterns"];

  for (const group of groupOrder) {
    if (!groups[group]) continue;
    console.log(`\n  ${group}`);
    console.log(`  ${"-".repeat(group.length)}`);
    for (const c of groups[group]) {
      const variants = Object.entries(c.variants)
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
