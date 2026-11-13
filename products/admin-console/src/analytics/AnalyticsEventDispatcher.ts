import { AnalyticsLifecycleEvent } from "./AnalyticsLifecycleEvent.js";

/**
 * AnalyticsEventDispatcher distributing lifecycle status updates.
 */
export class AnalyticsEventDispatcher {
  private readonly listeners = new Set<(event: AnalyticsLifecycleEvent) => void>();

  public dispatch(event: AnalyticsLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: AnalyticsLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
