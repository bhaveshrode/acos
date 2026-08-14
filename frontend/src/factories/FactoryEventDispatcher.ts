import { FactoryLifecycleEvent } from "./FactoryLifecycleEvent.js";

/**
 * FactoryEventDispatcher distributing lifecycle composition updates.
 */
export class FactoryEventDispatcher {
  private readonly listeners = new Set<(event: FactoryLifecycleEvent) => void>();

  public dispatch(event: FactoryLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: FactoryLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
