import { IWebSocketFactory } from "./IWebSocketFactory.js";
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
 * WebSocketFactory implementing standard IWebSocketFactory composition roots.
 */
export class WebSocketFactory implements IWebSocketFactory {
  public static createRegistry(): WebSocketRegistry {
    return new WebSocketRegistry();
  }

  public static createResolver(registry: WebSocketRegistry): WebSocketResolver {
    return new WebSocketResolver(registry);
  }

  public static createChannelRegistry(): WebSocketChannelRegistry {
    return new WebSocketChannelRegistry();
  }

  public static createDispatcher(client: IWebSocketClient): MessageDispatcher {
    return new MessageDispatcher(client);
  }

  public static createReceiver(): MessageReceiver {
    return new MessageReceiver();
  }

  public static createConnectionManager(client: IWebSocketClient): ConnectionManager {
    return new ConnectionManager(client);
  }

  public static createSubscriptionManager(): SubscriptionManager {
    return new SubscriptionManager();
  }

  public static createHeartbeatManager(): HeartbeatManager {
    return new HeartbeatManager();
  }

  public static createMessageBuffer(): MessageBuffer {
    return new MessageBuffer();
  }

  public static createConnectionStateManager(): ConnectionStateManager {
    return new ConnectionStateManager();
  }

  public static createReconnectionPolicy(): ReconnectionPolicy {
    return new ReconnectionPolicy();
  }

  public static createSessionRecoveryManager(
    subscriptionManager: SubscriptionManager
  ): SessionRecoveryManager {
    return new SessionRecoveryManager(subscriptionManager);
  }

  public static createMessageSynchronizer(): MessageSynchronizer {
    return new MessageSynchronizer();
  }

  public static createLifecycleDispatcher(): WebSocketEventDispatcher {
    return new WebSocketEventDispatcher();
  }

  public static createObserver(
    dispatcher: WebSocketEventDispatcher
  ): WebSocketObserver {
    return new WebSocketObserver(dispatcher);
  }

  public createRegistry(): WebSocketRegistry {
    return WebSocketFactory.createRegistry();
  }

  public createResolver(registry: WebSocketRegistry): WebSocketResolver {
    return WebSocketFactory.createResolver(registry);
  }

  public createChannelRegistry(): WebSocketChannelRegistry {
    return WebSocketFactory.createChannelRegistry();
  }

  public createDispatcher(client: IWebSocketClient): MessageDispatcher {
    return WebSocketFactory.createDispatcher(client);
  }

  public createReceiver(): MessageReceiver {
    return WebSocketFactory.createReceiver();
  }

  public createConnectionManager(client: IWebSocketClient): ConnectionManager {
    return WebSocketFactory.createConnectionManager(client);
  }

  public createSubscriptionManager(): SubscriptionManager {
    return WebSocketFactory.createSubscriptionManager();
  }

  public createHeartbeatManager(): HeartbeatManager {
    return WebSocketFactory.createHeartbeatManager();
  }

  public createMessageBuffer(): MessageBuffer {
    return WebSocketFactory.createMessageBuffer();
  }

  public createConnectionStateManager(): ConnectionStateManager {
    return WebSocketFactory.createConnectionStateManager();
  }

  public createReconnectionPolicy(): ReconnectionPolicy {
    return WebSocketFactory.createReconnectionPolicy();
  }

  public createSessionRecoveryManager(
    subscriptionManager: SubscriptionManager
  ): SessionRecoveryManager {
    return WebSocketFactory.createSessionRecoveryManager(subscriptionManager);
  }

  public createMessageSynchronizer(): MessageSynchronizer {
    return WebSocketFactory.createMessageSynchronizer();
  }

  public createLifecycleDispatcher(): WebSocketEventDispatcher {
    return WebSocketFactory.createLifecycleDispatcher();
  }

  public createObserver(
    dispatcher: WebSocketEventDispatcher
  ): WebSocketObserver {
    return WebSocketFactory.createObserver(dispatcher);
  }
}
