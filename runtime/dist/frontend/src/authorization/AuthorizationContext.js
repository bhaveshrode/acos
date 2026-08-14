"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationContext = void 0;
const AuthorizationState_js_1 = require("./AuthorizationState.js");
/**
 * AuthorizationContext carrying authenticated principal, resolved permissions, and metadata.
 */
class AuthorizationContext {
    user;
    permissions;
    resourceMetadata;
    state;
    constructor(user, permissions = [], resourceMetadata = {}, state = AuthorizationState_js_1.AuthorizationState.Unknown) {
        this.user = user;
        this.permissions = permissions;
        this.resourceMetadata = resourceMetadata;
        this.state = state;
        Object.freeze(this.permissions);
        Object.freeze(this.resourceMetadata);
        Object.freeze(this);
    }
}
exports.AuthorizationContext = AuthorizationContext;
