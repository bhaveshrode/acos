import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export interface IAgent {
  readonly agentId: string;
  processEvent(event: any): Promise<IntelligenceDecision | null>;
}
