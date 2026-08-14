import { Entity } from "./Entity.js";
/**
 * Base AggregateRoot class that extends Entity.
 * Serves as the consistency boundary for a cluster of domain objects.
 * Manages the generation, retrieval, and clearing of domain events.
 */
export class AggregateRoot extends Entity {
    _domainEvents = [];
    /**
     * Creates a new AggregateRoot instance.
     * @param id The stable, unique identifier of the aggregate.
     */
    constructor(id) {
        super(id);
    }
    /**
     * Retrieves a read-only list of pending domain events for this aggregate.
     * Returns a frozen copy of the collection to prevent external mutation.
     */
    get domainEvents() {
        return Object.freeze([...this._domainEvents]);
    }
    /**
     * Registers a new domain event. Should only be called internally by business methods.
     * @param event The domain event to register.
     */
    addDomainEvent(event) {
        if (event === null || event === undefined) {
            throw new Error("Domain event cannot be null or undefined.");
        }
        this._domainEvents.push(event);
    }
    /**
     * Clears the collection of pending domain events.
     */
    clearDomainEvents() {
        this._domainEvents.length = 0;
    }
}
