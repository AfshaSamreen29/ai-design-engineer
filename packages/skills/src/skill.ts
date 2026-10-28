import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_NAME = "landing-page-design";

/** Absolute path of the bundled skill directory. */
export const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", SKILL_NAME);

export interface Frontmatter {
  name: string;
  description: string;
}

/** Parses the minimal `name` / `description` YAML frontmatter used by agent skills. */
export function parseFrontmatter(markdown: string): { data: Partial<Frontmatter>; body: string } | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);
  if (!match) return null;
  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (kv) data[kv[1] as string] = (kv[2] ?? "").trim();
  }
  return { data: data as Partial<Frontmatter>, body: match[2] ?? "" };
}

/** Relative file paths (posix style) of every file in the skill, sorted. */
export function listSkillFiles(dir: string = SKILL_DIR, base: string = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listSkillFiles(full, base));
    else out.push(full.slice(base.length + 1).split("\\").join("/"));
  }
  return out.sort();
}

export function readSkillFile(relativePath: string): string {
  return readFileSync(join(SKILL_DIR, relativePath), "utf8");
}
