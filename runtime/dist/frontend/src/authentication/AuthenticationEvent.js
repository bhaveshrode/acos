"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationEvent = void 0;
/**
 * AuthenticationEvent enclosing timestamps and session details.
 */
class AuthenticationEvent {
    type;
    timestamp;
    session;
    constructor(type, timestamp = Date.now(), session) {
        this.type = type;
        this.timestamp = timestamp;
        this.session = session;
        Object.freeze(this);
    }
}
exports.AuthenticationEvent = AuthenticationEvent;
