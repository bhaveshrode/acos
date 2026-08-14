import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a Customer is deleted.
 */
export class CustomerDeleted extends BaseDomainEvent {
  constructor(customerId: string) {
    super(customerId, "Customer");
  }
}
