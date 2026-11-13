import type { IEventHandler } from "acos-backend";
import { InvoiceOverpaid } from "acos-backend";

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
