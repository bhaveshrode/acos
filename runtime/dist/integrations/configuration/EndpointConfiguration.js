"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointConfiguration = void 0;
/**
 * EndpointConfiguration containing base URLs and versions.
 */
class EndpointConfiguration {
    baseUrl;
    version;
    constructor(baseUrl, version = "v1") {
        this.baseUrl = baseUrl;
        this.version = version;
        Object.freeze(this);
    }
}
exports.EndpointConfiguration = EndpointConfiguration;
