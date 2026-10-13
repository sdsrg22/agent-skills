// Package each skill under skills/ into dist/<name>.skill (a zip with the skill
// folder inside), ready to upload to Claude.ai.
//
//   bun run build                     build every skill
//   bun run build jira-client-update  build only the named skill(s)
//   bun run clean                     delete dist/
//
// The output is reproducible: files are sorted and given a fixed timestamp, so
// rebuilding unchanged skills produces an identical file and no noisy diffs.
//
// Env overrides, mainly for testing: SKILLS_DIR, DIST_DIR.
import { zipSync } from "fflate";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SKILLS_DIR = process.env.SKILLS_DIR ?? join(ROOT, "skills");
const DIST_DIR = process.env.DIST_DIR ?? join(ROOT, "dist");

// Skills that only make sense in Claude Code (they rely on slash commands, local
// files, or desktop tools), so they are validated but not packaged for Claude.ai.
// Naming one explicitly, for example `bun run build compact-resume`, still builds it.
const CLAUDE_CODE_ONLY = new Set(["compact-resume"]);

// Local-only folders that must never ship inside a package.
const EXCLUDE_DIRS = new Set(["evals", "node_modules", "__pycache__"]);
const EXCLUDE_FILES = new Set([".DS_Store", "Thumbs.db"]);
// The zip format cannot store dates before 1980, so use a fixed date after it.
const FIXED_MTIME = new Date("2000-01-01T00:00:00Z");

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

/** Return the skills (folders containing SKILL.md), skipping workspace folders. */
function findSkills(): string[] {
  if (!existsSync(SKILLS_DIR)) fail(`skills folder not found: ${SKILLS_DIR}`);
  return readdirSync(SKILLS_DIR)
    .filter((name) => statSync(join(SKILLS_DIR, name)).isDirectory())
    .filter((name) => existsSync(join(SKILLS_DIR, name, "SKILL.md")))
    .sort();
}

/** Check the frontmatter the same way Claude will read it, so a bad skill fails here. */
function validate(name: string): void {
  const text = readFileSync(join(SKILLS_DIR, name, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) fail(`${name}: SKILL.md has no YAML frontmatter`);

  let meta: unknown;
  try {
    meta = Bun.YAML.parse(match[1]);
  } catch (err) {
    // A ": " inside an unquoted description is the usual cause.
    fail(
      `${name}: frontmatter is not valid YAML (${(err as Error).message.split("\n")[0]}). ` +
        `A colon followed by a space inside an unquoted description is the usual cause; reword it or quote the value.`,
    );
  }
  const { name: declared, description } = (meta ?? {}) as Record<string, unknown>;
  if (typeof declared !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(declared)) {
    fail(`${name}: frontmatter "name" must be kebab-case`);
  }
  if (declared !== name) fail(`${name}: frontmatter name "${declared}" does not match the folder name`);
  if (typeof description !== "string" || description.trim() === "") {
    fail(`${name}: frontmatter "description" is missing or empty`);
  }
}

/** List files under a folder, relative with forward slashes, in a stable order. */
function listFiles(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const rel = prefix ? `${prefix}/${entry}` : entry;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry)) out.push(...listFiles(full, rel));
    } else if (!EXCLUDE_FILES.has(entry) && !entry.endsWith(".pyc")) {
      out.push(rel);
    }
  }
  return out;
}

function build(name: string): void {
  validate(name);
  const entries: Record<string, [Uint8Array, { mtime: Date; level: 9 }]> = {};
  for (const rel of listFiles(join(SKILLS_DIR, name))) {
    entries[`${name}/${rel}`] = [
      new Uint8Array(readFileSync(join(SKILLS_DIR, name, rel))),
      { mtime: FIXED_MTIME, level: 9 },
    ];
  }
  mkdirSync(DIST_DIR, { recursive: true });
  const outFile = join(DIST_DIR, `${name}.skill`);
  writeFileSync(outFile, zipSync(entries));
  console.log(`Built ${name}.skill (${Object.keys(entries).length} files, ${statSync(outFile).size} bytes)`);
}

const args = process.argv.slice(2);
if (args.includes("--clean")) {
  rmSync(DIST_DIR, { recursive: true, force: true });
  console.log(`Removed ${DIST_DIR}`);
  process.exit(0);
}

const available = findSkills();
if (available.length === 0) fail(`no skills found under ${SKILLS_DIR}`);
for (const name of args) {
  if (!available.includes(name)) fail(`unknown skill "${name}". Available: ${available.join(", ")}`);
}
if (args.length > 0) {
  for (const name of args) build(name);
} else {
  for (const name of available) {
    if (CLAUDE_CODE_ONLY.has(name)) {
      // Still validate it, so a broken skill fails the build and CI.
      validate(name);
      console.log(`Validated ${name} (Claude Code only, not packaged)`);
    } else {
      build(name);
    }
  }
}
