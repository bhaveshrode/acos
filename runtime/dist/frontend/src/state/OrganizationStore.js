"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationStore = void 0;
/**
 * OrganizationStore coordinating settings modifications.
 */
class OrganizationStore {
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
    async fetchOrganization(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getOrganization(id);
            this.store.update((s) => {
                s.activeOrganization = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch organization";
                s.loading = false;
            });
        }
    }
}
exports.OrganizationStore = OrganizationStore;
