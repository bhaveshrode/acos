/**
 * HeartbeatManager checking keep-alive signals on timers loops.
 */
export class HeartbeatManager {
  private intervalId?: any;

  public startHeartbeat(pingFn: () => void, intervalMs: number): void {
    this.intervalId = setInterval(pingFn, intervalMs);
  }

  public stopHeartbeat(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
