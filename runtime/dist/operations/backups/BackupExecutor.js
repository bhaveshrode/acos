"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupExecutor = void 0;
/**
 * BackupExecutor executing backup tasks.
 */
class BackupExecutor {
    async runBackup(type, plan) {
        return `backup-${type.toLowerCase()}-${plan}-${Date.now()}.tar.gz`;
    }
}
exports.BackupExecutor = BackupExecutor;
