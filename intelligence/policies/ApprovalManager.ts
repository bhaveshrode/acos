import { ApprovalRequest } from "./ApprovalRequest.js";

export class ApprovalManager {
  private readonly approvals = new Map<string, ApprovalRequest>();
  private readonly resumeCallbacks = new Map<string, () => Promise<any>>();

  public registerRequest(
    planId: string,
    decisionId: string,
    reason: string,
    resumeCallback?: () => Promise<any>
  ): ApprovalRequest {
    const id = `app_req_${Math.floor(Math.random() * 100000)}`;
    const request: ApprovalRequest = {
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

  public getRequest(id: string): ApprovalRequest | undefined {
    return this.approvals.get(id);
  }

  public async approve(id: string): Promise<any> {
    const req = this.getRequest(id);
    if (!req) throw new Error(`ApprovalRequest '${id}' not found.`);
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

  public reject(id: string, reason: string): void {
    const req = this.getRequest(id);
    if (!req) throw new Error(`ApprovalRequest '${id}' not found.`);
    if (req.status !== "PENDING") {
      throw new Error(`ApprovalRequest '${id}' is already finalized with status: ${req.status}`);
    }

    req.status = "REJECTED";
    req.reason = `${req.reason} (Rejected: ${reason})`;
    req.updatedAt = new Date();
    this.resumeCallbacks.delete(id);
  }

  public listPending(): ApprovalRequest[] {
    return Array.from(this.approvals.values()).filter((r) => r.status === "PENDING");
  }

  public clear(): void {
    this.approvals.clear();
    this.resumeCallbacks.clear();
  }
}
