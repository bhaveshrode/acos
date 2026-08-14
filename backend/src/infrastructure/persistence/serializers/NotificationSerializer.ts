import { Notification } from "../../../business/notification/aggregates/Notification.js";
import { NotificationSnapshot } from "../snapshots/NotificationSnapshot.js";

/**
 * Serializes Notification aggregate root into NotificationSnapshot models.
 */
export class NotificationSerializer {
  public static serialize(aggregate: Notification): NotificationSnapshot {
    return {
      id: aggregate.id.value,
      organizationId: aggregate.organizationId.value,
      reference: aggregate.reference.value,
      subject: aggregate.subject,
      body: aggregate.body,
      priority: aggregate.priority,
      status: aggregate.status,
      scheduledTime: aggregate.scheduledTime,
      maxRetries: aggregate.retryPolicy.maxRetries,
      retryIntervalSeconds: aggregate.retryPolicy.retryIntervalSeconds,
      recipients: aggregate.recipients.map((r) => ({
        id: r.id.value,
        userId: r.userId ? r.userId.value : null,
        email: r.email ? r.email.value : null,
        phone: r.phone ? r.phone.value : null,
        channelPreferences: r.channelPreferences
      })),
      attachments: aggregate.attachments.map((a) => ({
        id: a.id.value,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        mimeType: a.mimeType
      })),
      deliveryAttempts: aggregate.deliveryAttempts.map((d) => ({
        id: d.id.value,
        channel: d.channel,
        timestamp: d.timestamp,
        providerResponse: d.providerResponse,
        status: d.status,
        retryCount: d.retryCount,
        metadata: d.metadata.value
      })),
      readReceipts: aggregate.readReceipts.map((rd) => ({
        id: rd.id.value,
        readAt: rd.readAt,
        channel: rd.channel,
        readerId: rd.readerId ? rd.readerId.value : null
      })),
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
