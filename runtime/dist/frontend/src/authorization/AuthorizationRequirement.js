"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationRequirement = void 0;
/**
 * AuthorizationRequirement capturing requirement type and value properties.
 */
class AuthorizationRequirement {
    type;
    value;
    constructor(type, value) {
        this.type = type;
        this.value = value;
        Object.freeze(this);
    }
}
exports.AuthorizationRequirement = AuthorizationRequirement;
