import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when an outstanding obligation is written off.
 */
export class ReceivableWrittenOff extends BaseDomainEvent {
    amount;
    approvedBy;
    constructor(receivableAccountId, amount, approvedBy) {
        super(receivableAccountId, "AccountsReceivable");
        this.amount = amount;
        this.approvedBy = approvedBy;
    }
}
