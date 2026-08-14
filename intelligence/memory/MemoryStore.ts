import { IMemoryStore } from "./IMemoryStore.js";
import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";

export class MemoryStore implements IMemoryStore {
  private readonly operationalMemory = new Map<string, IntelligenceDecision[]>();
  
  private readonly auditRecords: Array<{
    type: "DECISION" | "EXECUTION";
    id: string;
    success?: boolean;
    data: any;
    timestamp: Date;
  }> = [];

  public saveDecision(decision: IntelligenceDecision): void {
    const customerId = decision.props.contextSnapshot.props.customerId || "anonymous";
    const history = this.operationalMemory.get(customerId) || [];
    history.push(decision);
    this.operationalMemory.set(customerId, history);

    const auditRecord = {
      type: "DECISION" as const,
      id: decision.props.decisionId,
      data: decision,
      timestamp: new Date()
    };
    Object.freeze(auditRecord.data);
    Object.freeze(auditRecord);
    this.auditRecords.push(auditRecord);
  }

  public getDecisionHistory(customerId?: string): IntelligenceDecision[] {
    if (customerId) {
      return this.operationalMemory.get(customerId) || [];
    }
    return this.auditRecords
      .filter((r) => r.type === "DECISION")
      .map((r) => r.data as IntelligenceDecision);
  }

  public saveExecution(planId: string, success: boolean, results: any): void {
    const auditRecord = {
      type: "EXECUTION" as const,
      id: planId,
      success,
      data: results,
      timestamp: new Date()
    };
    Object.freeze(auditRecord.data);
    Object.freeze(auditRecord);
    this.auditRecords.push(auditRecord);
  }

  public getExecutionHistory(planId?: string): any[] {
    if (planId) {
      return this.auditRecords.filter((r) => r.type === "EXECUTION" && r.id === planId);
    }
    return this.auditRecords.filter((r) => r.type === "EXECUTION");
  }

  public getAuditRecords(): readonly any[] {
    return Object.freeze([...this.auditRecords]);
  }

  public clear(): void {
    this.operationalMemory.clear();
    this.auditRecords.length = 0;
  }
}
