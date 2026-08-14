/**
 * EventSubscriptionManager tracking unsubscribe callbacks.
 */
export class EventSubscriptionManager {
    bus;
    unsubscribers = [];
    constructor(bus) {
        this.bus = bus;
    }
    register(topic, callback) {
        const unsub = this.bus.subscribe(topic, callback);
        this.unsubscribers.push(unsub);
    }
    clear() {
        for (const unsub of this.unsubscribers) {
            unsub();
        }
        this.unsubscribers.length = 0;
    }
}
