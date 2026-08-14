"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
/**
 * LoggingInterceptor tracking request metrics.
 */
class LoggingInterceptor {
    logs = [];
    async interceptRequest(request) {
        this.logs.push(`[API REQUEST] ${request.method} -> ${request.url}`);
        return request;
    }
    async interceptResponse(response) {
        this.logs.push(`[API RESPONSE] Status: ${response.status} (${response.durationMs}ms)`);
        return response;
    }
    getLogs() {
        return [...this.logs];
    }
}
exports.LoggingInterceptor = LoggingInterceptor;
