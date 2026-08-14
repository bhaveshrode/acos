import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { CreateCustomerCommand } from "../commands/CreateCustomerCommand.js";

/**
 * Request validator checking fields structures and emails formats on CreateCustomerCommand.
 */
export class CreateCustomerCommandValidator implements IRequestValidator<CreateCustomerCommand> {
  public validate(request: CreateCustomerCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.organizationId || dto.organizationId.trim() === "") {
      errors.push("Organization ID is required.");
    }

    if (!dto.customerNumber || dto.customerNumber.trim() === "") {
      errors.push("Customer number is required.");
    }

    if (!dto.name || dto.name.trim().length < 2) {
      errors.push("Customer name must be at least 2 characters.");
    }

    if (!dto.primaryContact) {
      errors.push("Primary contact details must be provided.");
    } else {
      if (!dto.primaryContact.name || dto.primaryContact.name.trim() === "") {
        errors.push("Primary contact name is required.");
      }
      if (!dto.primaryContact.email || dto.primaryContact.email.trim() === "") {
        errors.push("Primary contact email is required.");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dto.primaryContact.email)) {
          errors.push(`Invalid primary contact email format: '${dto.primaryContact.email}'.`);
        }
      }
    }

    if (!dto.billingAddress) {
      errors.push("Billing address details must be provided.");
    } else {
      if (!dto.billingAddress.line1 || dto.billingAddress.line1.trim() === "") {
        errors.push("Billing street line 1 is required.");
      }
      if (!dto.billingAddress.city || dto.billingAddress.city.trim() === "") {
        errors.push("Billing city is required.");
      }
      if (!dto.billingAddress.country || dto.billingAddress.country.trim() === "") {
        errors.push("Billing country is required.");
      }
    }

    return errors;
  }
}
