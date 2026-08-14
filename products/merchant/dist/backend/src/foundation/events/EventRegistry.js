/**
 * Registry class responsible for storing and managing event handler subscriptions.
 */
export class EventRegistry {
    handlers = new Map();
    /**
     * Registers an event handler for a specific event name.
     * @param eventName The unique string representing the event name.
     * @param handler The subscriber handler to register.
     */
    register(eventName, handler) {
        if (!eventName || eventName.trim() === "") {
            throw new Error("Event name cannot be null or empty.");
        }
        if (!handler) {
            throw new Error("Event handler cannot be null or undefined.");
        }
        const trimmedName = eventName.trim();
        if (!this.handlers.has(trimmedName)) {
            this.handlers.set(trimmedName, new Set());
        }
        this.handlers.get(trimmedName).add(handler);
    }
    /**
     * Unregisters an event handler from a specific event name.
     * @param eventName The event name.
     * @param handler The subscriber handler to remove.
     */
    unregister(eventName, handler) {
        const trimmedName = eventName.trim();
        const set = this.handlers.get(trimmedName);
        if (set) {
            set.delete(handler);
            if (set.size === 0) {
                this.handlers.delete(trimmedName);
            }
        }
    }
    /**
     * Retrieves all active handlers subscribed to a specific event name.
     * @param eventName The event name.
     */
    getHandlersFor(eventName) {
        const set = this.handlers.get(eventName.trim());
        return set ? Array.from(set) : [];
    }
    /**
     * Clears all handler registrations.
     */
    clear() {
        this.handlers.clear();
    }
}
