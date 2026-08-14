"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryParameterParser = void 0;
/**
 * QueryParameterParser parsing and normalizing query string key-values.
 */
class QueryParameterParser {
    static parse(queryString) {
        const params = {};
        const query = queryString.startsWith("?") ? queryString.substring(1) : queryString;
        if (!query)
            return params;
        const pairs = query.split("&");
        for (const pair of pairs) {
            const [key, value] = pair.split("=");
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || "");
            }
        }
        return params;
    }
}
exports.QueryParameterParser = QueryParameterParser;
