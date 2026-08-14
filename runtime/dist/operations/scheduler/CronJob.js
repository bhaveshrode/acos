"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJob = void 0;
/**
 * CronJob wrapping pattern matching expressions.
 */
class CronJob {
    id;
    expression;
    task;
    constructor(id, expression, task) {
        this.id = id;
        this.expression = expression;
        this.task = task;
        Object.freeze(this);
    }
}
exports.CronJob = CronJob;
