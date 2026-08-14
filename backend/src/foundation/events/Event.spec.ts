import { describe, it, expect, vi } from "vitest";
import { BaseDomainEvent } from "./DomainEvent.js";
import { EventRegistry } from "./EventRegistry.js";
import { EventDispatcher } from "./EventDispatcher.js";
import { InMemoryEventBus } from "./EventBus.js";
import { IEventHandler } from "./EventHandler.js";
import { EventSerializer } from "./EventSerializer.js";

// Mock Event subclasses
class InvoiceCreated extends BaseDomainEvent {
  constructor(invoiceId: string, public readonly amount: number) {
    super(invoiceId, "Invoice");
  }
}

class InvoicePaid extends BaseDomainEvent {
  constructor(invoiceId: string, public readonly transactionHash: string) {
    super(invoiceId, "Invoice");
  }
}

// Mock handlers
class MockHandler implements IEventHandler<any> {
  public handledCount = 0;
  public lastEvent: any = null;
  public delayMs = 0;

  constructor(private readonly action?: (event: any) => Promise<void> | void) {}

  public async handle(event: any): Promise<void> {
    this.handledCount++;
    this.lastEvent = event;
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    if (this.action) {
      await this.action(event);
    }
  }
}

describe("Event Infrastructure Unit Tests (Task 5.2)", () => {
  describe("BaseDomainEvent Initialization", () => {
    it("should initialize metadata telemetries correctly", () => {
      const event = new InvoiceCreated("inv_123", 250);
      
      expect(event.eventName).toBe("InvoiceCreated");
      expect(event.metadata.aggregateId).toBe("inv_123");
      expect(event.metadata.aggregateType).toBe("Invoice");
      expect(event.metadata.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.getAggregateId()).toBe("inv_123");
    });
  });

  describe("EventRegistry", () => {
    it("should register and fetch handlers correctly", () => {
      const registry = new EventRegistry();
      const handler1 = new MockHandler();
      const handler2 = new MockHandler();

      registry.register("InvoiceCreated", handler1);
      registry.register("InvoiceCreated", handler2);

      const handlers = registry.getHandlersFor("InvoiceCreated");
      expect(handlers).toHaveLength(2);
      expect(handlers).toContain(handler1);
      expect(handlers).toContain(handler2);
    });

    it("should throw if registering empty event name or null handler", () => {
      const registry = new EventRegistry();
      const handler = new MockHandler();

      expect(() => registry.register("", handler)).toThrow();
      expect(() => registry.register("Event", null as any)).toThrow();
    });

    it("should unregister handlers correctly", () => {
      const registry = new EventRegistry();
      const handler = new MockHandler();

      registry.register("InvoiceCreated", handler);
      expect(registry.getHandlersFor("InvoiceCreated")).toHaveLength(1);

      registry.unregister("InvoiceCreated", handler);
      expect(registry.getHandlersFor("InvoiceCreated")).toHaveLength(0);
    });
  });

  describe("EventDispatcher", () => {
    it("should route events to registered handlers", async () => {
      const registry = new EventRegistry();
      const handler = new MockHandler();
      const dispatcher = new EventDispatcher(registry);

      registry.register("InvoiceCreated", handler);
      
      const event = new InvoiceCreated("inv_123", 250);
      await dispatcher.dispatch(event);

      expect(handler.handledCount).toBe(1);
      expect(handler.lastEvent).toBe(event);
    });

    it("should run multiple handlers concurrently", async () => {
      const registry = new EventRegistry();
      const executionTimes: number[] = [];
      
      const handler1 = new MockHandler(async () => { executionTimes.push(Date.now()); });
      const handler2 = new MockHandler(async () => { executionTimes.push(Date.now()); });
      handler1.delayMs = 20;
      handler2.delayMs = 20;

      registry.register("InvoiceCreated", handler1);
      registry.register("InvoiceCreated", handler2);

      const dispatcher = new EventDispatcher(registry);
      await dispatcher.dispatch(new InvoiceCreated("inv_1", 100));

      expect(handler1.handledCount).toBe(1);
      expect(handler2.handledCount).toBe(1);
      
      // Since they ran concurrently, their execution timestamps should be extremely close
      const diff = Math.abs(executionTimes[0] - executionTimes[1]);
      expect(diff).toBeLessThan(10); 
    });

    it("should aggregate errors if any handler rejects", async () => {
      const registry = new EventRegistry();
      const handler1 = new MockHandler();
      const handler2 = new MockHandler(() => { throw new Error("Handler 2 failed"); });
      const handler3 = new MockHandler(() => { throw new Error("Handler 3 failed"); });

      registry.register("InvoiceCreated", handler1);
      registry.register("InvoiceCreated", handler2);
      registry.register("InvoiceCreated", handler3);

      const dispatcher = new EventDispatcher(registry);
      
      await expect(
        dispatcher.dispatch(new InvoiceCreated("inv_1", 100))
      ).rejects.toThrow("Handler 2 failed; Handler 3 failed");

      // Verify that handler1 still ran successfully even though others threw
      expect(handler1.handledCount).toBe(1);
      expect(handler2.handledCount).toBe(1);
      expect(handler3.handledCount).toBe(1);
    });

    it("should execute multiple events sequentially to preserve order", async () => {
      const registry = new EventRegistry();
      const sequence: string[] = [];

      const handler = new MockHandler(async (event) => {
        sequence.push(event.eventName);
      });

      registry.register("InvoiceCreated", handler);
      registry.register("InvoicePaid", handler);

      const dispatcher = new EventDispatcher(registry);
      const ev1 = new InvoiceCreated("inv_1", 100);
      const ev2 = new InvoicePaid("inv_1", "tx_hash");

      await dispatcher.dispatchAll([ev1, ev2]);

      expect(sequence).toEqual(["InvoiceCreated", "InvoicePaid"]);
    });
  });

  describe("InMemoryEventBus (E2E Integration)", () => {
    it("should register subscriptions and publish events successfully", async () => {
      const bus = new InMemoryEventBus();
      const handler = new MockHandler();

      bus.subscribe("InvoiceCreated", handler);
      
      const event = new InvoiceCreated("inv_123", 500);
      await bus.publish(event);

      expect(handler.handledCount).toBe(1);
      expect(handler.lastEvent).toBe(event);

      // Unsubscribe and publish again
      bus.unsubscribe("InvoiceCreated", handler);
      await bus.publish(event);
      
      // Counter should remain 1
      expect(handler.handledCount).toBe(1);
    });

    it("should publish multiple events sequentially", async () => {
      const bus = new InMemoryEventBus();
      const sequence: string[] = [];

      const handler = new MockHandler((event) => {
        sequence.push(event.eventName);
      });

      bus.subscribe("InvoiceCreated", handler);
      bus.subscribe("InvoicePaid", handler);

      const ev1 = new InvoiceCreated("inv_99", 90);
      const ev2 = new InvoicePaid("inv_99", "tx_001");

      await bus.publishAll([ev1, ev2]);
      expect(sequence).toEqual(["InvoiceCreated", "InvoicePaid"]);
    });
  });

  describe("EventSerializer (Platform-level Hydration)", () => {
    it("should serialize a domain event and deserialize it restoring prototype methods", () => {
      EventSerializer.register("InvoiceCreated", InvoiceCreated);

      const event = new InvoiceCreated("inv_123", 250);
      const serialized = EventSerializer.serialize(event);
      
      const hydrated = EventSerializer.deserialize("InvoiceCreated", serialized) as InvoiceCreated;
      
      expect(hydrated.eventName).toBe("InvoiceCreated");
      expect(hydrated.amount).toBe(250);
      expect(hydrated.getAggregateId()).toBe("inv_123");
      expect(hydrated.occurredOn).toBeInstanceOf(Date);
      expect(hydrated.metadata).toBeDefined();
      expect(hydrated.metadata.aggregateId).toBe("inv_123");
      expect(hydrated.metadata.eventId).toBe(event.metadata.eventId);

      EventSerializer.clearRegistry();
    });

    it("should fall back to safe dynamic objects if event class is not registered", () => {
      const event = new InvoicePaid("inv_456", "tx_hash_123");
      const serialized = EventSerializer.serialize(event);
      
      const hydrated = EventSerializer.deserialize("InvoicePaid", serialized) as InvoicePaid;
      
      expect(hydrated.eventName).toBe("InvoicePaid");
      expect(hydrated.transactionHash).toBe("tx_hash_123");
      expect(hydrated.getAggregateId()).toBe("inv_456");
      expect(hydrated.occurredOn).toBeInstanceOf(Date);
    });
  });
});
