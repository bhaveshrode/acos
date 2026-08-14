import { LayoutLifecycleEvent } from "./LayoutLifecycleEvent.js";

/**
 * LayoutEventDispatcher publishing events to subscribers.
 */
export class LayoutEventDispatcher {
  private readonly listeners = new Set<(event: LayoutLifecycleEvent) => void>();

  public dispatch(event: LayoutLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: LayoutLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
