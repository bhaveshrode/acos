"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentExecutor = void 0;
/**
 * DeploymentExecutor executing deployment steps.
 */
class DeploymentExecutor {
    async run(plan) {
        return plan.steps.length > 0;
    }
}
exports.DeploymentExecutor = DeploymentExecutor;
