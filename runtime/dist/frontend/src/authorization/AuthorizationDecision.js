"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationDecision = void 0;
/**
 * AuthorizationDecision capturing allow/deny flags, failed requirements lists, redirect paths, and timestamps.
 */
class AuthorizationDecision {
    allowed;
    status;
    policyName;
    failedRequirements;
    redirectPath;
    reason;
    timestamp;
    constructor(allowed, status, policyName, failedRequirements = [], redirectPath, reason, timestamp = Date.now()) {
        this.allowed = allowed;
        this.status = status;
        this.policyName = policyName;
        this.failedRequirements = failedRequirements;
        this.redirectPath = redirectPath;
        this.reason = reason;
        this.timestamp = timestamp;
        Object.freeze(this.failedRequirements);
        Object.freeze(this);
    }
    static allow(policyName) {
        return new AuthorizationDecision(true, "Allowed", policyName);
    }
    static deny(policyName, failed, reason) {
        return new AuthorizationDecision(false, "Denied", policyName, failed, undefined, reason);
    }
    static redirect(policyName, path, reason) {
        return new AuthorizationDecision(false, "Redirect", policyName, [], path, reason);
    }
    static forbidden(policyName, reason) {
        return new AuthorizationDecision(false, "Forbidden", policyName, [], undefined, reason);
    }
}
exports.AuthorizationDecision = AuthorizationDecision;
