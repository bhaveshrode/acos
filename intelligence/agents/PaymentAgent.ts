import { IAgent } from "./IAgent.js";
import { ContextBuilder } from "../context/ContextBuilder.js";
import { IReasoningEngine } from "../reasoning/IReasoningEngine.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export class PaymentAgent implements IAgent {
  public readonly agentId = "PaymentAgent";

  constructor(
    private readonly contextBuilder: ContextBuilder,
    private readonly reasoner: IReasoningEngine
  ) {}

  public async processEvent(event: any): Promise<IntelligenceDecision | null> {
    if (event.type !== "payment.received") {
      return null;
    }

    const context = await this.contextBuilder.buildContextForPayment(
      event.paymentId,
      event.id || `evt_${Date.now()}`,
      event.type
    );

    return await this.reasoner.reason(context, this.agentId);
  }
}
