"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorInterceptor = void 0;
/**
 * ErrorInterceptor filtering responses.
 */
class ErrorInterceptor {
    async interceptResponse(response) {
        return response;
    }
}
exports.ErrorInterceptor = ErrorInterceptor;
