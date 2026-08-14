/**
 * AuthorizationException indicating access policy failures.
 */
export class AuthorizationException extends Error {
  constructor(message: string = "Access Denied") {
    super(message);
    this.name = "AuthorizationException";
  }
}
