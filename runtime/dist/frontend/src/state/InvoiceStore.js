"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceStore = void 0;
/**
 * InvoiceStore coordinating invoicing.
 */
class InvoiceStore {
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
    async fetchInvoice(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getInvoice(id);
            this.store.update((s) => {
                s.activeInvoice = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch invoice";
                s.loading = false;
            });
        }
    }
    async issueInvoice(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.issueInvoice(payload);
            this.store.update((s) => {
                s.invoices.push(response.data);
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to issue invoice";
                s.loading = false;
            });
        }
    }
}
exports.InvoiceStore = InvoiceStore;
