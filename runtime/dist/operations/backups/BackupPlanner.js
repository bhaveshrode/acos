"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupPlanner = void 0;
/**
 * BackupPlanner outlining backup tasks templates.
 */
class BackupPlanner {
    createPlan(type) {
        return `plan-${type.toLowerCase()}`;
    }
}
exports.BackupPlanner = BackupPlanner;
