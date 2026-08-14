"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementStore = void 0;
/**
 * SettlementStore coordinating settlement runs.
 */
class SettlementStore {
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
    async fetchSettlement(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getSettlement(id);
            this.store.update((s) => {
                s.activeSettlement = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch settlement";
                s.loading = false;
            });
        }
    }
    async initiateSettlement(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.initiateSettlement(payload);
            this.store.update((s) => {
                s.settlements.push(response.data);
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to initiate settlement";
                s.loading = false;
            });
        }
    }
}
exports.SettlementStore = SettlementStore;
