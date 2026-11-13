import { randomUUID } from "node:crypto";
import { Redis } from "ioredis";
import {
  EventSerializer,
  IDomainEvent,
  IEventHandler,
  IEventBus,
  InMemoryEventBus,
  Logger
} from "acos-backend";

export const BROKER_DEFAULT_STREAM = "acos.events";
export const BROKER_STREAM_MAXLEN = 100_000;
export const BROKER_DEDUPE_TTL_SECONDS = 24 * 60 * 60;
export const BROKER_DEFAULT_CLAIM_IDLE_MS = 30_000;
export const BROKER_DEFAULT_MAX_ATTEMPTS = 10;
export const BROKER_DEFAULT_BLOCK_MS = 5_000;

export function brokerConsumerGroup(replicaId: string): string {
  return `acos:merchant:${replicaId}`;
}

export interface RedisStreamEventBusOptions {
  url: string;
  logger: Logger;
  streamName?: string;
  deadLetterStreamName?: string;
  replicaId?: string;
  claimIdleMs?: number;
  maxAttempts?: number;
  blockMs?: number;
}

/**
 * Event bus backed by a Redis stream.
 *
 * `publish` dispatches to local subscribers first, so the caller observes the same
 * synchronous delivery it had on the in-process bus, then appends the event to the
 * stream for other replicas. Each replica owns a consumer group, because handlers
 * such as cache invalidation guard process-local state and every replica must see
 * every event; a shared group would load-balance events onto a replica that may
 * hold no subscriber for them.
 *
 * Delivery to remote replicas is at-least-once: a handler failure leaves the entry
 * in the group's pending list, `XAUTOCLAIM` redelivers it after `claimIdleMs`, and
 * repeated failures move it to the dead-letter stream. Republished outbox rows are
 * suppressed per group by `eventId`.
 */
export class RedisStreamEventBus implements IEventBus {
  private readonly local = new InMemoryEventBus();
  private readonly url: string;
  private readonly logger: Logger;
  private readonly streamName: string;
  private readonly deadLetterStreamName: string;
  private readonly groupName: string;
  private readonly consumerName: string;
  private readonly claimIdleMs: number;
  private readonly maxAttempts: number;
  private readonly blockMs: number;
  private readonly transportId = randomUUID();
  private readonly attemptsKey: string;
  private readonly locallyDelivered = new Set<string>();
  private client: Redis | null = null;
  private consumer: Redis | null = null;
  private closed = false;
  private loopStarted = false;
  private loop: Promise<void> | null = null;

  constructor(options: RedisStreamEventBusOptions) {
    this.url = options.url;
    this.logger = options.logger;
    this.streamName = options.streamName ?? BROKER_DEFAULT_STREAM;
    this.deadLetterStreamName = options.deadLetterStreamName ?? `${this.streamName}.dead`;
    this.groupName = brokerConsumerGroup(options.replicaId ?? randomUUID());
    this.consumerName = `${this.groupName}:${process.pid}:${randomUUID()}`;
    this.claimIdleMs = options.claimIdleMs ?? BROKER_DEFAULT_CLAIM_IDLE_MS;
    this.maxAttempts = options.maxAttempts ?? BROKER_DEFAULT_MAX_ATTEMPTS;
    this.blockMs = options.blockMs ?? BROKER_DEFAULT_BLOCK_MS;
    this.attemptsKey = `${this.streamName}:attempts`;
  }

  /**
   * Connects the command and consumer connections and creates this replica's
   * consumer group. Resolves only once Redis answers, so an unreachable broker
   * fails startup instead of surfacing later as a discarded event.
   */
  public async start(): Promise<void> {
    if (this.client) return;
    this.closed = false;

    const client = new Redis(this.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    });
    const consumer = new Redis(this.url, {
      lazyConnect: true,
      maxRetriesPerRequest: null
    });

