"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncPlanner = void 0;
/**
 * SyncPlanner outlining synchronization schedules.
 */
class SyncPlanner {
    plan(source, target) {
        return `plan_sync_from_${source}_to_${target}_at_${Date.now()}`;
    }
}
exports.SyncPlanner = SyncPlanner;
