"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowFactory = void 0;
const WorkflowRegistry_js_1 = require("./WorkflowRegistry.js");
const WorkflowResolver_js_1 = require("./WorkflowResolver.js");
const WorkflowStepRegistry_js_1 = require("./WorkflowStepRegistry.js");
const WorkflowExecutor_js_1 = require("./WorkflowExecutor.js");
const WorkflowCoordinator_js_1 = require("./WorkflowCoordinator.js");
const WorkflowNavigator_js_1 = require("./WorkflowNavigator.js");
const WorkflowStateManager_js_1 = require("./WorkflowStateManager.js");
const WorkflowCheckpointManager_js_1 = require("./WorkflowCheckpointManager.js");
const WorkflowHydrator_js_1 = require("./WorkflowHydrator.js");
const WorkflowValidator_js_1 = require("./WorkflowValidator.js");
const WorkflowConditionEvaluator_js_1 = require("./WorkflowConditionEvaluator.js");
const WorkflowTransitionResolver_js_1 = require("./WorkflowTransitionResolver.js");
const WorkflowRenderer_js_1 = require("./WorkflowRenderer.js");
const WorkflowProgressTracker_js_1 = require("./WorkflowProgressTracker.js");
const WorkflowTimeline_js_1 = require("./WorkflowTimeline.js");
const WorkflowInteractionManager_js_1 = require("./WorkflowInteractionManager.js");
const WorkflowEventDispatcher_js_1 = require("./WorkflowEventDispatcher.js");
const WorkflowObserver_js_1 = require("./WorkflowObserver.js");
/**
 * WorkflowFactory implementing standard IWorkflowFactory composition roots.
 */
class WorkflowFactory {
    static createRegistry() {
        return new WorkflowRegistry_js_1.WorkflowRegistry();
    }
    static createResolver(registry) {
        return new WorkflowResolver_js_1.WorkflowResolver(registry);
    }
    static createStepRegistry() {
        return new WorkflowStepRegistry_js_1.WorkflowStepRegistry();
    }
    static createExecutor() {
        return new WorkflowExecutor_js_1.WorkflowExecutor();
    }
    static createCoordinator(executor) {
        return new WorkflowCoordinator_js_1.WorkflowCoordinator(executor);
    }
    static createNavigator(maxSteps) {
        return new WorkflowNavigator_js_1.WorkflowNavigator(maxSteps);
    }
    static createStateManager() {
        return new WorkflowStateManager_js_1.WorkflowStateManager();
    }
    static createCheckpointManager() {
        return new WorkflowCheckpointManager_js_1.WorkflowCheckpointManager();
    }
    static createHydrator(checkpointManager) {
        return new WorkflowHydrator_js_1.WorkflowHydrator(checkpointManager);
    }
    static createValidator() {
        return new WorkflowValidator_js_1.WorkflowValidator();
    }
    static createConditionEvaluator() {
        return new WorkflowConditionEvaluator_js_1.WorkflowConditionEvaluator();
    }
    static createTransitionResolver() {
        return new WorkflowTransitionResolver_js_1.WorkflowTransitionResolver();
    }
    static createRenderer() {
        return new WorkflowRenderer_js_1.WorkflowRenderer();
    }
    static createProgressTracker() {
        return new WorkflowProgressTracker_js_1.WorkflowProgressTracker();
    }
    static createTimeline() {
        return new WorkflowTimeline_js_1.WorkflowTimeline();
    }
    static createInteractionManager() {
        return new WorkflowInteractionManager_js_1.WorkflowInteractionManager();
    }
    static createEventDispatcher() {
        return new WorkflowEventDispatcher_js_1.WorkflowEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new WorkflowObserver_js_1.WorkflowObserver(dispatcher);
    }
    createRegistry() {
        return WorkflowFactory.createRegistry();
    }
    createResolver(registry) {
        return WorkflowFactory.createResolver(registry);
    }
    createStepRegistry() {
        return WorkflowFactory.createStepRegistry();
    }
    createExecutor() {
        return WorkflowFactory.createExecutor();
    }
    createCoordinator(executor) {
        return WorkflowFactory.createCoordinator(executor);
    }
    createNavigator(maxSteps) {
        return WorkflowFactory.createNavigator(maxSteps);
    }
    createStateManager() {
        return WorkflowFactory.createStateManager();
    }
    createCheckpointManager() {
        return WorkflowFactory.createCheckpointManager();
    }
    createHydrator(checkpointManager) {
        return WorkflowFactory.createHydrator(checkpointManager);
    }
    createValidator() {
        return WorkflowFactory.createValidator();
    }
    createConditionEvaluator() {
        return WorkflowFactory.createConditionEvaluator();
    }
    createTransitionResolver() {
        return WorkflowFactory.createTransitionResolver();
    }
    createRenderer() {
        return WorkflowFactory.createRenderer();
    }
    createProgressTracker() {
        return WorkflowFactory.createProgressTracker();
    }
    createTimeline() {
        return WorkflowFactory.createTimeline();
    }
    createInteractionManager() {
        return WorkflowFactory.createInteractionManager();
    }
    createEventDispatcher() {
        return WorkflowFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return WorkflowFactory.createObserver(dispatcher);
    }
}
exports.WorkflowFactory = WorkflowFactory;
