/**
 * Interface representing a transactional boundary unit of work (begin, commit, rollback).
 */
export interface IUnitOfWork {
  /**
   * Begins a new database transaction.
   */
  begin(): Promise<void>;

  /**
   * Commits the current transaction.
   */
  commit(): Promise<void>;

  /**
   * Rolls back the current transaction.
   */
  rollback(): Promise<void>;
}
