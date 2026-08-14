import { InvoiceAgent } from "../agents/InvoiceAgent.js";
import { PaymentAgent } from "../agents/PaymentAgent.js";
export class AgentFactory {
    createInvoiceAgent(contextBuilder, reasoner) {
        return new InvoiceAgent(contextBuilder, reasoner);
    }
    createPaymentAgent(contextBuilder, reasoner) {
        return new PaymentAgent(contextBuilder, reasoner);
    }
}
