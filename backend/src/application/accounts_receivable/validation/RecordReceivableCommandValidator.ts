import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { RecordReceivableCommand } from "../commands/RecordReceivableCommand.js";

/**
 * Request validator checking fields structures and bounds for recording a Receivable entry.
 */
export class RecordReceivableCommandValidator
  implements IRequestValidator<RecordReceivableCommand>
{
  public validate(request: RecordReceivableCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.organizationId || dto.organizationId.trim() === "") {
      errors.push("Organization ID is required.");
    }

    if (!dto.customerId || dto.customerId.trim() === "") {
      errors.push("Customer ID is required.");
    }

    if (!dto.invoiceId || dto.invoiceId.trim() === "") {
      errors.push("Invoice ID is required.");
    }

    if (dto.amount <= 0) {
      errors.push("Receivable amount must be greater than zero.");
    }

    if (!dto.currency || dto.currency.trim().length < 3 || dto.currency.trim().length > 6) {
      errors.push("Currency must be a 3- to 6-letter ticker code.");
    }

    if (!dto.dueDate || dto.dueDate.trim() === "") {
      errors.push("Due date is required.");
    }

    return errors;
  }
}
