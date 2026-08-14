import { IntelligenceDecision, IntelligenceDecisionProps } from "../decisions/IntelligenceDecision.js";

export class DecisionFactory {
  public createDecision(props: IntelligenceDecisionProps): IntelligenceDecision {
    return new IntelligenceDecision(props);
  }
}
