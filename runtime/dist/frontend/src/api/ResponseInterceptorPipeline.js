"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptorPipeline = void 0;
/**
 * ResponseInterceptorPipeline running response filters.
 */
class ResponseInterceptorPipeline {
    interceptors;
    constructor(interceptors = []) {
        this.interceptors = interceptors;
    }
    async execute(response) {
        let current = response;
        for (const interceptor of this.interceptors) {
            if (interceptor.interceptResponse) {
                current = await interceptor.interceptResponse(current);
            }
        }
        return current;
    }
}
exports.ResponseInterceptorPipeline = ResponseInterceptorPipeline;
