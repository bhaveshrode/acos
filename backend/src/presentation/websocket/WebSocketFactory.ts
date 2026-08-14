import { ConnectionManager } from "./ConnectionManager.js";
import { MessageRouter } from "./MessageRouter.js";
import { MessageDispatcher } from "./MessageDispatcher.js";
import { WebSocketAuthenticator } from "./WebSocketAuthenticator.js";
import { SessionManager } from "./SessionManager.js";
import { SubscriptionManager } from "./SubscriptionManager.js";
import { ConnectionHandler } from "./ConnectionHandler.js";
import { HeartbeatHandler } from "./HeartbeatHandler.js";
import { NotificationSocketHandler } from "./NotificationSocketHandler.js";
import { WorkflowSocketHandler } from "./WorkflowSocketHandler.js";

/**
 * WebSocketFactory constructing routers, dispatchers, connection registries, and subscription modules.
 */
export class WebSocketFactory {
  public static createConnectionManager(): ConnectionManager {
    return new ConnectionManager();
  }

  public static createRouter(): MessageRouter {
    return new MessageRouter();
  }

  public static createDispatcher(): MessageDispatcher {
    return new MessageDispatcher();
  }

  public static createAuthenticator(tokenProvider?: any): WebSocketAuthenticator {
    return new WebSocketAuthenticator(tokenProvider);
  }

  public static createSessionManager(): SessionManager {
    return new SessionManager();
  }

  public static createSubscriptionManager(): SubscriptionManager {
    return new SubscriptionManager();
  }

  public static createConnectionHandler(manager: ConnectionManager): ConnectionHandler {
    return new ConnectionHandler(manager);
  }

  public static createHeartbeatHandler(): HeartbeatHandler {
    return new HeartbeatHandler();
  }

  public static createNotificationSocketHandler(dispatcher: MessageDispatcher): NotificationSocketHandler {
    return new NotificationSocketHandler(dispatcher);
  }

  public static createWorkflowSocketHandler(dispatcher: MessageDispatcher): WorkflowSocketHandler {
    return new WorkflowSocketHandler(dispatcher);
  }
}
