"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiContext = void 0;
/**
 * ApiContext holding active options and security token providers references.
 */
class ApiContext {
    options;
    tokenProvider;
    constructor(options, tokenProvider) {
        this.options = options;
        this.tokenProvider = tokenProvider;
        Object.freeze(this);
    }
}
exports.ApiContext = ApiContext;
