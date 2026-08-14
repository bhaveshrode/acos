import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";

/**
 * Domain event emitted when a customer's accounts receivable account is initialized.
 */
export class ReceivableCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;
  public readonly customerId: CustomerId;

  constructor(
    receivableAccountId: string,
    organizationId: OrganizationId,
    customerId: CustomerId
  ) {
    super(receivableAccountId, "AccountsReceivable");
    this.organizationId = organizationId;
    this.customerId = customerId;
  }
}
