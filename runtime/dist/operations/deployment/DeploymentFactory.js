"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentFactory = void 0;
const DeploymentContext_js_1 = require("./DeploymentContext.js");
const DeploymentPlan_js_1 = require("./DeploymentPlan.js");
const DeploymentExecutor_js_1 = require("./DeploymentExecutor.js");
const DeploymentPipeline_js_1 = require("./DeploymentPipeline.js");
/**
 * DeploymentFactory constructing executors and pipelines.
 */
class DeploymentFactory {
    static createContext(env, version) {
        return new DeploymentContext_js_1.DeploymentContext(env, version);
    }
    static createPlan(targetEnv, steps) {
        return new DeploymentPlan_js_1.DeploymentPlan(targetEnv, steps);
    }
    static createExecutor() {
        return new DeploymentExecutor_js_1.DeploymentExecutor();
    }
    static createPipeline(executor) {
        return new DeploymentPipeline_js_1.DeploymentPipeline(executor);
    }
    createContext(env, version) {
        return DeploymentFactory.createContext(env, version);
    }
    createPlan(targetEnv, steps) {
        return DeploymentFactory.createPlan(targetEnv, steps);
    }
    createExecutor() {
        return DeploymentFactory.createExecutor();
    }
    createPipeline(executor) {
        return DeploymentFactory.createPipeline(executor);
    }
}
exports.DeploymentFactory = DeploymentFactory;
