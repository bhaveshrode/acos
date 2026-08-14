/**
 * Base Entity class representing a domain object with a stable identity.
 * Equality of entities is determined by their identity rather than their attributes.
 */
export class Entity {
    _id;
    /**
     * Creates a new Entity instance.
     * @param id The stable, unique identifier of the entity.
     */
    constructor(id) {
        if (id === null || id === undefined) {
            throw new Error("Entity ID cannot be null or undefined.");
        }
        this._id = id;
    }
    /**
     * Exposes the immutable identity of the entity.
     */
    get id() {
        return this._id;
    }
    /**
     * Checks if another entity is equal to this entity based on identity and class type.
     * @param other The other entity to compare.
     */
    equals(other) {
        if (other === null || other === undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!Entity.isEntity(other)) {
            return false;
        }
        // Verify both entities belong to the same class type
        if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
            return false;
        }
        const thisId = this.id;
        const otherId = other.id;
        // Handle cases where ID is a Value Object with its own equality method
        if (thisId && typeof thisId.equals === 'function') {
            return thisId.equals(otherId);
        }
        return thisId === otherId;
    }
    /**
     * Generates a stable hash code string consistent with the identity and equality.
     */
    getHashCode() {
        const className = this.constructor.name;
        const idString = this._id && typeof this._id.getHashCode === 'function'
            ? this._id.getHashCode()
            : String(this._id);
        return `[Entity:${className}:${idString}]`;
    }
    /**
     * Type guard to check if an object is an instance of Entity.
     */
    static isEntity(v) {
        return v instanceof Entity;
    }
}
