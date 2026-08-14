import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConnectionState } from "../ConnectionState.js";
import { WebSocketContext } from "../WebSocketContext.js";
import { SocketMessage } from "../SocketMessage.js";
import { ConnectionRegistry } from "../ConnectionRegistry.js";
import { ConnectionManager } from "../ConnectionManager.js";
import { WebSocketAuthenticator } from "../WebSocketAuthenticator.js";
import { SessionManager } from "../SessionManager.js";
import { MessageRouter } from "../MessageRouter.js";
import { MessageDispatcher } from "../MessageDispatcher.js";
import { SubscriptionManager } from "../SubscriptionManager.js";
import { ConnectionHandler } from "../ConnectionHandler.js";
import { HeartbeatHandler } from "../HeartbeatHandler.js";
import { NotificationSocketHandler } from "../NotificationSocketHandler.js";
import { WorkflowSocketHandler } from "../WorkflowSocketHandler.js";
import { WebSocketFactory } from "../WebSocketFactory.js";

describe("Presentation WebSocket Component Tests (Task 53.8)", () => {
  beforeEach(() => {
    ConnectionRegistry.clear();
  });

  describe("Models & Contexts", () => {
    it("should initialize websocket context and socket messages correctly", () => {
      const msg = new SocketMessage("test:type", { val: 1 }, "corr-x");
      expect(msg.type).toBe("test:type");
      expect(msg.payload).toEqual({ val: 1 });
      expect(msg.correlationId).toBe("corr-x");

      const ctx = new WebSocketContext({
        connectionId: "conn-123",
        state: ConnectionState.Connected
      });
      expect(ctx.props.connectionId).toBe("conn-123");
      expect(ctx.props.state).toBe(ConnectionState.Connected);
    });
  });

  describe("Connection Management & Session managers", () => {
    it("should register active client connections in ConnectionRegistry", () => {
      const ctx = new WebSocketContext({
        connectionId: "conn-1",
        state: ConnectionState.Connected
      });
      const mockSocket = {};
      ConnectionRegistry.register("conn-1", mockSocket, ctx);

      expect(ConnectionRegistry.get("conn-1")?.socket).toBe(mockSocket);
      expect(ConnectionRegistry.getAll().length).toBe(1);

      ConnectionRegistry.unregister("conn-1");
      expect(ConnectionRegistry.get("conn-1")).toBeUndefined();
    });

    it("should track connection flows via ConnectionManager", () => {
      const manager = new ConnectionManager();
      const mockSocket = {};
      const context = manager.connect("conn-2", mockSocket);

      expect(context.props.connectionId).toBe("conn-2");
      expect(context.props.state).toBe(ConnectionState.Connected);
      expect(ConnectionRegistry.get("conn-2")).toBeDefined();

      manager.disconnect("conn-2");
      expect(ConnectionRegistry.get("conn-2")).toBeUndefined();
    });

    it("should associate active socket sessions by user ID", () => {
      const sessionManager = new SessionManager();
      const ctx1 = new WebSocketContext({
        connectionId: "c1",
        userId: "user-abc",
        state: ConnectionState.Authenticated
      });
      const ctx2 = new WebSocketContext({
        connectionId: "c2",
        userId: "user-xyz",
        state: ConnectionState.Authenticated
      });

      ConnectionRegistry.register("c1", {}, ctx1);
      ConnectionRegistry.register("c2", {}, ctx2);

      const res = sessionManager.getConnectionsForUser("user-abc");
      expect(res.length).toBe(1);
      expect(res[0].context.props.connectionId).toBe("c1");
    });
  });

  describe("Authentication & Handshake", () => {
    it("should validate credentials handshakes and upgrade contexts state properties", async () => {
      const auth = new WebSocketAuthenticator();
      const ctx = new WebSocketContext({
        connectionId: "conn-auth",
        state: ConnectionState.Connected
      });

      const success = await auth.authenticate(ctx, "valid-token");
      expect(success).toBe(true);
      expect(ctx.props.state).toBe(ConnectionState.Authenticated);
      expect(ctx.props.userId).toBe("user-123");
      expect(ctx.props.tenantId).toBe("tenant-456");

      const failure = await auth.authenticate(ctx, "invalid-token");
      expect(failure).toBe(false);
    });

    it("should utilize custom token providers if configured", async () => {
      const mockProvider = {
        validateToken: async (tok: string) => {
          if (tok === "custom-ok") return { userId: "custom-u", tenantId: "custom-t" };
          return null;
        }
      };
      const auth = new WebSocketAuthenticator(mockProvider);
      const ctx = new WebSocketContext({
        connectionId: "conn-custom",
        state: ConnectionState.Connected
      });

      const success = await auth.authenticate(ctx, "custom-ok");
      expect(success).toBe(true);
      expect(ctx.props.userId).toBe("custom-u");
    });
  });

  describe("Messaging & Topic Subscriptions channels", () => {
    it("should dispatch inbound socket messages via MessageRouter", async () => {
      const router = new MessageRouter();
      const mockHandler = vi.fn().mockResolvedValue(undefined);
      router.registerHandler("test:message", mockHandler);

      const msg = new SocketMessage("test:message", { text: "hello" });
      const ctx = new WebSocketContext({
        connectionId: "conn-route",
        state: ConnectionState.Connected
      });

      await router.route(msg, ctx);
      expect(mockHandler).toHaveBeenCalledWith(msg, ctx);
    });

    it("should send outbound payloads via MessageDispatcher", () => {
      const dispatcher = new MessageDispatcher();
      const mockSocket = {
        send: vi.fn()
      };
      const ctx = new WebSocketContext({
        connectionId: "conn-disp",
        state: ConnectionState.Connected
      });
      ConnectionRegistry.register("conn-disp", mockSocket, ctx);

      const msg = new SocketMessage("ping", {});
      dispatcher.send("conn-disp", msg);
      expect(mockSocket.send).toHaveBeenCalledWith(JSON.stringify(msg));

      dispatcher.broadcast(msg);
      expect(mockSocket.send).toHaveBeenCalledTimes(2);
    });

    it("should track topic memberships using SubscriptionManager", () => {
      const sub = new SubscriptionManager();
      sub.subscribe("topic-1", "conn-a");
      sub.subscribe("topic-1", "conn-b");

      expect(sub.getSubscribers("topic-1")).toEqual(["conn-a", "conn-b"]);

      sub.unsubscribe("topic-1", "conn-a");
      expect(sub.getSubscribers("topic-1")).toEqual(["conn-b"]);

      sub.unsubscribe("topic-1", "conn-b");
      expect(sub.getSubscribers("topic-1")).toEqual([]);
    });
  });

  describe("Handlers & Event monitors", () => {
    it("should hook connects via ConnectionHandler", () => {
      const manager = new ConnectionManager();
      const handler = new ConnectionHandler(manager);
      handler.handleConnect("c-handle", {});
      expect(ConnectionRegistry.get("c-handle")).toBeDefined();

      handler.handleDisconnect("c-handle");
      expect(ConnectionRegistry.get("c-handle")).toBeUndefined();
    });

    it("should monitor client keep-alive pings using HeartbeatHandler", () => {
      const handler = new HeartbeatHandler();
      const ctx = new WebSocketContext({
        connectionId: "c-hb",
        state: ConnectionState.Connected
      });
      ConnectionRegistry.register("c-hb", {}, ctx);

      expect(ctx.props.lastHeartbeat).toBeUndefined();
      handler.handlePing("c-hb");
      expect(ctx.props.lastHeartbeat).toBeInstanceOf(Date);
    });

    it("should stream domain notifications and workflow transition events to subscribers", () => {
      const dispatcher = new MessageDispatcher();
      const mockSocket = { send: vi.fn() };
      const ctx = new WebSocketContext({
        connectionId: "c-stream",
        state: ConnectionState.Connected
      });
      ConnectionRegistry.register("c-stream", mockSocket, ctx);

      const notificationHandler = new NotificationSocketHandler(dispatcher);
      notificationHandler.handleNotificationSent("user-123", { text: "Alert" });
      expect(mockSocket.send).toHaveBeenCalled();

      const workflowHandler = new WorkflowSocketHandler(dispatcher);
      workflowHandler.handleWorkflowTransition("work-7", "Approved");
      expect(mockSocket.send).toHaveBeenCalledTimes(2);
    });
  });

  describe("WebSocketFactory setups", () => {
    it("should construct all WebSocket instances cleanly", () => {
      const manager = WebSocketFactory.createConnectionManager();
      expect(manager).toBeInstanceOf(ConnectionManager);
      expect(WebSocketFactory.createRouter()).toBeInstanceOf(MessageRouter);
      expect(WebSocketFactory.createDispatcher()).toBeInstanceOf(MessageDispatcher);
      expect(WebSocketFactory.createAuthenticator()).toBeInstanceOf(WebSocketAuthenticator);
      expect(WebSocketFactory.createSessionManager()).toBeInstanceOf(SessionManager);
      expect(WebSocketFactory.createSubscriptionManager()).toBeInstanceOf(SubscriptionManager);
      expect(WebSocketFactory.createConnectionHandler(manager)).toBeInstanceOf(ConnectionHandler);
      expect(WebSocketFactory.createHeartbeatHandler()).toBeInstanceOf(HeartbeatHandler);
      expect(WebSocketFactory.createNotificationSocketHandler(new MessageDispatcher())).toBeInstanceOf(NotificationSocketHandler);
      expect(WebSocketFactory.createWorkflowSocketHandler(new MessageDispatcher())).toBeInstanceOf(WorkflowSocketHandler);
    });
  });
});
