import { InvoiceAgent } from "../agents/InvoiceAgent.js";
import { PaymentAgent } from "../agents/PaymentAgent.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { IReasoningEngine } from "../reasoning/IReasoningEngine.js";

export class AgentFactory {
  public createInvoiceAgent(
    contextBuilder: ContextBuilder,
    reasoner: IReasoningEngine
  ): InvoiceAgent {
    return new InvoiceAgent(contextBuilder, reasoner);
  }

  public createPaymentAgent(
    contextBuilder: ContextBuilder,
    reasoner: IReasoningEngine
  ): PaymentAgent {
    return new PaymentAgent(contextBuilder, reasoner);
  }
}
