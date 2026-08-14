"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticReport = void 0;
/**
 * DiagnosticReport formatting target issues reports details.
 */
class DiagnosticReport {
    issueDetected;
    details;
    timestamp;
    constructor(issueDetected, details, timestamp = Date.now()) {
        this.issueDetected = issueDetected;
        this.details = details;
        this.timestamp = timestamp;
        Object.freeze(this.details);
        Object.freeze(this);
    }
}
exports.DiagnosticReport = DiagnosticReport;
