import { ApplicationException } from "./ApplicationException.js";

/**
 * Exception representing user permission policy check failures.
 */
export class AuthorizationException extends ApplicationException {
  constructor(message: string = "User is not authorized to perform this operation.") {
    super(message);
  }
}
