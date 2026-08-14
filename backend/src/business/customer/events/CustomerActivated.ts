import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a Customer is activated.
 */
export class CustomerActivated extends BaseDomainEvent {
  constructor(customerId: string) {
    super(customerId, "Customer");
  }
}
