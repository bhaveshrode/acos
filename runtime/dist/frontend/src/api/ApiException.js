"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiException = void 0;
/**
 * ApiException carrying status codes and failure parameters.
 */
class ApiException extends Error {
    message;
    status;
    responseData;
    name = "ApiException";
    constructor(message, status, responseData) {
        super(message);
        this.message = message;
        this.status = status;
        this.responseData = responseData;
    }
}
exports.ApiException = ApiException;
