import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { SendNotificationRequestDto } from "../dto/SendNotificationRequestDto.js";
import { NotificationResponseDto } from "../dto/NotificationResponseDto.js";

/**
 * Command to request dispatching or scheduling a Notification.
 */
export class SendNotificationCommand
  implements ICommand<ApplicationResult<NotificationResponseDto>>
{
  constructor(public readonly dto: SendNotificationRequestDto) {}
}
