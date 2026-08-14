import { IAgent } from "./IAgent.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { IReasoningEngine } from "../reasoning/IReasoningEngine.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export class InvoiceAgent implements IAgent {
  public readonly agentId = "InvoiceAgent";

  constructor(
    private readonly contextBuilder: ContextBuilder,
    private readonly reasoner: IReasoningEngine
  ) {}

  public async processEvent(event: any): Promise<IntelligenceDecision | null> {
    if (event.type !== "invoice.overdue") {
      return null;
    }

    const context = await this.contextBuilder.buildContextForInvoice(
      event.invoiceId,
      event.id || `evt_${Date.now()}`,
      event.type
    );

    return await this.reasoner.reason(context, this.agentId);
  }
}
