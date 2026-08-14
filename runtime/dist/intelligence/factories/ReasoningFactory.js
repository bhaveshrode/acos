import { RuleBasedReasoner } from "../reasoning/RuleBasedReasoner.js";
import { ModelBasedReasoner } from "../reasoning/ModelBasedReasoner.js";
import { MockModelProvider } from "../reasoning/MockModelProvider.js";
export class ReasoningFactory {
    createRuleReasoner() {
        return new RuleBasedReasoner();
    }
    createModelReasoner() {
        const provider = new MockModelProvider();
        return new ModelBasedReasoner(provider);
    }
}
