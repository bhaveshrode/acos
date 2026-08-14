/**
 * ComplianceRequirement defining a single policy evaluation check.
 */
export class ComplianceRequirement {
    code;
    description;
    evaluateFn;
    constructor(code, description, evaluateFn) {
        this.code = code;
        this.description = description;
        this.evaluateFn = evaluateFn;
        Object.freeze(this);
    }
    isSatisfiedBy(context) {
        return this.evaluateFn(context);
    }
}
