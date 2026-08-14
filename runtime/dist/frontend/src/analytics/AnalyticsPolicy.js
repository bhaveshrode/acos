"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsPolicy = void 0;
/**
 * AnalyticsPolicy checking consent manager permissions.
 */
class AnalyticsPolicy {
    consentManager;
    constructor(consentManager) {
        this.consentManager = consentManager;
    }
    shouldCollectEvent(category) {
        if (category === "performance") {
            return true;
        }
        return this.consentManager.isConsentGranted();
    }
}
exports.AnalyticsPolicy = AnalyticsPolicy;
