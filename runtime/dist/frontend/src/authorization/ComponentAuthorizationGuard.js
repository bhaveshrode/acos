"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentAuthorizationGuard = void 0;
const AuthorizationContext_js_1 = require("./AuthorizationContext.js");
const PermissionResolver_js_1 = require("../authentication/PermissionResolver.js");
/**
 * ComponentAuthorizationGuard controlling components layouts rendering asynchronously.
 */
class ComponentAuthorizationGuard {
    evaluator;
    policyRegistry;
    constructor(evaluator, policyRegistry) {
        this.evaluator = evaluator;
        this.policyRegistry = policyRegistry;
    }
    async isAuthorized(user, policyName, resourceMetadata) {
        const policy = this.policyRegistry.getPolicy(policyName);
        if (!policy)
            return false;
        const permissions = PermissionResolver_js_1.PermissionResolver.resolvePermissions(user);
        const context = new AuthorizationContext_js_1.AuthorizationContext(user, permissions, resourceMetadata || {});
        const result = await this.evaluator.evaluate(context, policy);
        return result.allowed;
    }
}
exports.ComponentAuthorizationGuard = ComponentAuthorizationGuard;
