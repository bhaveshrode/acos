import { IntelligenceDecision } from "../decisions/IntelligenceDecision.js";
export class DecisionFactory {
    createDecision(props) {
        return new IntelligenceDecision(props);
    }
}
