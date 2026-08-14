import { ServiceContainer } from "../container/ServiceContainer.js";
import { Lifetime } from "../lifetimes/Lifetime.js";
import { DatabaseConfiguration } from "../../database/configuration/DatabaseConfiguration.js";
import { PrismaDatabaseClient } from "../../database/client/PrismaDatabaseClient.js";
import { RepositoryContext } from "../../repositories/base/RepositoryContext.js";

/**
 * Service registration helper binding core Database connection instances and RepositoryContext.
 */
export class DatabaseRegistration {
  public static register(container: ServiceContainer): void {
    // Database configuration instance
    container.register(
      "DatabaseConfiguration",
      (c) => {
        const snapshot = c.resolve<any>("ConfigurationSnapshot");
        return new DatabaseConfiguration(snapshot.database);
      },
      Lifetime.SINGLETON
    );

    // Database client manager
    container.register(
      "PrismaDatabaseClient",
      (c) => {
        const config = c.resolve<any>("DatabaseConfiguration");
        return new PrismaDatabaseClient(config);
      },
      Lifetime.SINGLETON
    );

    // Underlying Prisma client instance
    container.register(
      "PrismaClient",
      (c) => {
        const client = c.resolve<any>("PrismaDatabaseClient");
        return client.getClient();
      },
      Lifetime.SINGLETON
    );

    // Repository Context tracks execution context per scope
    container.register(
      "RepositoryContext",
      (c) => new RepositoryContext(c.resolve("PrismaClient")),
      Lifetime.SCOPED
    );
  }
}
