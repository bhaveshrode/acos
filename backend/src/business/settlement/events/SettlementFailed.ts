import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a settlement fails.
 */
export class SettlementFailed extends BaseDomainEvent {
  public readonly reason: string;

  constructor(settlementId: string, reason: string) {
    super(settlementId, "Settlement");
    this.reason = reason;
  }
}
