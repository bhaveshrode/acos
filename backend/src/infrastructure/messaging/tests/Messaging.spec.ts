import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryEventBus } from "../event-bus/InMemoryEventBus.js";
import { DomainEventPublisher } from "../publishers/DomainEventPublisher.js";
import { EventSubscriberRegistry } from "../subscribers/EventSubscriberRegistry.js";
import { EventSerializer } from "../serializers/EventSerializer.js";
import { OutboxService } from "../outbox/OutboxService.js";
import { OutboxProcessor } from "../outbox/OutboxProcessor.js";
import { FixedRetryStrategy, ExponentialBackoffRetryStrategy } from "../retry/RetryStrategy.js";
import { RepositoryContext } from "../../repositories/base/RepositoryContext.js";
import { IDomainEvent, BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { EventMetadata } from "../../../foundation/events/EventMetadata.js";

// Mock Event
class TestEvent extends BaseDomainEvent {
  constructor(public readonly value: string) {
    super("11111111-1111-4111-8111-111111111111", "TestAggregate", "TestEvent");
    (this as any).metadata = new EventMetadata({
      aggregateId: "11111111-1111-4111-8111-111111111111",
      aggregateType: "TestAggregate",
      correlationId: "TEST_CORRELATION"
    });
  }
}

describe("Messaging Infrastructure Layer Tests (Task 28.10)", () => {
  let mockPrisma: any;
  let context: RepositoryContext;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    mockPrisma = {
      outboxMessage: {
        create: vi.fn().mockResolvedValue({}),
        findMany: vi.fn(),
        update: vi.fn().mockResolvedValue({})
      }
    };
    context = new RepositoryContext(mockPrisma);
    eventBus = new InMemoryEventBus();
  });

  describe("InMemoryEventBus & Subscribers", () => {
    it("should successfully subscribe and dispatch events", async () => {
      const registry = new EventSubscriberRegistry(eventBus);
      const publisher = new DomainEventPublisher(eventBus);
      const mockHandler = {
        handle: vi.fn().mockResolvedValue(undefined)
      };

      registry.register("TestEvent", mockHandler);

      const event = new TestEvent("hello");
      await publisher.publish(event);

      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe("EventSerializer", () => {
    it("should serialize and deserialize events to and from JSON format", () => {
      const event = new TestEvent("data-packet");
      const serialized = EventSerializer.serialize(event);
      const parsed = EventSerializer.deserialize(serialized);

      expect(parsed.payload.value).toBe("data-packet");
      expect(parsed.metadata.correlationId).toBe("TEST_CORRELATION");
    });
  });

  describe("OutboxService & OutboxProcessor", () => {
    it("should serialize and write events to outbox database context", async () => {
      const service = new OutboxService(context);
      const event = new TestEvent("outbox-msg");

      await service.save(event);

      expect(mockPrisma.outboxMessage.create).toHaveBeenCalledTimes(1);
      const callData = mockPrisma.outboxMessage.create.mock.calls[0][0].data;
      expect(callData.eventType).toBe("TestEvent");
      expect(callData.status).toBe("PENDING");
    });

    it("should poll pending events, dispatch to Event Bus, and mark processed", async () => {
      const mockHandler = {
        handle: vi.fn().mockResolvedValue(undefined)
      };
      eventBus.subscribe("TestEvent", mockHandler);

      const event = new TestEvent("processing-data");
      const serialized = EventSerializer.serialize(event);

      mockPrisma.outboxMessage.findMany.mockResolvedValue([
        {
          id: "msg-1234",
          eventType: "TestEvent",
          payload: serialized,
          status: "PENDING",
          retryCount: 0,
          createdAt: new Date(),
          processedAt: null,
          error: null
        }
      ]);

      const processor = new OutboxProcessor(context, eventBus);
      await processor.processPending();

      expect(mockHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockPrisma.outboxMessage.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.outboxMessage.update.mock.calls[0][0].data.status).toBe("PROCESSED");
    });
  });

  describe("RetryStrategies", () => {
    it("should retry operations under FixedRetryStrategy", async () => {
      const strategy = new FixedRetryStrategy(3, 5);
      let count = 0;

      const result = await strategy.execute(async () => {
        count++;
        if (count < 2) {
          throw new Error("Temporary error");
        }
        return "success";
      });

      expect(result).toBe("success");
      expect(count).toBe(2);
    });

    it("should retry operations under ExponentialBackoffRetryStrategy", async () => {
      const strategy = new ExponentialBackoffRetryStrategy(3, 5, 2);
      let count = 0;

      const result = await strategy.execute(async () => {
        count++;
        if (count < 3) {
          throw new Error("Temporary error");
        }
        return "exponential-success";
      });

      expect(result).toBe("exponential-success");
      expect(count).toBe(3);
    });
  });
});
