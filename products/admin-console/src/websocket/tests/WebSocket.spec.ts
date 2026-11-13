import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebSocketState } from "../WebSocketState.js";
import { WebSocketMetadata } from "../WebSocketMetadata.js";
import { WebSocketContext } from "../WebSocketContext.js";
import { BaseWebSocketClient } from "../BaseWebSocketClient.js";
import { WebSocketDescriptor } from "../WebSocketDescriptor.js";
import { WebSocketRegistry } from "../WebSocketRegistry.js";
import { WebSocketResolver } from "../WebSocketResolver.js";
import { WebSocketMessage } from "../WebSocketMessage.js";
import { WebSocketChannel } from "../WebSocketChannel.js";
import { WebSocketChannelRegistry } from "../WebSocketChannelRegistry.js";
import { MessageDispatcher } from "../MessageDispatcher.js";
import { MessageReceiver } from "../MessageReceiver.js";
import { ConnectionManager } from "../ConnectionManager.js";
import { SubscriptionManager } from "../SubscriptionManager.js";
import { HeartbeatManager } from "../HeartbeatManager.js";
import { MessageBuffer } from "../MessageBuffer.js";
import { ConnectionStateManager } from "../ConnectionStateManager.js";
import { ReconnectionPolicy } from "../ReconnectionPolicy.js";
import { SessionRecoveryManager } from "../SessionRecoveryManager.js";
import { MessageSynchronizer } from "../MessageSynchronizer.js";
import { WebSocketLifecycleEvent } from "../WebSocketLifecycleEvent.js";
import { WebSocketEventDispatcher } from "../WebSocketEventDispatcher.js";
import { WebSocketObserver } from "../WebSocketObserver.js";
import { WebSocketFactory } from "../WebSocketFactory.js";

class TestWebSocketClient extends BaseWebSocketClient {
  public sentMessages: WebSocketMessage[] = [];

  protected onConnect(): void {
    this.state = WebSocketState.Connected;
  }

  protected onDisconnect(): void {
    this.state = WebSocketState.Disconnected;
  }

  protected onSend(message: WebSocketMessage): void {
    this.sentMessages.push(message);
  }
}

