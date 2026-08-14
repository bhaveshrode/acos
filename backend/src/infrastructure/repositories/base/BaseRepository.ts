import { RepositoryContext } from "./RepositoryContext.js";
import { TransactionScope } from "../../transactions/scopes/TransactionScope.js";

/**
 * Base Repository class holding the active query context.
 */
export abstract class BaseRepository {
  constructor(protected readonly context: RepositoryContext) {}

  /**
   * Retrieves the active database client or transaction instance.
   * Prioritizes the ambient TransactionScope client if one is currently active.
   */
  protected get prisma() {
    return TransactionScope.current ?? this.context.client;
  }
}
