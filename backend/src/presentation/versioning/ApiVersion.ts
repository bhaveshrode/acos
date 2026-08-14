/**
 * ApiVersion representing supported API versions.
 */
export class ApiVersion {
  constructor(
    public readonly major: number,
    public readonly minor: number = 0
  ) {}

  public toString(): string {
    return `v${this.major}.${this.minor}`;
  }

  public equals(other: ApiVersion): boolean {
    return this.major === other.major && this.minor === other.minor;
  }

  /**
   * Parses version string inputs (e.g. v1.1 or 2.0).
   */
  public static parse(versionStr: string): ApiVersion {
    const cleaned = versionStr.replace(/^v/i, "");
    const parts = cleaned.split(".");
    const major = parseInt(parts[0], 10);
    const minor = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isNaN(major)) {
      throw new Error(`Invalid API version string: ${versionStr}`);
    }
    return new ApiVersion(major, minor);
  }
}
