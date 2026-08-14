/**
 * RetentionRule verifying if record age exceeds target years limit.
 */
export class RetentionRule {
  constructor(
    public readonly code: string,
    public readonly allowedAgeYears: number
  ) {
    Object.freeze(this);
  }

  public hasExpired(createdAt: Date): boolean {
    const elapsedMs = Date.now() - createdAt.getTime();
    const allowedMs = this.allowedAgeYears * 365 * 24 * 60 * 60 * 1000;
    return elapsedMs > allowedMs;
  }
}
