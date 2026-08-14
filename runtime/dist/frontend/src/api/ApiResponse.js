"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
/**
 * ApiResponse wrapping response data, status, headers, and duration telemetry metrics.
 */
class ApiResponse {
    data;
    status;
    headers;
    durationMs;
    constructor(data, status, headers = {}, durationMs = 0) {
        this.data = data;
        this.status = status;
        this.headers = headers;
        this.durationMs = durationMs;
        Object.freeze(this.headers);
        Object.freeze(this);
    }
}
exports.ApiResponse = ApiResponse;
