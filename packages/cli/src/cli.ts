import { readFileSync } from "node:fs";
import { parseOptions, type OptSpecs } from "./args.ts";
import { designCommand, initCommand, reviewCommand, skillInstallCommand, tokensExportCommand } from "./commands.ts";
import { makeCtx, type Ctx, type Io } from "./context.ts";
import { CliError } from "./errors.ts";

const COMMON: OptSpecs = {
  dir: { type: "string", description: "Project directory (default: current directory)" },
  "dry-run": { type: "boolean", description: "Show what would happen without writing files" },
  force: { type: "boolean", description: "Overwrite existing files that differ" },
  help: { type: "boolean", description: "Show help for this command" },
};

interface Command {
  words: string[];
  summary: string;
  options: OptSpecs;
  examples: string[];
  run: (ctx: Ctx) => number;
}

const COMMANDS: Command[] = [
  {
    words: ["init"],
    summary: "Create a config, a default design system, and agent instructions",
    options: { ...COMMON, name: { type: "string", description: "Project name (default: folder name)" } },
    examples: ["ai-design-engineer init --name \"Acme\"", "ai-design-engineer init --dry-run"],
    run: initCommand,
  },
  {
    words: ["design"],
    summary: "Generate an editable design brief from your input and sensible defaults",
    options: {
      ...COMMON,
      name: { type: "string", description: "Project name" },
      type: { type: "string", description: "Website type, e.g. \"SaaS landing page\"" },
      audience: { type: "string", description: "Target audience" },
      goal: { type: "string", description: "Primary conversion goal" },
      description: { type: "string", description: "Product description" },
      input: { type: "string", description: "Design system JSON (default: design/design-system.json)" },
      out: { type: "string", description: "Output file (default: design/DESIGN_BRIEF.md)" },
    },
    examples: ["ai-design-engineer design --name Acme --goal \"Start a free trial\""],
    run: designCommand,
  },
  {
    words: ["tokens", "export"],
    summary: "Validate a design system and export JSON and CSS custom properties",
    options: {
      ...COMMON,
      input: { type: "string", description: "Design system JSON (default: design/design-system.json)" },
      format: { type: "string", description: "json, css, or both (default: both)" },
      out: { type: "string", description: "Output folder (default: design/tokens)" },
    },
    examples: ["ai-design-engineer tokens export --format css --out public/tokens"],
    run: tokensExportCommand,
  },
  {
    words: ["skill", "install"],
    summary: "Copy the bundled landing-page-design skill into a project",
    options: {
      ...COMMON,
      target: { type: "string", description: "claude (.claude/skills) or agents/codex (docs/skills). Default: claude" },
      dest: { type: "string", description: "Custom destination folder inside the project" },
    },
    examples: ["ai-design-engineer skill install --target claude --dry-run"],
    run: skillInstallCommand,
  },
  {
    words: ["review"],
    summary: "Capture screenshots and a quality report for a URL (not implemented yet)",
    options: { ...COMMON, url: { type: "string", description: "Page to review, e.g. http://localhost:3000" } },
    examples: ["ai-design-engineer review --url http://localhost:3000"],
    run: reviewCommand,
  },
];

function version(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function usage(): string {
  const width = Math.max(...COMMANDS.map((c) => c.words.join(" ").length));
  return [
    "AI Design Engineer: design systems, agent skills, and design briefs for AI-built websites.",
    "",
    "Usage: ai-design-engineer <command> [options]",
    "",
    "Commands:",
    ...COMMANDS.map((c) => `  ${c.words.join(" ").padEnd(width)}  ${c.summary}`),
    "",
    "Run `ai-design-engineer <command> --help` for options.",
    "File-changing commands support --dry-run and never overwrite differing files without --force.",
  ].join("\n");
}

function commandHelp(cmd: Command): string {
  const names = Object.keys(cmd.options);
  const width = Math.max(...names.map((n) => n.length)) + 2;
  return [
    `ai-design-engineer ${cmd.words.join(" ")}: ${cmd.summary}`,
    "",
    "Options:",
    ...names.map((n) => {
      const spec = cmd.options[n];
      const label = `--${n}${spec?.type === "string" ? " <value>" : ""}`;
      return `  ${label.padEnd(width + 9)}${spec?.description ?? ""}`;
    }),
    "",
    "Examples:",
    ...cmd.examples.map((e) => `  ${e}`),
  ].join("\n");
}

/** Runs the CLI and returns the exit code: 0 ok, 1 failed, 2 bad usage. Never throws for expected errors. */
export function run(argv: string[], io: Io): number {
  try {
    const first = argv[0];
    if (first === undefined || first === "help" || first === "--help" || first === "-h") {
      io.out(usage());
      return 0;
    }
    if (first === "--version" || first === "-v") {
      io.out(version());
      return 0;
    }

    const cmd = COMMANDS.find((c) => c.words.every((w, i) => argv[i] === w));
    if (!cmd) {
      const attempted = argv.filter((a) => !a.startsWith("-")).slice(0, 2).join(" ") || first;
      io.err(`Unknown command: ${attempted}\n\n${usage()}`);
      return 2;
    }

    const parsed = parseOptions(argv.slice(cmd.words.length), cmd.options);
    if (parsed.options["help"] === true) {
      io.out(commandHelp(cmd));
      return 0;
    }
    if (parsed.errors.length > 0 || parsed.positionals.length > 0) {
      const problems = [...parsed.errors, ...parsed.positionals.map((p) => `Unexpected argument "${p}"`)];
      io.err(`${problems.join("\n")}\n\nRun \`ai-design-engineer ${cmd.words.join(" ")} --help\` for usage.`);
      return 2;
    }
    return cmd.run(makeCtx(io, parsed.options));
  } catch (e) {
    if (e instanceof CliError) {
      io.err(`Error: ${e.message}`);
      return e.code;
    }
    throw e;
  }
}
