import { PrismaClient } from "@prisma/client";
import { PrismaUnitOfWork } from "../unit-of-work/PrismaUnitOfWork.js";
import { TransactionPolicy } from "../policies/TransactionPolicy.js";

/**
 * Coordinates and runs transaction-aware operations with commit/rollback management.
 */
export class TransactionManager {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Executes a callback within a managed transaction.
   * Begins a new transaction, runs the callback, commits on success, and rolls back on exception.
   */
  public async execute<T>(
    callback: () => Promise<T>,
    policy: TransactionPolicy = TransactionPolicy.REQUIRED
  ): Promise<T> {
    const uow = new PrismaUnitOfWork(this.prisma);
    await uow.begin();
    try {
      const result = await callback();
      await uow.commit();
      return result;
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
