import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { InvoiceNumber } from "../value-objects/InvoiceNumber.js";

/**
 * Domain event emitted when a new Invoice is initialized.
 */
export class InvoiceCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;
  public readonly customerId: CustomerId;
  public readonly invoiceNumber: InvoiceNumber;

  constructor(
    invoiceId: string,
    organizationId: OrganizationId,
    customerId: CustomerId,
    invoiceNumber: InvoiceNumber
  ) {
    super(invoiceId, "Invoice");
    this.organizationId = organizationId;
    this.customerId = customerId;
    this.invoiceNumber = invoiceNumber;
  }
}
