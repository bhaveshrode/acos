import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export interface IMemoryStore {
  saveDecision(decision: IntelligenceDecision): void;
  getDecisionHistory(customerId?: string): IntelligenceDecision[];
  saveExecution(planId: string, success: boolean, results: any): void;
  getExecutionHistory(planId?: string): any[];
  clear(): void;
}
