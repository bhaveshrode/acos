import { InvoicePaidHandler } from "../handlers/InvoicePaidHandler.js";
import { InvoicePartiallyPaidHandler } from "../handlers/InvoicePartiallyPaidHandler.js";
import { InvoiceOverpaidHandler } from "../handlers/InvoiceOverpaidHandler.js";
/**
 * Event Consumer registering event handlers with the ACOS Event Bus.
 */
export class MerchantEventConsumer {
    eventBus;
    invoicePaidHandler;
    invoicePartiallyPaidHandler;
    invoiceOverpaidHandler;
    constructor(eventBus, invalidateCache) {
        this.eventBus = eventBus;
        this.invoicePaidHandler = new InvoicePaidHandler(invalidateCache);
        this.invoicePartiallyPaidHandler = new InvoicePartiallyPaidHandler(invalidateCache);
        this.invoiceOverpaidHandler = new InvoiceOverpaidHandler(invalidateCache);
    }
    /**
     * Registers subscribers on the Event Bus.
     */
    subscribe() {
        this.eventBus.subscribe("InvoicePaid", this.invoicePaidHandler);
        this.eventBus.subscribe("InvoicePartiallyPaid", this.invoicePartiallyPaidHandler);
        this.eventBus.subscribe("InvoiceOverpaid", this.invoiceOverpaidHandler);
    }
    /**
     * Unregisters subscribers from the Event Bus.
     */
    unsubscribe() {
        this.eventBus.unsubscribe("InvoicePaid", this.invoicePaidHandler);
        this.eventBus.unsubscribe("InvoicePartiallyPaid", this.invoicePartiallyPaidHandler);
        this.eventBus.unsubscribe("InvoiceOverpaid", this.invoiceOverpaidHandler);
    }
}
