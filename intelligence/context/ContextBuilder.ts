import { IntelligenceContext } from "./IntelligenceContext.js";

export class ContextBuilder {
  public async buildContextForInvoice(
    invoiceId: string,
    eventId: string,
    eventType: string,
    correlationId?: string,
    causationId?: string
  ): Promise<IntelligenceContext> {
    return new IntelligenceContext({
      eventId,
      correlationId: correlationId || eventId,
      causationId: causationId || eventId,
      eventType,
      timestamp: new Date(),
      merchantId: "org-456",
      customerId: "cust-123",
      invoiceId,
      relatedInvoices: [
        {
          id: invoiceId,
          status: "OVERDUE",
          amount: 1200.0,
          currency: "USD",
          dueDate: new Date(Date.now() - 86400000 * 5)
        }
      ],
      relatedPayments: [],
      previousReminders: [
        { sentAt: new Date(Date.now() - 86400000 * 10), type: "email" }
      ],
      accountStatus: "active",
      authClaims: { userId: "user-123", organizationId: "org-456" }
    });
  }

  public async buildContextForPayment(
    paymentId: string,
    eventId: string,
    eventType: string,
    correlationId?: string,
    causationId?: string
  ): Promise<IntelligenceContext> {
    return new IntelligenceContext({
      eventId,
      correlationId: correlationId || eventId,
      causationId: causationId || eventId,
      eventType,
      timestamp: new Date(),
      merchantId: "org-456",
      customerId: "cust-123",
      paymentId,
      relatedInvoices: [
        {
          id: "inv-999",
          status: "ISSUED",
          amount: 1500.0,
          currency: "USD"
        }
      ],
      relatedPayments: [
        {
          id: paymentId,
          amount: 1500.0,
          currency: "USD",
          status: "COMPLETED"
        }
      ],
      previousReminders: [],
      accountStatus: "active",
      authClaims: { userId: "user-123", organizationId: "org-456" }
    });
  }
}
