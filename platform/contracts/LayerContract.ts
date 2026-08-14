export interface ISchemaValidator {
  validate(data: any): { isValid: boolean; errors: string[] };
}

export class CreateInvoiceSchema implements ISchemaValidator {
  public validate(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data) {
      errors.push("Payload is null or undefined.");
      return { isValid: false, errors };
    }
    if (typeof data.organizationId !== "string" || !data.organizationId) {
      errors.push("organizationId is required and must be a non-empty string.");
    }
    if (typeof data.customerId !== "string" || !data.customerId) {
      errors.push("customerId is required and must be a non-empty string.");
    }
    if (typeof data.invoiceNumber !== "string" || !data.invoiceNumber) {
      errors.push("invoiceNumber is required and must be a non-empty string.");
    }
    if (data.lines && !Array.isArray(data.lines)) {
      errors.push("lines must be an array.");
    }
    return { isValid: errors.length === 0, errors };
  }
}

export class SubmitPaymentSchema implements ISchemaValidator {
  public validate(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data) {
      errors.push("Payload is null or undefined.");
      return { isValid: false, errors };
    }
    if (typeof data.organizationId !== "string" || !data.organizationId) {
      errors.push("organizationId is required.");
    }
    if (typeof data.customerId !== "string" || !data.customerId) {
      errors.push("customerId is required.");
    }
    if (typeof data.amount !== "number" || data.amount <= 0) {
      errors.push("amount must be a positive number.");
    }
    if (typeof data.reference !== "string" || !data.reference) {
      errors.push("reference is required.");
    }
    if (typeof data.invoiceId !== "string" || !data.invoiceId) {
      errors.push("invoiceId is required.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
