import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { SendNotificationCommand } from "../commands/SendNotificationCommand.js";

/**
 * Request validator checking fields structures and bounds for dispatching a Notification.
 */
export class SendNotificationCommandValidator
  implements IRequestValidator<SendNotificationCommand>
{
  public validate(request: SendNotificationCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.organizationId || dto.organizationId.trim() === "") {
      errors.push("Organization ID is required.");
    }

    if (!dto.reference || dto.reference.trim() === "") {
      errors.push("Notification reference is required.");
    } else if (!dto.reference.trim().toUpperCase().startsWith("NTF-")) {
      errors.push(`Invalid reference format: '${dto.reference}'. References must start with 'NTF-'.`);
    }

    if (!dto.subject || dto.subject.trim() === "") {
      errors.push("Notification subject is required.");
    }

    if (!dto.body || dto.body.trim() === "") {
      errors.push("Notification body is required.");
    }

    if (!dto.priority || dto.priority.trim() === "") {
      errors.push("Notification priority is required.");
    }

    if (!dto.recipients || dto.recipients.length === 0) {
      errors.push("At least one recipient must be defined.");
    } else {
      dto.recipients.forEach((rec, index) => {
        if (!rec.channelPreferences || rec.channelPreferences.length === 0) {
          errors.push(`Recipient ${index + 1}: At least one channel preference is required.`);
        }
        if (!rec.userId && !rec.email && !rec.phone) {
          errors.push(
            `Recipient ${index + 1}: Must provide either a userId, email address, or phone number.`
          );
        }
      });
    }

    return errors;
  }
}
