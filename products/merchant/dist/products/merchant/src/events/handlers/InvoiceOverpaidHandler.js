/**
 * Event Handler reacting to InvoiceOverpaid domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoiceOverpaidHandler {
    invalidateCache;
    constructor(invalidateCache) {
        this.invalidateCache = invalidateCache;
    }
    async handle(event) {
        const invoiceId = event.getAggregateId();
        this.invalidateCache(invoiceId);
    }
}
