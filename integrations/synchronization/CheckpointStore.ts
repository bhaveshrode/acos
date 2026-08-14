/**
 * CheckpointStore tracking synchronization cursor timestamps.
 */
export class CheckpointStore {
  private readonly store = new Map<string, string>();

  public saveCheckpoint(key: string, value: string): void {
    this.store.set(key, value);
  }

  public getCheckpoint(key: string): string | undefined {
    return this.store.get(key);
  }
}
