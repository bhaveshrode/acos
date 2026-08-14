import { ServiceContainer } from "../container/ServiceContainer.js";
import { ConfigurationRegistration } from "../registrations/ConfigurationRegistration.js";
import { DatabaseRegistration } from "../registrations/DatabaseRegistration.js";
import { RepositoryRegistration } from "../registrations/RepositoryRegistration.js";
import { TransactionRegistration } from "../registrations/TransactionRegistration.js";
import { MessagingRegistration } from "../registrations/MessagingRegistration.js";

/**
 * Grouped registration module assembling all core infrastructure subsystems in ACOS.
 */
export class InfrastructureModule {
  public static register(container: ServiceContainer): void {
    ConfigurationRegistration.register(container);
    DatabaseRegistration.register(container);
    RepositoryRegistration.register(container);
    TransactionRegistration.register(container);
    MessagingRegistration.register(container);
  }
}
