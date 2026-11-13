import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkflowState } from "../WorkflowState.js";
import { WorkflowMetadata } from "../WorkflowMetadata.js";
import { WorkflowContext } from "../WorkflowContext.js";
import { BaseWorkflow } from "../BaseWorkflow.js";
import { WorkflowDescriptor } from "../WorkflowDescriptor.js";
import { WorkflowRegistry } from "../WorkflowRegistry.js";
import { WorkflowResolver } from "../WorkflowResolver.js";
import { WorkflowStep } from "../WorkflowStep.js";
import { WorkflowStepGroup } from "../WorkflowStepGroup.js";
import { WorkflowStepRegistry } from "../WorkflowStepRegistry.js";
import { WorkflowExecutor } from "../WorkflowExecutor.js";
import { WorkflowCoordinator } from "../WorkflowCoordinator.js";
import { WorkflowNavigator } from "../WorkflowNavigator.js";
import { WorkflowStateManager } from "../WorkflowStateManager.js";
import { WorkflowCheckpointManager } from "../WorkflowCheckpointManager.js";
import { WorkflowHydrator } from "../WorkflowHydrator.js";
import { WorkflowValidator } from "../WorkflowValidator.js";
import { WorkflowDecision } from "../WorkflowDecision.js";
import { WorkflowConditionEvaluator } from "../WorkflowConditionEvaluator.js";
import { WorkflowTransitionResolver } from "../WorkflowTransitionResolver.js";
import { WorkflowRenderer } from "../WorkflowRenderer.js";
import { WorkflowProgressTracker } from "../WorkflowProgressTracker.js";
import { WorkflowTimeline } from "../WorkflowTimeline.js";
import { WorkflowInteractionManager } from "../WorkflowInteractionManager.js";
import { WorkflowLifecycleEvent } from "../WorkflowLifecycleEvent.js";
import { WorkflowEventDispatcher } from "../WorkflowEventDispatcher.js";
import { WorkflowObserver } from "../WorkflowObserver.js";
import { WorkflowFactory } from "../WorkflowFactory.js";
import { RenderResult } from "../../components/RenderResult.js";

class TestWorkflow extends BaseWorkflow {
  private activeStep = "step-1";

  protected async onExecute(): Promise<void> {
    this.activeStep = "step-completed";
  }

  public hydrateState(snapshot: any): void {
    this.activeStep = snapshot.activeStep;
  }

  public getActiveStep(): string {
    return this.activeStep;
  }
}

