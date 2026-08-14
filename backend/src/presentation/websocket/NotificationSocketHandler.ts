import { MessageDispatcher } from "./MessageDispatcher.js";
import { SocketMessage } from "./SocketMessage.js";

/**
 * NotificationSocketHandler streaming event updates.
 */
export class NotificationSocketHandler {
  constructor(private readonly dispatcher: MessageDispatcher) {}

  public handleNotificationSent(userId: string, notification: any): void {
    const message = new SocketMessage("notification:sent", notification);
    this.dispatcher.broadcast(message);
  }
}
