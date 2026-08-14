import { ComplianceRegistry } from "./ComplianceRegistry.js";
import { ComplianceContext } from "./ComplianceContext.js";
import { ComplianceDecision } from "./ComplianceDecision.js";

/**
 * ComplianceEvaluator assessing action context safety.
 */
export class ComplianceEvaluator {
  constructor(private readonly registry: ComplianceRegistry) {}

  public evaluate(context: ComplianceContext): ComplianceDecision {
    const violatedRequirements: string[] = [];
    const policies = this.registry.listPolicies();

    for (const policy of policies) {
      for (const req of policy.requirements) {
        if (!req.isSatisfiedBy(context)) {
          violatedRequirements.push(req.code);
        }
      }
    }

    const isAllowed = violatedRequirements.length === 0;
    return new ComplianceDecision(isAllowed, violatedRequirements);
  }
}
