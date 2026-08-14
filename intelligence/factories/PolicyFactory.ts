import { PolicyEvaluator } from "../policies/PolicyEvaluator.js";

export class PolicyFactory {
  public createPolicyEvaluator(): PolicyEvaluator {
    return new PolicyEvaluator();
  }
}
