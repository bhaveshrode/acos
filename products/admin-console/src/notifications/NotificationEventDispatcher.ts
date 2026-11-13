import { NotificationEvent } from "./NotificationEvent.js";

/**
 * NotificationEventDispatcher publishing events to observers.
 */
export class NotificationEventDispatcher {
  private readonly listeners = new Set<(event: NotificationEvent) => void>();

  public dispatch(event: NotificationEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: NotificationEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
