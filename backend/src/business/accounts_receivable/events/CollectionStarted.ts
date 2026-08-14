import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a customer is entered into collection procedures.
 */
export class CollectionStarted extends BaseDomainEvent {
  public readonly reason: string;
  public readonly priority: string;

  constructor(receivableAccountId: string, reason: string, priority: string) {
    super(receivableAccountId, "AccountsReceivable");
    this.reason = reason;
    this.priority = priority;
  }
}
