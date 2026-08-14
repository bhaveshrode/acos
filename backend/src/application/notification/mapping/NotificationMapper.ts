import { IMapper } from "../../foundation/mapping/IMapper.js";
import { Notification } from "../../../business/notification/aggregates/Notification.js";
import { NotificationResponseDto } from "../dto/NotificationResponseDto.js";

/**
 * Mapper helper converting Notification entities into presentation NotificationResponseDto models.
 */
export class NotificationMapper implements IMapper<Notification, NotificationResponseDto> {
  public map(source: Notification): NotificationResponseDto {
    return {
      id: source.id.value,
      organizationId: source.organizationId.value,
      reference: source.reference.value,
      subject: source.subject.value,
      body: source.body.value,
      status: source.status,
      priority: source.priority.value,
      scheduledTime: source.scheduledTime.value.toISOString(),
      recipients: source.recipients.map((rec) => ({
        userId: rec.userId ? rec.userId.value : null,
        email: rec.email ? rec.email.value : null,
        phone: rec.phone ? rec.phone.value : null,
        channelPreferences: rec.channelPreferences.map((c) => c)
      })),
      createdAt: source.createdAt.toISOString()
    };
  }
}
