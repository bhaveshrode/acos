import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { ProcessSettlementCommand } from "../commands/ProcessSettlementCommand.js";

/**
 * Request validator checking fields structures and bounds for processing a Settlement.
 */
export class ProcessSettlementCommandValidator
  implements IRequestValidator<ProcessSettlementCommand>
{
  public validate(request: ProcessSettlementCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.organizationId || dto.organizationId.trim() === "") {
      errors.push("Organization ID is required.");
    }

    if (!dto.paymentId || dto.paymentId.trim() === "") {
      errors.push("Payment ID is required.");
    }

    if (!dto.reference || dto.reference.trim() === "") {
      errors.push("Settlement reference is required.");
    } else if (!dto.reference.trim().toUpperCase().startsWith("SET-")) {
      errors.push(`Invalid reference format: '${dto.reference}'. References must start with 'SET-'.`);
    }

    if (dto.amount <= 0) {
      errors.push("Settlement amount must be greater than zero.");
    }

    if (!dto.currency || dto.currency.trim().length < 3 || dto.currency.trim().length > 6) {
      errors.push("Currency must be a 3- to 6-letter ticker code.");
    }

    if (!dto.method || dto.method.trim() === "") {
      errors.push("Settlement method is required.");
    }

    if (
      dto.confirmationThreshold !== undefined &&
      (dto.confirmationThreshold < 0 || !Number.isInteger(dto.confirmationThreshold))
    ) {
      errors.push("Confirmation threshold must be a non-negative integer.");
    }

    return errors;
  }
}
