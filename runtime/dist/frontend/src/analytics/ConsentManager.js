"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentManager = void 0;
/**
 * ConsentManager tracking opt-in preferences.
 */
class ConsentManager {
    consentGranted = false;
    grantConsent() {
        this.consentGranted = true;
    }
    revokeConsent() {
        this.consentGranted = false;
    }
    isConsentGranted() {
        return this.consentGranted;
    }
}
exports.ConsentManager = ConsentManager;
