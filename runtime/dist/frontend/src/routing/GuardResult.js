"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardResult = void 0;
/**
 * GuardResult representing routing guard execution checks outcomes.
 */
class GuardResult {
    allowed;
    redirectUrl;
    reason;
    constructor(allowed, redirectUrl, reason) {
        this.allowed = allowed;
        this.redirectUrl = redirectUrl;
        this.reason = reason;
        Object.freeze(this);
    }
    static allow() {
        return new GuardResult(true);
    }
    static deny(reason) {
        return new GuardResult(false, undefined, reason);
    }
    static redirect(url, reason) {
        return new GuardResult(false, url, reason);
    }
}
exports.GuardResult = GuardResult;
