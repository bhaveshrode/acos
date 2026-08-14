"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationState = void 0;
/**
 * AuthorizationState enum capturing evaluating phases.
 */
var AuthorizationState;
(function (AuthorizationState) {
    AuthorizationState["Unknown"] = "Unknown";
    AuthorizationState["Evaluating"] = "Evaluating";
    AuthorizationState["Authorized"] = "Authorized";
    AuthorizationState["Denied"] = "Denied";
})(AuthorizationState || (exports.AuthorizationState = AuthorizationState = {}));
