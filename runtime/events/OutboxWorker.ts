import { IOutboxRepository } from "acos-backend/foundation/events/IOutboxRepository.js";
import { IEventBus } from "acos-backend/foundation/events/EventBus.js";
import { EventSerializer } from "acos-backend/foundation/events/EventSerializer.js";
import { Logger } from "acos-backend/foundation/logging/Logger.js";

/**
 * Reusable runtime background daemon that polls the transactional outbox table,
 * hydrates stored payloads into rich Domain Event instances using the EventSerializer,
 * and dispatches them asynchronously through the primary Event Bus.
 */
export class OutboxWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private readonly logger: Logger;

  constructor(
    private readonly repository: IOutboxRepository,
    private readonly eventBus: IEventBus,
    loggerInstance: Logger,
    private readonly intervalMs: number = 5000
  ) {
    this.logger = loggerInstance;
  }

  /**
   * Starts the background outbox processing daemon.
   */
  public start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.processOutbox(), this.intervalMs);
  }

  /**
   * Stops the background outbox processing daemon.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Performs a single outbox polling and dispatching cycle.
   */
  public async processOutbox(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const records = await this.repository.fetchUnprocessed();
      for (const record of records) {
        const domainEvent = EventSerializer.deserialize(record.eventType, record.payload);
        
        await this.eventBus.publish(domainEvent);
        await this.repository.markAsProcessed(record.id);
      }
    } catch (err: any) {
      this.logger.error("OutboxWorker: Failed to process transactional outbox events", err);
    } finally {
      this.isProcessing = false;
    }
  }
}
