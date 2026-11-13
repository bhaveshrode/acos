import type { IEventHandler } from "acos-backend";
import { InvoicePartiallyPaid } from "acos-backend";

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
