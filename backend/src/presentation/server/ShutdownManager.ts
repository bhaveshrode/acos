import { ServerLifecycle } from "./ServerLifecycle.js";

/**
 * ShutdownManager organizing sequential releases of resources and connections.
 */
export class ShutdownManager {
  constructor(private readonly closeServerFn: () => Promise<void>) {}

  /**
   * Shuts down listeners, workers, and databases gracefully.
   */
  public async shutdown(): Promise<void> {
    await ServerLifecycle.emit("stopping");
    await this.closeServerFn();
    await ServerLifecycle.emit("stopped");
  }
}
