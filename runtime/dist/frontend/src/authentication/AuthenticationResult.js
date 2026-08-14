"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationResult = void 0;
/**
 * AuthenticationResult wrapping successes, failures, and challenge-required outcomes.
 */
class AuthenticationResult {
    success;
    session;
    error;
    challengeRequired;
    constructor(success, session, error, challengeRequired) {
        this.success = success;
        this.session = session;
        this.error = error;
        this.challengeRequired = challengeRequired;
        Object.freeze(this);
    }
    static success(session) {
        return new AuthenticationResult(true, session);
    }
    static failed(error) {
        return new AuthenticationResult(false, undefined, error);
    }
    static challenge() {
        return new AuthenticationResult(false, undefined, undefined, true);
    }
}
exports.AuthenticationResult = AuthenticationResult;
