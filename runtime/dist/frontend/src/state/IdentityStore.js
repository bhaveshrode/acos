"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityStore = void 0;
/**
 * IdentityStore coordinating login and register actions.
 */
class IdentityStore {
    store;
    api;
    constructor(store, api) {
        this.store = store;
        this.api = api;
    }
    getState() {
        return this.store.getState();
    }
    getSnapshot() {
        return this.store.getSnapshot();
    }
    subscribe(listener) {
        return this.store.subscribe(listener);
    }
    async login(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.login(payload);
            this.store.update((s) => {
                s.currentUser = response.data;
                s.isAuthenticated = true;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Login failed";
                s.loading = false;
            });
        }
    }
    async register(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            await this.api.register(payload);
            this.store.update((s) => {
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Registration failed";
                s.loading = false;
            });
        }
    }
}
exports.IdentityStore = IdentityStore;
