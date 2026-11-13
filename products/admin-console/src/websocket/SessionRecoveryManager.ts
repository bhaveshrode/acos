import { SubscriptionManager } from "./SubscriptionManager.js";
import { IWebSocketClient } from "./IWebSocketClient.js";
import { WebSocketMessage } from "./WebSocketMessage.js";

/**
 * SessionRecoveryManager re-subscribing channels on reconnects.
 */
export class SessionRecoveryManager {
  constructor(private readonly subscriptionManager: SubscriptionManager) {}

  public recoverSession(client: IWebSocketClient): void {
    const active = this.subscriptionManager.getSubscriptions();
    for (const topic of active) {
      client.send(new WebSocketMessage("subscribe", { topic }, "system"));
    }
  }
}
