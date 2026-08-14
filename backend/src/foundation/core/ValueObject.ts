import { ObjectUtils } from "../utils/ObjectUtils.js";

export interface ValueObjectProps {
  [index: string]: any;
}

/**
 * Base ValueObject class representing a domain primitive with no identity.
 * Two value objects are equal if their structures and values are identical.
 * Value objects are strictly immutable.
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;
  private _cachedHashCode?: string;

  /**
   * Creates a new ValueObject instance.
   * Deep freezes the properties to enforce absolute immutability.
   * @param props The attributes of the value object.
   */
  protected constructor(props: T) {
    if (props === null || props === undefined) {
      throw new Error("ValueObject properties cannot be null or undefined.");
    }
    this.props = Object.freeze(ObjectUtils.deepFreeze(props));
  }

  /**
   * Checks for structural equality against another value object.
   */
  public equals(other?: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (other.props === undefined) {
      return false;
    }
    // Enforce class type safety: must share the exact same prototype
    if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
      return false;
    }
    return this.deepEquals(this.props, other.props);
  }

  /**
   * Performs a deep comparison between two values.
   */
  private deepEquals(a: any, b: any): boolean {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (a && typeof a.equals === "function") {
      return a.equals(b);
    }

    if (b && typeof b.equals === "function") {
      return b.equals(a);
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEquals(a[i], b[i])) return false;
      }
      return true;
    }

    if (a && typeof a === "object" && b && typeof b === "object") {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!this.deepEquals(a[key], b[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Generates a stable and deterministic hash string representing the values.
   * Caches the computed hash code to optimize future invocations.
   */
  public getHashCode(): string {
    if (!this._cachedHashCode) {
      this._cachedHashCode = `[ValueObject:${this.constructor.name}:${this.generateHash(this.props)}]`;
    }
    return this._cachedHashCode;
  }

  /**
   * Recursively computes a stable hash representation of a value.
   */
  private generateHash(value: any): string {
    if (value === null || value === undefined) {
      return "null";
    }

    if (value instanceof Date) {
      return String(value.getTime());
    }

    if (typeof value.getHashCode === "function") {
      return value.getHashCode();
    }

    if (typeof value.equals === "function" && typeof value.toString === "function") {
      return value.toString();
    }

    if (Array.isArray(value)) {
      return `[${value.map((v) => this.generateHash(v)).join(",")}]`;
    }

    if (typeof value === "object") {
      // Sort keys to guarantee deterministic order of serialized fields
      const keys = Object.keys(value).sort();
      const parts = keys.map((key) => `${key}:${this.generateHash(value[key])}`);
      return `{${parts.join(",")}}`;
    }

    return String(value);
  }

  /**
   * Serializes the ValueObject to a plain JSON representation.
   */
  public toJSON(): any {
    return this.serialize(this.props);
  }

  /**
   * Helper to recursively serialize properties.
   */
  private serialize(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value.toJSON === "function") {
      return value.toJSON();
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item));
    }
    if (typeof value === "object") {
      const result: any = {};
      for (const key of Object.keys(value)) {
        result[key] = this.serialize(value[key]);
      }
      return result;
    }
    return value;
  }
}
