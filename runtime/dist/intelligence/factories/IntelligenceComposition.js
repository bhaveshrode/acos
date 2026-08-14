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
    agents;
    context;
    reasoning;
    tools;
    planning;
    decisions;
    policies;
    execution;
    memory;
    events;
    prompts;
    approvals;
    constructor(agents = new AgentFactory(), context = new ContextFactory(), reasoning = new ReasoningFactory(), tools = new ToolFactory(), planning = new PlanningFactory(), decisions = new DecisionFactory(), policies = new PolicyFactory(), execution = new ExecutionFactory(), memory = new MemoryFactory(), events = new EventFactory(), prompts = new PromptFactory(), approvals = new ApprovalFactory()) {
        this.agents = agents;
        this.context = context;
        this.reasoning = reasoning;
        this.tools = tools;
        this.planning = planning;
        this.decisions = decisions;
        this.policies = policies;
        this.execution = execution;
        this.memory = memory;
        this.events = events;
        this.prompts = prompts;
        this.approvals = approvals;
        Object.freeze(this);
    }
}
