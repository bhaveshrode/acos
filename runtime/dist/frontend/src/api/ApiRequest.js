"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRequest = void 0;
/**
 * ApiRequest encapsulating method, URL paths, headers, query parameters, payloads, and timeout settings.
 */
class ApiRequest {
    method;
    url;
    headers;
    query;
    body;
    timeoutMs;
    constructor(method, url, headers = {}, query = {}, body, timeoutMs) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.query = query;
        this.body = body;
        this.timeoutMs = timeoutMs;
        Object.freeze(this.headers);
        Object.freeze(this.query);
        Object.freeze(this);
    }
}
exports.ApiRequest = ApiRequest;
