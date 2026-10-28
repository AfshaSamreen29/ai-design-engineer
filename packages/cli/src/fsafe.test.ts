import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, symlinkSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveInside, planFiles, applyPlan } from "./fsafe.ts";
import { tempDir } from "./helpers.test-util.ts";

test("resolveInside accepts paths inside the root", () => {
  const { dir, cleanup } = tempDir();
  try {
    assert.equal(resolveInside(dir, "a/b.txt"), path.join(dir, "a", "b.txt"));
    assert.equal(resolveInside(dir, "./a/../b.txt"), path.join(dir, "b.txt"));
  } finally {
    cleanup();
  }
});

test("resolveInside rejects traversal, outside absolutes, and bad input", () => {
  const { dir, cleanup } = tempDir();
  try {
    assert.throws(() => resolveInside(dir, "../evil.txt"), /outside the project/);
    assert.throws(() => resolveInside(dir, "a/../../evil.txt"), /outside the project/);
    assert.throws(() => resolveInside(dir, path.resolve(dir, "..", "evil.txt")), /outside the project/);
    assert.throws(() => resolveInside(dir, ""), /Invalid path/);
    assert.throws(() => resolveInside(dir, "a\0b"), /Invalid path/);
  } finally {
    cleanup();
  }
});

test("resolveInside rejects a symlink that points outside the root", (t) => {
  const outer = tempDir();
  const inner = tempDir();
  try {
    try {
      symlinkSync(outer.dir, path.join(inner.dir, "link"), "dir");
    } catch {
      t.skip("symlinks are not permitted on this system");
      return;
    }
    assert.throws(() => resolveInside(inner.dir, "link/file.txt"), /outside the project/);
  } finally {
    outer.cleanup();
    inner.cleanup();
  }
});

test("planFiles classifies create, identical, conflict, and overwrite", () => {
  const { dir, cleanup } = tempDir();
  try {
    mkdirSync(path.join(dir, "d"));
    writeFileSync(path.join(dir, "d", "same.txt"), "same");
    writeFileSync(path.join(dir, "d", "diff.txt"), "old");
    const files = [
      { path: "d/new.txt", content: Buffer.from("n") },
      { path: "d/same.txt", content: Buffer.from("same") },
      { path: "d/diff.txt", content: Buffer.from("new") },
    ];
    assert.deepEqual(planFiles(dir, files, false).map((p) => p.action), ["create", "identical", "conflict"]);
    const forced = planFiles(dir, files, true);
    assert.equal(forced[2]?.action, "overwrite");
    applyPlan(forced);
    assert.equal(readFileSync(path.join(dir, "d", "diff.txt"), "utf8"), "new");
    assert.equal(readFileSync(path.join(dir, "d", "new.txt"), "utf8"), "n");
  } finally {
    cleanup();
  }
});

test("planFiles refuses to replace a directory with a file", () => {
  const { dir, cleanup } = tempDir();
  try {
    mkdirSync(path.join(dir, "x"));
    assert.throws(() => planFiles(dir, [{ path: "x", content: Buffer.from("a") }], true), /not a regular file/);
  } finally {
    cleanup();
  }
});
