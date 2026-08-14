"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationContext = void 0;
/**
 * AuthenticationContext holding active sessions and security state parameters.
 */
class AuthenticationContext {
    state;
    options;
    session;
    constructor(state, options, session) {
        this.state = state;
        this.options = options;
        this.session = session;
        Object.freeze(this);
    }
}
exports.AuthenticationContext = AuthenticationContext;
