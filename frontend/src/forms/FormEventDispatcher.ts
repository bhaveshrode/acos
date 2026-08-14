import { FormLifecycleEvent } from "./FormLifecycleEvent.js";

/**
 * FormEventDispatcher publishing FormLifecycleEvents to subscribers.
 */
export class FormEventDispatcher {
  private readonly listeners = new Set<(event: FormLifecycleEvent) => void>();

  public dispatch(event: FormLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: FormLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
