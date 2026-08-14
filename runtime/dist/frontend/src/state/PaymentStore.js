"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStore = void 0;
/**
 * PaymentStore coordinating transactions.
 */
class PaymentStore {
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
    async fetchPayment(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getPayment(id);
            this.store.update((s) => {
                s.activePayment = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch payment";
                s.loading = false;
            });
        }
    }
    async processPayment(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.processPayment(payload);
            this.store.update((s) => {
                s.payments.push(response.data);
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to process payment";
                s.loading = false;
            });
        }
    }
}
exports.PaymentStore = PaymentStore;
