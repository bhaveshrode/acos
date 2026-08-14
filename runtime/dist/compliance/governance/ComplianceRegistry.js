/**
 * ComplianceRegistry storing active policies.
 */
export class ComplianceRegistry {
    policies = new Map();
    isFrozen = false;
    register(policy) {
        if (this.isFrozen) {
            throw new Error("ComplianceRegistry is frozen and cannot register new policies");
        }
        this.policies.set(policy.code.toLowerCase(), policy);
    }
    get(code) {
        return this.policies.get(code.toLowerCase());
    }
    freeze() {
        this.isFrozen = true;
    }
    listPolicies() {
        return Array.from(this.policies.values());
    }
}
