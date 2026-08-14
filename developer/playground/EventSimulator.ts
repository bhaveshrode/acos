type EventCallback = (event: any) => void;

export class EventSimulator {
  private listeners: Set<EventCallback> = new Set();

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private publish(event: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Suppress callback failures
      }
    });
  }

  public emitInvoicePaidEvent(invoiceId: string, amount: number): void {
    this.publish({
      type: "invoice.paid",
      timestamp: new Date(),
      data: {
        invoiceId,
        amount,
        settled: true
      }
    });
  }

  public emitPaymentRefundedEvent(paymentId: string, amount: number): void {
    this.publish({
      type: "payment.refunded",
      timestamp: new Date(),
      data: {
        paymentId,
        amount,
        status: "COMPLETED"
      }
    });
  }
}
