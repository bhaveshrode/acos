/**
 * FactoryLifecycleManager managing cleanups and disposals.
 */
export class FactoryLifecycleManager {
  private readonly cleanups: (() => void)[] = [];

  public registerCleanup(cleanup: () => void): void {
    this.cleanups.push(cleanup);
  }

  public dispose(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }
    this.cleanups.length = 0;
  }
}
