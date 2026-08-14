import { IUnitOfWork } from "../../../application/foundation/transactions/IUnitOfWork.js";
import { PrismaClient } from "@prisma/client";
import { TransactionScope } from "../scopes/TransactionScope.js";

/**
 * Concrete implementation of the IUnitOfWork boundary.
 * Bridges Prisma's callback-based interactive transactions with the sequential begin/commit/rollback flow.
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  private txClient: any = null;
  private resolveTx: (() => void) | null = null;
  private rejectTx: ((err: any) => void) | null = null;
  private txPromise: Promise<void> | null = null;
  private isCompleted = false;

  constructor(private readonly prisma: PrismaClient) {}

  public async begin(): Promise<void> {
    this.isCompleted = false;
    this.txClient = null;

    // Start interactive transaction block and hold it open with deferred resolvers
    this.txPromise = new Promise<void>((resolve, reject) => {
      (this.prisma as any).$transaction(async (tx: any) => {
        this.txClient = tx;

        // Enter transaction context into the asynchronous call path
        TransactionScope.enter(tx);

        await new Promise<void>((commitResolve, commitReject) => {
          this.resolveTx = commitResolve;
          this.rejectTx = commitReject;
        });
      }).then(resolve).catch(reject);
    });

    // Bounded spin/wait loop until the transaction starts and sets txClient
    while (!this.txClient && !this.isCompleted) {
      await new Promise((r) => setTimeout(r, 1));
    }
  }

  public async commit(): Promise<void> {
    if (this.resolveTx) {
      this.resolveTx();
    }
    this.isCompleted = true;
    await this.txPromise;
  }

  public async rollback(): Promise<void> {
    if (this.rejectTx) {
      this.rejectTx(new Error("Transaction rollback requested."));
    }
    this.isCompleted = true;
    try {
      await this.txPromise;
    } catch (err) {
      // Expected rollback rejection, suppress bubble
    }
  }
}
