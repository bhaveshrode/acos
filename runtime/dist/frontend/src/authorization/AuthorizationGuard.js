"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationGuard = void 0;
const GuardResult_js_1 = require("../routing/GuardResult.js");
const AuthorizationContext_js_1 = require("./AuthorizationContext.js");
const PermissionResolver_js_1 = require("../authentication/PermissionResolver.js");
/**
 * AuthorizationGuard implementing IRouteGuard for route navigation checks.
 */
class AuthorizationGuard {
    evaluator;
    policyRegistry;
    getUserPrincipal;
    constructor(evaluator, policyRegistry, getUserPrincipal) {
        this.evaluator = evaluator;
        this.policyRegistry = policyRegistry;
        this.getUserPrincipal = getUserPrincipal;
    }
    async canActivate(context) {
        const policyName = context.meta?.authorizationPolicy;
        if (!policyName) {
            return GuardResult_js_1.GuardResult.allow();
        }
        const policy = this.policyRegistry.getPolicy(policyName);
        if (!policy) {
            return GuardResult_js_1.GuardResult.deny(`Authorization policy ${policyName} not registered`);
        }
        const user = this.getUserPrincipal();
        if (!user) {
            return GuardResult_js_1.GuardResult.redirect("/login", "User is not authenticated");
        }
        const permissions = PermissionResolver_js_1.PermissionResolver.resolvePermissions(user);
        const authCtx = new AuthorizationContext_js_1.AuthorizationContext(user, permissions, context.meta || {});
        const result = await this.evaluator.evaluate(authCtx, policy);
        if (result.allowed) {
            return GuardResult_js_1.GuardResult.allow();
        }
        if (result.redirectPath) {
            return GuardResult_js_1.GuardResult.redirect(result.redirectPath, result.reason);
        }
        return GuardResult_js_1.GuardResult.deny(result.reason || "Access denied by policy check");
    }
}
exports.AuthorizationGuard = AuthorizationGuard;
