import { PolicyEvaluator } from "../policies/PolicyEvaluator.js";
export class PolicyFactory {
    createPolicyEvaluator() {
        return new PolicyEvaluator();
    }
}
