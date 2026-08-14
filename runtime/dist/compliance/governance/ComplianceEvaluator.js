import { ComplianceDecision } from "./ComplianceDecision.js";
/**
 * ComplianceEvaluator assessing action context safety.
 */
export class ComplianceEvaluator {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    evaluate(context) {
        const violatedRequirements = [];
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
