import { IEventHandler } from "../../../../../backend/src/foundation/events/EventHandler.js";
import { InvoicePartiallyPaid } from "../../../../../backend/src/business/invoice/events/InvoicePartiallyPaid.js";

/**
 * Event Handler reacting to InvoicePartiallyPaid domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoicePartiallyPaidHandler implements IEventHandler<InvoicePartiallyPaid> {
  constructor(private readonly invalidateCache: (invoiceId: string) => void) {}

  public async handle(event: InvoicePartiallyPaid): Promise<void> {
    const invoiceId = event.getAggregateId();
    this.invalidateCache(invoiceId);
  }
}
