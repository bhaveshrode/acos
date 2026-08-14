"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationEvaluator = void 0;
const AuthorizationDecision_js_1 = require("./AuthorizationDecision.js");
/**
 * AuthorizationEvaluator coordinating handlers checks against compiled policies requirements.
 */
class AuthorizationEvaluator {
    handlers;
    constructor(handlers) {
        this.handlers = handlers;
    }
    async evaluate(context, policy) {
        const failedRequirements = [];
        for (const requirement of policy.requirements) {
            const handler = this.handlers.find((h) => h.canHandle(requirement));
            if (!handler) {
                return AuthorizationDecision_js_1.AuthorizationDecision.deny(policy.name, [requirement], `No registered authorization handler found for requirement type ${requirement.type}`);
            }
            const succeeded = await handler.evaluate(context, requirement);
            if (!succeeded) {
                failedRequirements.push(requirement);
            }
        }
        if (failedRequirements.length > 0) {
            return AuthorizationDecision_js_1.AuthorizationDecision.deny(policy.name, failedRequirements, `Policy check failed on one or more requirements`);
        }
        return AuthorizationDecision_js_1.AuthorizationDecision.allow(policy.name);
    }
}
exports.AuthorizationEvaluator = AuthorizationEvaluator;
