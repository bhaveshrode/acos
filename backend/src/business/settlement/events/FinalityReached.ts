import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a settlement reaches financial finality.
 */
export class FinalityReached extends BaseDomainEvent {
  constructor(settlementId: string) {
    super(settlementId, "Settlement");
  }
}
