"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPool = void 0;
/**
 * WorkerPool managing scaled worker counts.
 */
class WorkerPool {
    count = 3;
    getWorkerCount() {
        return this.count;
    }
    resize(count) {
        this.count = count;
    }
}
exports.WorkerPool = WorkerPool;
