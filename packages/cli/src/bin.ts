#!/usr/bin/env node
import { run } from "./cli.ts";

process.exitCode = run(process.argv.slice(2), {
  cwd: process.cwd(),
  out: (line) => process.stdout.write(line + "\n"),
  err: (line) => process.stderr.write(line + "\n"),
});
