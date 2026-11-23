import type { IEventHandler } from "acos-backend";
import { InvoiceUpdated } from "acos-backend";

/**
 * Event Handler reacting to InvoiceUpdated domain events.
 * A status re-derivation emits this event, so the cached invoice query has to
 * drop its copy or readers keep seeing the previous status.
 */
export class InvoiceUpdatedHandler implements IEventHandler<InvoiceUpdated> {
  constructor(private readonly invalidateCache: (invoiceId: string) => void) {}

  public async handle(event: InvoiceUpdated): Promise<void> {
    const invoiceId = event.getAggregateId();
    this.invalidateCache(invoiceId);
  }
}
