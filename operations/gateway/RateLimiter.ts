/**
 * RateLimiter keeping client IPs inside request thresholds.
 */
export class RateLimiter {
  private readonly limits = new Map<string, number>();

  public isAllowed(clientIp: string, limit: number): boolean {
    const current = this.limits.get(clientIp) || 0;
    if (current >= limit) return false;
    this.limits.set(clientIp, current + 1);
    return true;
  }
}
