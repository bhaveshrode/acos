import { IEventBus } from "../../../../../backend/src/foundation/events/EventBus.js";
import { InvoicePaidHandler } from "../handlers/InvoicePaidHandler.js";
import { InvoicePartiallyPaidHandler } from "../handlers/InvoicePartiallyPaidHandler.js";
import { InvoiceOverpaidHandler } from "../handlers/InvoiceOverpaidHandler.js";

/**
 * Event Consumer registering event handlers with the ACOS Event Bus.
 */
export class MerchantEventConsumer {
  private readonly invoicePaidHandler: InvoicePaidHandler;
  private readonly invoicePartiallyPaidHandler: InvoicePartiallyPaidHandler;
  private readonly invoiceOverpaidHandler: InvoiceOverpaidHandler;

  constructor(
    private readonly eventBus: IEventBus,
    invalidateCache: (invoiceId: string) => void
  ) {
    this.invoicePaidHandler = new InvoicePaidHandler(invalidateCache);
    this.invoicePartiallyPaidHandler = new InvoicePartiallyPaidHandler(invalidateCache);
    this.invoiceOverpaidHandler = new InvoiceOverpaidHandler(invalidateCache);
  }

  /**
   * Registers subscribers on the Event Bus.
   */
  public subscribe(): void {
    this.eventBus.subscribe("InvoicePaid", this.invoicePaidHandler);
    this.eventBus.subscribe("InvoicePartiallyPaid", this.invoicePartiallyPaidHandler);
    this.eventBus.subscribe("InvoiceOverpaid", this.invoiceOverpaidHandler);
  }

  /**
   * Unregisters subscribers from the Event Bus.
   */
  public unsubscribe(): void {
    this.eventBus.unsubscribe("InvoicePaid", this.invoicePaidHandler);
    this.eventBus.unsubscribe("InvoicePartiallyPaid", this.invoicePartiallyPaidHandler);
    this.eventBus.unsubscribe("InvoiceOverpaid", this.invoiceOverpaidHandler);
  }
}
