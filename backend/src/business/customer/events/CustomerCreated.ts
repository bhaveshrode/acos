import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerNumber } from "../value-objects/CustomerNumber.js";

/**
 * Domain event emitted when a new Customer aggregate root is created.
 */
export class CustomerCreated extends BaseDomainEvent {
  public readonly organizationId: OrganizationId;
  public readonly customerNumber: CustomerNumber;

  constructor(customerId: string, organizationId: OrganizationId, customerNumber: CustomerNumber) {
    super(customerId, "Customer");
    this.organizationId = organizationId;
    this.customerNumber = customerNumber;
  }
}
