#!/usr/bin/env node
// CalVer release helper — the repo versions by date, not semver semantics.
//
// Scheme: YYYY.M.MICRO  (e.g. 2026.8.0, 2026.8.1, … 2026.9.0)
//   - YYYY.M  = year and month of the release (no leading zero — npm rejects
//     numeric identifiers with leading zeros, so 2026.08.x is not a valid
//     version string).
//   - MICRO   = release counter within that month, starting at 0.
// The result is still a syntactically valid semver triple, so npm, caret
// ranges, and every existing tool keep working; only the *meaning* changes.
//
// Usage:
//   node scripts/release.mjs            # bump + changelog + commit + signed tag
//   node scripts/release.mjs --dry-run  # print the next version and exit
//
// It does NOT push. Push explicitly:  git push origin <branch> && git push origin v<version>
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;

const m = /^(\d{4})\.(\d{1,2})\.(\d+)$/.exec(pkg.version);
const micro = m && Number(m[1]) === year && Number(m[2]) === month ? Number(m[3]) + 1 : 0;
const next = `${year}.${month}.${micro}`;

if (process.argv.includes("--dry-run")) {
  console.log(next);
  process.exit(0);
}

if (run("git status --porcelain") !== "") {
  console.error("✗ Working tree is not clean — commit or stash first.");
  process.exit(1);
}

// Retitle the changelog's [Unreleased] section, keeping an empty one on top.
const changelogPath = "CHANGELOG.md";
const changelog = readFileSync(changelogPath, "utf8");
const isoDate = now.toISOString().slice(0, 10);
const marker = "## [Unreleased]";
if (!changelog.includes(marker)) {
  console.error("✗ CHANGELOG.md has no [Unreleased] section.");
  process.exit(1);
}
writeFileSync(
  changelogPath,
  changelog.replace(marker, `${marker}\n\n## [${next}] - ${isoDate}`),
);

// npm version updates package.json AND package-lock.json together.
run(`npm version --no-git-tag-version ${next}`);

run("git add package.json package-lock.json CHANGELOG.md");
execSync(`git commit -m "chore(release): v${next}"`, { stdio: "inherit" });
execSync(`git tag -a v${next} -m "v${next}"`, { stdio: "inherit" }); // tag.gpgsign signs it

console.log(`\n✅ Released v${next} locally.`);
console.log(`   Push with: git push origin HEAD && git push origin v${next}`);
