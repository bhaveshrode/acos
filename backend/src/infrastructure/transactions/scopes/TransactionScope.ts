import { AsyncLocalStorage } from "async_hooks";
import { PrismaClientOrTx } from "../../repositories/base/RepositoryContext.js";

/**
 * Ambient Storage holding the active database transaction context.
 * Decouples repositories from manually passing transaction clients down the call stack.
 */
export class TransactionScope {
  private static readonly storage = new AsyncLocalStorage<PrismaClientOrTx>();

  /**
   * Runs a callback within the context of an active transaction.
   * @param client The active Prisma transaction client.
   * @param callback The callback containing transactional repository actions.
   */
  public static run<T>(client: PrismaClientOrTx, callback: () => T): T {
    return this.storage.run(client, callback);
  }

  /**
   * Enters the transactional client context into the current asynchronous execution flow.
   * @param client The active Prisma transaction client.
   */
  public static enter(client: PrismaClientOrTx): void {
    this.storage.enterWith(client);
  }

  /**
   * Retrieves the active transaction client if inside a transaction scope.
   */
  public static get current(): PrismaClientOrTx | undefined {
    return this.storage.getStore();
  }
}
