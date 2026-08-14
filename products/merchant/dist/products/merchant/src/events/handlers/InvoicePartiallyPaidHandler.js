/**
 * Event Handler reacting to InvoicePartiallyPaid domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoicePartiallyPaidHandler {
    invalidateCache;
    constructor(invalidateCache) {
        this.invalidateCache = invalidateCache;
    }
    async handle(event) {
        const invoiceId = event.getAggregateId();
        this.invalidateCache(invoiceId);
    }
}
