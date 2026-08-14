import { PageLifecycleEvent } from "./PageLifecycleEvent.js";

/**
 * PageEventDispatcher distributing PageLifecycleEvents to subscribers.
 */
export class PageEventDispatcher {
  private readonly listeners = new Set<(event: PageLifecycleEvent) => void>();

  public dispatch(event: PageLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: PageLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
