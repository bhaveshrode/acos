import type { IEventHandler } from "acos-backend";
import { InvoiceRefunded } from "acos-backend";

/**
 * Event Handler reacting to InvoiceRefunded domain events.
 * Simply invalidates the cached invoice query, keeping Merchant state reactive.
 */
export class InvoiceRefundedHandler implements IEventHandler<InvoiceRefunded> {
  constructor(private readonly invalidateCache: (invoiceId: string) => void) {}

  public async handle(event: InvoiceRefunded): Promise<void> {
    const invoiceId = event.getAggregateId();
    this.invalidateCache(invoiceId);
  }
}