    try {
      await client.connect();
      await consumer.connect();
      await client.ping();
    } catch (err) {
      client.disconnect();
      consumer.disconnect();
      throw err;
    }

    this.client = client;
    this.consumer = consumer;

    try {
      await this.ensureGroup();
    } catch (err) {
      await this.close();
      throw err;
    }

    this.logger.info("Broker event transport connected", {
      streamName: this.streamName,
      groupName: this.groupName
    });

    if (this.loopStarted) {
      this.runLoop();
    }
  }

  public async close(): Promise<void> {
    if (this.closed && !this.client && !this.consumer) return;
    this.closed = true;

    const loop = this.loop;
    this.consumer?.disconnect();
    if (loop) await loop.catch(() => undefined);
    this.loop = null;

    const client = this.client;
    this.client = null;
    this.consumer = null;

    if (client) {
      try {
        await client.quit();
      } catch {
        client.disconnect();
      }
    }
  }

  public async publish(event: IDomainEvent): Promise<void> {
    const eventId = this.eventIdOf(event);

    if (!this.locallyDelivered.has(eventId)) {
      await this.local.publish(event);
      this.rememberLocal(eventId);
    }

    await this.enqueue(event, eventId);
  }

  public async publishAll(events: readonly IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  public subscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.local.subscribe(eventName, handler);
    this.loopStarted = true;
    if (this.consumer) {
      this.runLoop();
    }
  }

  public unsubscribe<T extends IDomainEvent>(
    eventName: string,
    handler: IEventHandler<T>
  ): void {
    this.local.unsubscribe(eventName, handler);
  }

  private async ensureGroup(): Promise<void> {
    try {
      await this.client!.xgroup("CREATE", this.streamName, this.groupName, "$", "MKSTREAM");
    } catch (err: any) {
      if (!String(err?.message ?? err).includes("BUSYGROUP")) {
        throw err;
      }
    }
  }

  private async enqueue(event: IDomainEvent, eventId: string): Promise<void> {
    const client = this.client;
    if (!client) {
      throw new Error("RedisStreamEventBus.start() must be called before publishing events.");
    }

    const eventType = this.eventNameOf(event);

    try {
      await client.xadd(
        this.streamName,
        "MAXLEN", "~", String(BROKER_STREAM_MAXLEN),
        "*",
        "eventId", eventId,
        "eventType", eventType,
        "payload", EventSerializer.serialize(event),
        "origin", this.transportId
      );
    } catch (err: any) {
      throw new Error(
        `Failed to publish ${eventType} to the broker: ${err?.message ?? err}`
      );
    }
  }

  private runLoop(): void {
    if (this.loop || this.closed || !this.consumer) return;

    this.loop = this.consumeUntilClosed()
      .catch((err) => this.logger.error("Broker consumer loop stopped unexpectedly", err))
      .finally(() => {
        this.loop = null;
      });
  }

  private async consumeUntilClosed(): Promise<void> {
    while (!this.closed) {
      try {
        const response = (await this.consumer!.xreadgroup(
          "GROUP", this.groupName, this.consumerName,
          "COUNT", "50",
          "BLOCK", String(this.blockMs),
          "STREAMS", this.streamName, ">"
        )) as any;

        if (Array.isArray(response)) {
          for (const [, entries] of response) {
            for (const entry of entries ?? []) {
              await this.handleEntry(entry, false);
            }
          }
        }

        await this.reclaimStaleEntries();
      } catch (err) {
        if (!this.closed) {
          this.logger.error(
            "Broker consumer read failed; retrying",
            err instanceof Error ? err : new Error(String(err))
          );
          await delay(250);
        }
      }
    }
  }

  /**
   * Claims entries whose handler never acknowledged them. Claimed entries are
   * handled even when this transport published them, because a local dispatch
   * that crashes mid-handler must still be retried.
   */
  private async reclaimStaleEntries(): Promise<void> {
    const consumer = this.consumer!;
    const result = (await (consumer as any).xautoclaim(
      this.streamName,
      this.groupName,
      this.consumerName,
      this.claimIdleMs,
      "0-0",
      "COUNT", "10"
    )) as any;

    const entries = Array.isArray(result?.[1]) ? result[1] : [];
    for (const entry of entries) {
      if (Array.isArray(entry) && entry.length === 2) {
        await this.handleEntry(entry, true);
      }
    }
  }

  private async handleEntry(entry: any, fromClaim: boolean): Promise<void> {
    const [messageId, rawFields] = entry as [string, unknown];
    const fields = fieldsToRecord(rawFields);

    if (!fromClaim && fields.origin === this.transportId) {
      await this.ack(messageId);
      return;
    }

    if (!fields.eventType || !fields.payload) {
      this.logger.warn("Dropping malformed broker message", { messageId });
      await this.ack(messageId);
      return;
    }

    const eventId = fields.eventId || `message:${messageId}`;
    if (await this.alreadySeen(eventId)) {
      await this.ack(messageId);
      return;
    }

    try {
      const event = EventSerializer.deserialize(fields.eventType, fields.payload);
      await this.local.publish(event);
      await this.markSeen(eventId);
      await this.ack(messageId);
    } catch (err: any) {
      await this.recordFailure(messageId, eventId, fields, err);
    }
  }

  private async recordFailure(
    messageId: string,
    eventId: string,
    fields: Record<string, string>,
    err: any
  ): Promise<void> {
    const consumer = this.consumer!;
    const attempts = await consumer.hincrby(this.attemptsKey, eventId, 1);

    if (attempts < this.maxAttempts) {
      this.logger.warn("Broker handler failed; message stays pending for redelivery", {
        messageId,
        eventId,
        attempts,
        lastError: String(err?.message ?? err)
      });
      return;
    }

    await consumer.xadd(
      this.deadLetterStreamName,
      "*",
      "eventId", eventId,
      "eventType", fields.eventType ?? "",
      "payload", fields.payload ?? "",
      "error", String(err?.message ?? err)
    );
    await consumer.hdel(this.attemptsKey, eventId);
    await this.ack(messageId);

    this.logger.warn("Broker message dead-lettered after repeated handler failures", {
      messageId,
      eventId,
      attempts
    });
  }

  private async ack(messageId: string): Promise<void> {
    await this.consumer!.xack(this.streamName, this.groupName, messageId);
  }

  private seenKey(eventId: string): string {
    return `${this.streamName}:seen:${this.groupName}:${eventId}`;
  }

  private async alreadySeen(eventId: string): Promise<boolean> {
    return (await this.consumer!.exists(this.seenKey(eventId))) === 1;
  }

  private async markSeen(eventId: string): Promise<void> {
    await this.consumer!.set(
      this.seenKey(eventId),
      "1",
      "EX",
      String(BROKER_DEDUPE_TTL_SECONDS),
      "NX"
    );
  }

  private eventIdOf(event: IDomainEvent): string {
    const eventId = (event as any)?.metadata?.eventId;
    return typeof eventId === "string" && eventId.length > 0 ? eventId : randomUUID();
  }

  private eventNameOf(event: IDomainEvent): string {
    return (
      event.eventName ||
      (event.constructor && event.constructor.name !== "Object" ? event.constructor.name : "") ||
      "DomainEvent"
    );
  }

  private rememberLocal(eventId: string): void {
    this.locallyDelivered.add(eventId);
    if (this.locallyDelivered.size > 10_000) {
      const oldest = this.locallyDelivered.values().next().value;
      if (oldest !== undefined) {
        this.locallyDelivered.delete(oldest);
      }
    }
  }
}

function fieldsToRecord(fields: unknown): Record<string, string> {
  const record: Record<string, string> = {};
  if (!Array.isArray(fields)) return record;

  for (let i = 0; i + 1 < fields.length; i += 2) {
    record[String(fields[i])] = String(fields[i + 1]);
  }
  return record;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
