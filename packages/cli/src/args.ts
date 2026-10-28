export interface OptSpec {
  type: "string" | "boolean";
  description: string;
}
export type OptSpecs = Record<string, OptSpec>;
export type OptValues = Record<string, string | boolean>;

export interface ParsedArgs {
  options: OptValues;
  positionals: string[];
  errors: string[];
}

/** Parses `--name value`, `--name=value` and boolean `--flag`. Unknown options are errors, never ignored. */
export function parseOptions(tokens: string[], specs: OptSpecs): ParsedArgs {
  const options: OptValues = {};
  const positionals: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] as string;
    if (token === "--") {
      positionals.push(...tokens.slice(i + 1));
      break;
    }
    if (token === "-h") {
      options["help"] = true;
      continue;
    }
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const eq = token.indexOf("=");
    const name = eq === -1 ? token.slice(2) : token.slice(2, eq);
    const inline = eq === -1 ? undefined : token.slice(eq + 1);
    const spec = Object.hasOwn(specs, name) ? specs[name] : undefined;
    if (!spec) {
      errors.push(`Unknown option --${name}`);
      continue;
    }
    if (spec.type === "boolean") {
      if (inline !== undefined) errors.push(`Option --${name} does not take a value`);
      else options[name] = true;
      continue;
    }
    let value = inline;
    if (value === undefined) {
      const next = tokens[i + 1];
      if (next === undefined || next.startsWith("--")) {
        errors.push(`Option --${name} requires a value`);
        continue;
      }
      value = next;
      i++;
    }
    if (value.trim() === "") {
      errors.push(`Option --${name} must not be empty`);
      continue;
    }
    options[name] = value;
  }
  return { options, positionals, errors };
}
