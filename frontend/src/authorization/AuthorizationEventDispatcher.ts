import { AuthorizationEvent } from "./AuthorizationEvent.js";

/**
 * AuthorizationEventDispatcher publishing events to registered listeners.
 */
export class AuthorizationEventDispatcher {
  private readonly listeners = new Set<(event: AuthorizationEvent) => void>();

  public dispatch(event: AuthorizationEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: AuthorizationEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
