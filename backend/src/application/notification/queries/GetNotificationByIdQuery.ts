import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { NotificationResponseDto } from "../dto/NotificationResponseDto.js";

/**
 * Query to request loading Notification status details by ID.
 */
export class GetNotificationByIdQuery
  implements IQuery<ApplicationResult<NotificationResponseDto>>
{
  constructor(public readonly id: string) {}
}
