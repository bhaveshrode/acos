import { IDomainEvent } from "./DomainEvent.js";

/**
 * Interface defining contract for durable Transactional Outbox operations.
 */
export interface IOutboxRepository {
  /**
   * Persists a domain event to the outbox table.
   * @param event The domain event instance to save.
   */
  save(event: IDomainEvent): Promise<void>;

  /**
   * Fetches a list of unprocessed outbox event records.
   */
  fetchUnprocessed(): Promise<Array<{ id: string; eventType: string; payload: string }>>;

  /**
   * Marks a specific outbox event record as successfully processed.
   * @param id Unique identifier of the outbox record.
   */
  markAsProcessed(id: string): Promise<void>;
}
