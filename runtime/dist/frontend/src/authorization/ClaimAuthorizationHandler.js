"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimAuthorizationHandler = void 0;
/**
 * ClaimAuthorizationHandler validating user claim values presence asynchronously.
 */
class ClaimAuthorizationHandler {
    canHandle(requirement) {
        return requirement.type === "claim";
    }
    async evaluate(context, requirement) {
        const { type, value } = requirement.value || {};
        if (!type)
            return false;
        return context.user.hasClaim(type, value);
    }
}
exports.ClaimAuthorizationHandler = ClaimAuthorizationHandler;
