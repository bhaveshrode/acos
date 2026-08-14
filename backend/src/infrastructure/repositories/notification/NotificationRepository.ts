import { INotificationRepository } from "../../../business/notification/repositories/INotificationRepository.js";
import { BaseRepository } from "../base/BaseRepository.js";
import { Notification } from "../../../business/notification/aggregates/Notification.js";
import { NotificationId } from "../../../business/notification/value-objects/NotificationId.js";
import { NotificationReference } from "../../../business/notification/value-objects/NotificationReference.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { NotificationSerializer } from "../../persistence/serializers/NotificationSerializer.js";
import { NotificationHydrator } from "../../persistence/hydrators/NotificationHydrator.js";

/**
 * Concrete infrastructure repository implementing Notification persistence operations.
 */
export class NotificationRepository extends BaseRepository implements INotificationRepository {
  public async findById(id: NotificationId): Promise<Result<Notification>> {
    try {
      const row = await (this.prisma as any).notification.findUnique({
        where: { id: id.value }
      });
      if (!row) {
        return Result.fail(ResultError.notFound(`Notification with ID ${id.value} not found.`));
      }

      const recipients = await (this.prisma as any).notificationRecipient.findMany({
        where: { notificationId: id.value }
      });
      const attachments = await (this.prisma as any).notificationAttachment.findMany({
        where: { notificationId: id.value }
      });
      const deliveryAttempts = await (this.prisma as any).deliveryAttempt.findMany({
        where: { notificationId: id.value }
      });
      const readReceipts = await (this.prisma as any).readReceipt.findMany({
        where: { notificationId: id.value }
      });

      const snapshot = {
        id: row.id,
        organizationId: row.organizationId,
        reference: row.reference,
        subject: row.subject,
        body: row.body,
        priority: row.priority,
        status: row.status,
        scheduledTime: row.scheduledTime,
        maxRetries: row.maxRetries,
        retryIntervalSeconds: row.retryIntervalSeconds,
        recipients: recipients.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          email: r.email,
          phone: r.phone,
          channelPreferences: r.channelPreferences
        })),
        attachments: attachments.map((a: any) => ({
          id: a.id,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          mimeType: a.mimeType
        })),
        deliveryAttempts: deliveryAttempts.map((da: any) => ({
          id: da.id,
          channel: da.channel,
          timestamp: da.timestamp,
          providerResponse: da.providerResponse,
          status: da.status,
          retryCount: da.retryCount,
          metadata: da.metadata
        })),
        readReceipts: readReceipts.map((rr: any) => ({
          id: rr.id,
          readAt: rr.readAt,
          channel: rr.channel,
          readerId: rr.readerId
        })),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };

      const aggregate = NotificationHydrator.hydrate(snapshot);
      return Result.ok(aggregate);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByReference(orgId: OrganizationId, ref: NotificationReference): Promise<Result<Notification>> {
    try {
      const row = await (this.prisma as any).notification.findFirst({
        where: {
          organizationId: orgId.value,
          reference: ref.value
        }
      });
      if (!row) {
        return Result.fail(
          ResultError.notFound(
            `Notification with reference ${ref.value} under organization ${orgId.value} not found.`
          )
        );
      }

      return this.findById(new NotificationId(row.id));
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findByRecipient(orgId: OrganizationId, userId: UserId): Promise<Result<Notification[]>> {
    try {
      const recipientRows = await (this.prisma as any).notificationRecipient.findMany({
        where: { userId: userId.value }
      });

      const notificationIds = Array.from(new Set(recipientRows.map((r: any) => r.notificationId)));
      const aggregates: Notification[] = [];

      for (const nid of notificationIds) {
        const res = await this.findById(new NotificationId(nid));
        if (res.isSuccess && res.value.organizationId.value === orgId.value) {
          aggregates.push(res.value);
        }
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async findPending(orgId: OrganizationId): Promise<Result<Notification[]>> {
    try {
      const rows = await (this.prisma as any).notification.findMany({
        where: {
          organizationId: orgId.value,
          status: { in: ["PENDING", "SCHEDULED"] }
        }
      });

      const aggregates: Notification[] = [];
      for (const row of rows) {
        const res = await this.findById(new NotificationId(row.id));
        if (res.isSuccess) {
          aggregates.push(res.value);
        }
      }

      return Result.ok(aggregates);
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async save(notification: Notification): Promise<Result<void>> {
    try {
      const snapshot = NotificationSerializer.serialize(notification);

      const row = {
        id: snapshot.id,
        organizationId: snapshot.organizationId,
        reference: snapshot.reference,
        subject: snapshot.subject,
        body: snapshot.body,
        priority: snapshot.priority,
        status: snapshot.status,
        scheduledTime: snapshot.scheduledTime,
        maxRetries: snapshot.maxRetries,
        retryIntervalSeconds: snapshot.retryIntervalSeconds,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt
      };

      const recipients = snapshot.recipients.map((r) => ({
        id: r.id,
        notificationId: snapshot.id,
        userId: r.userId,
        email: r.email,
        phone: r.phone,
        channelPreferences: r.channelPreferences
      }));

      const attachments = snapshot.attachments.map((a) => ({
        id: a.id,
        notificationId: snapshot.id,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        mimeType: a.mimeType
      }));

      const deliveryAttempts = snapshot.deliveryAttempts.map((da) => ({
        id: da.id,
        notificationId: snapshot.id,
        channel: da.channel,
        timestamp: da.timestamp,
        providerResponse: da.providerResponse,
        status: da.status,
        retryCount: da.retryCount,
        metadata: da.metadata
      }));

      const readReceipts = snapshot.readReceipts.map((rr) => ({
        id: rr.id,
        notificationId: snapshot.id,
        readAt: rr.readAt,
        channel: rr.channel,
        readerId: rr.readerId
      }));

      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.notification.upsert({
          where: { id: row.id },
          create: row,
          update: row
        });

        // Sync recipients
        await txPrisma.notificationRecipient.deleteMany({ where: { notificationId: row.id } });
        if (recipients.length > 0) {
          await txPrisma.notificationRecipient.createMany({ data: recipients });
        }

        // Sync attachments
        await txPrisma.notificationAttachment.deleteMany({ where: { notificationId: row.id } });
        if (attachments.length > 0) {
          await txPrisma.notificationAttachment.createMany({ data: attachments });
        }

        // Sync delivery attempts
        await txPrisma.deliveryAttempt.deleteMany({ where: { notificationId: row.id } });
        if (deliveryAttempts.length > 0) {
          await txPrisma.deliveryAttempt.createMany({ data: deliveryAttempts });
        }

        // Sync read receipts
        await txPrisma.readReceipt.deleteMany({ where: { notificationId: row.id } });
        if (readReceipts.length > 0) {
          await txPrisma.readReceipt.createMany({ data: readReceipts });
        }
      });

      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }

  public async delete(id: NotificationId): Promise<Result<void>> {
    try {
      await this.context.transaction(async (txContext) => {
        const txPrisma = txContext.client as any;
        await txPrisma.notificationRecipient.deleteMany({ where: { notificationId: id.value } });
        await txPrisma.notificationAttachment.deleteMany({ where: { notificationId: id.value } });
        await txPrisma.deliveryAttempt.deleteMany({ where: { notificationId: id.value } });
        await txPrisma.readReceipt.deleteMany({ where: { notificationId: id.value } });
        await txPrisma.notification.delete({ where: { id: id.value } });
      });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(ResultError.unexpected(error.message));
    }
  }
}
