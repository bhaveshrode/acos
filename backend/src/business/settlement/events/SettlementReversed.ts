import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ReversalReason } from "../enums/ReversalReason.js";

/**
 * Domain event emitted when a settlement is reversed.
 */
export class SettlementReversed extends BaseDomainEvent {
  public readonly reason: ReversalReason;
  public readonly details: string;

  constructor(settlementId: string, reason: ReversalReason, details: string) {
    super(settlementId, "Settlement");
    this.reason = reason;
    this.details = details;
  }
}
