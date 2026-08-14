export class MemoryStore {
    operationalMemory = new Map();
    auditRecords = [];
    saveDecision(decision) {
        const customerId = decision.props.contextSnapshot.props.customerId || "anonymous";
        const history = this.operationalMemory.get(customerId) || [];
        history.push(decision);
        this.operationalMemory.set(customerId, history);
        const auditRecord = {
            type: "DECISION",
            id: decision.props.decisionId,
            data: decision,
            timestamp: new Date()
        };
        Object.freeze(auditRecord.data);
        Object.freeze(auditRecord);
        this.auditRecords.push(auditRecord);
    }
    getDecisionHistory(customerId) {
        if (customerId) {
            return this.operationalMemory.get(customerId) || [];
        }
        return this.auditRecords
            .filter((r) => r.type === "DECISION")
            .map((r) => r.data);
    }
    saveExecution(planId, success, results) {
        const auditRecord = {
            type: "EXECUTION",
            id: planId,
            success,
            data: results,
            timestamp: new Date()
        };
        Object.freeze(auditRecord.data);
        Object.freeze(auditRecord);
        this.auditRecords.push(auditRecord);
    }
    getExecutionHistory(planId) {
        if (planId) {
            return this.auditRecords.filter((r) => r.type === "EXECUTION" && r.id === planId);
        }
        return this.auditRecords.filter((r) => r.type === "EXECUTION");
    }
    getAuditRecords() {
        return Object.freeze([...this.auditRecords]);
    }
    clear() {
        this.operationalMemory.clear();
        this.auditRecords.length = 0;
    }
}
