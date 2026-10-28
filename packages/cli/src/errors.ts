/** Expected failure with a user-facing message and a process exit code (1 = failed, 2 = bad usage). */
export class CliError extends Error {
  code: number;
  constructor(message: string, code = 1) {
    super(message);
    this.name = "CliError";
    this.code = code;
  }
}

export class PathError extends CliError {
  constructor(message: string) {
    super(message, 1);
    this.name = "PathError";
  }
}
