"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTracker = void 0;
/**
 * ErrorTracker gathering unhandled frontend exception payloads.
 */
class ErrorTracker {
    errors = [];
    trackError(error) {
        this.errors.push(error);
    }
    getErrors() {
        return [...this.errors];
    }
}
exports.ErrorTracker = ErrorTracker;
