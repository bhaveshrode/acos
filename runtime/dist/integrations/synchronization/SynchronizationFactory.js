"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronizationFactory = void 0;
const SyncPlanner_js_1 = require("./SyncPlanner.js");
const SyncExecutor_js_1 = require("./SyncExecutor.js");
const ConflictResolver_js_1 = require("./ConflictResolver.js");
const CheckpointStore_js_1 = require("./CheckpointStore.js");
const SyncPipeline_js_1 = require("./SyncPipeline.js");
/**
 * SynchronizationFactory composing planners, executors, conflict resolvers, and checkpoints.
 */
class SynchronizationFactory {
    static createPlanner() {
        return new SyncPlanner_js_1.SyncPlanner();
    }
    static createExecutor(checkpoints) {
        return new SyncExecutor_js_1.SyncExecutor(checkpoints);
    }
    static createResolver() {
        return new ConflictResolver_js_1.ConflictResolver();
    }
    static createStore() {
        return new CheckpointStore_js_1.CheckpointStore();
    }
    static createPipeline(planner, executor, resolver, store) {
        return new SyncPipeline_js_1.SyncPipeline(planner, executor, resolver, store);
    }
    createPlanner() {
        return SynchronizationFactory.createPlanner();
    }
    createExecutor(checkpoints) {
        return SynchronizationFactory.createExecutor(checkpoints);
    }
    createResolver() {
        return SynchronizationFactory.createResolver();
    }
    createStore() {
        return SynchronizationFactory.createStore();
    }
    createPipeline(planner, executor, resolver, store) {
        return SynchronizationFactory.createPipeline(planner, executor, resolver, store);
    }
}
exports.SynchronizationFactory = SynchronizationFactory;
