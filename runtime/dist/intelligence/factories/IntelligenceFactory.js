import { IntelligenceComposition } from "./IntelligenceComposition.js";
export class IntelligenceFactory {
    composition;
    constructor(composition = new IntelligenceComposition()) {
        this.composition = composition;
    }
    get agents() { return this.composition.agents; }
    get context() { return this.composition.context; }
    get reasoning() { return this.composition.reasoning; }
    get tools() { return this.composition.tools; }
    get planning() { return this.composition.planning; }
    get decisions() { return this.composition.decisions; }
    get policies() { return this.composition.policies; }
    get execution() { return this.composition.execution; }
    get memory() { return this.composition.memory; }
    get events() { return this.composition.events; }
    get prompts() { return this.composition.prompts; }
    get approvals() { return this.composition.approvals; }
}
