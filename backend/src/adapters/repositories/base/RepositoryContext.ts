import { PrismaClient } from "@prisma/client";

export type PrismaClientOrTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Encapsulates the active database query client or transaction boundary.
 */
export class RepositoryContext {
  constructor(public readonly client: PrismaClientOrTx) {}

  /**
   * Executes a database transaction block, passing a transactional RepositoryContext.
   */
  public async transaction<T>(
    runInTx: (txContext: RepositoryContext) => Promise<T>
  ): Promise<T> {
    if ("$transaction" in this.client) {
      return (this.client as any).$transaction(async (txClient: any) => {
        return runInTx(new RepositoryContext(txClient));
      });
    }
    // Already executing in a transactional boundary, execute inline.
    return runInTx(this);
  }
}
