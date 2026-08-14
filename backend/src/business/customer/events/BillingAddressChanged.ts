import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { Address } from "../value-objects/Address.js";

/**
 * Domain event emitted when a customer's billing address is updated.
 */
export class BillingAddressChanged extends BaseDomainEvent {
  public readonly address: Address;

  constructor(customerId: string, address: Address) {
    super(customerId, "Customer");
    this.address = address;
  }
}
