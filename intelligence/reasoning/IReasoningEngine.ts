import { IntelligenceContext } from "../context/IntelligenceContext.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export interface IReasoningEngine {
  reason(context: IntelligenceContext, agentId: string): Promise<IntelligenceDecision>;
}
