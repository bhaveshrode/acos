"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydrationResult = void 0;
/**
 * HydrationResult modelling hydration outcome success, failures, and recovery types.
 */
class HydrationResult {
    success;
    status;
    reason;
    constructor(success, status, reason) {
        this.success = success;
        this.status = status;
        this.reason = reason;
        Object.freeze(this);
    }
    static success() {
        return new HydrationResult(true, "Success");
    }
    static failed(reason) {
        return new HydrationResult(false, "Failed", reason);
    }
    static recovered(reason) {
        return new HydrationResult(true, "Recovered", reason);
    }
}
exports.HydrationResult = HydrationResult;
