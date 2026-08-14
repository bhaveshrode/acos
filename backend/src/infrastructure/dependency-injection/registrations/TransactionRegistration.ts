import { ServiceContainer } from "../container/ServiceContainer.js";
import { Lifetime } from "../lifetimes/Lifetime.js";
import { PrismaUnitOfWork } from "../../transactions/unit-of-work/PrismaUnitOfWork.js";
import { TransactionManager } from "../../transactions/managers/TransactionManager.js";

/**
 * Service registration helper binding transaction unit of work structures.
 */
export class TransactionRegistration {
  public static register(container: ServiceContainer): void {
    container.register(
      "IUnitOfWork",
      (c) => new PrismaUnitOfWork(c.resolve("PrismaClient")),
      Lifetime.SCOPED
    );
    container.register(
      "TransactionManager",
      (c) => new TransactionManager(c.resolve("PrismaClient")),
      Lifetime.SCOPED
    );
  }
}
