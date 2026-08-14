import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { CreateInvoiceCommand } from "../commands/CreateInvoiceCommand.js";

/**
 * Request validator checking fields structures and line bounds for creating an Invoice.
 */
export class CreateInvoiceCommandValidator
  implements IRequestValidator<CreateInvoiceCommand>
{
  public validate(request: CreateInvoiceCommand): string[] {
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

    if (!dto.invoiceNumber || dto.invoiceNumber.trim() === "") {
      errors.push("Invoice number is required.");
    }

    if (!dto.currency || dto.currency.trim().length < 3 || dto.currency.trim().length > 6) {
      errors.push("Currency must be a 3- to 6-letter ticker code.");
    }

    if (!dto.lines || dto.lines.length === 0) {
      errors.push("Invoice must contain at least one line item.");
    } else {
      dto.lines.forEach((line, index) => {
        if (!line.description || line.description.trim() === "") {
          errors.push(`Line item ${index + 1}: Description is required.`);
        }
        if (line.quantity <= 0) {
          errors.push(`Line item ${index + 1}: Quantity must be greater than zero.`);
        }
        if (line.unitPrice < 0) {
          errors.push(`Line item ${index + 1}: Unit price cannot be negative.`);
        }
        if (line.taxRate < 0 || line.taxRate > 100) {
          errors.push(`Line item ${index + 1}: Tax rate must be between 0 and 100.`);
        }
      });
    }

    return errors;
  }
}
