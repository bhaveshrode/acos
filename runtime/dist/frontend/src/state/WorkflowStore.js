"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStore = void 0;
/**
 * WorkflowStore coordinating step mutations.
 */
class WorkflowStore {
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
    async fetchWorkflow(id) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.getWorkflow(id);
            this.store.update((s) => {
                s.activeWorkflow = response.data;
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to fetch workflow";
                s.loading = false;
            });
        }
    }
    async triggerWorkflowAction(id, payload) {
        this.store.update((s) => {
            s.loading = true;
            s.error = null;
        });
        try {
            const response = await this.api.triggerWorkflowAction(id, payload);
            this.store.update((s) => {
                const index = s.workflows.findIndex((w) => w.id === id);
                if (index !== -1) {
                    s.workflows[index] = response.data;
                }
                else {
                    s.workflows.push(response.data);
                }
                s.loading = false;
            });
        }
        catch (err) {
            this.store.update((s) => {
                s.error = err.message || "Failed to trigger workflow action";
                s.loading = false;
            });
        }
    }
}
exports.WorkflowStore = WorkflowStore;
