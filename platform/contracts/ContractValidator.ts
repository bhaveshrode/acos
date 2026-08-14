import { ISchemaValidator, CreateInvoiceSchema, SubmitPaymentSchema } from "./LayerContract.js";
import { PaymentReceivedEventSchema, InvoiceOverdueEventSchema } from "./EventContract.js";

export class ContractValidator {
  private readonly validators = new Map<string, ISchemaValidator>();

  constructor() {
    this.validators.set("CreateInvoiceCommand", new CreateInvoiceSchema());
    this.validators.set("SubmitPaymentCommand", new SubmitPaymentSchema());
    this.validators.set("payment.received", new PaymentReceivedEventSchema());
    this.validators.set("invoice.overdue", new InvoiceOverdueEventSchema());
  }

  public validate(schemaName: string, payload: any): void {
    const validator = this.validators.get(schemaName);
    if (!validator) {
      throw new Error(`No schema validator registered for contract: '${schemaName}'`);
    }

    const { isValid, errors } = validator.validate(payload);
    if (!isValid) {
      throw new Error(`Contract validation failed for '${schemaName}': ${errors.join(", ")}`);
    }
  }
}
