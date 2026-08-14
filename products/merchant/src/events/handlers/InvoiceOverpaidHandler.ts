import { IEventHandler } from "../../../../../backend/src/foundation/events/EventHandler.js";
import { InvoiceOverpaid } from "../../../../../backend/src/business/invoice/events/InvoiceOverpaid.js";

/**
 * Event Handler reacting to InvoiceOverpaid domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoiceOverpaidHandler implements IEventHandler<InvoiceOverpaid> {
  constructor(private readonly invalidateCache: (invoiceId: string) => void) {}

  public async handle(event: InvoiceOverpaid): Promise<void> {
    const invoiceId = event.getAggregateId();
    this.invalidateCache(invoiceId);
  }
}
