import { ApplicationException } from "./ApplicationException.js";

/**
 * Exception representing resource locking/concurrency conflict failures.
 */
export class ConcurrencyException extends ApplicationException {
  constructor(
    message: string = "Optimistic concurrency conflict. Resource was modified elsewhere."
  ) {
    super(message);
  }
}
