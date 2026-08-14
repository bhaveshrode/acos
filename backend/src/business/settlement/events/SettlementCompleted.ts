import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";

/**
 * Domain event emitted when a settlement is successfully completed.
 */
export class SettlementCompleted extends BaseDomainEvent {
  constructor(settlementId: string) {
    super(settlementId, "Settlement");
  }
}
