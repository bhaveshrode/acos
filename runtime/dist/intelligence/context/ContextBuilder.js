import { IntelligenceContext } from "./IntelligenceContext.js";
export class ContextBuilder {
    async buildContextForInvoice(invoiceId, eventId, eventType, correlationId, causationId) {
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
    async buildContextForPayment(paymentId, eventId, eventType, correlationId, causationId) {
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
