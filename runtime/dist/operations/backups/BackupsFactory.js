"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupsFactory = void 0;
const BackupPlanner_js_1 = require("./BackupPlanner.js");
const BackupExecutor_js_1 = require("./BackupExecutor.js");
const RestoreExecutor_js_1 = require("./RestoreExecutor.js");
/**
 * BackupsFactory building planners and executors.
 */
class BackupsFactory {
    static createPlanner() {
        return new BackupPlanner_js_1.BackupPlanner();
    }
    static createBackupExecutor() {
        return new BackupExecutor_js_1.BackupExecutor();
    }
    static createRestoreExecutor() {
        return new RestoreExecutor_js_1.RestoreExecutor();
    }
    createPlanner() {
        return BackupsFactory.createPlanner();
    }
    createBackupExecutor() {
        return BackupsFactory.createBackupExecutor();
    }
    createRestoreExecutor() {
        return BackupsFactory.createRestoreExecutor();
    }
}
exports.BackupsFactory = BackupsFactory;
