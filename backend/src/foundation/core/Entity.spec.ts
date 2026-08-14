import { describe, it, expect } from "vitest";
import { Entity } from "./Entity.js";

// Mock entities for testing
class TestEntity extends Entity<string> {
  public name: string;
  constructor(id: string, name: string) {
    super(id);
    this.name = name;
  }
}

class AnotherTestEntity extends Entity<string> {
  public name: string;
  constructor(id: string, name: string) {
    super(id);
    this.name = name;
  }
}

// Mock custom ID object to test custom ID equality/hashing support
class CustomID {
  constructor(private readonly value: string) {}
  
  public equals(other?: CustomID): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public getHashCode(): string {
    return `CustomID:${this.value}`;
  }

  public toString(): string {
    return this.value;
  }
}

class CustomIdEntity extends Entity<CustomID> {
  constructor(id: CustomID) {
    super(id);
  }
}

describe("Entity Base Class", () => {
  describe("Identity Initialization (IU-003)", () => {
    it("should create an entity with a stable identity", () => {
      const entity = new TestEntity("user-1", "Alice");
      expect(entity.id).toBe("user-1");
    });

    it("should throw an error if identity is null or undefined", () => {
      expect(() => new (TestEntity as any)(null, "Alice")).toThrow("Entity ID cannot be null or undefined.");
      expect(() => new (TestEntity as any)(undefined, "Alice")).toThrow("Entity ID cannot be null or undefined.");
    });

    it("should make identity read-only (immutable)", () => {
      const entity = new TestEntity("user-1", "Alice");
      // @ts-expect-error - testing immutability of readonly id property
      expect(() => { entity.id = "user-2"; }).toThrow();
      expect(entity.id).toBe("user-1");
    });
  });

  describe("Equality Semantics (IU-004)", () => {
    it("should return true when comparing an entity with itself", () => {
      const entity = new TestEntity("user-1", "Alice");
      expect(entity.equals(entity)).toBe(true);
    });

    it("should return true when comparing two entities of the same class with the same ID", () => {
      const entity1 = new TestEntity("user-1", "Alice");
      const entity2 = new TestEntity("user-1", "Bob"); // Different properties, same identity
      expect(entity1.equals(entity2)).toBe(true);
    });

    it("should return false when comparing two entities of the same class with different IDs", () => {
      const entity1 = new TestEntity("user-1", "Alice");
      const entity2 = new TestEntity("user-2", "Alice");
      expect(entity1.equals(entity2)).toBe(false);
    });

    it("should return false when comparing with null or undefined", () => {
      const entity = new TestEntity("user-1", "Alice");
      expect(entity.equals(null as any)).toBe(false);
      expect(entity.equals(undefined)).toBe(false);
    });

    it("should return false when comparing with a non-entity object", () => {
      const entity = new TestEntity("user-1", "Alice");
      const fakeEntity = { id: "user-1" };
      expect(entity.equals(fakeEntity as any)).toBe(false);
    });

    it("should return false when comparing entities of different classes even with the same ID", () => {
      const entity1 = new TestEntity("common-id", "Alice");
      const entity2 = new AnotherTestEntity("common-id", "Alice");
      expect(entity1.equals(entity2)).toBe(false);
    });

    it("should support custom ID objects with an equals method", () => {
      const customId1 = new CustomID("uuid-123");
      const customId2 = new CustomID("uuid-123");
      const customId3 = new CustomID("uuid-456");

      const entity1 = new CustomIdEntity(customId1);
      const entity2 = new CustomIdEntity(customId2);
      const entity3 = new CustomIdEntity(customId3);

      expect(entity1.equals(entity2)).toBe(true);
      expect(entity1.equals(entity3)).toBe(false);
    });
  });

  describe("Hashing (IU-005)", () => {
    it("should generate a stable hash code containing the class name and identity", () => {
      const entity = new TestEntity("user-1", "Alice");
      expect(entity.getHashCode()).toBe("[Entity:TestEntity:user-1]");
    });

    it("should produce the same hash code for equal entities", () => {
      const entity1 = new TestEntity("user-1", "Alice");
      const entity2 = new TestEntity("user-1", "Bob");
      expect(entity1.getHashCode()).toBe(entity2.getHashCode());
    });

    it("should produce different hash codes for different types with the same ID", () => {
      const entity1 = new TestEntity("common-id", "Alice");
      const entity2 = new AnotherTestEntity("common-id", "Alice");
      expect(entity1.getHashCode()).not.toBe(entity2.getHashCode());
    });

    it("should support custom ID objects with a getHashCode method", () => {
      const customId = new CustomID("uuid-123");
      const entity = new CustomIdEntity(customId);
      expect(entity.getHashCode()).toBe("[Entity:CustomIdEntity:CustomID:uuid-123]");
    });
  });

  describe("Helper Methods (IU-006)", () => {
    it("should correctly identify entities with static isEntity method", () => {
      const entity = new TestEntity("user-1", "Alice");
      const plainObj = { id: "user-1" };

      expect(Entity.isEntity(entity)).toBe(true);
      expect(Entity.isEntity(plainObj)).toBe(false);
      expect(Entity.isEntity(null)).toBe(false);
      expect(Entity.isEntity(undefined)).toBe(false);
    });
  });
});
