"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceFactory = void 0;
const CleanupTask_js_1 = require("./CleanupTask.js");
const MaintenanceManager_js_1 = require("./MaintenanceManager.js");
/**
 * MaintenanceFactory building cleanups tasks.
 */
class MaintenanceFactory {
    static createCleanupTask(id) {
        return new CleanupTask_js_1.CleanupTask(id);
    }
    static createManager() {
        return new MaintenanceManager_js_1.MaintenanceManager();
    }
    createCleanupTask(id) {
        return MaintenanceFactory.createCleanupTask(id);
    }
    createManager() {
        return MaintenanceFactory.createManager();
    }
}
exports.MaintenanceFactory = MaintenanceFactory;
