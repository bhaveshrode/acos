import { ComponentEvent } from "./ComponentEvent.js";

/**
 * ComponentEventDispatcher managing callback listeners subscriptions.
 */
export class ComponentEventDispatcher {
  private readonly listeners = new Set<(event: ComponentEvent) => void>();

  public dispatch(event: ComponentEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: ComponentEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
