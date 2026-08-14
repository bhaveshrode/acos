import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a settlement transitions to the CONFIRMING state.
 */
export class SettlementConfirming extends BaseDomainEvent {
  constructor(settlementId: string) {
    super(settlementId, "Settlement");
  }
}
