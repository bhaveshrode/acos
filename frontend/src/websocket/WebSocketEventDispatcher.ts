import { WebSocketLifecycleEvent } from "./WebSocketLifecycleEvent.js";

/**
 * WebSocketEventDispatcher distributing events to websocket observers.
 */
export class WebSocketEventDispatcher {
  private readonly listeners = new Set<(event: WebSocketLifecycleEvent) => void>();

  public dispatch(event: WebSocketLifecycleEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: WebSocketLifecycleEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
