import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";

/**
 * Domain event emitted when an invoice due date is missed and enters overdue status.
 */
export class InvoiceOverdue extends BaseDomainEvent {
  public readonly invoiceId: InvoiceId;

  constructor(receivableAccountId: string, invoiceId: InvoiceId) {
    super(receivableAccountId, "AccountsReceivable");
    this.invoiceId = invoiceId;
  }
}
