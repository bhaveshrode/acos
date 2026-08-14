import { AgentFactory } from "./AgentFactory.js";
import { ContextFactory } from "./ContextFactory.js";
import { ReasoningFactory } from "./ReasoningFactory.js";
import { ToolFactory } from "./ToolFactory.js";
import { PlanningFactory } from "./PlanningFactory.js";
import { DecisionFactory } from "./DecisionFactory.js";
import { PolicyFactory } from "./PolicyFactory.js";
import { ExecutionFactory } from "./ExecutionFactory.js";
import { MemoryFactory } from "./MemoryFactory.js";
import { EventFactory } from "./EventFactory.js";
import { PromptFactory } from "./PromptFactory.js";
import { ApprovalFactory } from "./ApprovalFactory.js";

export class IntelligenceComposition {
  constructor(
    public readonly agents: AgentFactory = new AgentFactory(),
    public readonly context: ContextFactory = new ContextFactory(),
    public readonly reasoning: ReasoningFactory = new ReasoningFactory(),
    public readonly tools: ToolFactory = new ToolFactory(),
    public readonly planning: PlanningFactory = new PlanningFactory(),
    public readonly decisions: DecisionFactory = new DecisionFactory(),
    public readonly policies: PolicyFactory = new PolicyFactory(),
    public readonly execution: ExecutionFactory = new ExecutionFactory(),
    public readonly memory: MemoryFactory = new MemoryFactory(),
    public readonly events: EventFactory = new EventFactory(),
    public readonly prompts: PromptFactory = new PromptFactory(),
    public readonly approvals: ApprovalFactory = new ApprovalFactory()
  ) {
    Object.freeze(this);
  }
}
