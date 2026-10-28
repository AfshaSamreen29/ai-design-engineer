import { test } from "node:test";
import assert from "node:assert/strict";
import { parseOptions, type OptSpecs } from "./args.ts";

const specs: OptSpecs = {
  name: { type: "string", description: "" },
  force: { type: "boolean", description: "" },
};

test("parses separate, inline, and boolean options", () => {
  const r = parseOptions(["--name", "Acme", "--force"], specs);
  assert.deepEqual(r.options, { name: "Acme", force: true });
  assert.deepEqual(parseOptions(["--name=Acme Co"], specs).options, { name: "Acme Co" });
  assert.deepEqual(r.errors, []);
});

test("reports unknown options, missing values, and boolean values", () => {
  assert.match(parseOptions(["--nope"], specs).errors[0] ?? "", /Unknown option --nope/);
  assert.match(parseOptions(["--name"], specs).errors[0] ?? "", /requires a value/);
  assert.match(parseOptions(["--name", "--force"], specs).errors[0] ?? "", /requires a value/);
  assert.match(parseOptions(["--force=yes"], specs).errors[0] ?? "", /does not take a value/);
  assert.match(parseOptions(["--name="], specs).errors[0] ?? "", /must not be empty/);
});

test("does not treat prototype names as options", () => {
  assert.match(parseOptions(["--constructor"], specs).errors[0] ?? "", /Unknown option/);
  assert.match(parseOptions(["--__proto__"], specs).errors[0] ?? "", /Unknown option/);
});

test("collects positionals and honors --", () => {
  const r = parseOptions(["a", "--", "--force"], specs);
  assert.deepEqual(r.positionals, ["a", "--force"]);
  assert.equal(r.options["force"], undefined);
});
