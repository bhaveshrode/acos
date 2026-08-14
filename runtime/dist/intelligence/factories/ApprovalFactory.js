import { ApprovalManager } from "../policies/ApprovalManager.js";
export class ApprovalFactory {
    static manager = null;
    getApprovalManager() {
        if (!ApprovalFactory.manager) {
            ApprovalFactory.manager = new ApprovalManager();
        }
        return ApprovalFactory.manager;
    }
}
