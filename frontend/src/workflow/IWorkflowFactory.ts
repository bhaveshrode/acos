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
 * IWorkflowFactory interface defining composition contract capabilities.
 */
export interface IWorkflowFactory {
  createRegistry(): WorkflowRegistry;
  createResolver(registry: WorkflowRegistry): WorkflowResolver;
  createStepRegistry(): WorkflowStepRegistry;
  createExecutor(): WorkflowExecutor;
  createCoordinator(executor: WorkflowExecutor): WorkflowCoordinator;
  createNavigator(maxSteps: number): WorkflowNavigator;
  createStateManager(): WorkflowStateManager;
  createCheckpointManager(): WorkflowCheckpointManager;
  createHydrator(checkpointManager: WorkflowCheckpointManager): WorkflowHydrator;
  createValidator(): WorkflowValidator;
  createConditionEvaluator(): WorkflowConditionEvaluator;
  createTransitionResolver(): WorkflowTransitionResolver;
  createRenderer(): WorkflowRenderer;
  createProgressTracker(): WorkflowProgressTracker;
  createTimeline(): WorkflowTimeline;
  createInteractionManager(): WorkflowInteractionManager;
  createEventDispatcher(): WorkflowEventDispatcher;
  createObserver(dispatcher: WorkflowEventDispatcher): WorkflowObserver;
}
