"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationHandler = void 0;
const ApiRequest_js_1 = require("./ApiRequest.js");
/**
 * AuthenticationHandler attaching tokens to outgoing requests.
 */
class AuthenticationHandler {
    tokenProvider;
    headerScheme;
    constructor(tokenProvider, headerScheme = "Bearer") {
        this.tokenProvider = tokenProvider;
        this.headerScheme = headerScheme;
    }
    attachToken(request) {
        const token = this.tokenProvider.getToken();
        if (!token)
            return request;
        const headers = {
            ...request.headers,
            Authorization: `${this.headerScheme} ${token}`
        };
        return new ApiRequest_js_1.ApiRequest(request.method, request.url, headers, request.query, request.body, request.timeoutMs);
    }
}
exports.AuthenticationHandler = AuthenticationHandler;
