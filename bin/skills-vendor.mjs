// Vendoring engine for the skills pack (see references/skills-index.md).
//
// Zero npm dependencies by design (AGENTS.md §0.7): fetching is done through
// the git CLI — guaranteed present wherever agent skills are used — with
// shallow, blobless, sparse clones so big monorepos stay cheap. Pins live in
// skills/vendor.lock.json (committed); vendored bodies live under
// skills/<vendorDir>/ (gitignored) and are wiped per source before every run,
// so a restore is always byte-exact against the pin.

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { join, dirname, relative } from "path";
import { tmpdir } from "os";
import { DEFAULT_CONFIG } from "./skills-config.default.mjs";

export const SKILLS_DIR = "skills";
const CONFIG_PATH = join(SKILLS_DIR, "vendor.config.json");
const LOCK_PATH = join(SKILLS_DIR, "vendor.lock.json");

// ---------------------------------------------------------------------------
// git plumbing

function git(cwd, args) {
  const res = spawnSync("git", args, { cwd, encoding: "utf-8" });
  if (res.status !== 0 || res.error) {
    throw new Error(`git ${args.join(" ")} failed: ${(res.stderr || res.error?.message || "").trim()}`);
  }
  return res.stdout.trim();
}

function requireGit() {
  if (spawnSync("git", ["--version"]).status !== 0) {
    throw new Error("git is required for skills:update but was not found on PATH");
  }
}

// ---------------------------------------------------------------------------
// config / lock

function readJson(path, fallback) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : fallback;
}

function vendorRoot(config) {
  return join(SKILLS_DIR, config.vendorDir ?? "vendor");
}

// ---------------------------------------------------------------------------
// include-pattern matching (gitignore-flavoured globs → RegExp)

function globToRegExp(pattern) {
  let re = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "*") {
      if (pattern[i + 1] === "*") {
        re += ".*";
        i++;
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  // A trailing slash means "this directory and everything beneath it".
  if (re.endsWith("/")) re += ".+";
  return new RegExp(`^${re}$`);
}

function listFiles(root) {
  const out = [];
  for (const name of readdirSync(root)) {
    if (name === ".git") continue;
    const p = join(root, name);
    if (statSync(p).isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// commands

export function skillsInit(force) {
  mkdirSync(SKILLS_DIR, { recursive: true });
  const files = [
    [CONFIG_PATH, () => JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n"],
    [LOCK_PATH, () => JSON.stringify({ version: 1, sources: {} }, null, 2) + "\n"],
  ];
  for (const [path, content] of files) {
    if (existsSync(path) && !force) {
      console.log(`  skipped  ${path} (already exists, use --force to overwrite)`);
      continue;
    }
    writeFileSync(path, content(), "utf-8");
    console.log(`  written  ${path}`);
  }
  console.log(`
Next steps:
  npx my-you-eye skills:update          # first run: nothing pinned yet — see below
  npx my-you-eye skills:update --latest # make the first pin of every source at HEAD
Then commit vendor.config.json + vendor.lock.json and gitignore:
  ${SKILLS_DIR}/<vendorDir>/            # bodies are derived state, never committed
Edit vendor.config.json to add/drop sources; keep references/skills-index.md's
tables in the same commit.`);
}

export function skillsUpdate({ latest = false, source } = {}) {
  requireGit();
  if (!existsSync(CONFIG_PATH)) {
    console.error(`No ${CONFIG_PATH}. Run: npx my-you-eye skills:init`);
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  const lock = readJson(LOCK_PATH, { version: 1, sources: {} });
  const sources = source ? config.sources.filter((s) => s.id === source) : config.sources;
  if (source && sources.length === 0) {
    console.error(`Unknown source id "${source}". Config lists:\n  ${config.sources.map((s) => s.id).join("\n  ")}`);
    process.exit(1);
  }

  let changed = false;
  let failures = 0;

  for (const src of sources) {
    try {
      const pin = lock.sources[src.id]?.commit;
      if (!latest && !pin) {
        console.log(`  skipped  ${src.id} (no pin yet — run with --latest to make the first pin)`);
        continue;
      }
      const worktree = mkdtempSync(join(tmpdir(), "myye-vendor-"));
      try {
        git(worktree, ["clone", "--quiet", "--depth", "1", "--filter=blob:none", "--sparse", "--branch", src.ref, src.repo, "."]);
        let sha = git(worktree, ["rev-parse", "HEAD"]);
        if (!latest && pin && pin !== sha) {
          git(worktree, ["fetch", "--quiet", "--depth", "1", "origin", pin]);
          git(worktree, ["checkout", "--quiet", "FETCH_HEAD"]);
          sha = pin;
        }
        git(worktree, ["sparse-checkout", "set", "--no-cone", ...src.include]);

        const matchers = src.include.map(globToRegExp);
        const dest = join(vendorRoot(config), src.id);
        rmSync(dest, { recursive: true, force: true });
        let count = 0;
        for (const abs of listFiles(worktree)) {
          const rel = relative(worktree, abs).split("\\").join("/");
          if (!matchers.some((re) => re.test(rel))) continue;
          const target = join(dest, rel);
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, readFileSync(abs));
          count++;
        }
        if (count === 0) throw new Error("0 files matched the include patterns — paths drifted upstream?");

        const prev = lock.sources[src.id]?.commit;
        if (prev !== sha) {
          lock.sources[src.id] = { commit: sha, ref: src.ref, vendoredAt: new Date().toISOString() };
          changed = true;
          console.log(`  ${prev ? `updated  ${src.id}  ${prev.slice(0, 9)} -> ${sha.slice(0, 9)}` : `pinned   ${src.id} @ ${sha.slice(0, 9)}`} (${count} files)`);
        } else {
          console.log(`  restored ${src.id} @ ${sha.slice(0, 9)} (${count} files)`);
        }
      } finally {
        rmSync(worktree, { recursive: true, force: true });
      }
    } catch (err) {
      failures++;
      console.error(`  failed   ${src.id}: ${err.message}`);
    }
  }

  if (changed) {
    writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + "\n", "utf-8");
    console.log(`\nLock updated: ${LOCK_PATH} — review the diff and commit it.`);
  }
  console.log(failures === 0 ? "\nDone." : `\nDone with ${failures} failure(s).`);
  if (failures > 0) process.exitCode = 1;
}
