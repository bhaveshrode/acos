export type LifecycleEvent = "starting" | "started" | "stopping" | "stopped" | "failed";

/**
 * ServerLifecycle event registry coordinating application start and shutdown callbacks.
 */
export class ServerLifecycle {
  private static listeners: Record<LifecycleEvent, Array<() => Promise<void> | void>> = {
    starting: [],
    started: [],
    stopping: [],
    stopped: [],
    failed: []
  };

  /**
   * Appends a subscriber to the designated event hooks queue.
   */
  public static on(event: LifecycleEvent, callback: () => Promise<void> | void): void {
    this.listeners[event].push(callback);
  }

  /**
   * Broadcasts lifecycle triggers sequentially.
   */
  public static async emit(event: LifecycleEvent): Promise<void> {
    for (const callback of this.listeners[event]) {
      await callback();
    }
  }

  /**
   * Clears registered hooks for clean setups.
   */
  public static reset(): void {
    this.listeners = {
      starting: [],
      started: [],
      stopping: [],
      stopped: [],
      failed: []
    };
  }
}
