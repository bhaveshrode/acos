import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when a customer's accounts receivable account is initialized.
 */
export class ReceivableCreated extends BaseDomainEvent {
    organizationId;
    customerId;
    constructor(receivableAccountId, organizationId, customerId) {
        super(receivableAccountId, "AccountsReceivable");
        this.organizationId = organizationId;
        this.customerId = customerId;
    }
}
