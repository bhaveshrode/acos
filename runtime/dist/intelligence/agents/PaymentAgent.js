export class PaymentAgent {
    contextBuilder;
    reasoner;
    agentId = "PaymentAgent";
    constructor(contextBuilder, reasoner) {
        this.contextBuilder = contextBuilder;
        this.reasoner = reasoner;
    }
    async processEvent(event) {
        if (event.type !== "payment.received") {
            return null;
        }
        const context = await this.contextBuilder.buildContextForPayment(event.paymentId, event.id || `evt_${Date.now()}`, event.type);
        return await this.reasoner.reason(context, this.agentId);
    }
}
