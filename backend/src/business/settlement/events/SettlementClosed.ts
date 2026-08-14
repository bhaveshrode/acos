import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a settlement is closed.
 */
export class SettlementClosed extends BaseDomainEvent {
  constructor(settlementId: string) {
    super(settlementId, "Settlement");
  }
}
