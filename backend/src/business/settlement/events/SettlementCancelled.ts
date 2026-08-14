import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a settlement is cancelled.
 */
export class SettlementCancelled extends BaseDomainEvent {
  constructor(settlementId: string) {
    super(settlementId, "Settlement");
  }
}
