"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsReceivableStore = void 0;
/**
 * AccountsReceivableStore coordinating write offs actions.
 */
class AccountsReceivableStore {
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
    async fetchReceivable(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getReceivable(id);
            this.store.update((s) => {
                s.activeReceivable = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch receivable";
                s.loading = false;
            });
        }
    }
    async writeOffReceivable(id, payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.writeOffReceivable(id, payload);
            this.store.update((s) => {
                const index = s.receivables.findIndex((r) => r.id === id);
                if (index !== -1) {
                    s.receivables[index] = response.data;
                }
                else {
                    s.receivables.push(response.data);
                }
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to write off receivable";
                s.loading = false;
            });
        }
    }
}
exports.AccountsReceivableStore = AccountsReceivableStore;
