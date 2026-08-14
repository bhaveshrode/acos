import { describe, it, expect } from "vitest";
import { AggregateRoot } from "./AggregateRoot.js";
import { BaseDomainEvent } from "../events/DomainEvent.js";

// Mock domain event
class TestDomainEvent extends BaseDomainEvent {
  constructor(public readonly aggregateId: string, public readonly message: string) {
    super(aggregateId, "TestAggregate");
  }
}

// Mock aggregate root
class TestAggregate extends AggregateRoot<string> {
  constructor(id: string) {
    super(id);
  }

  // Exposed business method that raises an event
  public performAction(message: string): void {
    const event = new TestDomainEvent(this.id, message);
    this.addDomainEvent(event);
  }

  // Exposed method to test throwing on invalid event
  public raiseInvalidEvent(event: any): void {
    this.addDomainEvent(event);
  }
}

describe("AggregateRoot Base Class", () => {
  describe("Inheritance and Entity Behavior", () => {
    it("should extend Entity and inherit identity behaviour", () => {
      const aggregate = new TestAggregate("agg-1");
      expect(aggregate.id).toBe("agg-1");
      expect(aggregate.getHashCode()).toBe("[Entity:TestAggregate:agg-1]");
    });

    it("should maintain equality rules", () => {
      const agg1 = new TestAggregate("agg-1");
      const agg2 = new TestAggregate("agg-1");
      const agg3 = new TestAggregate("agg-2");
      expect(agg1.equals(agg2)).toBe(true);
      expect(agg1.equals(agg3)).toBe(false);
    });
  });

  describe("Domain Event Management", () => {
    it("should start with an empty list of domain events", () => {
      const aggregate = new TestAggregate("agg-1");
      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it("should register domain events when business methods raise them (IU-004)", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.performAction("Created ACOS invoice");
      
      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBeInstanceOf(TestDomainEvent);
      expect((aggregate.domainEvents[0] as TestDomainEvent).message).toBe("Created ACOS invoice");
    });

    it("should throw an error when registering a null or undefined event", () => {
      const aggregate = new TestAggregate("agg-1");
      expect(() => aggregate.raiseInvalidEvent(null)).toThrow("Domain event cannot be null or undefined.");
      expect(() => aggregate.raiseInvalidEvent(undefined)).toThrow("Domain event cannot be null or undefined.");
    });

    it("should preserve the order of events when multiple are added (IU-005)", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.performAction("First event");
      aggregate.performAction("Second event");
      aggregate.performAction("Third event");

      const events = aggregate.domainEvents;
      expect(events).toHaveLength(3);
      expect((events[0] as TestDomainEvent).message).toBe("First event");
      expect((events[1] as TestDomainEvent).message).toBe("Second event");
      expect((events[2] as TestDomainEvent).message).toBe("Third event");
    });

    it("should clear the pending events collection (IU-006)", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.performAction("Action 1");
      aggregate.performAction("Action 2");
      expect(aggregate.domainEvents).toHaveLength(2);

      aggregate.clearDomainEvents();
      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it("should enforce encapsulation by freezing the returned array (IU-007)", () => {
      const aggregate = new TestAggregate("agg-1");
      aggregate.performAction("Action 1");

      const events = aggregate.domainEvents;
      
      // Attempting to push to the returned array should throw in strict mode
      expect(() => {
        (events as any).push(new TestDomainEvent("agg-1", "Hacked"));
      }).toThrow();

      // Check that internal event collection has not changed
      expect(aggregate.domainEvents).toHaveLength(1);
      expect((aggregate.domainEvents[0] as TestDomainEvent).message).toBe("Action 1");
    });
  });
});
