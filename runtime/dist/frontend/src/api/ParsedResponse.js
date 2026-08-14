"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedResponse = void 0;
/**
 * ParsedResponse capturing raw response formats, headers, and normalized ApiResponse models.
 */
class ParsedResponse {
    response;
    rawBody;
    contentType;
    headers;
    constructor(response, rawBody, contentType, headers = {}) {
        this.response = response;
        this.rawBody = rawBody;
        this.contentType = contentType;
        this.headers = headers;
        Object.freeze(this.headers);
        Object.freeze(this);
    }
}
exports.ParsedResponse = ParsedResponse;
