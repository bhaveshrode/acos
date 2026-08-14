"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingFactory = void 0;
const Autoscaler_js_1 = require("./Autoscaler.js");
const WorkerPool_js_1 = require("./WorkerPool.js");
/**
 * ScalingFactory building autoscalers.
 */
class ScalingFactory {
    static createAutoscaler() {
        return new Autoscaler_js_1.Autoscaler();
    }
    static createWorkerPool() {
        return new WorkerPool_js_1.WorkerPool();
    }
    createAutoscaler() {
        return ScalingFactory.createAutoscaler();
    }
    createWorkerPool() {
        return ScalingFactory.createWorkerPool();
    }
}
exports.ScalingFactory = ScalingFactory;
