/**
 * Event Handler reacting to InvoicePaid domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoicePaidHandler {
    invalidateCache;
    constructor(invalidateCache) {
        this.invalidateCache = invalidateCache;
    }
    async handle(event) {
        const invoiceId = event.getAggregateId();
        this.invalidateCache(invoiceId);
    }
}
