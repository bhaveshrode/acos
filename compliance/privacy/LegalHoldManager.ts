/**
 * LegalHoldManager registering and checking legal holds.
 */
export class LegalHoldManager {
  private readonly activeHolds = new Set<string>();

  public addHold(userId: string): void {
    this.activeHolds.add(userId);
  }

  public removeHold(userId: string): void {
    this.activeHolds.delete(userId);
  }

  public hasHold(userId: string): boolean {
    return this.activeHolds.has(userId);
  }

  public clear(): void {
    this.activeHolds.clear();
  }
}
