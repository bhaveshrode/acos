import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a Customer is archived.
 */
export class CustomerArchived extends BaseDomainEvent {
  constructor(customerId: string) {
    super(customerId, "Customer");
  }
}
