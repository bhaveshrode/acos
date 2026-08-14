"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const ResponseParser_js_1 = require("./ResponseParser.js");
/**
 * ApiClient executing requests via standard Fetch and extracting ApiResponse wrappers.
 */
class ApiClient {
    context;
    constructor(context) {
        this.context = context;
    }
    async execute(request) {
        const baseUrl = this.context.options.baseUrl;
        const url = `${baseUrl.replace(/\/$/, "")}/${request.url.replace(/^\//, "")}`;
        const queryParams = new URLSearchParams(request.query).toString();
        const finalUrl = queryParams ? `${url}?${queryParams}` : url;
        const headers = new Headers(request.headers);
        const config = {
            method: request.method,
            headers
        };
        if (request.body !== undefined) {
            if (typeof request.body === "object") {
                headers.set("Content-Type", "application/json");
                config.body = JSON.stringify(request.body);
            }
            else {
                config.body = String(request.body);
            }
        }
        if (this.context.options.withCredentials) {
            config.credentials = "include";
        }
        const start = Date.now();
        const controller = new AbortController();
        const timeoutMs = request.timeoutMs || this.context.options.timeoutMs;
        let timeoutId;
        if (timeoutMs) {
            config.signal = controller.signal;
            timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        }
        try {
            const response = await fetch(finalUrl, config);
            const duration = Date.now() - start;
            const parsed = await ResponseParser_js_1.ResponseParser.parse(response, duration);
            return parsed.response;
        } // wait, error is raised if network is down/aborted
        finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }
}
exports.ApiClient = ApiClient;
