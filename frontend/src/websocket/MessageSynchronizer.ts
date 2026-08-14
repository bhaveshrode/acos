import { WebSocketMessage } from "./WebSocketMessage.js";

/**
 * MessageSynchronizer filtering duplicate frames to sync states.
 */
export class MessageSynchronizer {
  private readonly processedIds = new Set<string>();

  public synchronize(message: WebSocketMessage): boolean {
    const msgId =
      (message.payload && message.payload.id) || `${message.type}:${message.timestamp}`;
    if (this.processedIds.has(msgId)) {
      return false;
    }
    this.processedIds.add(msgId);
    return true;
  }
}
