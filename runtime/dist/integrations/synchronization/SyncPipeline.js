"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncPipeline = void 0;
const SyncState_js_1 = require("./SyncState.js");
const SyncPlanner_js_1 = require("./SyncPlanner.js");
const SyncExecutor_js_1 = require("./SyncExecutor.js");
const ConflictResolver_js_1 = require("./ConflictResolver.js");
const CheckpointStore_js_1 = require("./CheckpointStore.js");
/**
 * SyncPipeline orchestrating synchronization loops with activePlanId exposure.
 */
class SyncPipeline {
    planner;
    executor;
    conflicts;
    checkpoints;
    state = SyncState_js_1.SyncState.Idle;
    activePlanId;
    constructor(planner = new SyncPlanner_js_1.SyncPlanner(), executor = new SyncExecutor_js_1.SyncExecutor(), conflicts = new ConflictResolver_js_1.ConflictResolver(), checkpoints = new CheckpointStore_js_1.CheckpointStore()) {
        this.planner = planner;
        this.executor = executor;
        this.conflicts = conflicts;
        this.checkpoints = checkpoints;
    }
    async executeSync(source, target, runFn) {
        this.state = SyncState_js_1.SyncState.Synchronizing;
        const planId = this.planner.plan(source, target);
        this.activePlanId = planId;
        const success = await this.executor.execute(planId, runFn);
        this.state = success ? SyncState_js_1.SyncState.Completed : SyncState_js_1.SyncState.Failed;
        return success;
    }
}
exports.SyncPipeline = SyncPipeline;
