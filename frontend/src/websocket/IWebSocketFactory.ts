import { WebSocketRegistry } from "./WebSocketRegistry.js";
import { WebSocketResolver } from "./WebSocketResolver.js";
import { WebSocketChannelRegistry } from "./WebSocketChannelRegistry.js";
import { MessageDispatcher } from "./MessageDispatcher.js";
import { MessageReceiver } from "./MessageReceiver.js";
import { ConnectionManager } from "./ConnectionManager.js";
import { SubscriptionManager } from "./SubscriptionManager.js";
import { HeartbeatManager } from "./HeartbeatManager.js";
import { MessageBuffer } from "./MessageBuffer.js";
import { ConnectionStateManager } from "./ConnectionStateManager.js";
import { ReconnectionPolicy } from "./ReconnectionPolicy.js";
import { SessionRecoveryManager } from "./SessionRecoveryManager.js";
import { MessageSynchronizer } from "./MessageSynchronizer.js";
import { WebSocketEventDispatcher } from "./WebSocketEventDispatcher.js";
import { WebSocketObserver } from "./WebSocketObserver.js";
import { IWebSocketClient } from "./IWebSocketClient.js";

/**
 * IWebSocketFactory interface defining client components composition contracts.
 */
export interface IWebSocketFactory {
  createRegistry(): WebSocketRegistry;
  createResolver(registry: WebSocketRegistry): WebSocketResolver;
  createChannelRegistry(): WebSocketChannelRegistry;
  createDispatcher(client: IWebSocketClient): MessageDispatcher;
  createReceiver(): MessageReceiver;
  createConnectionManager(client: IWebSocketClient): ConnectionManager;
  createSubscriptionManager(): SubscriptionManager;
  createHeartbeatManager(): HeartbeatManager;
  createMessageBuffer(): MessageBuffer;
  createConnectionStateManager(): ConnectionStateManager;
  createReconnectionPolicy(): ReconnectionPolicy;
  createSessionRecoveryManager(
    subscriptionManager: SubscriptionManager
  ): SessionRecoveryManager;
  createMessageSynchronizer(): MessageSynchronizer;
  createLifecycleDispatcher(): WebSocketEventDispatcher;
  createObserver(dispatcher: WebSocketEventDispatcher): WebSocketObserver;
}