describe("Frontend Workflow Component Unit Tests (Task 75.9)", () => {
  let context: WorkflowContext;

  beforeEach(() => {
    vi.restoreAllMocks();
    const meta: WorkflowMetadata = { id: "wf-1", version: "1.0.0" };
    context = new WorkflowContext(meta, { step: 1 });
  });

  describe("Contexts & Models", () => {
    it("should instantiate WorkflowContext and freeze variables", () => {
      const meta: WorkflowMetadata = { id: "wf-1", version: "1.0.0" };
      const ctx = new WorkflowContext(meta, { category: "payment" }, { elapsed: 100 });

      expect(ctx.metadata.id).toBe("wf-1");
      expect(ctx.variables.category).toBe("payment");
      expect(ctx.executionMetadata.elapsed).toBe(100);
      expect(Object.isFrozen(ctx)).toBe(true);
      expect(Object.isFrozen(ctx.variables)).toBe(true);
      expect(Object.isFrozen(ctx.executionMetadata)).toBe(true);
    });

    it("should manage BaseWorkflow execution and lifecycle states", async () => {
      const wf = new TestWorkflow(context);
      expect(wf.state).toBe(WorkflowState.Created);

      await wf.execute();
      expect(wf.state).toBe(WorkflowState.Completed);
      expect(wf.getActiveStep()).toBe("step-completed");

      wf.suspend();
      expect(wf.state).toBe(WorkflowState.Suspended);

      wf.resume();
      expect(wf.state).toBe(WorkflowState.Running);
    });
  });

  describe("Workflow Definitions & Registry", () => {
    it("should register descriptors and freeze WorkflowRegistry", () => {
      const registry = new WorkflowRegistry();
      const meta: WorkflowMetadata = { id: "wf-1", version: "1.0.0" };
      const descriptor = new WorkflowDescriptor(meta, TestWorkflow, ["step-1"]);

      registry.register(descriptor);
      expect(registry.get("wf-1")).toBe(descriptor);

      registry.freeze();
      expect(() => registry.register(descriptor)).toThrow(
        "WorkflowRegistry is frozen and cannot accept further workflows"
      );
    });

    it("should resolve workflows in WorkflowResolver", () => {
      const registry = new WorkflowRegistry();
      const meta: WorkflowMetadata = { id: "wf-1", version: "1.0.0" };
      const descriptor = new WorkflowDescriptor(meta, TestWorkflow);
      registry.register(descriptor);

      const resolver = new WorkflowResolver(registry);
      expect(resolver.resolve("wf-1")).toBe(descriptor);
      expect(() => resolver.resolve("missing")).toThrow(
        "Workflow with identifier missing is not registered"
      );
    });
  });

  describe("Workflow Steps & Execution", () => {
    it("should manage step registries and execute steps using executors", async () => {
      const step = new WorkflowStep("step-1", "Initialize", () => "Result Value");
      const stepRegistry = new WorkflowStepRegistry();
      stepRegistry.register(step);

      expect(stepRegistry.get("step-1")).toBe(step);
      stepRegistry.freeze();
      expect(() => stepRegistry.register(step)).toThrow("WorkflowStepRegistry is frozen");

      const executor = new WorkflowExecutor();
      const results = await executor.executeSequential([step], context);
      expect(results).toContain("Result Value");

      const coordinator = new WorkflowCoordinator(executor);
      const workflow = new TestWorkflow(context);
      const coordResults = await coordinator.coordinate(workflow, [step]);
      expect(coordResults).toContain("Result Value");
    });
  });

  describe("Navigation & State Management", () => {
    it("should navigate indices in WorkflowNavigator", () => {
      const navigator = new WorkflowNavigator(3);
      expect(navigator.getIndex()).toBe(0);
      expect(navigator.next()).toBe(1);
      expect(navigator.next()).toBe(2);
      expect(navigator.next()).toBe(2); // cap
      expect(navigator.prev()).toBe(1);
      
      navigator.reset();
      expect(navigator.getIndex()).toBe(0);
    });

    it("should transition states in WorkflowStateManager", () => {
      const mgr = new WorkflowStateManager();
      const wf = new TestWorkflow(context);
      mgr.transitionTo(wf, WorkflowState.Suspended);
      expect(wf.state).toBe(WorkflowState.Suspended);
    });

    it("should persist checkpoints and hydrate using WorkflowHydrator", () => {
      const checkpointManager = new WorkflowCheckpointManager();
      const hydrator = new WorkflowHydrator(checkpointManager);

      checkpointManager.saveCheckpoint("wf-1", { activeStep: "restored-step" });

      const wf = new TestWorkflow(context);
      expect(wf.getActiveStep()).toBe("step-1");

      const success = hydrator.hydrate(wf);
      expect(success).toBe(true);
      expect(wf.getActiveStep()).toBe("restored-step");
    });
  });

  describe("Validation & Decisions", () => {
    it("should validate configurations in WorkflowValidator", () => {
      const validator = new WorkflowValidator();
      const wf = new TestWorkflow(context);
      expect(validator.validate(wf)).toHaveLength(0);

      const invalidWf = new TestWorkflow(new WorkflowContext({ id: "", version: "" }));
      expect(validator.validate(invalidWf)).toContain("Workflow ID is required");
    });

    it("should record decision logs in WorkflowDecision", () => {
      const decision = new WorkflowDecision(true, ["step-1"], [], 120);
      expect(decision.isSuccess).toBe(true);
      expect(decision.completedSteps).toContain("step-1");
      expect(decision.durationMs).toBe(120);
    });

    it("should evaluate expression variables in WorkflowConditionEvaluator", () => {
      const evaluator = new WorkflowConditionEvaluator();
      expect(evaluator.evaluate("isApproved", { approved: true })).toBe(true);
      expect(evaluator.evaluate("isApproved", { approved: false })).toBe(false);
    });

    it("should resolve step transitions in WorkflowTransitionResolver", () => {
      const resolver = new WorkflowTransitionResolver();
      expect(resolver.resolveNextStep(1, "approve")).toBe(3);
      expect(resolver.resolveNextStep(1, "next")).toBe(2);
    });
  });

  describe("Rendering & Interaction", () => {
    it("should render visual outputs in WorkflowRenderer", () => {
      const renderer = new WorkflowRenderer();
      const wf = new TestWorkflow(context);
      const res = renderer.render(wf);

      expect(res).toBeInstanceOf(RenderResult);
      expect(res.output).toBe('<div class="workflow-view">Created</div>');
      expect(res.diagnostics.workflowId).toBe("wf-1");
    });

    it("should compute progress rates in WorkflowProgressTracker", () => {
      const tracker = new WorkflowProgressTracker();
      expect(tracker.getProgressPercent(1, 4)).toBe(25);
    });

    it("should collect timeline node history in WorkflowTimeline", () => {
      const timeline = new WorkflowTimeline();
      timeline.addNode("step-1");
      timeline.addNode("step-2");
      expect(timeline.getNodes()).toEqual(["step-1", "step-2"]);
    });

    it("should track user events in WorkflowInteractionManager", () => {
      const mgr = new WorkflowInteractionManager();
      mgr.handleInteraction("click-next");
      expect(mgr.getLastInteraction()).toBe("click-next");
    });
  });

  describe("Events & Observers", () => {
    it("should publish events to observers", () => {
      const dispatcher = new WorkflowEventDispatcher();
      const observer = new WorkflowObserver(dispatcher);

      let count = 0;
      const token = observer.observe((ev) => {
        count++;
        expect(ev.workflowId).toBe("wf-1");
        expect(ev.type).toBe("execution");
      });

      dispatcher.dispatch(new WorkflowLifecycleEvent("wf-1", "execution"));
      expect(count).toBe(1);

      token.dispose();
      dispatcher.dispatch(new WorkflowLifecycleEvent("wf-1", "execution"));
      expect(count).toBe(1);
    });
  });

  describe("Factory", () => {
    it("should compose factory components", () => {
      const factory = new WorkflowFactory();
      const reg = factory.createRegistry();
      expect(reg).toBeInstanceOf(WorkflowRegistry);
    });
  });
});
