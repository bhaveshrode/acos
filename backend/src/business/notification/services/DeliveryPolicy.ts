/**
 * Domain Service enforcing delivery retries and message expiration calculations.
 */
export class DeliveryPolicy {
  /**
   * Calculates next retry delay applying a simple exponential backoff strategy.
   */
  public calculateNextRetryInterval(
    currentRetryCount: number,
    baseIntervalSeconds: number
  ): number {
    if (currentRetryCount < 0) return baseIntervalSeconds;
    // Exponential backoff: base * 2^retryCount
    return baseIntervalSeconds * Math.pow(2, currentRetryCount);
  }

  /**
   * Evaluates if a notification is expired relative to its creation time and time-to-live parameter.
   */
  public isExpired(createdAt: Date, ttlSeconds: number, currentDate: Date = new Date()): boolean {
    if (ttlSeconds <= 0) return false;
    const diffSeconds = (currentDate.getTime() - createdAt.getTime()) / 1000;
    return diffSeconds >= ttlSeconds;
  }
}
