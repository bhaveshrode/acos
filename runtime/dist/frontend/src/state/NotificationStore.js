"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStore = void 0;
/**
 * NotificationStore coordinating notifications dispatches.
 */
class NotificationStore {
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
    async fetchNotification(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getNotification(id);
            this.store.update((s) => {
                s.activeNotification = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch notification";
                s.loading = false;
            });
        }
    }
    async sendNotification(payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.sendNotification(payload);
            this.store.update((s) => {
                s.notifications.push(response.data);
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to send notification";
                s.loading = false;
            });
        }
    }
}
exports.NotificationStore = NotificationStore;
