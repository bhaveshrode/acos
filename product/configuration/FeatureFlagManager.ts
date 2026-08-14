/**
 * FeatureFlagManager enabling or disabling capabilities.
 */
export class FeatureFlagManager {
  private readonly flags = new Map<string, boolean>();

  public enable(flag: string): void {
    this.flags.set(flag.toLowerCase(), true);
  }

  public disable(flag: string): void {
    this.flags.set(flag.toLowerCase(), false);
  }

  public isEnabled(flag: string): boolean {
    return this.flags.get(flag.toLowerCase()) ?? false;
  }

  public clear(): void {
    this.flags.clear();
  }
}
