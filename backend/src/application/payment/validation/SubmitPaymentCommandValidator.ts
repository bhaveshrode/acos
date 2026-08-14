import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { SubmitPaymentCommand } from "../commands/SubmitPaymentCommand.js";

/**
 * Request validator checking fields structures and bounds for submitting a Payment.
 */
export class SubmitPaymentCommandValidator
  implements IRequestValidator<SubmitPaymentCommand>
{
  public validate(request: SubmitPaymentCommand): string[] {
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

    if (!dto.reference || dto.reference.trim() === "") {
      errors.push("Payment reference is required.");
    } else if (!dto.reference.trim().toUpperCase().startsWith("PAY-")) {
      errors.push(`Invalid reference format: '${dto.reference}'. References must start with 'PAY-'.`);
    }

    if (dto.amount <= 0) {
      errors.push("Payment amount must be greater than zero.");
    }

    if (!dto.currency || dto.currency.trim().length < 3 || dto.currency.trim().length > 6) {
      errors.push("Currency must be a 3- to 6-letter ticker code.");
    }

    if (!dto.invoiceId || dto.invoiceId.trim() === "") {
      errors.push("Allocation invoice ID is required.");
    }

    if (dto.allocatedAmount <= 0) {
      errors.push("Allocated amount must be greater than zero.");
    } else if (dto.allocatedAmount > dto.amount) {
      errors.push("Allocated amount cannot exceed total payment amount.");
    }

    return errors;
  }
}
