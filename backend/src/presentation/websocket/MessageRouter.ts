import { SocketMessage } from "./SocketMessage.js";
import { WebSocketContext } from "./WebSocketContext.js";

export type MessageHandler = (message: SocketMessage, context: WebSocketContext) => Promise<void>;

/**
 * MessageRouter dispatching incoming WebSocket messages to handlers.
 */
export class MessageRouter {
  private handlers = new Map<string, MessageHandler>();

  public registerHandler(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  public async route(message: SocketMessage, context: WebSocketContext): Promise<void> {
    const handler = this.handlers.get(message.type);
    if (handler) {
      await handler(message, context);
    }
  }
}
