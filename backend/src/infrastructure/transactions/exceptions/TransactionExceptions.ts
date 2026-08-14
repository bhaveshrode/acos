/**
 * Base transaction infrastructure exception.
 */
export class TransactionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionException";
  }
}

/**
 * Thrown when a database transaction commit fails.
 */
export class CommitFailedException extends TransactionException {
  constructor(message: string) {
    super(`Commit failed: ${message}`);
    this.name = "CommitFailedException";
  }
}

/**
 * Thrown when a database transaction rollback fails.
 */
export class RollbackFailedException extends TransactionException {
  constructor(message: string) {
    super(`Rollback failed: ${message}`);
    this.name = "RollbackFailedException";
  }
}
