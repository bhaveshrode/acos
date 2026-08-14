import { PrismaClient } from "@prisma/client";
import { PrismaUnitOfWork } from "../unit-of-work/PrismaUnitOfWork.js";
import { TransactionManager } from "../managers/TransactionManager.js";

/**
 * Factory class simplifying construction of transaction coordination objects.
 */
export class TransactionFactory {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Instantiates a new PrismaUnitOfWork.
   */
  public createUnitOfWork(): PrismaUnitOfWork {
    return new PrismaUnitOfWork(this.prisma);
  }

  /**
   * Instantiates a new TransactionManager.
   */
  public createManager(): TransactionManager {
    return new TransactionManager(this.prisma);
  }
}
