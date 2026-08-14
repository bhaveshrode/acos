"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseParser = void 0;
const ApiResponse_js_1 = require("./ApiResponse.js");
const ParsedResponse_js_1 = require("./ParsedResponse.js");
/**
 * ResponseParser executing raw body parsings and outputting a ParsedResponse model.
 */
class ResponseParser {
    static async parse(response, durationMs = 0) {
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        const contentType = response.headers.get("Content-Type") || "";
        let data;
        if (contentType.includes("application/json")) {
            data = await response.json();
        }
        else {
            data = await response.text();
        }
        const apiResponse = new ApiResponse_js_1.ApiResponse(data, response.status, headers, durationMs);
        return new ParsedResponse_js_1.ParsedResponse(apiResponse, data, contentType, headers);
    }
}
exports.ResponseParser = ResponseParser;
