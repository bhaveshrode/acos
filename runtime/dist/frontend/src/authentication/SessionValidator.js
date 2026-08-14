"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionValidator = void 0;
/**
 * SessionValidator verifying token structures and sessions duration expirations.
 */
class SessionValidator {
    validate(session) {
        if (!session)
            return false;
        if (!session.token || !session.userId || !session.username)
            return false;
        return !session.isExpired();
    }
}
exports.SessionValidator = SessionValidator;
