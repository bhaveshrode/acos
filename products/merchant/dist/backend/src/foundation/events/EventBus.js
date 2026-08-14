import { EventRegistry } from "./EventRegistry.js";
import { EventDispatcher } from "./EventDispatcher.js";
/**
 * In-Memory Event Bus implementation for local development and testing.
 * Composes EventRegistry and EventDispatcher to orchestrate message delivery in-process.
 */
export class InMemoryEventBus {
    registry;
    dispatcher;
    constructor() {
        this.registry = new EventRegistry();
        this.dispatcher = new EventDispatcher(this.registry);
    }
    /**
     * Publishes a single domain event.
     */
    async publish(event) {
        await this.dispatcher.dispatch(event);
    }
    /**
     * Publishes all domain events sequentially to preserve ordering.
     */
    async publishAll(events) {
        await this.dispatcher.dispatchAll(events);
    }
    /**
     * Subscribes a handler to an event.
     */
    subscribe(eventName, handler) {
        this.registry.register(eventName, handler);
    }
    /**
     * Unsubscribes a handler from an event.
     */
    unsubscribe(eventName, handler) {
        this.registry.unregister(eventName, handler);
    }
}
