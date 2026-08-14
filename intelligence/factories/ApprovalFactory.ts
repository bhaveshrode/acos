import { ApprovalManager } from "../policies/ApprovalManager.js";

export class ApprovalFactory {
  private static manager: ApprovalManager | null = null;

  public getApprovalManager(): ApprovalManager {
    if (!ApprovalFactory.manager) {
      ApprovalFactory.manager = new ApprovalManager();
    }
    return ApprovalFactory.manager;
  }
}
