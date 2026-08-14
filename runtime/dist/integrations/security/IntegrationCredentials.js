"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationCredentials = void 0;
/**
 * IntegrationCredentials wrapping external credentials secrets.
 */
class IntegrationCredentials {
    clientId;
    clientSecret;
    tokenUrl;
    constructor(clientId, clientSecret, tokenUrl) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenUrl = tokenUrl;
        Object.freeze(this);
    }
}
exports.IntegrationCredentials = IntegrationCredentials;
