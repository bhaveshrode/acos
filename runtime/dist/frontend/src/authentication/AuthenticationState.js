"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationState = void 0;
/**
 * AuthenticationState enum capturing security lifecycle states.
 */
var AuthenticationState;
(function (AuthenticationState) {
    AuthenticationState["Unauthenticated"] = "Unauthenticated";
    AuthenticationState["Authenticating"] = "Authenticating";
    AuthenticationState["Authenticated"] = "Authenticated";
    AuthenticationState["Refreshing"] = "Refreshing";
    AuthenticationState["Expired"] = "Expired";
})(AuthenticationState || (exports.AuthenticationState = AuthenticationState = {}));
