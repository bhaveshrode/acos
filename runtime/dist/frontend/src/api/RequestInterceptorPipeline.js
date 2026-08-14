"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestInterceptorPipeline = void 0;
/**
 * RequestInterceptorPipeline running request filters.
 */
class RequestInterceptorPipeline {
    interceptors;
    constructor(interceptors = []) {
        this.interceptors = interceptors;
    }
    async execute(request) {
        let current = request;
        for (const interceptor of this.interceptors) {
            if (interceptor.interceptRequest) {
                current = await interceptor.interceptRequest(current);
            }
        }
        return current;
    }
}
exports.RequestInterceptorPipeline = RequestInterceptorPipeline;
