import { IWorkflowFactory } from "./IWorkflowFactory.js";
import { WorkflowRegistry } from "./WorkflowRegistry.js";
import { WorkflowResolver } from "./WorkflowResolver.js";
import { WorkflowStepRegistry } from "./WorkflowStepRegistry.js";
import { WorkflowExecutor } from "./WorkflowExecutor.js";
import { WorkflowCoordinator } from "./WorkflowCoordinator.js";
import { WorkflowNavigator } from "./WorkflowNavigator.js";
import { WorkflowStateManager } from "./WorkflowStateManager.js";
import { WorkflowCheckpointManager } from "./WorkflowCheckpointManager.js";
import { WorkflowHydrator } from "./WorkflowHydrator.js";
import { WorkflowValidator } from "./WorkflowValidator.js";
import { WorkflowConditionEvaluator } from "./WorkflowConditionEvaluator.js";
import { WorkflowTransitionResolver } from "./WorkflowTransitionResolver.js";
import { WorkflowRenderer } from "./WorkflowRenderer.js";
import { WorkflowProgressTracker } from "./WorkflowProgressTracker.js";
import { WorkflowTimeline } from "./WorkflowTimeline.js";
import { WorkflowInteractionManager } from "./WorkflowInteractionManager.js";
import { WorkflowEventDispatcher } from "./WorkflowEventDispatcher.js";
import { WorkflowObserver } from "./WorkflowObserver.js";

/**
 * WorkflowFactory implementing standard IWorkflowFactory composition roots.
 */
export class WorkflowFactory implements IWorkflowFactory {
  public static createRegistry(): WorkflowRegistry {
    return new WorkflowRegistry();
  }

  public static createResolver(registry: WorkflowRegistry): WorkflowResolver {
    return new WorkflowResolver(registry);
  }

  public static createStepRegistry(): WorkflowStepRegistry {
    return new WorkflowStepRegistry();
  }

  public static createExecutor(): WorkflowExecutor {
    return new WorkflowExecutor();
  }

  public static createCoordinator(executor: WorkflowExecutor): WorkflowCoordinator {
    return new WorkflowCoordinator(executor);
  }

  public static createNavigator(maxSteps: number): WorkflowNavigator {
    return new WorkflowNavigator(maxSteps);
  }

  public static createStateManager(): WorkflowStateManager {
    return new WorkflowStateManager();
  }

  public static createCheckpointManager(): WorkflowCheckpointManager {
    return new WorkflowCheckpointManager();
  }

  public static createHydrator(checkpointManager: WorkflowCheckpointManager): WorkflowHydrator {
    return new WorkflowHydrator(checkpointManager);
  }

  public static createValidator(): WorkflowValidator {
    return new WorkflowValidator();
  }

  public static createConditionEvaluator(): WorkflowConditionEvaluator {
    return new WorkflowConditionEvaluator();
  }

  public static createTransitionResolver(): WorkflowTransitionResolver {
    return new WorkflowTransitionResolver();
  }

  public static createRenderer(): WorkflowRenderer {
    return new WorkflowRenderer();
  }

  public static createProgressTracker(): WorkflowProgressTracker {
    return new WorkflowProgressTracker();
  }

  public static createTimeline(): WorkflowTimeline {
    return new WorkflowTimeline();
  }

  public static createInteractionManager(): WorkflowInteractionManager {
    return new WorkflowInteractionManager();
  }

  public static createEventDispatcher(): WorkflowEventDispatcher {
    return new WorkflowEventDispatcher();
  }

  public static createObserver(dispatcher: WorkflowEventDispatcher): WorkflowObserver {
    return new WorkflowObserver(dispatcher);
  }

  public createRegistry(): WorkflowRegistry {
    return WorkflowFactory.createRegistry();
  }

  public createResolver(registry: WorkflowRegistry): WorkflowResolver {
    return WorkflowFactory.createResolver(registry);
  }

  public createStepRegistry(): WorkflowStepRegistry {
    return WorkflowFactory.createStepRegistry();
  }

  public createExecutor(): WorkflowExecutor {
    return WorkflowFactory.createExecutor();
  }

  public createCoordinator(executor: WorkflowExecutor): WorkflowCoordinator {
    return WorkflowFactory.createCoordinator(executor);
  }

  public createNavigator(maxSteps: number): WorkflowNavigator {
    return WorkflowFactory.createNavigator(maxSteps);
  }

  public createStateManager(): WorkflowStateManager {
    return WorkflowFactory.createStateManager();
  }

  public createCheckpointManager(): WorkflowCheckpointManager {
    return WorkflowFactory.createCheckpointManager();
  }

  public createHydrator(checkpointManager: WorkflowCheckpointManager): WorkflowHydrator {
    return WorkflowFactory.createHydrator(checkpointManager);
  }

  public createValidator(): WorkflowValidator {
    return WorkflowFactory.createValidator();
  }

  public createConditionEvaluator(): WorkflowConditionEvaluator {
    return WorkflowFactory.createConditionEvaluator();
  }

  public createTransitionResolver(): WorkflowTransitionResolver {
    return WorkflowFactory.createTransitionResolver();
  }

  public createRenderer(): WorkflowRenderer {
    return WorkflowFactory.createRenderer();
  }

  public createProgressTracker(): WorkflowProgressTracker {
    return WorkflowFactory.createProgressTracker();
  }

  public createTimeline(): WorkflowTimeline {
    return WorkflowFactory.createTimeline();
  }

  public createInteractionManager(): WorkflowInteractionManager {
    return WorkflowFactory.createInteractionManager();
  }

  public createEventDispatcher(): WorkflowEventDispatcher {
    return WorkflowFactory.createEventDispatcher();
  }

  public createObserver(dispatcher: WorkflowEventDispatcher): WorkflowObserver {
    return WorkflowFactory.createObserver(dispatcher);
  }
}
