import { RuleBasedReasoner } from "../reasoning/RuleBasedReasoner.js";
import { ModelBasedReasoner } from "../reasoning/ModelBasedReasoner.js";
import { MockModelProvider } from "../reasoning/MockModelProvider.js";

export class ReasoningFactory {
  public createRuleReasoner(): RuleBasedReasoner {
    return new RuleBasedReasoner();
  }

  public createModelReasoner(): ModelBasedReasoner {
    const provider = new MockModelProvider();
    return new ModelBasedReasoner(provider);
  }
}
