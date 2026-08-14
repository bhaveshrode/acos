/**
 * ConnectionPoolManager enforcing postgres connection boundaries.
 */
export class ConnectionPoolManager {
  private activeCount = 0;

  constructor(public readonly maxPoolSize: number) {}

  public acquireConnection(): string {
    if (this.activeCount >= this.maxPoolSize) {
      throw new Error(`Connection pool size exceeded: Max pool size is ${this.maxPoolSize}`);
    }
    this.activeCount++;
    return `conn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  public releaseConnection(connectionId: string): void {
    if (this.activeCount > 0) {
      this.activeCount--;
    }
  }

  public getActiveCount(): number {
    return this.activeCount;
  }
}
