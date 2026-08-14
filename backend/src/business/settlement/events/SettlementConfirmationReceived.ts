import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { ConfirmationSource } from "../enums/ConfirmationSource.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";

/**
 * Domain event emitted when a new confirmation is received.
 */
export class SettlementConfirmationReceived extends BaseDomainEvent {
  public readonly source: ConfirmationSource;
  public readonly count: ConfirmationCount;

  constructor(
    settlementId: string,
    source: ConfirmationSource,
    count: ConfirmationCount
  ) {
    super(settlementId, "Settlement");
    this.source = source;
    this.count = count;
  }
}
