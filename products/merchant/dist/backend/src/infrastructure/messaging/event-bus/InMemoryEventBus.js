import { InMemoryEventBus as FoundationInMemoryEventBus } from "../../../foundation/events/EventBus.js";
/**
 * Concrete implementation of the infrastructure Event Bus wrapper.
 * Integrates the local foundation event bus for in-process subscriber notifications.
 */
export class InMemoryEventBus {
    delegate = new FoundationInMemoryEventBus();
    async publish(event) {
        await this.delegate.publish(event);
    }
    async publishAll(events) {
        await this.delegate.publishAll(events);
    }
    subscribe(eventName, handler) {
        this.delegate.subscribe(eventName, handler);
    }
    unsubscribe(eventName, handler) {
        this.delegate.unsubscribe(eventName, handler);
    }
}
