import { ApprovalManager } from "../../intelligence/policies/ApprovalManager.js";

export class ChaosSimulator {
  private isDatabaseAvailable = true;

  public setDatabaseAvailability(available: boolean): void {
    this.isDatabaseAvailable = available;
  }

  public async queryDatabase<T>(queryFn: () => Promise<T>): Promise<T> {
    if (!this.isDatabaseAvailable) {
      throw new Error("Database unavailable: Connection timeout.");
    }
    return await queryFn();
  }

  public simulateCrashAndRestore(manager: ApprovalManager): ApprovalManager {
    const pendingList = manager.listPending();
    manager.clear();

    const newManager = new ApprovalManager();
    pendingList.forEach((req) => {
      const restored = {
        id: req.id,
        decisionId: req.decisionId,
        planId: req.planId,
        status: req.status,
        reason: req.reason,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt
      };
      (newManager as any).approvals.set(req.id, restored);
    });

    return newManager;
  }
}
