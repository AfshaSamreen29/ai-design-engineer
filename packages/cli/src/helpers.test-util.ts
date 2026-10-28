import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { run } from "./cli.ts";

export interface Result {
  code: number;
  out: string;
  err: string;
}

export function tempDir(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(path.join(tmpdir(), "ade-"));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export function cli(cwd: string, ...argv: string[]): Result {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(argv, { cwd, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}
