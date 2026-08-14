export class InvoiceAgent {
    contextBuilder;
    reasoner;
    agentId = "InvoiceAgent";
    constructor(contextBuilder, reasoner) {
        this.contextBuilder = contextBuilder;
        this.reasoner = reasoner;
    }
    async processEvent(event) {
        if (event.type !== "invoice.overdue") {
            return null;
        }
        const context = await this.contextBuilder.buildContextForInvoice(event.invoiceId, event.id || `evt_${Date.now()}`, event.type);
        return await this.reasoner.reason(context, this.agentId);
    }
}
