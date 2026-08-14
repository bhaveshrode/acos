export class ApprovalManager {
    approvals = new Map();
    resumeCallbacks = new Map();
    registerRequest(planId, decisionId, reason, resumeCallback) {
        const id = `app_req_${Math.floor(Math.random() * 100000)}`;
        const request = {
            id,
            decisionId,
            planId,
            status: "PENDING",
            reason,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.approvals.set(id, request);
        if (resumeCallback) {
            this.resumeCallbacks.set(id, resumeCallback);
        }
        return request;
    }
    getRequest(id) {
        return this.approvals.get(id);
    }
    async approve(id) {
        const req = this.getRequest(id);
        if (!req)
            throw new Error(`ApprovalRequest '${id}' not found.`);
        if (req.status !== "PENDING") {
            throw new Error(`ApprovalRequest '${id}' is already finalized with status: ${req.status}`);
        }
        req.status = "APPROVED";
        req.updatedAt = new Date();
        const callback = this.resumeCallbacks.get(id);
        if (callback) {
            this.resumeCallbacks.delete(id);
            return await callback();
        }
        return { success: true, message: "Approved successfully (no execution resume callback registered)." };
    }
    reject(id, reason) {
        const req = this.getRequest(id);
        if (!req)
            throw new Error(`ApprovalRequest '${id}' not found.`);
        if (req.status !== "PENDING") {
            throw new Error(`ApprovalRequest '${id}' is already finalized with status: ${req.status}`);
        }
        req.status = "REJECTED";
        req.reason = `${req.reason} (Rejected: ${reason})`;
        req.updatedAt = new Date();
        this.resumeCallbacks.delete(id);
    }
    listPending() {
        return Array.from(this.approvals.values()).filter((r) => r.status === "PENDING");
    }
    clear() {
        this.approvals.clear();
        this.resumeCallbacks.clear();
    }
}
