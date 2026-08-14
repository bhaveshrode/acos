"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnershipAuthorizationHandler = void 0;
/**
 * OwnershipAuthorizationHandler validating owner relationships rules asynchronously.
 */
class OwnershipAuthorizationHandler {
    canHandle(requirement) {
        return requirement.type === "ownership";
    }
    async evaluate(context, requirement) {
        const ownerId = context.resourceMetadata.ownerId || context.resourceMetadata.userId;
        if (!ownerId)
            return false;
        return context.user.userId === ownerId;
    }
}
exports.OwnershipAuthorizationHandler = OwnershipAuthorizationHandler;
