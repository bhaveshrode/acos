"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupTask = void 0;
/**
 * CleanupTask implementing basic MaintenanceTask tasks.
 */
class CleanupTask {
    id;
    constructor(id) {
        this.id = id;
    }
    async execute() {
        return true;
    }
}
exports.CleanupTask = CleanupTask;
