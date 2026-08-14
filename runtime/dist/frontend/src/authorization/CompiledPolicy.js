"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompiledPolicy = void 0;
/**
 * CompiledPolicy representing optimized policy checking graphs.
 */
class CompiledPolicy {
    name;
    requirements;
    constructor(name, requirements) {
        this.name = name;
        this.requirements = requirements;
        Object.freeze(this.requirements);
        Object.freeze(this);
    }
    static compile(policy) {
        return new CompiledPolicy(policy.name, [...policy.requirements]);
    }
}
exports.CompiledPolicy = CompiledPolicy;
