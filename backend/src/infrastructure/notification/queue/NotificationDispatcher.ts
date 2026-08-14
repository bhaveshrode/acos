import { NotificationQueue } from "./NotificationQueue.js";
import { EmailChannel } from "../channels/EmailChannel.js";
import { SmsChannel } from "../channels/SmsChannel.js";

/**
 * Worker class polling the in-memory queue and routing items to active communication channels.
 */
export class NotificationDispatcher {
  constructor(
    private readonly emailChannel: EmailChannel,
    private readonly smsChannel: SmsChannel
  ) {}

  /**
   * Processes all pending or failed notification jobs in the queue synchronously/asynchronously.
   */
  public async processPending(): Promise<void> {
    const pending = NotificationQueue.getPending();
    for (const item of pending) {
      try {
        NotificationQueue.updateStatus(item.id, "SENDING");
        let result;
        if (item.type === "email") {
          result = await this.emailChannel.send(item.data);
        } else {
          result = await this.smsChannel.send(item.data);
        }

        if (result.isSuccess) {
          NotificationQueue.updateStatus(item.id, "DELIVERED");
        } else {
          NotificationQueue.updateStatus(item.id, "FAILED", result.error.message);
        }
      } catch (err: any) {
        NotificationQueue.updateStatus(item.id, "FAILED", err.message || "Unknown delivery failure");
      }
    }
  }
}
