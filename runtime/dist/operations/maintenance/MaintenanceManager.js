"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceManager = void 0;
/**
 * MaintenanceManager executing scheduled cleanups.
 */
class MaintenanceManager {
    tasks = [];
    addTask(task) {
        this.tasks.push(task);
    }
    async runAll() {
        const results = [];
        for (const task of this.tasks) {
            results.push(await task.execute());
        }
        return results;
    }
}
exports.MaintenanceManager = MaintenanceManager;
