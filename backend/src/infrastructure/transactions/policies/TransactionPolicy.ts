/**
 * Defines execution propagation policies for nested database transaction bounds.
 */
export enum TransactionPolicy {
  /**
   * Joins the current active transaction if one exists, otherwise begins a new transaction.
   */
  REQUIRED = "REQUIRED",

  /**
   * Always starts a new isolated transaction, suspending the ambient one if present.
   */
  REQUIRES_NEW = "REQUIRES_NEW",

  /**
   * Runs the code non-transactionally, suppressing any active ambient transaction.
   */
  SUPPRESS = "SUPPRESS",

  /**
   * Declares that the transaction scope only executes read operations (optimized performance).
   */
  READ_ONLY = "READ_ONLY"
}
