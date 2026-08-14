"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialValidator = void 0;
/**
 * CredentialValidator performing formats validation on username/passwords.
 */
class CredentialValidator {
    validate(credentials) {
        const errors = [];
        if (!credentials) {
            errors.push("Credentials payload is required");
            return errors;
        }
        if (!credentials.username ||
            typeof credentials.username !== "string" ||
            credentials.username.trim() === "") {
            errors.push("Username is required");
        }
        if (!credentials.password ||
            typeof credentials.password !== "string" ||
            credentials.password.length < 4) {
            errors.push("Password must be at least 4 characters long");
        }
        return errors;
    }
}
exports.CredentialValidator = CredentialValidator;
