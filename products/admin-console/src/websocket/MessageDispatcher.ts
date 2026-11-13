import { WebSocketMessage } from "./WebSocketMessage.js";
import { IWebSocketClient } from "./IWebSocketClient.js";

/**
 * MessageDispatcher delivering outgoing messages.
 */
export class MessageDispatcher {
  constructor(private readonly client: IWebSocketClient) {}

  public dispatch(message: WebSocketMessage): void {
    this.client.send(message);
  }
}
