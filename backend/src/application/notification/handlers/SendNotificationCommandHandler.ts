import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { SendNotificationCommand } from "../commands/SendNotificationCommand.js";
import { NotificationResponseDto } from "../dto/NotificationResponseDto.js";
import { INotificationRepository } from "../../../business/notification/repositories/INotificationRepository.js";
import { NotificationMapper } from "../mapping/NotificationMapper.js";

// Domain imports
import { Notification } from "../../../business/notification/aggregates/Notification.js";
import { NotificationId } from "../../../business/notification/value-objects/NotificationId.js";
import { NotificationReference } from "../../../business/notification/value-objects/NotificationReference.js";
import { NotificationSubject } from "../../../business/notification/value-objects/NotificationSubject.js";
import { NotificationBody } from "../../../business/notification/value-objects/NotificationBody.js";
import { NotificationPriority } from "../../../business/notification/value-objects/NotificationPriority.js";
import { Priority } from "../../../business/notification/enums/Priority.js";
import { ScheduledTime } from "../../../business/notification/value-objects/ScheduledTime.js";
import { RetryPolicy } from "../../../business/notification/value-objects/RetryPolicy.js";
import { Recipient } from "../../../business/notification/entities/Recipient.js";
import { RecipientAddress } from "../../../business/notification/value-objects/RecipientAddress.js";
import { ChannelType } from "../../../business/notification/enums/ChannelType.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Use case handler scheduling or sending a Notification.
 */
export class SendNotificationCommandHandler
  implements IRequestHandler<SendNotificationCommand, ApplicationResult<NotificationResponseDto>>
{
  constructor(
    private readonly repository: INotificationRepository,
    private readonly mapper: NotificationMapper
  ) {}

  public async handle(
    request: SendNotificationCommand
  ): Promise<ApplicationResult<NotificationResponseDto>> {
    const { dto } = request;

    const orgId = OrganizationId.from(dto.organizationId);

    // Validate business reference format
    const refRes = NotificationReference.create(dto.reference);
    if (refRes.isFailure) return ApplicationResult.failure(refRes.error.message);

    // Check duplicate reference
    const existsRes = await this.repository.findByReference(orgId, refRes.value);
    if (existsRes.isSuccess && existsRes.value) {
      return ApplicationResult.failure(
        `Notification reference '${dto.reference}' already exists in this organization.`
      );
    }

    // Validate textual content VOs
    const subjectRes = NotificationSubject.create(dto.subject);
    if (subjectRes.isFailure) return ApplicationResult.failure(subjectRes.error.message);

    const bodyRes = NotificationBody.create(dto.body);
    if (bodyRes.isFailure) return ApplicationResult.failure(bodyRes.error.message);

    const priorityRes = NotificationPriority.create(dto.priority as Priority);
    if (priorityRes.isFailure) return ApplicationResult.failure(priorityRes.error.message);

    const scheduledTimeRes = ScheduledTime.create(
      dto.scheduledTime ? new Date(dto.scheduledTime) : new Date()
    );
    if (scheduledTimeRes.isFailure) return ApplicationResult.failure(scheduledTimeRes.error.message);

    const retryRes = RetryPolicy.create(
      dto.maxRetries !== undefined ? dto.maxRetries : 3,
      dto.retryIntervalSeconds !== undefined ? dto.retryIntervalSeconds : 30
    );
    if (retryRes.isFailure) return ApplicationResult.failure(retryRes.error.message);

    // Instantiate child recipient entities
    const recipients: Recipient[] = [];
    for (const r of dto.recipients) {
      const emailVO = r.email ? RecipientAddress.create(r.email).value : null;
      const phoneVO = r.phone ? RecipientAddress.create(r.phone).value : null;
      const userIdVO = r.userId ? UserId.from(r.userId) : null;

      const rec = new Recipient(new UniqueEntityID(), {
        userId: userIdVO,
        email: emailVO,
        phone: phoneVO,
        channelPreferences: r.channelPreferences as ChannelType[]
      });
      recipients.push(rec);
    }

    // Create Notification aggregate
    const notificationRes = Notification.create(
      NotificationId.generate(),
      orgId,
      refRes.value,
      subjectRes.value,
      bodyRes.value,
      priorityRes.value,
      scheduledTimeRes.value,
      retryRes.value,
      recipients
    );

    if (notificationRes.isFailure) return ApplicationResult.failure(notificationRes.error.message);
    const notification = notificationRes.value;

    // Save and commit state
    const saveRes = await this.repository.save(notification);
    if (saveRes.isFailure) return ApplicationResult.failure(saveRes.error.message);

    return ApplicationResult.success(this.mapper.map(notification));
  }
}
