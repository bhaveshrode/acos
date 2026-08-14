import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a Customer is blocked.
 */
export class CustomerBlocked extends BaseDomainEvent {
  public readonly reason: string;

  constructor(customerId: string, reason: string) {
    super(customerId, "Customer");
    this.reason = reason;
  }
}
