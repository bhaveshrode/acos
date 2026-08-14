"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAuthorizationHandler = void 0;
/**
 * RoleAuthorizationHandler validating role claim rules asynchronously.
 */
class RoleAuthorizationHandler {
    canHandle(requirement) {
        return requirement.type === "role";
    }
    async evaluate(context, requirement) {
        const userRole = context.user.getClaim("role") || context.user.getClaim("roles");
        const requiredRole = requirement.value;
        if (Array.isArray(userRole)) {
            return userRole.map((r) => r.toLowerCase()).includes(requiredRole.toLowerCase());
        }
        if (typeof userRole === "string") {
            return userRole.toLowerCase() === requiredRole.toLowerCase();
        }
        return false;
    }
}
exports.RoleAuthorizationHandler = RoleAuthorizationHandler;
