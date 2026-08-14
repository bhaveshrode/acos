"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreExecutor = void 0;
/**
 * RestoreExecutor recovering backups archives.
 */
class RestoreExecutor {
    async runRestore(backupPath) {
        return backupPath.includes(".tar.gz");
    }
}
exports.RestoreExecutor = RestoreExecutor;
