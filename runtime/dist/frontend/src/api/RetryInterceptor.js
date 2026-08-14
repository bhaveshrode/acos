"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryInterceptor = void 0;
const NoRetryPolicy_js_1 = require("./NoRetryPolicy.js");
/**
 * RetryInterceptor utilizing a decoupled IRetryPolicy abstraction strategy.
 */
class RetryInterceptor {
    policy;
    constructor(policy = new NoRetryPolicy_js_1.NoRetryPolicy()) {
        this.policy = policy;
    }
    async interceptResponse(response) {
        return response;
    }
    getPolicy() {
        return this.policy;
    }
}
exports.RetryInterceptor = RetryInterceptor;
