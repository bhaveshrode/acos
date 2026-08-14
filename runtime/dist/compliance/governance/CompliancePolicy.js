/**
 * CompliancePolicy grouping requirements under a logical policy code.
 */
export class CompliancePolicy {
    code;
    description;
    requirements;
    constructor(code, description, requirements) {
        this.code = code;
        this.description = description;
        this.requirements = Object.freeze([...requirements]);
        Object.freeze(this);
    }
}
