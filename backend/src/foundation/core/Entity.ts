/**
 * Base Entity class representing a domain object with a stable identity.
 * Equality of entities is determined by their identity rather than their attributes.
 */
export abstract class Entity<ID> {
  protected readonly _id: ID;

  /**
   * Creates a new Entity instance.
   * @param id The stable, unique identifier of the entity.
   */
  protected constructor(id: ID) {
    if (id === null || id === undefined) {
      throw new Error("Entity ID cannot be null or undefined.");
    }
    this._id = id;
  }

  /**
   * Exposes the immutable identity of the entity.
   */
  public get id(): ID {
    return this._id;
  }

  /**
   * Checks if another entity is equal to this entity based on identity and class type.
   * @param other The other entity to compare.
   */
  public equals(other?: Entity<ID>): boolean {
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
    if (thisId && typeof (thisId as any).equals === 'function') {
      return (thisId as any).equals(otherId);
    }

    return thisId === otherId;
  }

  /**
   * Generates a stable hash code string consistent with the identity and equality.
   */
  public getHashCode(): string {
    const className = this.constructor.name;
    const idString = this._id && typeof (this._id as any).getHashCode === 'function'
      ? (this._id as any).getHashCode()
      : String(this._id);

    return `[Entity:${className}:${idString}]`;
  }

  /**
   * Type guard to check if an object is an instance of Entity.
   */
  public static isEntity(v: any): v is Entity<any> {
    return v instanceof Entity;
  }
}
