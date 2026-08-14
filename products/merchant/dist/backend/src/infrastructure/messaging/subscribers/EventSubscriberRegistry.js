/**
 * Registry coordinating the subscription and unsubscription of event handlers.
 */
export class EventSubscriberRegistry {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    /**
     * Registers a handler to receive published events of a given name.
     */
    register(eventName, handler) {
        this.eventBus.subscribe(eventName, handler);
    }
    /**
     * Unregisters a handler from receiving events of a given name.
     */
    unregister(eventName, handler) {
        this.eventBus.unsubscribe(eventName, handler);
    }
}
