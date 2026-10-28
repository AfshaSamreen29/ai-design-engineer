import { statSync } from "node:fs";
import path from "node:path";
import type { OptValues } from "./args.ts";
import { CliError, PathError } from "./errors.ts";
import { applyPlan, planFiles, type FileSpec } from "./fsafe.ts";

export interface Io {
  cwd: string;
  out(line: string): void;
  err(line: string): void;
}

export interface Ctx {
  root: string;
  opts: OptValues;
  io: Io;
}

export function str(ctx: Ctx, name: string): string | undefined {
  const v = ctx.opts[name];
  return typeof v === "string" ? v : undefined;
}

export function flag(ctx: Ctx, name: string): boolean {
  return ctx.opts[name] === true;
}

export function makeCtx(io: Io, opts: OptValues): Ctx {
  const dir = typeof opts["dir"] === "string" ? opts["dir"] : ".";
  const root = path.resolve(io.cwd, dir);
  let isDir = false;
  try {
    isDir = statSync(root).isDirectory();
  } catch {
    /* handled below */
  }
  if (!isDir) throw new CliError(`Project directory not found: ${root}`);
  return { root, opts, io };
}

const LABEL: Record<string, string> = {
  create: "create   ",
  overwrite: "overwrite",
  identical: "unchanged",
  conflict: "CONFLICT ",
};

/**
 * Plans, reports, and (unless --dry-run) writes files. Never overwrites a differing file
 * without --force, and writes nothing at all if any file would conflict.
 */
export function commitFiles(ctx: Ctx, files: FileSpec[]): number {
  const dryRun = flag(ctx, "dry-run");
  let plan;
  try {
    plan = planFiles(ctx.root, files, flag(ctx, "force"));
  } catch (e) {
    if (e instanceof PathError) {
      ctx.io.err(`Error: ${e.message}`);
      return 1;
    }
    throw e;
  }

  if (dryRun) ctx.io.out("Dry run: no files will be written.");
  for (const item of plan) ctx.io.out(`  ${LABEL[item.action]}  ${item.path}`);

  const conflicts = plan.filter((p) => p.action === "conflict");
  if (conflicts.length > 0) {
    ctx.io.err(
      `Error: ${conflicts.length} existing file(s) differ from what would be written. Nothing was written.\n` +
        "Re-run with --force to overwrite them, or --dry-run to preview.",
    );
    return 1;
  }

  const changed = plan.filter((p) => p.action === "create" || p.action === "overwrite").length;
  if (!dryRun) applyPlan(plan);
  ctx.io.out(dryRun ? `Would write ${changed} file(s).` : `Wrote ${changed} file(s).`);
  return 0;
}
