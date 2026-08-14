import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetNotificationByIdQuery } from "../queries/GetNotificationByIdQuery.js";
import { NotificationResponseDto } from "../dto/NotificationResponseDto.js";
import { INotificationRepository } from "../../../business/notification/repositories/INotificationRepository.js";
import { NotificationMapper } from "../mapping/NotificationMapper.js";
import { NotificationId } from "../../../business/notification/value-objects/NotificationId.js";

/**
 * Use case handler reading a Notification by ID.
 */
export class GetNotificationByIdQueryHandler
  implements IRequestHandler<GetNotificationByIdQuery, ApplicationResult<NotificationResponseDto>>
{
  constructor(
    private readonly repository: INotificationRepository,
    private readonly mapper: NotificationMapper
  ) {}

  public async handle(
    request: GetNotificationByIdQuery
  ): Promise<ApplicationResult<NotificationResponseDto>> {
    const ntfId = NotificationId.from(request.id);
    const loadRes = await this.repository.findById(ntfId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
