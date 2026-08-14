/**
 * SeedRunner class executing initial reference seeding.
 */
export class SeedRunner {
  private static seedsApplied: string[] = [];

  /**
   * Dispatches reference currency and roles seed operations.
   */
  public static async seedAll(): Promise<void> {
    this.seedsApplied = ["currencies", "roles", "settings"];
  }

  /**
   * Retrieves applied seed categories.
   */
  public static getAppliedSeeds(): string[] {
    return this.seedsApplied;
  }

  /**
   * Resets active seed marks.
   */
  public static clear(): void {
    this.seedsApplied = [];
  }
}
