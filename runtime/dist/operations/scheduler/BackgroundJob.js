"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundJob = void 0;
/**
 * BackgroundJob wrapping asynchronous execution operations.
 */
class BackgroundJob {
    id;
    task;
    constructor(id, task) {
        this.id = id;
        this.task = task;
        Object.freeze(this);
    }
}
exports.BackgroundJob = BackgroundJob;
