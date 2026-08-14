import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a customer's receivable account is closed.
 */
export class ReceivableClosed extends BaseDomainEvent {
  constructor(receivableAccountId: string) {
    super(receivableAccountId, "AccountsReceivable");
  }
}
