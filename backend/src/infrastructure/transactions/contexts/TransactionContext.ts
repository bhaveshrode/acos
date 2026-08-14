import { PrismaClientOrTx } from "../../repositories/base/RepositoryContext.js";

export type TransactionStatus = "ACTIVE" | "COMMITTED" | "ROLLED_BACK" | "FAILED";

/**
 * Tracks the state, identifier, query client, and metadata of an active transaction.
 */
export class TransactionContext {
  constructor(
    public readonly id: string,
    public readonly client: PrismaClientOrTx,
    public status: TransactionStatus = "ACTIVE",
    public readonly isolationLevel?: string
  ) {}
}
