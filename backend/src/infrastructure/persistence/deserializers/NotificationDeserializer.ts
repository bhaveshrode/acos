import { NotificationSnapshot } from "../snapshots/NotificationSnapshot.js";
import { NotificationProps } from "../../../business/notification/aggregates/Notification.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { NotificationReference } from "../../../business/notification/value-objects/NotificationReference.js";
import { NotificationSubject } from "../../../business/notification/value-objects/NotificationSubject.js";
import { NotificationBody } from "../../../business/notification/value-objects/NotificationBody.js";
import { NotificationPriority } from "../../../business/notification/value-objects/NotificationPriority.js";
import { NotificationStatus } from "../../../business/notification/enums/NotificationStatus.js";
import { ScheduledTime } from "../../../business/notification/value-objects/ScheduledTime.js";
import { RetryPolicy } from "../../../business/notification/value-objects/RetryPolicy.js";
import { Recipient } from "../../../business/notification/entities/Recipient.js";
import { RecipientAddress } from "../../../business/notification/value-objects/RecipientAddress.js";
import { ChannelType } from "../../../business/notification/enums/ChannelType.js";
import { NotificationAttachment } from "../../../business/notification/entities/NotificationAttachment.js";
import { DeliveryAttempt } from "../../../business/notification/entities/DeliveryAttempt.js";
import { DeliveryResult } from "../../../business/notification/enums/DeliveryResult.js";
import { DeliveryMetadata } from "../../../business/notification/value-objects/DeliveryMetadata.js";
import { ReadReceipt } from "../../../business/notification/entities/ReadReceipt.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs NotificationProps domain structure from NotificationSnapshot persistence models.
 */
export class NotificationDeserializer {
  public static deserialize(snapshot: NotificationSnapshot): NotificationProps {
    const recipients = snapshot.recipients.map(
      (r) =>
        new Recipient(new UniqueEntityID(r.id), {
          userId: r.userId ? new UserId(new UniqueEntityID(r.userId)) : null,
          email: r.email ? RecipientAddress.create(r.email).value : null,
          phone: r.phone ? RecipientAddress.create(r.phone).value : null,
          channelPreferences: r.channelPreferences as ChannelType[]
        })
    );

    const attachments = snapshot.attachments.map(
      (a) =>
        new NotificationAttachment(new UniqueEntityID(a.id), {
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          mimeType: a.mimeType
        })
    );

    const deliveryAttempts = snapshot.deliveryAttempts.map(
      (d) =>
        new DeliveryAttempt(new UniqueEntityID(d.id), {
          channel: d.channel as ChannelType,
          timestamp: d.timestamp,
          providerResponse: d.providerResponse,
          status: d.status as DeliveryResult,
          retryCount: d.retryCount,
          metadata: DeliveryMetadata.create(d.metadata).value
        })
    );

    const readReceipts = snapshot.readReceipts.map(
      (rd) =>
        new ReadReceipt(new UniqueEntityID(rd.id), {
          readAt: rd.readAt,
          channel: rd.channel as ChannelType,
          readerId: rd.readerId ? new UserId(new UniqueEntityID(rd.readerId)) : null
        })
    );

    return {
      organizationId: new OrganizationId(new UniqueEntityID(snapshot.organizationId)),
      reference: NotificationReference.create(snapshot.reference).value,
      subject: NotificationSubject.create(snapshot.subject).value,
      body: NotificationBody.create(snapshot.body).value,
      priority: snapshot.priority as NotificationPriority,
      status: snapshot.status as NotificationStatus,
      scheduledTime: ScheduledTime.create(snapshot.scheduledTime).value,
      retryPolicy: RetryPolicy.create(snapshot.maxRetries, snapshot.retryIntervalSeconds).value,
      recipients,
      attachments,
      deliveryAttempts,
      readReceipts,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
