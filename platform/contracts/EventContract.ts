import { ISchemaValidator } from "./LayerContract.js";

export class PaymentReceivedEventSchema implements ISchemaValidator {
  public validate(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data) {
      errors.push("Event payload is null or undefined.");
      return { isValid: false, errors };
    }
    if (typeof data.id !== "string" || !data.id) {
      errors.push("Event id is required.");
    }
    if (data.type !== "payment.received") {
      errors.push("Event type must be 'payment.received'.");
    }
    if (typeof data.paymentId !== "string" || !data.paymentId) {
      errors.push("paymentId is required.");
    }
    return { isValid: errors.length === 0, errors };
  }
}

export class InvoiceOverdueEventSchema implements ISchemaValidator {
  public validate(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data) {
      errors.push("Event payload is null or undefined.");
      return { isValid: false, errors };
    }
    if (typeof data.id !== "string" || !data.id) {
      errors.push("Event id is required.");
    }
    if (data.type !== "invoice.overdue") {
      errors.push("Event type must be 'invoice.overdue'.");
    }
    if (typeof data.invoiceId !== "string" || !data.invoiceId) {
      errors.push("invoiceId is required.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
