import { ServiceContainer } from "../container/ServiceContainer.js";
import { Lifetime } from "../lifetimes/Lifetime.js";
import { MessagingFactory } from "../../messaging/factories/MessagingFactory.js";

/**
 * Service registration helper binding event publication channels and outbox services.
 */
export class MessagingRegistration {
  public static register(container: ServiceContainer): void {
    container.register(
      "IEventBus",
      () => MessagingFactory.getEventBus(),
      Lifetime.SINGLETON
    );
    container.register(
      "DomainEventPublisher",
      (c) => MessagingFactory.createDomainPublisher(c.resolve("IEventBus")),
      Lifetime.SINGLETON
    );
    container.register(
      "IntegrationEventPublisher",
      (c) => MessagingFactory.createIntegrationPublisher(c.resolve("IEventBus")),
      Lifetime.SINGLETON
    );
    container.register(
      "EventSubscriberRegistry",
      (c) => MessagingFactory.createSubscriberRegistry(c.resolve("IEventBus")),
      Lifetime.SINGLETON
    );
    container.register(
      "OutboxService",
      (c) => MessagingFactory.createOutboxService(c.resolve("RepositoryContext")),
      Lifetime.SCOPED
    );
    container.register(
      "OutboxProcessor",
      (c) => MessagingFactory.createOutboxProcessor(c.resolve("RepositoryContext"), c.resolve("IEventBus")),
      Lifetime.SCOPED
    );
  }
}
