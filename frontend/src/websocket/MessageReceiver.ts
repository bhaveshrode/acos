import { WebSocketMessage } from "./WebSocketMessage.js";

/**
 * MessageReceiver processing incoming messages and routing to subscribers.
 */
export class MessageReceiver {
  private readonly subscribers = new Set<(message: WebSocketMessage) => void>();

  public receive(message: WebSocketMessage): void {
    for (const sub of this.subscribers) {
      sub(message);
    }
  }

  public subscribe(callback: (message: WebSocketMessage) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
}
