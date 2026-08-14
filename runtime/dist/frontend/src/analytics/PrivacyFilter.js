"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyFilter = void 0;
/**
 * PrivacyFilter removing sensitive email templates or passwords.
 */
class PrivacyFilter {
    filterSensitiveData(payload) {
        const sanitized = { ...payload };
        for (const key of Object.keys(sanitized)) {
            if (key.toLowerCase().includes("email")) {
                sanitized[key] = "[MASKED_EMAIL]";
            }
            if (key.toLowerCase().includes("password") || key.toLowerCase().includes("secret")) {
                sanitized[key] = "[REDACTED]";
            }
        }
        return sanitized;
    }
}
exports.PrivacyFilter = PrivacyFilter;
