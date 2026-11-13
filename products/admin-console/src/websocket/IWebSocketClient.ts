import { WebSocketMessage } from "./WebSocketMessage.js";
import { WebSocketState } from "./WebSocketState.js";

/**
 * IWebSocketClient interface defining connects and frame transmissions.
 */
export interface IWebSocketClient {
  state: WebSocketState;
  connect(): void;
  disconnect(): void;
  send(message: WebSocketMessage): void;
}
