"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionAuthorizationHandler = void 0;
const PermissionResolver_js_1 = require("../authentication/PermissionResolver.js");
/**
 * PermissionAuthorizationHandler validating permission claim matches asynchronously.
 */
class PermissionAuthorizationHandler {
    canHandle(requirement) {
        return requirement.type === "permission";
    }
    async evaluate(context, requirement) {
        return PermissionResolver_js_1.PermissionResolver.hasPermission(context.user, requirement.value);
    }
}
exports.PermissionAuthorizationHandler = PermissionAuthorizationHandler;
