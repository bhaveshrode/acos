"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenProvider = void 0;
/**
 * TokenProvider fetching token strings from the injected ITokenStore.
 */
class TokenProvider {
    store;
    constructor(store) {
        this.store = store;
    }
    getToken() {
        return this.store.retrieveToken();
    }
    setToken(token) {
        this.store.saveToken(token);
    }
    clearToken() {
        this.store.saveToken(null);
    }
}
exports.TokenProvider = TokenProvider;
