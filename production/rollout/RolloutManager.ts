/**
 * RolloutManager executing progressive releases of flags.
 */
export class RolloutManager {
  private readonly rollouts = new Map<string, number>();

  public setRolloutPercentage(featureFlag: string, percentage: number): void {
    this.rollouts.set(featureFlag.toLowerCase(), Math.max(0, Math.min(100, percentage)));
  }

  public isFeatureEnabledForUser(featureFlag: string, userId: string): boolean {
    const pct = this.rollouts.get(featureFlag.toLowerCase()) ?? 0;
    if (pct === 0) return false;
    if (pct === 100) return true;

    // Stable hash mapping to check if user falls under percentage bucket
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bucket = hash % 100;
    return bucket < pct;
  }

  public clear(): void {
    this.rollouts.clear();
  }
}
