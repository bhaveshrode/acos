import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import { Logger, LogEntry } from "acos-backend";
import type { LogWriter } from "acos-backend";
import { Mediator } from "acos-backend/application";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { PrismaClient } from "@prisma/client";
import {
  brokerConsumerGroup,
  RedisStreamEventBus
} from "../src/adapters/messaging/event-bus/RedisStreamEventBus.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";

describe("ACOS Merchant — Broker Transport Suite", () => {
  const logs: LogEntry[] = [];
  const writer: LogWriter = (entry) => {
    logs.push(entry);
  };

  const brokerUrl = process.env.MERCHANT_BROKER_URL || "redis://localhost:6379";
  const dbUrl =
    process.env.MERCHANT_DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/acos?schema=public";
  const namespace = randomUUID().slice(0, 8);

  let isBrokerAvailable = false;
  let isDbAvailable = false;
  let probe: Redis | null = null;

  beforeAll(async () => {
    probe = new Redis(brokerUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    });

    try {
      await probe.connect();
      await probe.ping();
      isBrokerAvailable = true;
    } catch {
      console.warn("Redis broker is not reachable. Skipping broker transport tests.");
      probe.disconnect();
      probe = null;
      return;
    }

    const pg = await import("pg");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const pool = new pg.default.Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      isDbAvailable = true;
    } catch {
      console.warn("PostgreSQL is not reachable. The outbox-to-broker test will be skipped.");
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  });

  afterAll(() => {
    probe?.disconnect();
  });

  function createBus(streamName: string, replicaId: string, overrides: Record<string, any> = {}) {
    return new RedisStreamEventBus({
      url: brokerUrl,
      streamName,
      replicaId,
      blockMs: 50,
      claimIdleMs: 100,
      logger: new Logger(`BrokerSpec-${replicaId}`, writer),
      ...overrides
    });
  }

  function handlerFor(received: string[], behaviour: () => Promise<void> = async () => undefined) {
    return {
      handle: async (event: any) => {
        await behaviour();
        received.push(event.eventName);
      }
    } as any;
  }

  it("delivers an event to a subscriber in another replica", async () => {
    if (!isBrokerAvailable) return;

    const streamName = `${namespace}.cross`;
    const receivedA: string[] = [];
    const receivedB: string[] = [];
    const busA = createBus(streamName, "cross-a");
    const busB = createBus(streamName, "cross-b");

    try {
      await busA.start();
      await busB.start();
      busA.subscribe("BrokerCrossProbe", handlerFor(receivedA));
      busB.subscribe("BrokerCrossProbe", handlerFor(receivedB));

      await busA.publish(makeEvent("BrokerCrossProbe"));

      expect(receivedA).toHaveLength(1);
      await waitFor(() => receivedB.length === 1);
      expect(receivedB).toHaveLength(1);
    } finally {
      await busA.close();
      await busB.close();
    }
  });

  it("dispatches locally before publish resolves and does not echo its own message", async () => {
    if (!isBrokerAvailable) return;

    const streamName = `${namespace}.echo`;
    const received: string[] = [];
    const bus = createBus(streamName, "echo-a");

    try {
      await bus.start();
      bus.subscribe("BrokerEchoProbe", handlerFor(received));

      await bus.publish(makeEvent("BrokerEchoProbe"));
      expect(received).toHaveLength(1);
      expect(await probe!.xlen(streamName)).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(received).toHaveLength(1);
    } finally {
      await bus.close();
    }
  });

  it("delivers a republished event id once per replica", async () => {
    if (!isBrokerAvailable) return;

    const streamName = `${namespace}.dedupe`;
    const received: string[] = [];
    const busA = createBus(streamName, "dedupe-a");
    const busB = createBus(streamName, "dedupe-b");
    const event = makeEvent("BrokerDedupeProbe");

    try {
      await busA.start();
      await busB.start();
      busB.subscribe("BrokerDedupeProbe", handlerFor(received));

      await busA.publish(event);
      await busA.publish(event);

      await waitFor(() => received.length === 1);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(received).toHaveLength(1);
      expect(await probe!.xlen(streamName)).toBe(2);
    } finally {
      await busA.close();
      await busB.close();
    }
  });

  it("redelivers a failed remote delivery until it succeeds", async () => {
    if (!isBrokerAvailable) return;

    const streamName = `${namespace}.retry`;
    const received: string[] = [];
    let failures = 0;
    const busA = createBus(streamName, "retry-a");
    const busB = createBus(streamName, "retry-b", { maxAttempts: 5 });

    try {
      await busA.start();
      await busB.start();
      busB.subscribe(
        "BrokerRetryProbe",
        handlerFor(received, async () => {
          if (failures === 0) {
            failures++;
            throw new Error("transient handler failure");
          }
        })
      );

      await busA.publish(makeEvent("BrokerRetryProbe"));

      await waitFor(() => received.length === 1);
      expect(failures).toBe(1);
    } finally {
      await busA.close();
      await busB.close();
    }
  });

  it("tracks retry budgets independently per replica", async () => {
    if (!isBrokerAvailable) return;

    const streamName = `${namespace}.budgets`;
    const deadLetterStreamName = `${streamName}.dead`;
    const receivedB: string[] = [];
    const receivedC: string[] = [];
    let failuresB = 0;
    let failuresC = 0;
    const busA = createBus(streamName, "budget-publisher");
    const busB = createBus(streamName, "budget-b", { maxAttempts: 2, deadLetterStreamName });
    const busC = createBus(streamName, "budget-c", { maxAttempts: 2, deadLetterStreamName });

    try {
      await busA.start();
      await busB.start();
      await busC.start();

      busB.subscribe(
        "BrokerBudgetProbe",
        handlerFor(receivedB, async () => {
          if (failuresB === 0) {
            failuresB++;
            throw new Error("transient failure in replica b");
          }
        })
      );
      busC.subscribe(
        "BrokerBudgetProbe",
        handlerFor(receivedC, async () => {
          if (failuresC === 0) {
            failuresC++;
            throw new Error("transient failure in replica c");
          }
        })
      );

      await busA.publish(makeEvent("BrokerBudgetProbe"));

      await waitFor(() => receivedB.length === 1 && receivedC.length === 1);
      expect(failuresB).toBe(1);
      expect(failuresC).toBe(1);
      expect(await probe!.xlen(deadLetterStreamName)).toBe(0);
    } finally {
      await busA.close();
      await busB.close();
      await busC.close();
    }
  });

  it("dead-letters a message whose handler keeps failing", async () => {
    if (!isBrokerAvailable) return;

    const streamName = `${namespace}.dead`;
    const deadLetterStreamName = `${streamName}.dead`;
    const replicaId = "dead-a";
    const busA = createBus(streamName, "dead-publisher");
    const busB = createBus(streamName, replicaId, {
      maxAttempts: 2,
      deadLetterStreamName
    });

    try {
      await busA.start();
      await busB.start();
      busB.subscribe(
        "BrokerDeadProbe",
        handlerFor([], async () => {
          throw new Error("permanent handler failure");
        })
      );

      await busA.publish(makeEvent("BrokerDeadProbe"));

      await waitFor(async () => (await probe!.xlen(deadLetterStreamName)) === 1);
      await waitFor(async () => {
        const pending = (await probe!.xpending(streamName, brokerConsumerGroup(replicaId))) as any[];
        return Number(pending?.[0] ?? 0) === 0;
      });
      expect(await probe!.xlen(deadLetterStreamName)).toBe(1);
    } finally {
      await busA.close();
      await busB.close();
    }
  });

  it("drains the outbox to the broker and marks the row processed", async () => {
    if (!isBrokerAvailable || !isDbAvailable) return;

    const eventType = `BrokerOutboxProbe.${Date.now()}`;
    const received: string[] = [];

    const runtimeFactoryA = new RuntimeFactory();
    runtimeFactoryA.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));
    const runtimeFactoryB = new RuntimeFactory();
    runtimeFactoryB.registry.register(new SubsystemDescriptor("backend", [], new Mediator()));

    const boundaryA = new AcosIntegrationBoundary(
      new Logger("BrokerOutboxA", writer),
      runtimeFactoryA,
      { brokerUrl, replicaId: `${namespace}-outbox-a` }
    );
    const boundaryB = new AcosIntegrationBoundary(
      new Logger("BrokerOutboxB", writer),
      runtimeFactoryB,
      { brokerUrl, replicaId: `${namespace}-outbox-b` }
    );

    const handler = handlerFor(received);

    try {
      await boundaryA.connect("test", dbUrl);
      await boundaryB.connect("test", dbUrl);

      boundaryB.eventBus.subscribe(eventType, handler);

      const prisma = boundaryA.prismaClient;
      const row = await prisma.outboxEvent.create({
        data: {
          eventType,
          aggregateId: "broker-outbox-probe",
          payload: JSON.stringify({
            metadata: { aggregateId: "broker-outbox-probe" },
            eventName: eventType
          }),
          processed: false
        }
      });

      await boundaryA.processOutboxAsynchronously();

      const after = await prisma.outboxEvent.findUnique({ where: { id: row.id } });
      expect(after.processed).toBe(true);
      expect(after.lockedBy).toBeNull();

      await waitFor(() => received.length === 1, 10_000);
      expect(received).toEqual([eventType]);
    } finally {
      boundaryB.eventBus.unsubscribe(eventType, handler);
      await boundaryB.disconnect();
      await boundaryA.disconnect();
      const prisma = boundaryA.prismaClient;
      if (prisma) {
        await prisma.outboxEvent.deleteMany({ where: { eventType } });
      }
    }
  });
});

function makeEvent(eventName: string, eventId = randomUUID(), aggregateId = "broker-probe"): any {
  return {
    eventName,
    occurredOn: new Date(),
    metadata: {
      eventId,
      occurredOn: new Date(),
      aggregateId,
      aggregateType: "BrokerProbe"
    },
    getAggregateId: () => aggregateId
  };
}

async function waitFor(
  predicate: () => boolean | Promise<boolean>,
  timeoutMs = 5_000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for broker delivery");
}
