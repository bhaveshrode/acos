"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionResolver = void 0;
/**
 * PermissionResolver evaluating role permissions maps and matching wildcard authorizations.
 */
class PermissionResolver {
    static ROLE_PERMISSIONS = {
        admin: ["*"],
        manager: ["read:*", "write:customer", "write:invoice"],
        user: ["read:*"]
    };
    static resolvePermissions(principal) {
        const roles = [];
        const roleClaim = principal.getClaim("role") || principal.getClaim("roles");
        if (Array.isArray(roleClaim)) {
            roles.push(...roleClaim);
        }
        else if (typeof roleClaim === "string") {
            roles.push(roleClaim);
        }
        const permissions = new Set();
        for (const role of roles) {
            const list = this.ROLE_PERMISSIONS[role.toLowerCase()];
            if (list) {
                list.forEach((p) => permissions.add(p));
            }
        }
        return Array.from(permissions);
    }
    static hasPermission(principal, permission) {
        const principalPermissions = this.resolvePermissions(principal);
        if (principalPermissions.includes("*"))
            return true;
        if (principalPermissions.includes(permission))
            return true;
        const parts = permission.split(":");
        if (parts.length === 2) {
            const wildcard = `${parts[0]}:*`;
            if (principalPermissions.includes(wildcard))
                return true;
        }
        return false;
    }
}
exports.PermissionResolver = PermissionResolver;