describe("Frontend WebSocket Component Unit Tests (Task 77.8)", () => {
  let context: WebSocketContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    const meta: WebSocketMetadata = { id: "ws-1", endpoint: "ws://localhost/acos" };
    context = new WebSocketContext(meta);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Contexts & Models", () => {
    it("should instantiate WebSocketContext and freeze arrays", () => {
      const meta: WebSocketMetadata = { id: "ws-1", endpoint: "ws://localhost/acos" };
      const ctx = new WebSocketContext(meta, ["conn-1"], ["topic-1"], ["req-1"]);

      expect(ctx.metadata.id).toBe("ws-1");
      expect(ctx.activeConnections).toContain("conn-1");
      expect(ctx.subscriptions).toContain("topic-1");
      expect(ctx.pendingRequests).toContain("req-1");
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.activeConnections)).toBe(true);
      expect(Object.isFrozen(ctx.subscriptions)).toBe(true);
      expect(Object.isFrozen(ctx.pendingRequests)).toBe(true);
    });

    it("should buffer offline messages and transition BaseWebSocketClient states", () => {
      const client = new TestWebSocketClient(context);
      expect(client.state).toBe(WebSocketState.Disconnected);

      const msg = new WebSocketMessage("test", "data");
      client.send(msg);
      expect(client.getBufferedMessages()).toContain(msg);

      client.connect();
      expect(client.state).toBe(WebSocketState.Connected);

      client.send(msg);
      expect(client.sentMessages).toContain(msg);

      client.disconnect();
      expect(client.state).toBe(WebSocketState.Closed);
    });
  });

  describe("Connection Definitions & Registry", () => {
    it("should register descriptors and freeze WebSocketRegistry", () => {
      const registry = new WebSocketRegistry();
      const meta: WebSocketMetadata = { id: "ws-1", endpoint: "ws://localhost/acos" };
      const descriptor = new WebSocketDescriptor(meta, TestWebSocketClient, ["events"]);

      registry.register(descriptor);
      expect(registry.get("ws-1")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "WebSocketRegistry is frozen and cannot accept further clients"
      );
    });

    it("should resolve client descriptors in WebSocketResolver", () => {
      const registry = new WebSocketRegistry();
      const meta: WebSocketMetadata = { id: "ws-1", endpoint: "ws://localhost/acos" };
      const descriptor = new WebSocketDescriptor(meta, TestWebSocketClient);
      registry.register(descriptor);

      const resolver = new WebSocketResolver(registry);
      expect(resolver.resolve("ws-1")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "WebSocket client with identifier missing is not registered"
      );
    });
  });

  describe("Messaging & Communication", () => {
    it("should register channels and freeze WebSocketChannelRegistry", () => {
      const channelRegistry = new WebSocketChannelRegistry();
      const channel = new WebSocketChannel("c-1", "System Channel");

      channelRegistry.register(channel);
      expect(channelRegistry.get("c-1")).toBe(channel);

      channelRegistry.freeze();
      expect(() => channelRegistry.register(channel)).toThrow("WebSocketChannelRegistry is frozen");
    });

    it("should dispatch and receive messages", () => {
      const client = new TestWebSocketClient(context);
      const dispatcher = new MessageDispatcher(client);
      const receiver = new MessageReceiver();

      let received: WebSocketMessage | null = null;
      receiver.subscribe((msg) => {
        received = msg;
      });

      const message = new WebSocketMessage("notify", "Hello");
      client.connect();

      dispatcher.dispatch(message);
      expect(client.sentMessages).toContain(message);

      receiver.receive(message);
      expect(received).toBe(message);
    });
  });

  describe("Connection & Subscription Management", () => {
    it("should route connect/disconnect in ConnectionManager", () => {
      const client = new TestWebSocketClient(context);
      const manager = new ConnectionManager(client);

      manager.connect();
      expect(client.state).toBe(WebSocketState.Connected);

      manager.disconnect();
      expect(client.state).toBe(WebSocketState.Closed);
    });

    it("should manage active topics in SubscriptionManager", () => {
      const manager = new SubscriptionManager();
      manager.subscribe("invoices");
      expect(manager.getSubscriptions()).toContain("invoices");

      manager.unsubscribe("invoices");
      expect(manager.getSubscriptions()).not.toContain("invoices");
    });

    it("should manage keep-alive in HeartbeatManager", () => {
      const manager = new HeartbeatManager();
      const pingFn = vi.fn();

      manager.startHeartbeat(pingFn, 500);
      vi.advanceTimersByTime(1000);

      expect(pingFn).toHaveBeenCalledTimes(2);
      manager.stopHeartbeat();
    });

    it("should cache messages offline in MessageBuffer", () => {
      const buffer = new MessageBuffer();
      const message = new WebSocketMessage("ping", null);

      buffer.push(message);
      expect(buffer.size()).toBe(1);
      expect(buffer.getBuffered()).toContain(message);

      buffer.clear();
      expect(buffer.size()).toBe(0);
    });
  });

  describe("Synchronization & Recovery", () => {
    it("should transition states in ConnectionStateManager", () => {
      const stateManager = new ConnectionStateManager();
      const client = new TestWebSocketClient(context);

      stateManager.transitionTo(client, WebSocketState.Reconnecting);
      expect(client.state).toBe(WebSocketState.Reconnecting);
    });

    it("should calculate delays in ReconnectionPolicy", () => {
      const policy = new ReconnectionPolicy(3, 500);
      expect(policy.shouldRetry(1)).toBe(true);
      expect(policy.shouldRetry(3)).toBe(false);

      expect(policy.getDelay(0)).toBe(500);
      expect(policy.getDelay(2)).toBe(2000);
    });

    it("should recover sessions and subscriptions", () => {
      const client = new TestWebSocketClient(context);
      const subManager = new SubscriptionManager();
      subManager.subscribe("alerts");

      const recovery = new SessionRecoveryManager(subManager);
      client.connect();

      recovery.recoverSession(client);
      expect(client.sentMessages[0].type).toBe("subscribe");
      expect(client.sentMessages[0].payload.topic).toBe("alerts");
    });

    it("should filter duplicate payloads in MessageSynchronizer", () => {
      const sync = new MessageSynchronizer();
      const msg = new WebSocketMessage("event", { id: "msg-123" });

      expect(sync.synchronize(msg)).toBe(true);
      expect(sync.synchronize(msg)).toBe(false); // Skip duplicate
    });
  });

  describe("Events & Observers", () => {
    it("should dispatch and observe lifecycle changes", () => {
      const dispatcher = new WebSocketEventDispatcher();
      const observer = new WebSocketObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.clientId).toBe("ws-100");
        expect(ev.type).toBe("reconnection");
      });

      dispatcher.dispatch(new WebSocketLifecycleEvent("ws-100", "reconnection"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new WebSocketLifecycleEvent("ws-100", "reconnection"));
      expect(count).toBe(1);
    });
  });

  describe("Factory", () => {
    it("should compose components in WebSocketFactory", () => {
      const factory = new WebSocketFactory();
      const registry = factory.createRegistry();
      expect(registry).toBeInstanceOf(WebSocketRegistry);
    });
  });
});
