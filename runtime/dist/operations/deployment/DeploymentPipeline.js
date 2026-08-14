"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentPipeline = void 0;
const DeploymentState_js_1 = require("./DeploymentState.js");
const DeploymentExecutor_js_1 = require("./DeploymentExecutor.js");
/**
 * DeploymentPipeline orchestrating plans execution delegating to executors.
 */
class DeploymentPipeline {
    executor;
    state = DeploymentState_js_1.DeploymentState.Pending;
    constructor(executor = new DeploymentExecutor_js_1.DeploymentExecutor()) {
        this.executor = executor;
    }
    async execute(plan) {
        this.state = DeploymentState_js_1.DeploymentState.Executing;
        const success = await this.executor.run(plan);
        this.state = success ? DeploymentState_js_1.DeploymentState.Success : DeploymentState_js_1.DeploymentState.Failed;
        return success;
    }
}
exports.DeploymentPipeline = DeploymentPipeline;
