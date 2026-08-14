"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyRegistry = void 0;
const CompiledPolicy_js_1 = require("./CompiledPolicy.js");
/**
 * PolicyRegistry cataloging compiled policy templates, preventing mutations post startup.
 */
class PolicyRegistry {
    policies = new Map();
    isFrozen = false;
    register(policy) {
        if (this.isFrozen) {
            throw new Error("PolicyRegistry is frozen and cannot accept further policies");
        }
        const compiled = CompiledPolicy_js_1.CompiledPolicy.compile(policy);
        this.policies.set(policy.name, compiled);
    }
    getPolicy(name) {
        return this.policies.get(name);
    }
    freeze() {
        this.isFrozen = true;
    }
}
exports.PolicyRegistry = PolicyRegistry;
