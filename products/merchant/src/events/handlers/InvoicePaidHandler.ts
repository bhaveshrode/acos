import { IEventHandler } from "../../../../../backend/src/foundation/events/EventHandler.js";
import { InvoicePaid } from "../../../../../backend/src/business/invoice/events/InvoicePaid.js";

/**
 * Event Handler reacting to InvoicePaid domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoicePaidHandler implements IEventHandler<InvoicePaid> {
  constructor(private readonly invalidateCache: (invoiceId: string) => void) {}

  public async handle(event: InvoicePaid): Promise<void> {
    const invoiceId = event.getAggregateId();
    this.invalidateCache(invoiceId);
  }
}
