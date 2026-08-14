"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorMapper = void 0;
const ApiException_js_1 = require("./ApiException.js");
/**
 * ApiErrorMapper mapping HTTP codes and transport failures into custom exceptions.
 */
class ApiErrorMapper {
    static map(response) {
        const data = response.data;
        const message = (data && (data.message || data.error)) ||
            `API request failed with status: ${response.status}`;
        return new ApiException_js_1.ApiException(message, response.status, data);
    }
    static mapTransportError(error, request) {
        return new ApiException_js_1.ApiException(`Network connection failure for request: ${request.url} - ${error.message}`);
    }
}
exports.ApiErrorMapper = ApiErrorMapper;
