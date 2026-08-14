"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncExecutor = void 0;
const CheckpointStore_js_1 = require("./CheckpointStore.js");
/**
 * SyncExecutor running incremental synchronization tasks.
 */
class SyncExecutor {
    checkpoints;
    constructor(checkpoints = new CheckpointStore_js_1.CheckpointStore()) {
        this.checkpoints = checkpoints;
    }
    async execute(planId, runSync) {
        const success = await runSync();
        if (success) {
            this.checkpoints.saveCheckpoint(planId, `checkpoint_${Date.now()}`);
        }
        return success;
    }
}
exports.SyncExecutor = SyncExecutor;
