"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryManager = void 0;
/**
 * HistoryManager coordinating undo, redo, and history depth bounds pruning.
 */
class HistoryManager {
    store;
    limit;
    undoStack = [];
    redoStack = [];
    constructor(store, limit = 20) {
        this.store = store;
        this.limit = limit;
        this.undoStack.push(store.getSnapshot());
    }
    record(snapshot) {
        this.undoStack.push(snapshot);
        this.redoStack = [];
        if (this.undoStack.length > this.limit) {
            this.undoStack.shift();
        }
    }
    undo() {
        if (this.undoStack.length <= 1)
            return false;
        const current = this.undoStack.pop();
        this.redoStack.push(current);
        const previous = this.undoStack[this.undoStack.length - 1];
        this.store.update((state) => {
            Object.assign(state, previous.data);
        });
        return true;
    }
    redo() {
        if (this.redoStack.length === 0)
            return false;
        const next = this.redoStack.pop();
        this.undoStack.push(next);
        this.store.update((state) => {
            Object.assign(state, next.data);
        });
        return true;
    }
    getUndoStack() {
        return [...this.undoStack];
    }
    getRedoStack() {
        return [...this.redoStack];
    }
}
exports.HistoryManager = HistoryManager;
