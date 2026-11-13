import { IWebSocketClient } from "./IWebSocketClient.js";
import { WebSocketState } from "./WebSocketState.js";

/**
 * ConnectionStateManager transitioning connection states.
 */
export class ConnectionStateManager {
  public transitionTo(client: IWebSocketClient, nextState: WebSocketState): void {
    (client as any).state = nextState;
  }
}
