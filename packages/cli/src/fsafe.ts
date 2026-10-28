import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PathError } from "./errors.ts";

function lexists(p: string): boolean {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

function isInside(root: string, target: string): boolean {
  const rel = path.relative(root, target);
  return rel === "" || (rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel));
}

/**
 * Resolves `rel` against `root` and guarantees the result stays inside `root`,
 * both lexically (no `..` escapes) and physically (no symlink that points outside).
 */
export function resolveInside(root: string, rel: string): string {
  if (typeof rel !== "string" || rel.trim() === "" || rel.includes("\0")) {
    throw new PathError("Invalid path.");
  }
  const rootAbs = path.resolve(root);
  const abs = path.resolve(rootAbs, rel);
  if (!isInside(rootAbs, abs)) {
    throw new PathError(`Path "${rel}" is outside the project directory.`);
  }

  // Walk up to the nearest existing entry and check where it really points.
  let probe = abs;
  while (!lexists(probe)) {
    const parent = path.dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  let realProbe: string;
  let realRoot: string;
  try {
    realProbe = realpathSync(probe);
    realRoot = realpathSync(rootAbs);
  } catch {
    throw new PathError(`Path "${rel}" cannot be resolved safely (broken link?).`);
  }
  if (!isInside(realRoot, realProbe)) {
    throw new PathError(`Path "${rel}" resolves outside the project directory through a link.`);
  }
  return abs;
}

export interface FileSpec {
  /** Path relative to the project root, using forward slashes. */
  path: string;
  content: Buffer;
}

export type Action = "create" | "identical" | "conflict" | "overwrite";

export interface PlannedFile {
  path: string;
  abs: string;
  action: Action;
  content: Buffer;
}

export function planFiles(root: string, files: FileSpec[], force: boolean): PlannedFile[] {
  return files.map((f) => {
    const abs = resolveInside(root, f.path);
    let action: Action = "create";
    if (lexists(abs)) {
      if (!lstatSync(abs).isFile()) throw new PathError(`"${f.path}" exists and is not a regular file.`);
      action = readFileSync(abs).equals(f.content) ? "identical" : force ? "overwrite" : "conflict";
    }
    return { path: f.path, abs, action, content: f.content };
  });
}

export function applyPlan(plan: PlannedFile[]): void {
  for (const item of plan) {
    if (item.action !== "create" && item.action !== "overwrite") continue;
    mkdirSync(path.dirname(item.abs), { recursive: true });
    writeFileSync(item.abs, item.content);
  }
}
