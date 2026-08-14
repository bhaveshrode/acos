import { IntelligenceComposition } from "./IntelligenceComposition.js";

export class IntelligenceFactory {
  constructor(
    public readonly composition: IntelligenceComposition = new IntelligenceComposition()
  ) {}

  public get agents() { return this.composition.agents; }
  public get context() { return this.composition.context; }
  public get reasoning() { return this.composition.reasoning; }
  public get tools() { return this.composition.tools; }
  public get planning() { return this.composition.planning; }
  public get decisions() { return this.composition.decisions; }
  public get policies() { return this.composition.policies; }
  public get execution() { return this.composition.execution; }
  public get memory() { return this.composition.memory; }
  public get events() { return this.composition.events; }
  public get prompts() { return this.composition.prompts; }
  public get approvals() { return this.composition.approvals; }
}
