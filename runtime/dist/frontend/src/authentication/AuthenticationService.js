"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const AuthenticationResult_js_1 = require("./AuthenticationResult.js");
/**
 * AuthenticationService coordinating validating credentials and provider pipelines updates.
 */
class AuthenticationService {
    registry;
    sessionManager;
    credentialValidator;
    sessionValidator;
    constructor(registry, sessionManager, credentialValidator, sessionValidator) {
        this.registry = registry;
        this.sessionManager = sessionManager;
        this.credentialValidator = credentialValidator;
        this.sessionValidator = sessionValidator;
    }
    async login(providerName, credentials) {
        const validationErrors = this.credentialValidator.validate(credentials);
        if (validationErrors.length > 0) {
            return AuthenticationResult_js_1.AuthenticationResult.failed(validationErrors.join(", "));
        }
        const provider = this.registry.getProvider(providerName);
        if (!provider) {
            return AuthenticationResult_js_1.AuthenticationResult.failed(`Identity provider ${providerName} is not registered`);
        }
        const result = await provider.authenticate(credentials);
        if (result.success && result.session) {
            this.sessionManager.setSession(result.session);
        }
        return result;
    }
    logout() {
        this.sessionManager.clearSession();
    }
    checkSession() {
        const ctx = this.sessionManager.getContext();
        const isValid = this.sessionValidator.validate(ctx.session);
        if (!isValid && ctx.session) {
            this.sessionManager.setExpired();
        }
        return isValid;
    }
}
exports.AuthenticationService = AuthenticationService;
