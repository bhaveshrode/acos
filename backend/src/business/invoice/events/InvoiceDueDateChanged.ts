import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { DueDate } from "../value-objects/DueDate.js";

/**
 * Domain event emitted when an invoice's due date is updated.
 */
export class InvoiceDueDateChanged extends BaseDomainEvent {
  public readonly newDueDate: DueDate;

  constructor(invoiceId: string, newDueDate: DueDate) {
    super(invoiceId, "Invoice");
    this.newDueDate = newDueDate;
  }
}
