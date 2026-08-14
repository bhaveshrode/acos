"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerStore = void 0;
/**
 * CustomerStore coordinating state transitions and customer management REST APIs.
 */
class CustomerStore {
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
    async fetchCustomer(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getCustomer(id);
            this.store.update((s) => {
                s.activeCustomer = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch customer";
                s.loading = false;
            });
        }
    }
    async createCustomer(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.createCustomer(payload);
            this.store.update((s) => {
                s.customers.push(response.data);
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to create customer";
                s.loading = false;
            });
        }
    }
}
exports.CustomerStore = CustomerStore;
