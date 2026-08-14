"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentPlan = void 0;
/**
 * DeploymentPlan outlining targeted deployment steps.
 */
class DeploymentPlan {
    targetEnv;
    steps;
    constructor(targetEnv, steps = []) {
        this.targetEnv = targetEnv;
        this.steps = steps;
        Object.freeze(this.steps);
        Object.freeze(this);
    }
}
exports.DeploymentPlan = DeploymentPlan;
