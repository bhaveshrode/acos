import { AuthenticationEvent } from "./AuthenticationEvent.js";

/**
 * AuthenticationEventDispatcher broadcasting authentication events to subscribers.
 */
export class AuthenticationEventDispatcher {
  private readonly listeners = new Set<(event: AuthenticationEvent) => void>();

  public dispatch(event: AuthenticationEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: AuthenticationEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
