import { IDomainEvent } from "./DomainEvent.js";

/**
 * Interface representing a subscriber handler for a specific type of Domain Event.
 */
export interface IEventHandler<T extends IDomainEvent = IDomainEvent> {
  /**
   * Executes the business handler logic when the subscribed event is published.
   * Must return a Promise to support async side-effect jobs (e.g. database updates, emails).
   * @param event The domain event instance.
   */
  handle(event: T): Promise<void>;
}
